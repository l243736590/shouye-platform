const { createPost, createQuestion } = require('../../utils/api')
const { postCategories, questionCategories, skillCategories, schools } = require('../../utils/content')

const modeConfig = {
  question: {
    eyebrow: '提问/悬赏',
    title: '提出问题寻求帮助，或者直接悬赏解决问题',
    submitText: '发布问题',
    titlePlaceholder: '例如：中央大附近找房怎么避坑？',
    detailPlaceholder: '把学校、时间线、材料背景和你卡住的点写清楚...',
    categories: questionCategories
  },
  experience: {
    eyebrow: 'I KNOW 我知道',
    title: '发布可检索、可审核、可加精的留学经验',
    submitText: '保存并发布经验',
    titlePlaceholder: '例如：庆熙大学传媒研究生真实体验',
    detailPlaceholder: '写下申请过程、课程体验、教授风格、毕业要求、避坑建议...',
    categories: postCategories
  },
  skill: {
    eyebrow: 'I CAN 我能做',
    title: '发布你能提供的技能服务',
    submitText: '发布技能服务',
    titlePlaceholder: '例如：弘大附近可帮忙排队/跑腿/喂猫',
    detailPlaceholder: '写清服务范围、可服务时间、费用积分、边界和注意事项。严禁代写、代考、替课、作弊。',
    categories: skillCategories
  }
}

Page({
  data: {
    mode: 'question',
    config: modeConfig.question,
    categories: modeConfig.question.categories,
    schools: ['韩国留学', ...schools.map((item) => item.name)],
    schoolIndex: 0,
    categoryIndex: 0,
    form: {
      title: '',
      school: '韩国留学',
      category: modeConfig.question.categories[0],
      rewardPoints: 0,
      price: 0,
      excerpt: '',
      detail: '',
      body: '',
      city: ''
    },
    submitting: false
  },

  onLoad(options) {
    const mode = modeConfig[options.mode] ? options.mode : 'question'
    this.setMode(mode)
  },

  onShow() {
    wx.showTabBar()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 2, visible: true })
    const pendingMode = wx.getStorageSync('pendingPublishMode')
    if (modeConfig[pendingMode]) {
      wx.removeStorageSync('pendingPublishMode')
      this.setMode(pendingMode)
    }
  },

  setMode(mode) {
    const config = modeConfig[mode]
    this.setData({
      mode,
      config,
      categories: config.categories,
      categoryIndex: 0,
      'form.category': config.categories[0],
      'form.rewardPoints': 0,
      'form.price': 0
    })
  },

  chooseMode(event) {
    this.setMode(event.currentTarget.dataset.mode)
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: event.detail.value })
  },

  onSchoolChange(event) {
    const schoolIndex = Number(event.detail.value)
    this.setData({
      schoolIndex,
      'form.school': this.data.schools[schoolIndex]
    })
  },

  onCategoryChange(event) {
    const categoryIndex = Number(event.detail.value)
    this.setData({
      categoryIndex,
      'form.category': this.data.categories[categoryIndex]
    })
  },

  async submit() {
    const app = getApp()
    const user = app.globalData.user || wx.getStorageSync('shouyeUser')
    if (!user) {
      wx.showModal({
        title: '需要先登录',
        content: '发布内容需要先登录账号。你可以先回首页完成微信登录，再回来发布。',
        success(res) {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/index/index' })
          }
        }
      })
      return
    }

    const form = this.data.form
    if (!form.title || (!form.detail && !form.body)) {
      wx.showToast({ title: '标题和正文不能为空', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      if (this.data.mode === 'question') {
        await createQuestion(user, {
          ...form,
          detail: form.detail || form.body,
          tags: [form.category, form.school].filter(Boolean)
        })
        wx.showToast({ title: '问题已发布', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/questions/index' }), 800)
      } else {
        await createPost(user, {
          ...form,
          price: this.data.mode === 'skill' ? form.price : form.price,
          excerpt: form.excerpt || String(form.body || form.detail).slice(0, 54),
          body: form.body || form.detail
        })
        wx.showToast({ title: '内容已发布', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/posts/index' }), 800)
      }
    } catch (error) {
      wx.showToast({ title: error.message || '发布失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
