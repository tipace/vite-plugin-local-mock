import { ViteDevServer, PluginOption } from 'vite';
import getRawBody from 'raw-body';
import path from 'node:path';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import { isAjax, makeMockData, getMockPathInfo } from './utils';

const require = createRequire(import.meta.url);

export interface PluginConfig {
  dir?: string;
  enable?: boolean;
  pathMapConfig?: string;
}

const viteLocalMockPlugin = (opt?: PluginConfig): PluginOption => ({
  name: 'vite-plugin-local-mock',
  apply: 'serve',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      async (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        next: Function
      ) => {
        const options = {
          dir: 'mock',
          enable: true,
          ...(opt || {}),
        };

        if (!options.enable) {
          next();
          return;
        }

        if (!isAjax(req)) {
          next();
          return;
        }

        try {
          let routers: any = [];
          if (options.pathMapConfig) {
            const pathMapFile = path.join(
              process.cwd(),
              options.dir,
              options.pathMapConfig + '.cjs'
            );

            if (fs.existsSync(pathMapFile)) {
              delete require.cache[pathMapFile];
              routers = require(pathMapFile);
            }
          }

          const [filePath, urlParams] = getMockPathInfo(req.url, routers);
          const mockPath = path.join(
            process.cwd(),
            options.dir,
            filePath + '.cjs'
          );

          delete require.cache[mockPath];
          const mockModule = require(mockPath);

          const bodyStr = await getRawBody(req, {
            encoding: 'utf-8',
          });

          const params = {
            ...JSON.parse(bodyStr || '{}'),
            ...urlParams,
          };

          const mockData = makeMockData(mockModule, params);

          if (mockData.__mock) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mockData));
          } else {
            next();
          }
        } catch (error) {
          // console.error(error);
          next();
        }
      }
    );
  },
});

export default viteLocalMockPlugin;
