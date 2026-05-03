# 售业平台 | Sell Your Skills

韩国留学经验分享与商业合作平台。当前版本包含：

- 韩国主流院校地区菜单
- 院校详情页与校园背景图
- 注册 / 登录与邮箱验证码流程
- 发帖、积分奖励、积分解锁与创作者中心
- 机构入驻、企业人才合作与可信内容机制展示

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
