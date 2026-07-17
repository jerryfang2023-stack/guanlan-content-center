# 观澜内容中心

观澜内容中心按今日工作台、内容资产、编辑发布和发布中心组织完整内容流程。“澜”通过本地服务调用用户已配置的 Claude CLI；经典写作台的标题、提纲和正文生成继续使用 DeepSeek。凭证均不进入浏览器页面。

当前发布版本：`v1.0.5`

模块状态与版本记录见 [CHANGELOG.md](CHANGELOG.md)。

## 本地校验

```sh
node --check app.js
node tools/verify-prototype.mjs
```

## 启动正文写作

将 DeepSeek 密钥放入项目根目录的 `.env.local`（该文件已被 Git 忽略）：

```sh
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_MODEL=deepseek-v4-pro
```

启动本地服务后访问终端显示的地址：

```sh
node server.mjs
```

原来的 `file://` 页面也能调用该本地服务，但建议直接使用 `http://127.0.0.1:8787`，便于确认服务状态与排查错误。

GitHub Pages 会在 `main` 分支更新后自动部署。
