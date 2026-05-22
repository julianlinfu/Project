const { ADMIN_PASSWORD } = require('../../utils/util');

Page({
  data: {
    password: ''
  },

  onPwdInput(e) {
    this.setData({ password: e.detail.value });
  },

  login() {
    if (this.data.password !== ADMIN_PASSWORD) {
      wx.showToast({ title: '密码错误', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/admin-dash/admin-dash' });
  }
});
