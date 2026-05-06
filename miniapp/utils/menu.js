const sideMenuRoutes = {
  '添加好友': 'friends',
  '我的草稿': 'drafts',
  '浏览记录': 'history',
  '购买的服务': 'services',
  '消费记录': 'spending',
  '钱包': 'wallet',
  '社区公约': 'rules',
  '帮助与客服': 'help',
  '设置': 'settings'
}

function openSideMenuAction(label) {
  if (label === '扫一扫') {
    wx.scanCode({
      onlyFromCamera: false,
      fail: () => wx.showToast({ title: '扫码已取消', icon: 'none' })
    })
    return
  }

  const type = sideMenuRoutes[label]
  if (!type) {
    wx.showToast({ title: (label || '该功能') + '整理中', icon: 'none' })
    return
  }

  wx.navigateTo({ url: '/pages/toolbox/index?type=' + type })
}

module.exports = {
  openSideMenuAction
}
