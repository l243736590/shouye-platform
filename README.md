# 留学生首页 - 留学生经验分享与问题解决平台

面向留学生的经验分享与问题解决社区。当前版本包含：

- 韩国主流院校地区菜单
- 院校专题页与学校经验入口
- 注册 / 登录与邮箱验证码流程
- 提问、经验帖、积分奖励、积分解锁与创作者中心
- 机构合作申请与可信内容机制展示

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
