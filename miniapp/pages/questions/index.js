const { fetchPosts, fetchQuestions, normalizeDate, recordLike, searchItems } = require('../../utils/api')
const { feedImages, merchantCards } = require('../../utils/content')

const baseCats = ['推荐', '签证', '找房', '入学', '打工', '论文', '生活', '商家福利']

function categoryMatch(item, cat) {
  if (cat === '推荐') return true
  if (cat === '商家福利') return item.type === 'ad'
  const content = `${item.category || ''} ${item.title || ''} ${(item.tags || []).join(' ')}`
  return content.includes(cat)
}

function makeQuestionCard(item, index) {
  const author = item.author || item.school || '留学生求助'
  return {
    ...item,
    type: 'question',
    className: index % 3 === 1 ? 'tall' : index % 3 === 2 ? 'short' : '',
    image: feedImages[index % feedImages.length],
    coverText: item.title,
    author,
    avatar: author.slice(0, 1),
    likes: Math.max(38, Number(item.views || 0) % 600 + Number(item.rewardPoints || 0)),
    liked: false,
    dateText: normalizeDate(item.createdAt)
  }
}

function makeAdCard(item, index) {
  return {
    ...item,
    type: 'ad',
    className: index % 2 ? 'short' : '',
    coverText: item.title,
    avatar: item.author.slice(0, 1),
    liked: false
  }
}

function makeInfoCard(item, index) {
  const author = item.author || '常识信息'
  return {
    ...item,
    type: 'info',
    className: index % 2 ? 'short' : '',
    image: feedImages[(index + 5) % feedImages.length],
    coverText: '常识信息',
    subtitle: item.summary || item.excerpt || '',
    avatar: '知',
    author,
    likes: Math.max(32, Number(item.likes || 0)),
    liked: false
  }
}

Page({
  data: {
    activeTab: '发现',
    activeCategory: '推荐',
    categoryTabs: [],
    searchValue: '',
    questions: [],
    infoCards: [],
    feedItems: [],
    loading: true,
    showLeftCatCue: false,
    catScrollLeft: 0
  },

  onLoad() {
    this.refreshCategories()
    this.loadFeed()
  },

  onShow() {
    wx.showTabBar()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1, visible: true })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7'
    })
    const pendingSearch = wx.getStorageSync('pendingSearch')
    if (pendingSearch) {
      wx.removeStorageSync('pendingSearch')
      this.setData({ searchValue: pendingSearch, activeCategory: '推荐' }, () => {
        this.refreshCategories()
        this.applyFilters()
      })
    }
    const pendingTopTab = wx.getStorageSync('pendingQuestionTopTab')
    if (pendingTopTab) {
      wx.removeStorageSync('pendingQuestionTopTab')
      this.setData({ activeTab: pendingTopTab }, () => this.applyFilters())
    }
  },

  onShareAppMessage() {
    return {
      title: '售业｜我要提问/求助',
      path: '/pages/questions/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  async loadFeed() {
    this.setData({ loading: true })
    const [questions, posts] = await Promise.all([fetchQuestions(), fetchPosts()])
    this.setData({
      questions: questions.map(makeQuestionCard),
      infoCards: posts.map(makeInfoCard),
      loading: false
    }, () => this.applyFilters())
  },

  refreshCategories() {
    this.setData({
      categoryTabs: baseCats.map((name) => ({
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
    let questionCards = searchItems(this.data.questions, this.data.searchValue)
    let infoCards = searchItems(this.data.infoCards, this.data.searchValue)
    const adCards = merchantCards.map(makeAdCard)
    let merged = []
    if (this.data.activeCategory === '商家福利') {
      merged = adCards
    } else {
      infoCards = infoCards.filter((item) => categoryMatch(item, this.data.activeCategory)).slice(0, 4)
      questionCards.forEach((item, index) => {
        merged.push(item)
        if ((index === 1 || index === 6) && infoCards.length) merged.push(infoCards.shift())
        if (index === 3 || index === 8) merged.push(adCards[index % adCards.length])
      })
      merged = merged.filter((item) => categoryMatch(item, this.data.activeCategory))
    }
    if (this.data.activeTab === '关注') {
      merged = merged.filter((item, index) => item.type === 'ad' || index % 2 === 0)
    }
    this.setData({ feedItems: merged })
  },

  likeItem(event) {
    const id = event.currentTarget.dataset.id
    const likedItem = this.data.feedItems.find((item) => item.id === id)
    const feedItems = this.data.feedItems.map((item) => {
      if (item.id !== id) return item
      const liked = !item.liked
      return {
        ...item,
        liked,
        likes: Math.max(0, Number(item.likes || 0) + (liked ? 1 : -1))
      }
    })
    this.setData({ feedItems })
    if (likedItem) {
      const user = getApp().globalData.user || wx.getStorageSync('shouyeUser') || {}
      const type = likedItem.type === 'info' ? 'post' : likedItem.type === 'ad' ? 'merchant' : 'question'
      recordLike(type, id, user).catch(() => {})
    }
  },

  openFeedCard(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.feedItems.find((card) => card.id === id)
    if (!item) return
    if (item.type === 'info') {
      wx.setStorageSync('activePostDetail', item)
      wx.navigateTo({ url: `/pages/post-detail/index?id=${encodeURIComponent(item.id)}` })
      return
    }
    if (item.type === 'ad') {
      wx.setStorageSync('activeMerchantDetail', item)
      wx.navigateTo({ url: `/pages/partner-detail/index?id=${encodeURIComponent(item.id)}` })
      return
    }
    if (item.type === 'question') {
      wx.setStorageSync('activeQuestionDetail', item)
      wx.navigateTo({ url: `/pages/question-detail/index?id=${encodeURIComponent(item.id)}` })
    }
  },

  openPublish() {
    wx.setStorageSync('pendingPublishMode', 'question')
    wx.switchTab({ url: '/pages/publish/index' })
  },

  openPartners() {
    wx.navigateTo({ url: '/pages/partners/index' })
  }
})
