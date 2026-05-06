App({
  globalData: {
    apiBase: 'https://shouye.fun',
    user: null
  },

  onLaunch() {
    const user = wx.getStorageSync('shouyeUser')
    if (user) {
      this.globalData.user = user
    }
  },

  setUser(user) {
    this.globalData.user = user
    wx.setStorageSync('shouyeUser', user)
  },

  clearUser() {
    this.globalData.user = null
    wx.removeStorageSync('shouyeUser')
  }
})
