const { fetchPosts } = require('../../utils/api')
const { fallbackPosts, feedImages } = require('../../utils/content')

function hashText(text = '') {
  return String(text).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function pickHeroImage(post = {}) {
  if (post.image || post.coverImage || post.thumbnail) return post.image || post.coverImage || post.thumbnail
  return feedImages[hashText(post.id || post.title) % feedImages.length]
}

function getTags(post = {}) {
  if (Array.isArray(post.tags)) return post.tags.filter(Boolean)
  return String(post.tags || '').split(/[,\s，、]+/).map((item) => item.trim()).filter(Boolean)
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function splitParagraphs(text = '') {
  const cleaned = String(text).replace(/\r/g, '').trim()
  if (!cleaned) return []
  const lineParagraphs = cleaned.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  if (lineParagraphs.length > 1) return lineParagraphs
  const sentences = cleaned.split('。').map((item) => item.trim()).filter(Boolean).map((item) => `${item}。`)
  const paragraphs = []
  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(''))
  }
  return paragraphs.length ? paragraphs : [cleaned]
}

function buildGuideBlocks(post = {}, bodyText = '') {
  const haystack = `${post.title || ''} ${post.category || ''} ${getTags(post).join(' ')} ${bodyText}`
  if (haystack.includes('艺术') || haystack.includes('作品集') || haystack.includes('设计') || haystack.includes('传媒')) {
    return [
      { title: '先定方向', text: '先分清纯艺、视觉、影像、戏剧、传媒等方向，再看学校是否真的有合适的课程和教授资源。' },
      { title: '对齐规格', text: '确认作品集页数、尺寸、链接权限、原创声明、面试或实技要求，别到截止前才发现格式不符。' },
      { title: '比较学校', text: '把简章、语言要求、面试节点、学费和毕业要求放进同一张表，排名只作为参考。' }
    ]
  }
  if (haystack.includes('签证') || haystack.includes('D-') || haystack.includes('登录证')) {
    return [
      { title: '先看官方', text: '签证和登录证信息先回到 HiKorea、出入境、1345 和学校国际处确认。' },
      { title: '整理材料', text: '把申请表、在学或毕业材料、住所证明、财力材料和时间线分开放。' },
      { title: '留出缓冲', text: '不要卡最后一天提交，地址、学校系统和预约名额都可能拖慢进度。' }
    ]
  }
  if (haystack.includes('租房') || haystack.includes('找房') || haystack.includes('搬家')) {
    return [
      { title: '先核合同', text: '确认房东身份、押金账户、合同主体、退租通知期和维修责任。' },
      { title: '现场检查', text: '热水、水压、采光、霉味、门锁、噪音和垃圾点都要现场看。' },
      { title: '保留证据', text: '聊天记录、转账记录、房屋照片和合同关键页都留存，后续更好处理纠纷。' }
    ]
  }
  return [
    { title: '先抓流程', text: '把目标、截止时间、已有材料和卡住的问题列清楚，再按步骤推进。' },
    { title: '核对来源', text: '经验帖用于理解路径，具体材料和政策仍要回到学校或官方窗口确认。' },
    { title: '留下记录', text: '重要沟通、文件、付款和提交凭证都建议留存，方便后续复盘。' }
  ]
}

function buildMetaItems(post = {}, price = 0, paragraphs = []) {
  return [
    { label: '学校', value: post.school || '韩国留学' },
    { label: '分类', value: post.category || '经验' },
    { label: '可见', value: price > 0 ? `${price} 积分` : '免费' },
    { label: '阅读', value: `${Math.max(1, Math.ceil(paragraphs.join('').length / 280))} 分钟` }
  ]
}

Page({
  data: {
    post: null,
    bodyText: '',
    previewText: '',
    heroImage: '',
    summaryText: '',
    dateText: '',
    bodyParagraphs: [],
    previewParagraphs: [],
    guideBlocks: [],
    metaItems: [],
    tagItems: [],
    contentUnlocked: false,
    isPaidPost: false,
    isFreePost: true,
    accessLabel: '免费看帖'
  },

  async onLoad(options = {}) {
    const stored = wx.getStorageSync('activePostDetail')
    const postId = options.id ? decodeURIComponent(options.id) : stored && stored.id
    let post = stored || fallbackPosts.find((item) => item.id === postId)

    if (!post && postId) {
      try {
        const posts = await fetchPosts()
        post = posts.find((item) => item.id === postId)
      } catch (error) {
        post = fallbackPosts.find((item) => item.id === postId)
      }
    }

    if (!post) {
      wx.navigateBack()
      return
    }

    const bodyText = post.body || post.detail || post.excerpt || post.summary || ''
    const price = Number(post.price || post.points || 0)
    const bodyParagraphs = splitParagraphs(bodyText)
    const previewText = bodyText.length > 130 ? `${bodyText.slice(0, 130)}...` : bodyText
    const previewParagraphs = splitParagraphs(previewText)

    this.setData({
      post,
      bodyText,
      heroImage: pickHeroImage(post),
      summaryText: post.summary || post.excerpt || '来自售业用户的留学经验整理。',
      dateText: formatDate(post.updatedAt || post.createdAt),
      bodyParagraphs,
      previewParagraphs,
      guideBlocks: buildGuideBlocks(post, bodyText),
      metaItems: buildMetaItems(post, price, bodyParagraphs),
      tagItems: getTags(post).slice(0, 4),
      previewText,
      contentUnlocked: price <= 0,
      isPaidPost: price > 0,
      isFreePost: price <= 0,
      accessLabel: price > 0 ? `${price} 积分看帖` : '免费看帖'
    })
    wx.setNavigationBarTitle({ title: post.title || '经验详情' })
  },

  onShareAppMessage() {
    const post = this.data.post || {}
    return {
      title: post.title || '售业经验详情',
      path: post.id ? `/pages/post-detail/index?id=${encodeURIComponent(post.id)}` : '/pages/posts/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  unlockPost() {
    this.setData({ contentUnlocked: true })
    wx.showToast({
      title: this.data.isPaidPost ? '已解锁本帖' : '已打开全文',
      icon: 'none'
    })
  }
})
