const { fallbackPosts, fallbackQuestions } = require('./content')

const API_BASE = 'https://shouye.fun'

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        const ok = res.statusCode >= 200 && res.statusCode < 300
        if (ok) {
          resolve(res.data || {})
          return
        }
        const message = res.data && res.data.error ? res.data.error : `请求失败：${res.statusCode}`
        reject(new Error(message))
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

async function fetchQuestions() {
  try {
    const data = await request('/api/questions')
    return mergeById(Array.isArray(data.questions) ? data.questions : [], fallbackQuestions)
  } catch (error) {
    return fallbackQuestions
  }
}

async function fetchQuestionDetail(questionId) {
  const id = encodeURIComponent(String(questionId || ''))
  if (!id) throw new Error('缺少问题 ID')
  const data = await request(`/api/questions/${id}`)
  return {
    question: data.question,
    answers: Array.isArray(data.answers) ? data.answers : []
  }
}

async function fetchPosts() {
  try {
    const data = await request('/api/posts')
    return mergeById(Array.isArray(data.posts) ? data.posts : [], fallbackPosts)
  } catch (error) {
    return fallbackPosts
  }
}

function mergeById(remoteItems = [], fallbackItems = []) {
  const seen = new Set()
  return [...remoteItems, ...fallbackItems].filter((item) => {
    const id = item && item.id ? String(item.id) : JSON.stringify(item)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

function remoteUserId(user) {
  const id = user && user.id ? String(user.id) : ''
  return id.startsWith('user-') ? id : ''
}

async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    data: { email, password }
  })
  return data.user
}

async function loginWithWechatMiniapp(code, profile = {}) {
  const data = await request('/api/auth/wechat-miniapp', {
    method: 'POST',
    data: {
      code,
      nickname: profile.nickName || profile.nickname || '',
      avatarUrl: profile.avatarUrl || ''
    }
  })
  return data.user
}

async function createQuestion(user, form) {
  return request('/api/questions', {
    method: 'POST',
    data: {
      userId: remoteUserId(user),
      authorName: user && user.name ? user.name : '小程序用户',
      identity: user && user.identity ? user.identity : '小程序提问',
      source: 'miniapp',
      title: form.title,
      category: form.category,
      country: '韩国',
      city: form.city || '',
      school: form.school || '韩国留学',
      rewardPoints: Number(form.rewardPoints) || 0,
      tags: form.tags || [],
      detail: form.detail
    }
  })
}

async function createAnswer(questionId, user, content) {
  const id = encodeURIComponent(String(questionId || ''))
  if (!id) throw new Error('缺少问题 ID')
  return request(`/api/questions/${id}/answers`, {
    method: 'POST',
    data: {
      userId: remoteUserId(user),
      authorName: user && user.name ? user.name : '小程序用户',
      identity: user && user.identity ? user.identity : '小程序助人',
      source: 'miniapp',
      content
    }
  })
}

async function acceptAnswer(questionId, answerId, user) {
  const qid = encodeURIComponent(String(questionId || ''))
  const aid = encodeURIComponent(String(answerId || ''))
  if (!qid || !aid) throw new Error('缺少采纳对象')
  return request(`/api/questions/${qid}/answers/${aid}/accept`, {
    method: 'POST',
    data: {
      userId: remoteUserId(user)
    }
  })
}

async function requestQuestionRefund(questionId, user) {
  const qid = encodeURIComponent(String(questionId || ''))
  if (!qid) throw new Error('缺少问题 ID')
  return request(`/api/questions/${qid}/refund`, {
    method: 'POST',
    data: {
      userId: remoteUserId(user)
    }
  })
}

async function createQuestionDispute(questionId, user, form = {}) {
  const qid = encodeURIComponent(String(questionId || ''))
  if (!qid) throw new Error('缺少问题 ID')
  return request(`/api/questions/${qid}/disputes`, {
    method: 'POST',
    data: {
      userId: remoteUserId(user),
      type: form.type || 'appeal',
      answerId: form.answerId || '',
      reason: form.reason || '申请人工处理',
      detail: form.detail || '',
      source: 'miniapp'
    }
  })
}

async function createPost(user, form) {
  return request('/api/posts', {
    method: 'POST',
    data: {
      userId: remoteUserId(user),
      authorName: user && user.name ? user.name : '小程序用户',
      source: 'miniapp',
      title: form.title,
      school: form.school || '韩国留学',
      category: form.category,
      price: Number(form.price) || 0,
      excerpt: form.excerpt,
      body: form.body
    }
  })
}

async function createMerchantLead(merchant, user, note) {
  return request('/api/merchant-leads', {
    method: 'POST',
    data: {
      merchantId: merchant && merchant.id ? merchant.id : '',
      merchantTitle: merchant && merchant.title ? merchant.title : '',
      merchantType: merchant && merchant.type ? merchant.type : '',
      userId: remoteUserId(user),
      userName: user && user.name ? user.name : '小程序用户',
      userContact: user && user.email ? user.email : '',
      note: note || '想咨询这个服务'
    }
  })
}

async function fetchMerchantBrandAccesses() {
  try {
    const data = await request('/api/merchant-brand-accesses')
    return Array.isArray(data.merchantBrandAccesses) ? data.merchantBrandAccesses : []
  } catch (error) {
    return []
  }
}

async function recordLike(contentType, contentId, user) {
  if (!contentType || !contentId) return null
  return request('/api/reactions/like', {
    method: 'POST',
    data: {
      contentType,
      contentId,
      userId: user && user.id ? user.id : '',
      actorName: user && user.name ? user.name : '小程序用户'
    }
  })
}

function normalizeDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function searchItems(items, keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const content = [
      item.title,
      item.school,
      item.category,
      item.summary,
      item.excerpt,
      item.body,
      item.detail,
      item.author,
      ...(item.tags || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return content.includes(q)
  })
}

module.exports = {
  API_BASE,
  request,
  fetchQuestions,
  fetchQuestionDetail,
  fetchPosts,
  login,
  loginWithWechatMiniapp,
  createQuestion,
  createAnswer,
  acceptAnswer,
  requestQuestionRefund,
  createQuestionDispute,
  createPost,
  createMerchantLead,
  fetchMerchantBrandAccesses,
  recordLike,
  normalizeDate,
  searchItems
}
