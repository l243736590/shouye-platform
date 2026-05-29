const { fetchPosts, recordLike, searchItems } = require('../../utils/api')
const { feedImages, skillCategories } = require('../../utils/content')

const cats = ['推荐', '免费', '经验干货', '入学', '签证', '找房', '技能服务', '生活']

function makePostCard(item, index) {
  const isSkill = skillCategories.includes(item.category)
  const isFreePost = !isSkill && Number(item.price || item.points || 0) <= 0
  const author = item.author || (isSkill ? '技能服务者' : '经验分享者')
  return {
    ...item,
    isSkill,
    isFreePost,
    className: index % 4 === 0 ? 'tall' : index % 4 === 2 ? 'short' : '',
    image: feedImages[(index + 4) % feedImages.length],
    coverText: isSkill ? '我能做' : isFreePost ? '免费经验' : (item.hot || '经验'),
    author,
    avatar: author.slice(0, 1),
    likes: Math.max(24, Number(item.price || 0) * 8 + index * 37 + 80),
    liked: false
  }
}

function matchesCat(item, cat) {
  if (cat === '推荐') return true
  if (cat === '免费') return !item.isSkill && Number(item.price || item.points || 0) <= 0
  if (cat === '技能服务') return item.isSkill
  if (cat === '经验干货') return !item.isSkill
  return `${item.category || ''} ${item.title || ''} ${item.excerpt || ''}`.includes(cat)
}

Page({
  data: {
    activeTab: '发现',
    activeCategory: '推荐',
    categoryTabs: [],
    searchValue: '',
    cards: [],
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
    wx.showTabBar()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 3, visible: true })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7'
    })
  },

  onShareAppMessage() {
    return {
      title: '售业｜经验与技能信息流',
      path: '/pages/posts/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  async loadFeed() {
    this.setData({ loading: true })
    const posts = await fetchPosts()
    this.setData({
      cards: posts.map(makePostCard),
      loading: false
    }, () => this.applyFilters())
  },

  refreshCategories() {
    this.setData({
      categoryTabs: cats.map((name) => ({ name, className: this.data.activeCategory === name ? 'active' : '' }))
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
    let list = searchItems(this.data.cards, this.data.searchValue).filter((item) => matchesCat(item, this.data.activeCategory))
    if (this.data.activeTab === '关注') list = list.filter((_, index) => index % 2 === 0)
    this.setData({ visibleCards: list })
  },

  likeItem(event) {
    const id = event.currentTarget.dataset.id
    const visibleCards = this.data.visibleCards.map((item) => {
      if (item.id !== id) return item
      const liked = !item.liked
      return { ...item, liked, likes: Math.max(0, Number(item.likes || 0) + (liked ? 1 : -1)) }
    })
    this.setData({ visibleCards })
    const user = getApp().globalData.user || wx.getStorageSync('shouyeUser') || {}
    recordLike('post', id, user).catch(() => {})
  },

  openPostDetail(event) {
    const id = event.currentTarget.dataset.id
    const post = this.data.cards.find((item) => item.id === id)
    if (!post) return
    wx.setStorageSync('activePostDetail', post)
    wx.navigateTo({ url: '/pages/post-detail/index' })
  },

  openPublish() {
    wx.setStorageSync('pendingPublishMode', 'experience')
    wx.navigateTo({ url: '/pages/publish/index?mode=experience' })
  },

  openPartners() {
    wx.navigateTo({ url: '/pages/partners/index' })
  }
})
