const { login } = require('../../utils/api')

Page({
  data: {
    user: null,
    email: '',
    password: '',
    loading: false
  },

  onShow() {
    wx.showTabBar()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 4, visible: true })
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser')
    this.setData({ user: user || null })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7'
    })
  },

  onShareAppMessage() {
    return {
      title: '售业｜留学生经验分享与问题解决平台',
      path: '/pages/profile/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({ [field]: event.detail.value })
  },

  async doLogin() {
    if (!this.data.email || !this.data.password) {
      wx.showToast({ title: '请输入邮箱和密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const user = await login(this.data.email, this.data.password)
      getApp().setUser(user)
      this.setData({ user, password: '' })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  logout() {
    getApp().clearUser()
    this.setData({ user: null })
  },

  openPublish(event) {
    const mode = event.currentTarget.dataset.mode
    wx.setStorageSync('pendingPublishMode', mode)
    wx.switchTab({ url: '/pages/publish/index' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  copyRegisterLink() {
    wx.setClipboardData({
      data: 'https://shouye.fun',
      success: () => wx.showToast({ title: '注册链接已复制', icon: 'none' })
    })
  }
})
