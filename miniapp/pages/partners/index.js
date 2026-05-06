const { recordLike } = require('../../utils/api')
const { partnerCategories, merchantCards } = require('../../utils/content')

const extraMerchants = [
  {
    id: 'm_academic_1',
    type: '学业相关',
    title: '韩语发表和课业答疑怎么选？',
    subtitle: '看服务边界、是否写明不代写、能否先做需求诊断。',
    image: '/assets/merchant/merchant-academic.jpg',
    author: '学业支持',
    likes: 188,
    tags: ['发表', 'TOPIK', '选课']
  },
  {
    id: 'm_logistics_1',
    type: '物流快递',
    title: '行李海运、转运和同城配送比价',
    subtitle: '重点看时效、可寄品类、赔付规则和上门范围。',
    image: '/assets/merchant/merchant-logistics.jpg',
    author: '物流服务',
    likes: 92,
    tags: ['海运', '文件', '同城配送']
  },
  {
    id: 'm_telecom_1',
    type: '通信',
    title: '新生电话卡和宽带套餐怎么选',
    subtitle: '先确认实名材料、合约期限、解约金和校园附近网点。',
    image: '/assets/merchant/merchant-telecom.jpg',
    author: '通信商家',
    likes: 156,
    tags: ['手机卡', '宽带', '实名']
  },
  {
    id: 'm_housing_1',
    type: '不动产',
    title: '找房和转租服务怎么货比三家',
    subtitle: '看区域、保证金、合同确认方式和中介资质。',
    image: '/assets/merchant/merchant-housing.jpg',
    author: '房源服务',
    likes: 201,
    tags: ['找房', '转租', '合同']
  }
]

function makeCard(item, index) {
  return {
    ...item,
    className: index % 3 === 1 ? 'tall' : index % 3 === 2 ? 'short' : '',
    coverText: item.type,
    avatar: item.author.slice(0, 1),
    liked: false
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
    showLeftCatCue: false,
    catScrollLeft: 0
  },

  onLoad() {
    this.setData({ cards: [...merchantCards, ...extraMerchants].map(makeCard) })
    this.refreshCategories()
    this.applyFilters()
  },

  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fffdf7'
    })
  },

  onShareAppMessage() {
    return {
      title: '售业｜商家福利',
      path: '/pages/partners/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  refreshCategories() {
    const names = ['推荐', ...partnerCategories.map((item) => item.title)]
    this.setData({
      categoryTabs: names.map((name) => ({ name, className: this.data.activeCategory === name ? 'active' : '' }))
    })
  },

  chooseCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.name }, () => {
      this.refreshCategories()
      this.applyFilters()
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
    let filteredCards = this.data.activeCategory === '推荐'
      ? this.data.cards
      : this.data.cards.filter((item) => item.type === this.data.activeCategory)
    if (keyword) {
      filteredCards = filteredCards.filter((item) => {
        const text = `${item.type || ''} ${item.title || ''} ${item.subtitle || ''} ${item.author || ''} ${(item.tags || []).join(' ')}`.toLowerCase()
        return text.includes(keyword)
      })
    }
    this.setData({
      filteredCards,
      visibleLimit: 4,
      visibleCards: filteredCards.slice(0, 4)
    })
  },

  onReachBottom() {
    if (this.data.visibleCards.length >= this.data.filteredCards.length) return
    const visibleLimit = this.data.visibleLimit + 4
    this.setData({
      visibleLimit,
      visibleCards: this.data.filteredCards.slice(0, visibleLimit)
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
    const merchant = this.data.visibleCards.find((item) => item.id === id)
    if (!merchant) return
    wx.setStorageSync('activeMerchantDetail', merchant)
    wx.navigateTo({ url: `/pages/partner-detail/index?id=${encodeURIComponent(merchant.id)}` })
  }
})
