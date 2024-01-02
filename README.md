# vite-plugin-local-mock

## 特点

[使用简单！example](https://github.com/tipace/pokemon-api-demo)

## 安装

```bash
npm i vite-plugin-local-mock -D
```

## 使用

在 vite.config.js 中配置插件

```js
import { defineConfig } from 'vite'
import localMock from 'vite-plugin-local-mock'

export default defineConfig({
  plugins: [localMock()]
}
```

在 mock 文件夹中创建 mock 文件，文件名为请求路径，格式为 cjs：

```js
// mock/user.js
export default {
  code: 0,
  data: {
    name: 'test',
  },
};
```

## 插件配置参数

- **dir**【string】： mock 文件的目录名，默认'mock'
