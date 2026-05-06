const {
  fetchQuestionDetail,
  createAnswer: createRemoteAnswer,
  acceptAnswer: acceptRemoteAnswer,
  requestQuestionRefund,
  createQuestionDispute
} = require('../../utils/api')
const { fallbackQuestions } = require('../../utils/content')

function normalizeAnswer(answer) {
  return {
    ...answer,
    avatar: answer.avatar || String(answer.author || '答').slice(0, 1),
    accepted: Boolean(answer.accepted)
  }
}

function seedAnswers(question) {
  const category = `${question.category || ''} ${question.title || ''}`
  const officialTip = category.includes('签证') || category.includes('D-') || category.includes('登录证')
    ? '签证、打工和滞留资格信息要以 HiKorea、出入境、1345 和学校国际处最新公告为准。'
    : '建议把聊天记录、合同、付款记录和学校/官方窗口说明一起保存，方便后续核对。'
  const firstContent = category.includes('找房') || category.includes('租房')
    ? '我会先帮你核对房东身份、登记簿、合同主体、押金收款账户和退租条款。你可以把地址、合同关键页、保证金金额和中介信息先整理出来，敏感证件号打码后再发。'
    : category.includes('打工') || category.includes('兼职')
      ? '先确认你现在的签证阶段和学校是否允许申请时间制就业，再核对雇主信息、合同、排班和工资结算方式。不要先上班再补手续。'
      : category.includes('论文') || category.includes('作业')
        ? '先把院系毕业要求、导师意见、当前进度、截止日期和需要延期的原因列出来。能不能延、怎么延，最终还是以院系和国际处说明为准。'
        : '我建议先把你的学校、阶段、截止时间、已有材料和卡住的点列清楚，再按“官方要求、学校要求、个人情况”三层拆开处理。'
  return [
    {
      id: `${question.id}-seed-1`,
      author: '同校过来人',
      avatar: '同',
      identity: '已解决过类似问题',
      content: firstContent,
      likes: 18,
      accepted: question.status === 'solved'
    },
    {
      id: `${question.id}-seed-2`,
      author: '资料整理员',
      avatar: '资',
      identity: '常识补充',
      content: officialTip,
      likes: 9,
      accepted: false
    }
  ]
}

function answerStorageKey(questionId) {
  return `questionAnswers:${questionId}`
}

