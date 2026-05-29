function buildList(mode = 'ask') {
  const centerItem = mode === 'helper'
    ? { key: 'center-helper', pagePath: '/pages/solve/index', text: '助人', isPost: true, mode: 'helper' }
    : { key: 'center-ask', pagePath: '/pages/questions/index', text: '求助', isAsk: true, mode: 'ask' }

  return [
    { key: 'home', pagePath: '/pages/index/index', text: '首页' },
    { key: 'plain-question', pagePath: '/pages/questions/index', text: '提问', mode: 'ask' },
    centerItem,
    { key: 'posts', pagePath: '/pages/posts/index', text: '经验' },
    { key: 'profile', pagePath: '/pages/profile/index', text: '我的' }
  ]
}

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
    mode: 'ask',
    list: buildList('ask')
  },

  methods: {
    setMode(mode = 'ask') {
      const nextMode = mode === 'helper' ? 'helper' : 'ask'
      this.setData({
        mode: nextMode,
        list: buildList(nextMode)
      })
    },

    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      const item = this.data.list[index]
      if (!item) return
      if (item.mode) this.setMode(item.mode)
      this.setData({ selected: index })
      wx.switchTab({ url: item.pagePath })
    }
  }
})
