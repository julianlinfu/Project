const Store = require('../../utils/store');
const { Util } = require('../../utils/util');

Page({
  data: {
    orders: [],
    orderIndex: 0,
    workerName: ''
  },

  onShow() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) {
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }
    this.setData({ workerName: user.realName });

    const orders = Store.getAllOrders().filter(o => !Util.isWorkOrderDone(o));
    this.setData({
      orders,
      orderIndex: orders.length > 0 ? 0 : -1
    });
  },

  onOrderChange(e) {
    this.setData({ orderIndex: parseInt(e.detail.value) });
  },

  enter() {
    if (this.data.orders.length === 0) {
      wx.showToast({ title: '暂无进行中的工单', icon: 'none' });
      return;
    }

    const app = getApp();
    app.globalData.currentWorker = this.data.workerName;
    app.globalData.currentOrderId = this.data.orders[this.data.orderIndex].id;

    wx.navigateTo({ url: '/pages/worker-ops/worker-ops' });
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-login/admin-login' });
  }
});
