const titles = {
  friends: '添加好友',
  drafts: '我的草稿',
  history: '浏览记录',
  services: '购买的服务',
  spending: '消费记录',
  wallet: '钱包',
  rules: '社区公约',
  help: '帮助与客服',
  settings: '设置'
}

Page({
  data: {
    type: 'history',
    searchValue: '',
    noticeReply: true,
    noticeReward: true,
    noticeMerchant: false
  },

  onLoad(options) {
    const query = options || {}
    const type = titles[query.type] ? query.type : 'history'
    this.setData({ type })
    wx.setNavigationBarTitle({ title: titles[type] })
  },

  onSearchInput(event) {
    this.setData({ searchValue: event.detail.value })
  },

  goQuestionDraft() {
    wx.setStorageSync('pendingPublishMode', 'question')
    wx.switchTab({ url: '/pages/publish/index' })
  },

  goPostDraft() {
    wx.setStorageSync('pendingPublishMode', 'experience')
    wx.switchTab({ url: '/pages/publish/index' })
  },

  showTodo(event) {
    const label = event.currentTarget.dataset.label || '功能'
    wx.showToast({ title: label + '整理中', icon: 'none' })
  },

  toggleNotice(event) {
    const field = event.currentTarget.dataset.field
    if (!field) return
    this.setData({ [field]: !this.data[field] })
  }
})
