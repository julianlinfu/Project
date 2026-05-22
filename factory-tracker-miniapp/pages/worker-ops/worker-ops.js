const Store = require('../../utils/store');
const { Util } = require('../../utils/util');

Page({
  data: {
    batch: null,
    steps: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const app = getApp();
    const batchId = app.globalData.currentBatchId;
    const worker = app.globalData.currentWorker;
    if (!batchId) return;

    const batch = Store.getBatch(batchId);
    if (!batch) return;

    const steps = batch.steps.map((step, i) => {
      const prevDone = i === 0 || batch.steps[i - 1].status === 'done';

      let badgeClass = 'badge-pending';
      let badgeText = '未开始';
      if (step.status === 'active') { badgeClass = 'badge-active'; badgeText = '进行中'; }
      if (step.status === 'done') { badgeClass = 'badge-done'; badgeText = '已完成'; }

      const duration = Util.calcDuration(step.startTime, step.endTime);

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
      batch: {
        id: batch.id,
        qty: batch.qty,
        worker: worker,
      },
      steps
    });
  },

  startStep(e) {
    const batchId = this.data.batch.id;
    const i = e.currentTarget.dataset.index;
    const worker = this.data.batch.worker;
    Store.startStep(batchId, i, worker);
    this.loadData();
  },

  completeStep(e) {
    const batchId = this.data.batch.id;
    const i = e.currentTarget.dataset.index;
    Store.completeStep(batchId, i);
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
