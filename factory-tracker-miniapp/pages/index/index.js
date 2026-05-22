Page({
  goWorker() {
    wx.navigateTo({ url: '/pages/worker-login/worker-login' });
  },
  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-login/admin-login' });
  }
});
