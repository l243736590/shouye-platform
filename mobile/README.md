# 售业 Android APP

React Native + Expo 版本，独立于网页版和小程序。

## 本地运行

```bash
cd mobile
npm install
npm run start
```

用 Android 真机安装 Expo Go 后扫码，或在安装 Android Studio/模拟器后运行：

```bash
npm run android
```

需要生成本地 Android 工程和调试包时：

```bash
npm run android:dev
```

## 当前范围

- 首屏入口：我要提问/求助、我要分享/助人
- 求助流、助人流、经验流
- 求助详情和经验详情
- 个人中心占位
- 默认连接 `https://shouye.fun` 的 Worker API
