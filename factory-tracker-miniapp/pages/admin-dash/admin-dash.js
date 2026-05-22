const Store = require('../../utils/store');
const { Util } = require('../../utils/util');

Page({
  data: {
    tab: 'active',
    batches: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const all = Store.getAllBatches();
    const filtered = all.filter(b =>
      this.data.tab === 'done' ? Util.isBatchDone(b) : !Util.isBatchDone(b)
    );

    const batches = filtered.map(batch => ({
      ...batch,
      pct: Util.calcProgress(batch),
      steps: batch.steps.map(step => {
        let timeStr = '—';
        let duration = '';
        if (step.status === 'done') {
          duration = Util.calcDuration(step.startTime, step.endTime);
          timeStr = step.startTime + ' → ' + step.endTime;
        } else if (step.status === 'active') {
          timeStr = step.startTime + ' 开始';
        }

        let badgeClass = 'badge-pending';
        let badgeText = '待开始';
        if (step.status === 'active') { badgeClass = 'badge-active'; badgeText = '进行中'; }
        if (step.status === 'done') { badgeClass = 'badge-done'; badgeText = '完成'; }

        return { ...step, timeStr, duration, badgeClass, badgeText };
      })
    }));

    this.setData({ batches });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  createBatch() {
    wx.showModal({
      title: '新建批次',
      editable: true,
      placeholderText: '请输入生产数量',
      success: res => {
        if (res.confirm && res.content) {
          const qty = parseInt(res.content);
          if (isNaN(qty) || qty <= 0) {
            wx.showToast({ title: '请输入有效的数量', icon: 'none' });
            return;
          }
          Store.createBatch(qty);
          this.loadData();
          wx.showToast({ title: '批次创建成功', icon: 'success' });
        }
      }
    });
  }
});
