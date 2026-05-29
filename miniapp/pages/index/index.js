const { login, loginWithWechatMiniapp } = require('../../utils/api')

function getLocalDemoUser(profile = {}) {
  let id = wx.getStorageSync('shouyeMiniappDemoUserId')
  if (!id) {
    id = `wx_${Date.now()}`
    wx.setStorageSync('shouyeMiniappDemoUserId', id)
  }
  return {
    id,
    name: profile.nickName || '微信用户',
    email: 'wechat-user@miniapp.local',
    points: 30,
    earningPoints: 0,
    avatarUrl: profile.avatarUrl || ''
  }
}

Page({
  data: {
    logoLight: '/assets/shouye-logo-text-light-en-tight.png',
    user: null,
    email: '',
    password: '',
    loading: false,
    showOtherLogin: false,
    agreementAccepted: false,
    stats: [
      { value: '问答', label: '真实求助' },
      { value: '经验', label: '可被检索' },
      { value: '收益', label: '助人变现' }
    ]
  },

  onShow() {
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || null
    this.setData({ user })
    wx.hideTabBar()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0, visible: false })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#242b2e'
    })
  },

  onShareAppMessage() {
    return {
      title: '售业｜技能&经验变现平台',
      path: '/pages/index/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({ [field]: event.detail.value })
  },

  toggleAgreement() {
    this.setData({ agreementAccepted: !this.data.agreementAccepted })
  },

  toggleOtherLogin() {
    this.setData({ showOtherLogin: !this.data.showOtherLogin })
  },

  ensureAgreement() {
    if (this.data.agreementAccepted) return true
    wx.showToast({ title: '请先勾选同意协议', icon: 'none' })
    return false
  },

  wechatLogin() {
    if (this.data.loading) return
    if (!this.ensureAgreement()) return
    this.setData({ loading: true })
    const finishWechatLogin = (profile = {}) => {
      wx.login({
        success: async (loginRes) => {
          try {
            const user = await loginWithWechatMiniapp(loginRes.code, profile)
            getApp().setUser(user)
            this.setData({ user, loading: false })
            wx.hideTabBar()
            const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
            if (tabBar) tabBar.setData({ selected: 0, visible: false })
            wx.showToast({ title: '登录成功', icon: 'success' })
          } catch (error) {
            const user = getLocalDemoUser(profile)
            getApp().setUser(user)
            this.setData({ user, loading: false })
            wx.hideTabBar()
            const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
            if (tabBar) tabBar.setData({ selected: 0, visible: false })
            wx.showToast({ title: '演示账号已进入', icon: 'none' })
          }
        },
        fail: () => {
          this.setData({ loading: false })
          wx.showToast({ title: '微信登录失败', icon: 'none' })
        }
      })
    }

    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于完善售业账号资料',
        success: (res) => finishWechatLogin(res.userInfo || {}),
        fail: () => {
          this.setData({ loading: false })
          wx.showToast({ title: '已取消微信登录', icon: 'none' })
        }
      })
      return
    }

    finishWechatLogin({})
  },

  async emailLogin() {
    if (!this.ensureAgreement()) return
    if (!this.data.email || !this.data.password) {
      wx.showToast({ title: '请输入邮箱和密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const user = await login(this.data.email, this.data.password)
      getApp().setUser(user)
      this.setData({ user, password: '', loading: false })
      wx.hideTabBar()
      const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
      if (tabBar) tabBar.setData({ selected: 0, visible: false })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    }
  },

  showHelp() {
    wx.showModal({
      title: '售业帮助',
      content: '登录后先选择“我要分享/助人”或“我要提问/求助”，再进入对应内容流。',
      showCancel: false
    })
  },

  recoverAccount() {
    wx.setClipboardData({
      data: 'https://shouye.fun',
      success: () => wx.showToast({ title: '网页版地址已复制', icon: 'none' })
    })
  },

  openTerms() {
    wx.setClipboardData({ data: 'https://shouye.fun/terms' })
  },

  openPrivacy() {
    wx.setClipboardData({ data: 'https://shouye.fun/privacy' })
  },

  openMinorPrivacy() {
    wx.setClipboardData({ data: 'https://shouye.fun/minor-privacy' })
  },

  openHelpFeed() {
    wx.switchTab({ url: '/pages/solve/index' })
  },

  openAskFeed() {
    wx.switchTab({ url: '/pages/questions/index' })
  },

  openProfile() {
    wx.switchTab({ url: '/pages/profile/index' })
  }
})
