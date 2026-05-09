const { recordLike, fetchMerchantBrandAccesses } = require('../../utils/api')
const { merchantCategories, merchantCards, withBrandAccess } = require('../../utils/merchant')

function makeCard(item, index) {
  return {
    ...item,
    className: index % 3 === 1 ? 'tall' : index % 3 === 2 ? 'short' : '',
    coverText: item.type,
    avatar: item.author.slice(0, 1),
    liked: false,
    bubbleClass: `float-${(index % 6) + 1} ${item.level === 'pinned' ? 'pinned' : ''}`,
    bubbleStyle: `background:${item.bubbleColor || 'rgba(255,253,247,.92)'}; animation-delay:${index * -1.7}s;`,
  }
}

Page({
  data: {
    activeCategory: '推荐',
    categoryTabs: [],
    searchValue: '',
    cards: [],
    filteredCards: [],
    visibleCards: [],
    visibleLimit: 4,
    fishbowlCards: [],
    fishCategoryTabs: [],
    showLeftCatCue: false,
    catScrollLeft: 0,
  },

  async onLoad(options = {}) {
    const accesses = await fetchMerchantBrandAccesses()
    const cards = withBrandAccess(merchantCards, accesses).map(makeCard)
    this.setData({ cards, fishbowlCards: this.sortFishbowlCards(cards) })
    this.refreshCategories()
    if (options.brand) this.focusBrand(decodeURIComponent(options.brand))
    if (options.edit) wx.showToast({ title: '小程序已进入商家展示页', icon: 'none' })
    this.applyFilters()
  },

  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7',
    })
  },

  onShareAppMessage() {
    return {
      title: '售业·商家福利',
      path: '/pages/partners/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg',
    }
  },

  sortFishbowlCards(cards) {
    return [...cards].sort((a, b) => (a.level === 'pinned' ? 1 : 0) - (b.level === 'pinned' ? 1 : 0))
  },

  refreshCategories() {
    const names = ['推荐', ...merchantCategories.map((item) => item.title)]
    this.setData({
      categoryTabs: names.map((name) => ({ name, className: this.data.activeCategory === name ? 'active' : '' })),
      fishCategoryTabs: merchantCategories.map((item) => item.title),
    })
  },

  focusBrand(brandId) {
    const merchant = this.data.cards.find((item) => item.id === brandId)
    if (!merchant) return
    this.setData({ activeCategory: merchant.type })
    this.refreshCategories()
  },

  chooseCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.name }, () => {
      this.refreshCategories()
      this.applyFilters()
    })
  },

  chooseFishCategory(event) {
    const type = event.currentTarget.dataset.type
    this.setData({ activeCategory: type, catScrollLeft: 0 }, () => {
      this.refreshCategories()
      this.applyFilters()
      wx.pageScrollTo({ selector: '.feed-search-box', duration: 240 })
    })
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

  switchTopTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === '商家福利') return
    wx.setStorageSync('pendingQuestionTopTab', tab)
    wx.switchTab({ url: '/pages/questions/index' })
  },

  applyFilters() {
    const keyword = String(this.data.searchValue || '').trim().toLowerCase()
    let filteredCards =
      this.data.activeCategory === '推荐'
        ? this.data.cards
        : this.data.cards.filter((item) => item.type === this.data.activeCategory)
    if (keyword) {
      filteredCards = filteredCards.filter((item) => {
        const text = `${item.type || ''} ${item.title || ''} ${item.subtitle || ''} ${item.author || ''} ${(item.tags || []).join(' ')}`.toLowerCase()
        return text.includes(keyword)
      })
    }
    filteredCards = [...filteredCards].sort((a, b) => (b.level === 'pinned' ? 1 : 0) - (a.level === 'pinned' ? 1 : 0))
    this.setData({
      filteredCards,
      visibleLimit: 4,
      visibleCards: filteredCards.slice(0, 4),
    })
  },

  onReachBottom() {
    if (this.data.visibleCards.length >= this.data.filteredCards.length) return
    const visibleLimit = this.data.visibleLimit + 4
    this.setData({
      visibleLimit,
      visibleCards: this.data.filteredCards.slice(0, visibleLimit),
    })
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
    recordLike('merchant', id, user).catch(() => {})
  },

  contactMerchant(event) {
    const id = event.currentTarget.dataset.id
    const merchant = this.data.cards.find((item) => item.id === id) || this.data.visibleCards.find((item) => item.id === id)
    if (!merchant) return
    wx.setStorageSync('activeMerchantDetail', merchant)
    wx.navigateTo({ url: `/pages/partner-detail/index?id=${encodeURIComponent(merchant.id)}` })
  },
})
