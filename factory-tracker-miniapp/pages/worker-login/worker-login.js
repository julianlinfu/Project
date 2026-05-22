const Store = require('../../utils/store');
const { Util } = require('../../utils/util');

Page({
  data: {
    batches: [],
    workerName: ''
  },

  onShow() {
    const batches = Store.getAllBatches().filter(b => !Util.isBatchDone(b));
    this.setData({
      batches,
      batchIndex: batches.length > 0 ? 0 : -1
    });
  },

  onNameInput(e) {
    this.setData({ workerName: e.detail.value });
  },

  onBatchChange(e) {
    this.setData({ batchIndex: parseInt(e.detail.value) });
  },

  login() {
    const name = this.data.workerName.trim();
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (this.data.batches.length === 0) {
      wx.showToast({ title: '暂无进行中的批次', icon: 'none' });
      return;
    }

    const app = getApp();
    app.globalData.currentWorker = name;
    app.globalData.currentBatchId = this.data.batches[this.data.batchIndex].id;

    wx.navigateTo({ url: '/pages/worker-ops/worker-ops' });
  }
});
