Component({
  properties: {
    selected: {
      type: Number,
      value: 0
    },
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    list: [
      { pagePath: '/pages/index/index', text: '首页' },
      { pagePath: '/pages/questions/index', text: '提问' },
      { pagePath: '/pages/publish/index', text: '发帖', isPost: true },
      { pagePath: '/pages/posts/index', text: '经验' },
      { pagePath: '/pages/profile/index', text: '我的' }
    ]
  },

  methods: {
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      const item = this.data.list[index]
      if (!item) return
      this.setData({ selected: index })
      wx.switchTab({ url: item.pagePath })
    }
  }
})
