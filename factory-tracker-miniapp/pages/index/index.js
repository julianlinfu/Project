const Store = require('../../utils/store');
const { ROLE } = require('../../utils/util');

Page({
  data: {
    loading: true,
    status: '',   // unregistered | pending | worker | disabled
    realName: '',
    nickname: ''
  },

  onShow() {
    this.checkUser();
  },

  checkUser() {
    const openId = wx.getStorageSync('current_openId');
    if (!openId) {
      this.setData({ loading: false, status: 'unregistered' });
      return;
    }

    const user = Store.getUser(openId);
    if (!user) {
      this.setData({ loading: false, status: 'unregistered' });
      return;
    }

    // 同步到全局
    getApp().globalData.currentUser = user;

    this.setData({
      loading: false,
      status: user.role,
      realName: user.realName,
      nickname: user.nickname
    });

    if (user.role === ROLE.WORKER) {
      wx.redirectTo({ url: '/pages/worker-login/worker-login' });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-login/admin-login' });
  }
});
