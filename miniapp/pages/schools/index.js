const { schools, questionCategories } = require('../../utils/content')

Page({
  data: {
    searchValue: '',
    activeNeed: '入学须知',
    needs: ['入学须知', '找房与转租', '签证/滞留资格', '作业与论文', '同好与交友', '周边生活攻略', '跳蚤市场', '八卦与吃瓜'],
    schools,
    visibleSchools: schools
  },

  onShareAppMessage() {
    return {
      title: '售业｜韩国留学院校专题',
      path: '/pages/schools/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  onSearchInput(event) {
    const searchValue = event.detail.value
    this.setData({ searchValue }, () => this.applySearch())
  },

  applySearch() {
    const q = this.data.searchValue.trim().toLowerCase()
    if (!q) {
      this.setData({ visibleSchools: this.data.schools })
      return
    }
    const visibleSchools = this.data.schools.filter((school) => {
      return [school.name, school.city, ...school.tags].join(' ').toLowerCase().includes(q)
    })
    this.setData({ visibleSchools })
  },

  chooseNeed(event) {
    const activeNeed = event.currentTarget.dataset.need
    this.setData({ activeNeed })
  },

  copySchoolLink(event) {
    const id = event.currentTarget.dataset.id
    const school = schools.find((item) => item.id === id)
    wx.setClipboardData({
      data: `https://shouye.fun/schools/${id}`,
      success: () => {
        wx.showToast({ title: `${school ? school.name : '学校'}专题链接已复制`, icon: 'none' })
      }
    })
  },

  openQuestionsByNeed() {
    wx.setStorageSync('pendingSearch', this.data.activeNeed)
    wx.switchTab({ url: '/pages/questions/index' })
  }
})
