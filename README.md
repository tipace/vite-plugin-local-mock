# vite-plugin-local-mock

## 特点

[使用简单！example](https://github.com/tipace/pokemon-api-demo)

## 安装

```bash
npm i vite-plugin-local-mock -D
```

在 vite.config.js 中配置插件

```js
import { defineConfig } from 'vite'
import localMock from 'vite-plugin-local-mock'

export default defineConfig({
  plugins: [localMock()]
}
```

## 插件配置参数

- **enable** [boolean]: 是否开启 mock，默认 true
- **dir**【string】： mock 文件的目录名，默认'mock'
- **pathMapConfig**【string】:动态路由映射文件路径

## 使用

在 mock 文件夹中创建 mock 文件，文件名为请求路径，格式为 cjs：

```cjs
// mock/user.cjs
export default {
  /**
   * 整个mock设计中最关键的设置，只有顶部返回了该字段为true才会生效
   * 在项目运行中，也方便通过查看接口返回是否有这个字段来判断是否是mock接口
   */
  __mock: true,
  code: 0,
  data: {
    name: 'test',
  },
};
```

```cjs
export default {
  __mock: true,
  code: 0,
  data: {
    /**
     * 支持方法返回，入参为{...query, ...restfullParams, ...body}
     */
    name(params) {
      return 'test';
    },
  },
};
```

```cjs
/**
 * 支持方法返回，入参为{...query, ...restfullParams, ...body}
 */
export default (params) => ({
  __mock: true,
  code: 0,
  data: {
    /**
     * 支持方法返回，入参为{...query, ...body}
     */
    name: 'test',
  },
});
```

对于 restful 的动态接口，需要配置映射文件，即配置**pathMapConfig**，例如

```js
localMock({
  pathMapConfig: 'mockMap',
}),
```

需要在 mock 目录下新建 **mockMap.cjs**

```cjs
module.exports = [
  {
    url: 'api/v2/pokemon/post/:name',
    path: 'poke',
  },
];
```

比如请求匹配到第一条 url，便会尝试从 mock/poke.cjs 中读取数据，优先级从上到下递减，如果没有匹配到，会走默认的完整路径映射文件的数据
