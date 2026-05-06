const { createMerchantLead } = require('../../utils/api')
const { merchantCards } = require('../../utils/content')

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

function leadStorageKey() {
  return 'merchantLeads'
}

function findMerchant(id) {
  return [...merchantCards, ...extraMerchants].find((item) => item.id === id)
}

Page({
  data: {
    merchant: null,
    note: ''
  },

  onLoad(options = {}) {
    const stored = wx.getStorageSync('activeMerchantDetail')
    const merchantId = options.id ? decodeURIComponent(options.id) : stored && stored.id
    const merchant = stored || findMerchant(merchantId)
    if (!merchant) {
      wx.navigateBack()
      return
    }
    this.setData({ merchant })
    wx.setNavigationBarTitle({ title: merchant.type || '商家详情' })
  },

  onShareAppMessage() {
    const merchant = this.data.merchant || {}
    return {
      title: merchant.title || '售业商家福利',
      path: merchant.id ? `/pages/partner-detail/index?id=${encodeURIComponent(merchant.id)}` : '/pages/partners/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value })
  },

  async submitLead() {
    const merchant = this.data.merchant
    if (!merchant) return
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || {}
    const note = this.data.note || '想咨询这个服务'

    try {
      const result = await createMerchantLead(merchant, user, note)
      const leads = wx.getStorageSync(leadStorageKey()) || []
      leads.unshift(result.lead)
      wx.setStorageSync(leadStorageKey(), leads)
      this.setData({ note: '' })
      wx.showModal({
        title: '咨询已提交',
        content: '平台已记录咨询意向。正式版会展示商家认证、价格边界、服务记录和投诉入口。',
        showCancel: false
      })
    } catch (error) {
      const message = error && error.message ? error.message : '提交失败'
      wx.showToast({ title: message.slice(0, 18), icon: 'none' })
    }
  },

  copyContactHint() {
    wx.setClipboardData({
      data: '售业商家咨询：请在平台内确认商家认证、服务范围、价格和退款规则后再下单。',
      success: () => wx.showToast({ title: '提示已复制', icon: 'none' })
    })
  },

  reportMerchant() {
    wx.showModal({
      title: '举报商家',
      content: '正式版会接入举报入口，可提交虚假宣传、诱导私下交易、违规服务等线索。',
      showCancel: false
    })
  }
})
