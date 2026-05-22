const Store = require('../../utils/store');
const { Util } = require('../../utils/util');

Page({
  data: {
    order: null,
    steps: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const app = getApp();
    const orderId = app.globalData.currentOrderId;
    const worker = app.globalData.currentWorker;
    if (!orderId) return;

    const order = Store.getOrder(orderId);
    if (!order) return;

    const steps = order.steps.map((step, i) => {
      const prevDone = i === 0 || order.steps[i - 1].status === 'done';
      const duration = Util.calcDuration(step.startTime, step.endTime);

      let badgeClass = 'badge-pending';
      let badgeText = '未开始';
      if (step.status === 'active') { badgeClass = 'badge-active'; badgeText = '进行中'; }
      if (step.status === 'done') { badgeClass = 'badge-done'; badgeText = '已完成'; }

      return {
        ...step,
        index: i,
        prevDone,
        badgeClass,
        badgeText,
        duration,
      };
    });

    this.setData({
      order: {
        id: order.id,
        name: order.name,
        qty: order.qty,
        productType: order.productType,
        alerts: order.alerts,
        worker: worker,
      },
      steps
    });
  },

  startStep(e) {
    const orderId = this.data.order.id;
    const i = e.currentTarget.dataset.index;
    const worker = this.data.order.worker;
    Store.startStep(orderId, i, worker);
    this.loadData();
  },

  completeStep(e) {
    const orderId = this.data.order.id;
    const i = e.currentTarget.dataset.index;
    Store.completeStep(orderId, i);
    this.loadData();
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-login/admin-login' });
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
