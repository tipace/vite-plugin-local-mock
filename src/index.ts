import { ViteDevServer, PluginOption } from 'vite';
import getRawBody from 'raw-body';
import queryString from 'query-string';
import path from 'node:path';
import { createRequire } from 'node:module';
import http from 'node:http';
import { isAjax, makeMockData } from './utils';

const require = createRequire(import.meta.url);

export interface PluginConfig {
  dir?: string;
}

const viteLocalMockPlugin = (options?: PluginConfig): PluginOption => ({
  name: 'vite-plugin-local-mock',
  apply: 'serve',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      async (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        next: Function
      ) => {
        if (!isAjax(req)) {
          next();
          return;
        }

        try {
          const [reqPath, reqSearch] = req.url?.split('?') || [];

          const mockPath = path.join(
            process.cwd(),
            options?.dir || 'mock',
            reqPath + '.cjs'
          );

          delete require.cache[mockPath];
          const mockModule = require(mockPath);

          const bodyStr = await getRawBody(req, {
            encoding: 'utf-8',
          });
          const params = {
            ...JSON.parse(bodyStr || '{}'),
            ...queryString.parse(reqSearch || ''),
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
