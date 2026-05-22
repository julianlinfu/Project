const Store = require('../../utils/store');

Page({
  data: {
    nickname: '微信用户',
    realName: ''
  },

  onLoad() {
    this.getNickname();
  },

  getNickname() {
    wx.login({
      success: () => {
        // 测试模式下 wx.login 返回模拟 code，用时间戳生成临时 openId
        const stored = wx.getStorageSync('current_openId');
        if (!stored) {
          const mockId = 'u_' + Date.now().toString(36);
          wx.setStorageSync('current_openId', mockId);
          // 尝试获取昵称
          wx.getUserProfile  // 检查 API 是否存在
          this.setData({ nickname: '微信用户' });
        }
      },
      fail: () => {
        const mockId = 'u_' + Date.now().toString(36);
        wx.setStorageSync('current_openId', mockId);
      }
    });
  },

  onNameInput(e) {
    this.setData({ realName: e.detail.value });
  },

  submit() {
    const name = this.data.realName.trim();
    if (!name) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    const openId = wx.getStorageSync('current_openId');
    const user = Store.registerUser(openId, this.data.nickname, name);

    const app = getApp();
    app.globalData.currentUser = user;

    wx.redirectTo({ url: '/pages/index/index' });
  }
});
