App({
  globalData: {
    currentUser: null
  },

  onLaunch() {
    this._checkLogin();
  },

  _checkLogin() {
    const stored = wx.getStorageSync('current_openId');
    if (stored) {
      const Store = require('./utils/store');
      const user = Store.getUser(stored);
      if (user) {
        this.globalData.currentUser = user;
      }
    }
  }
});
