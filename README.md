<div align="center">
  <a href="https://github.com/thinkjs/thinkjs">
    <img width="200" heigth="200" src="https://p1.ssl.qhimg.com/t01c74e1aaed13e64fc.png">
  </a>  

  <h1>ThinkJS</h1>
</div>

## 全局安装 ThinkJS

```sh
npm install -g think-cli
```

## 创建项目

```sh
thinkjs new demo
```

## 安装依赖

```sh
npm install  或者  cnpm install
```

## 启动服务

```sh
npm start
```

启动后，会看到类似下面的信息：

```text
[2017-05-22 15:54:58.281] [INFO] - Server running at http://127.0.0.1:8360
[2017-05-22 15:54:58.283] [INFO] - ThinkJS version: 3.0.0-alpha1
[2017-05-22 15:54:58.283] [INFO] - Environment: development
[2017-05-22 15:54:58.284] [INFO] - Workers: 1
```

## 文档

<https://thinkjs.org/>

## pm2的部署

使用pm2在生产环境中部署应用程序.

```
pm2 startOrReload pm2.json
```