const { fetchPosts, fetchQuestions, recordLike, searchItems } = require('../../utils/api')
const { feedImages } = require('../../utils/content')

const cats = ['推荐', '高悬赏', '签证', '找房', '入学', '跑腿', '作业', '线下帮助']

function makeNeedCard(item, index) {
  const reward = Number(item.rewardPoints || 0)
  const author = item.author || item.school || '求助人'
  return {
    ...item,
    type: 'need',
    className: index % 3 === 0 ? 'tall' : index % 3 === 2 ? 'short' : '',
    image: feedImages[(index + 2) % feedImages.length],
    coverText: reward > 0 ? `悬赏 ${reward} 提现积分` : '求助',
    author,
    avatar: author.slice(0, 1),
    likes: Math.max(20, Number(item.views || 0) % 700 + reward),
    liked: false
  }
}

function makeInfoCard(item, index) {
  const author = item.author || '常识信息'
  return {
    ...item,
    type: 'info',
    className: index % 2 === 0 ? 'short' : '',
    image: feedImages[(index + 6) % feedImages.length],
    coverText: '常识信息',
    detail: item.summary || item.excerpt || item.body || '',
    author,
    avatar: '知',
    likes: Math.max(36, Number(item.likes || 0)),
    liked: false
  }
}

function matchesCat(item, cat) {
  if (cat === '推荐') return true
  if (cat === '高悬赏') return item.type !== 'info' && Number(item.rewardPoints || 0) >= 100
  if (cat === '线下帮助') return `${item.title || ''} ${item.detail || ''}`.includes('线下') || `${item.category || ''}`.includes('跑腿')
  return `${item.category || ''} ${item.title || ''} ${(item.tags || []).join(' ')}`.includes(cat)
}

function interleaveInfoCards(needs, infos) {
  if (!infos.length || !needs.length) return needs
  const pool = infos.slice(0, 2)
  const mixed = []
  needs.forEach((item, index) => {
    mixed.push(item)
    if ((index === 3 || index === 8) && pool.length) mixed.push(pool.shift())
  })
  if (needs.length > 4 && pool.length) mixed.push(pool.shift())
  return mixed
}

Page({
  data: {
    activeTab: '发现',
    activeCategory: '推荐',
    categoryTabs: [],
    searchValue: '',
    cards: [],
    infoCards: [],
    visibleCards: [],
    loading: true,
    showLeftCatCue: false,
    catScrollLeft: 0
  },

  onLoad() {
    this.refreshCategories()
    this.loadFeed()
  },

  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7'
    })
  },

  onShareAppMessage() {
    return {
      title: '售业｜我来解决问题',
      path: '/pages/solve/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  async loadFeed() {
    this.setData({ loading: true })
    const [questions, posts] = await Promise.all([fetchQuestions(), fetchPosts()])
    this.setData({
      cards: questions
        .filter((item) => item.status !== 'solved')
        .sort((a, b) => Number(b.rewardPoints || 0) - Number(a.rewardPoints || 0))
        .map(makeNeedCard),
      infoCards: posts.map(makeInfoCard),
      loading: false
    }, () => this.applyFilters())
  },

  refreshCategories() {
    this.setData({
      categoryTabs: cats.map((name) => ({
        name,
        className: this.data.activeCategory === name ? 'active' : ''
      }))
    })
  },

  chooseCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.name }, () => {
      this.refreshCategories()
      this.applyFilters()
    })
  },

  switchTopTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === '商家福利') {
      wx.navigateTo({ url: '/pages/partners/index' })
      return
    }
    this.setData({ activeTab: tab }, () => this.applyFilters())
  },

  onSearchInput(event) {
    this.setData({ searchValue: event.detail.value }, () => this.applyFilters())
  },

  openSideMenu() {
    wx.navigateTo({ url: '/pages/toolbox/index?type=menu' })
  },

  onCatScroll(event) {
    const catScrollLeft = Number(event.detail.scrollLeft || 0)
    const showLeftCatCue = catScrollLeft > 8
    if (showLeftCatCue !== this.data.showLeftCatCue) {
      this.setData({ showLeftCatCue, catScrollLeft })
    } else if (Math.abs(catScrollLeft - Number(this.data.catScrollLeft || 0)) > 20) {
      this.setData({ catScrollLeft })
    }
  },

  scrollCatsLeft() {
    const catScrollLeft = Math.max(0, Number(this.data.catScrollLeft || 0) - 220)
    this.setData({ catScrollLeft, showLeftCatCue: catScrollLeft > 8 })
  },

  scrollCatsRight() {
    const catScrollLeft = Number(this.data.catScrollLeft || 0) + 220
    this.setData({ catScrollLeft, showLeftCatCue: true })
  },

  applyFilters() {
    let needs = searchItems(this.data.cards, this.data.searchValue).filter((item) => matchesCat(item, this.data.activeCategory))
    if (this.data.activeTab === '关注') needs = needs.filter((_, index) => index % 2 === 0)
    const infos = this.data.activeCategory === '高悬赏'
      ? []
      : searchItems(this.data.infoCards, this.data.searchValue).filter((item) => matchesCat(item, this.data.activeCategory))
    const list = interleaveInfoCards(needs, infos)
    this.setData({ visibleCards: list })
  },

  likeItem(event) {
    const id = event.currentTarget.dataset.id
    const likedItem = this.data.visibleCards.find((item) => item.id === id)
    const visibleCards = this.data.visibleCards.map((item) => {
      if (item.id !== id) return item
      const liked = !item.liked
      return { ...item, liked, likes: Math.max(0, Number(item.likes || 0) + (liked ? 1 : -1)) }
    })
    this.setData({ visibleCards })
    if (likedItem) {
      const user = getApp().globalData.user || wx.getStorageSync('shouyeUser') || {}
      recordLike(likedItem.type === 'info' ? 'post' : 'question', id, user).catch(() => {})
    }
  },

  openCard(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.visibleCards.find((card) => card.id === id)
    if (!item) return
    if (item.type === 'info') {
      wx.setStorageSync('activePostDetail', item)
      wx.navigateTo({ url: `/pages/post-detail/index?id=${encodeURIComponent(item.id)}` })
      return
    }
    wx.setStorageSync('activeQuestionDetail', item)
    wx.navigateTo({ url: `/pages/question-detail/index?id=${encodeURIComponent(item.id)}` })
  },

  openPublish() {
    wx.setStorageSync('pendingPublishMode', 'skill')
    wx.switchTab({ url: '/pages/publish/index' })
  },

  openPartners() {
    wx.navigateTo({ url: '/pages/partners/index' })
  }
})