function mergeAnswers(remoteAnswers = [], localAnswers = []) {
  const seen = new Set()
  return [...remoteAnswers.map(normalizeAnswer), ...localAnswers.map(normalizeAnswer)].filter((answer) => {
    const id = String(answer.id || '')
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

Page({
  data: {
    question: null,
    answers: [],
    answerText: '',
    disputeText: '',
    settled: false,
    settledPoints: 0
  },

  async onLoad(options = {}) {
    const stored = wx.getStorageSync('activeQuestionDetail')
    const questionId = options.id ? decodeURIComponent(options.id) : stored && stored.id
    let question = stored || fallbackQuestions.find((item) => item.id === questionId)
    let answers = questionId ? (wx.getStorageSync(answerStorageKey(questionId)) || []) : []

    if (questionId) {
      try {
        const detail = await fetchQuestionDetail(questionId)
        question = detail.question || question
        answers = mergeAnswers(detail.answers || [], answers)
      } catch (error) {
        // Keep the miniapp usable for demo/fallback content that has not been written to D1 yet.
      }
    }

    if (!question) {
      wx.navigateBack()
      return
    }

    if (!answers.length) answers = seedAnswers(question)
    this.setData({ question, answers: answers.map(normalizeAnswer) })
    wx.setNavigationBarTitle({ title: question.title || '求助详情' })
  },

  onShareAppMessage() {
    const question = this.data.question || {}
    return {
      title: question.title || '售业求助详情',
      path: question.id ? `/pages/question-detail/index?id=${encodeURIComponent(question.id)}` : '/pages/questions/index',
      imageUrl: 'https://shouye.fun/wechat-share-card.jpg'
    }
  },

  onAnswerInput(event) {
    this.setData({ answerText: event.detail.value })
  },

  onDisputeInput(event) {
    this.setData({ disputeText: event.detail.value })
  },

  async submitAnswer() {
    const content = String(this.data.answerText || '').trim()
    if (content.length < 20) {
      wx.showToast({ title: '至少写 20 个字，说明实际步骤', icon: 'none' })
      return
    }
    const question = this.data.question
    if (!question) return
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || {}

    try {
      const result = await createRemoteAnswer(question.id, user, content)
      const answer = normalizeAnswer(result.answer)
      const answers = mergeAnswers([answer], this.data.answers)
      wx.setStorageSync(answerStorageKey(question.id), answers)
      this.setData({
        question: result.question || question,
        answers,
        answerText: ''
      })
      wx.showToast({ title: '已提交，等待采纳', icon: 'success' })
    } catch (error) {
      const message = error && error.message ? error.message : '提交失败'
      if (!message.includes('网络')) {
        wx.showToast({ title: message.slice(0, 18), icon: 'none' })
        return
      }
      const answer = normalizeAnswer({
        id: `local-${Date.now()}`,
        author: user.name || '我来助人',
        identity: '待采纳回答',
        content,
        likes: 0,
        accepted: false
      })
      const answers = [answer, ...this.data.answers]
      wx.setStorageSync(answerStorageKey(question.id), answers)
      this.setData({ answers, answerText: '' })
      wx.showToast({ title: '已离线保存', icon: 'none' })
    }
  },

  async acceptAnswer(event) {
    const id = event.currentTarget.dataset.id
    const question = this.data.question
    if (!question) return
    const reward = Number(question.rewardPoints || 0)
    const fallbackPoints = reward > 0 ? Math.min(200, Math.max(50, reward)) : 50
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || {}

    try {
      const result = await acceptRemoteAnswer(question.id, id, user)
      const answers = result.answers && result.answers.length
        ? result.answers.map(normalizeAnswer)
        : this.data.answers.map((item) => ({ ...item, accepted: item.id === id }))
      wx.setStorageSync(answerStorageKey(question.id), answers)
      this.setData({
        question: result.question || { ...question, status: 'solved' },
        answers,
        settled: true,
        settledPoints: result.settledPoints || fallbackPoints
      })
      wx.showToast({ title: `已采纳 +${result.settledPoints || fallbackPoints} 积分`, icon: 'none' })
    } catch (error) {
      const answers = this.data.answers.map((item) => ({
        ...item,
        accepted: item.id === id
      }))
      wx.setStorageSync(answerStorageKey(question.id), answers)
      this.setData({ answers, settled: true, settledPoints: fallbackPoints })
      wx.showToast({ title: `本地演示采纳 +${fallbackPoints} 积分`, icon: 'none' })
    }
  },

  async requestRefund() {
    const question = this.data.question
    if (!question) return
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || {}
    try {
      const result = await requestQuestionRefund(question.id, user)
      this.setData({ question: result.question || { ...question, rewardPoints: 0 } })
      wx.showToast({ title: '退款申请已处理', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: (error.message || '请改走申诉').slice(0, 18), icon: 'none' })
    }
  },

  async submitDispute() {
    const question = this.data.question
    const detail = String(this.data.disputeText || '').trim()
    if (!question) return
    if (detail.length < 6) {
      wx.showToast({ title: '请写明申诉原因', icon: 'none' })
      return
    }
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser') || {}
    try {
      await createQuestionDispute(question.id, user, {
        type: 'appeal',
        reason: '申请人工处理',
        detail
      })
      this.setData({ disputeText: '' })
      wx.showToast({ title: '已提交人工处理', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: (error.message || '提交失败').slice(0, 18), icon: 'none' })
    }
  }
})
