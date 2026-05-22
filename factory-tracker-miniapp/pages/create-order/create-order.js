const Store = require('../../utils/store');

Page({
  data: {
    editId: '',
    name: '',
    productType: '',
    qty: '',
    deadline: '',
    notes: '',
    alerts: '',
    isEdit: false
  },

  onLoad(options) {
    console.log('[create-order] page loaded, options:', options);
    if (options.id) {
      const order = Store.getOrder(options.id);
      if (order) {
        this.setData({
          isEdit: true,
          editId: order.id,
          name: order.name,
          productType: order.productType,
          qty: String(order.qty),
          deadline: order.deadline,
          notes: order.notes,
          alerts: order.alerts
        });
        wx.setNavigationBarTitle({ title: '编辑工单' });
      }
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onDeadlineChange(e) {
    this.setData({ deadline: e.detail.value });
  },

  submit() {
    const name = this.data.name.trim();
    const productType = this.data.productType.trim();
    const qty = parseInt(this.data.qty);
    const deadline = this.data.deadline;
    const notes = this.data.notes.trim();
    const alerts = this.data.alerts.trim();

    if (!name) { wx.showToast({ title: '请输入工单名称', icon: 'none' }); return; }
    if (!productType) { wx.showToast({ title: '请输入产品类型', icon: 'none' }); return; }
    if (isNaN(qty) || qty <= 0) { wx.showToast({ title: '请输入有效数量', icon: 'none' }); return; }

    if (this.data.isEdit) {
      Store.updateOrder(this.data.editId, { name, productType, qty, deadline, notes, alerts });
      wx.showToast({ title: '工单已更新', icon: 'success' });
    } else {
      Store.createOrder({ name, productType, qty, deadline, notes, alerts });
      wx.showToast({ title: '工单创建成功', icon: 'success' });
    }
    setTimeout(() => wx.navigateBack(), 1000);
  }
});
