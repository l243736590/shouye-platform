const { login } = require('../../utils/api')

function parseUserBioSettings(bio) {
  if (!bio) return {}
  try {
    const parsed = JSON.parse(bio)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    return {}
  }
}

function getMerchantProfile(user) {
  if (!user) return { isMerchant: false }
  const settings = parseUserBioSettings(user.bio)
  const isMerchant =
    settings.userType === 'merchant' ||
    user.identity === '商家' ||
    Boolean(settings.businessName || settings.businessCategory || settings.managedBrandId)
  return {
    isMerchant,
    brandId: settings.managedBrandId || '',
    brandName: settings.managedBrandName || settings.businessName || '商家展示管理',
    serviceType: settings.businessCategory || '商家服务',
  }
}

Page({
  data: {
    user: null,
    merchantProfile: { isMerchant: false },
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
    this.setData({ user: user || null, merchantProfile: getMerchantProfile(user) })
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
      this.setData({ user, merchantProfile: getMerchantProfile(user), password: '' })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  logout() {
    getApp().clearUser()
    this.setData({ user: null, merchantProfile: { isMerchant: false } })
  },

  openMerchantDetailEditor() {
    const profile = this.data.merchantProfile || {}
    if (!profile.brandId) {
      wx.showToast({ title: '请先等待后台分配品牌权限', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/partner-detail/index?id=${encodeURIComponent(profile.brandId)}&edit=1` })
  },

  openMerchantShopEditor() {
    const profile = this.data.merchantProfile || {}
    if (!profile.brandId) {
      wx.showToast({ title: '请先等待后台分配品牌权限', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/partners/index?brand=${encodeURIComponent(profile.brandId)}&edit=1` })
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
