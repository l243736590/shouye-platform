# 售业平台 | Sell Your Skills

韩国留学经验分享平台 MVP。当前版本包含：

- 韩国主流院校地区菜单
- 院校详情页与校园背景图
- 注册 / 登录演示流程
- 发帖、积分奖励、积分解锁
- 浏览器 localStorage 本地存储

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

Cloudflare Pages / Workers 静态部署配置：

- Build command: `npm run build`
- Output directory: `dist`

当前构建使用 `vite-plugin-singlefile`，会把主要 JS/CSS 内联到 `dist/index.html`，方便静态托管。
