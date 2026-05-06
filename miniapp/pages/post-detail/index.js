const { fetchPosts } = require('../../utils/api')
const { fallbackPosts } = require('../../utils/content')

Page({
  data: {
    post: null,
    bodyText: ''
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

    this.setData({
      post,
      bodyText: post.body || post.detail || post.excerpt || post.summary || ''
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
  }
})
