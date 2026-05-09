const { createMerchantLead, fetchMerchantBrandAccesses } = require('../../utils/api')
const { merchantCards, getMerchantById, withBrandAccess } = require('../../utils/merchant')

function leadStorageKey() {
  return 'merchantLeads'
}

function resolveMerchant(id, stored, accesses) {
  const cards = withBrandAccess(merchantCards, accesses)
  const withDefaultSections = (merchant) => {
    if (!merchant) return merchant
    if (Array.isArray(merchant.detailSections) && merchant.detailSections.length) return merchant
    return {
      ...merchant,
      detailSections: [
        { title: '适合咨询的人', text: `需要对比${merchant.type || '相关'}服务范围、交付方式和适合人群的在韩学生。` },
        { title: '咨询前先准备', text: '请先整理学校、城市、预算、时间节点、联系方式和目前卡住的具体问题。' },
        { title: '平台提醒', text: '展示页只帮助学生货比三家，价格、交付和售后由用户与商家自行确认。' },
      ],
    }
  }
  if (stored && stored.id === id) {
    const updated = cards.find((item) => item.id === id)
    return withDefaultSections(updated ? { ...stored, ...updated } : stored)
  }
  return withDefaultSections(cards.find((item) => item.id === id) || getMerchantById(id))
}

Page({
  data: {
    merchant: null,
    note: '',
    editPreview: false,
  },

  async onLoad(options = {}) {
    const stored = wx.getStorageSync('activeMerchantDetail')
    const merchantId = options.id ? decodeURIComponent(options.id) : stored && stored.id
    const accesses = await fetchMerchantBrandAccesses()
    const merchant = resolveMerchant(merchantId, stored, accesses)
    if (!merchant) {
      wx.navigateBack()
      return
    }
    this.setData({ merchant, editPreview: Boolean(options.edit) })
    wx.setNavigationBarTitle({ title: merchant.author || '商家详情' })
    if (options.edit) {
      wx.showToast({ title: '小程序端展示预览中', icon: 'none' })
    }
  },

  onShareAppMessage() {
    const merchant = this.data.merchant || {}
    return {
      title: merchant.title || '售业商家福利',
      path: merchant.id ? `/pages/partner-detail/index?id=${encodeURIComponent(merchant.id)}` : '/pages/partners/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg',
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
        content: '平台已记录咨询意向。请先确认商家认证、服务范围、价格边界和售后规则，再决定是否下单。',
        showCancel: false,
      })
    } catch (error) {
      const message = error && error.message ? error.message : '提交失败'
      wx.showToast({ title: message.slice(0, 18), icon: 'none' })
    }
  },

  copyContactHint() {
    wx.setClipboardData({
      data: '售业商家咨询：请在平台内确认商家认证、服务范围、价格和退款规则后再下单。',
      success: () => wx.showToast({ title: '提示已复制', icon: 'none' }),
    })
  },

  reportMerchant() {
    wx.showModal({
      title: '举报商家',
      content: '正式版会接入举报入口，可提交虚假宣传、诱导私下交易、违规服务等线索。',
      showCancel: false,
    })
  },

  openWebEditor() {
    wx.setClipboardData({
      data: this.data.merchant && this.data.merchant.id ? `https://shouye.fun/partners/${this.data.merchant.id}` : 'https://shouye.fun',
      success: () => wx.showToast({ title: '网页编辑地址已复制', icon: 'none' }),
    })
  },
})
