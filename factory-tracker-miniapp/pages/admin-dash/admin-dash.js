const Store = require('../../utils/store');
const { Util, ROLE_LABEL } = require('../../utils/util');

Page({
  data: {
    section: 'users',
    orderTab: 'active',
    users: [],
    orders: [],
    deletedOrders: []
  },

  onShow() {
    try { Store.cleanRecycleBin(); } catch (e) {}
    this.loadData();
  },

  loadData() {
    this.loadUsers();
    this.loadOrders();
    if (this.data.section === 'recycle') this.loadDeletedOrders();
  },

  // ========== 用户管理 ==========
  loadUsers() {
    const users = Store.getAllUsers().map(u => ({
      ...u,
      roleLabel: ROLE_LABEL[u.role] || u.role,
      roleClass: 'role-' + u.role
    }));
    this.setData({ users });
  },

  approveUser(e) {
    Store.approveUser(e.currentTarget.dataset.id);
    this.loadUsers();
    wx.showToast({ title: '已通过', icon: 'success' });
  },

  disableUser(e) {
    wx.showModal({
      title: '停用用户', content: '停用后该用户将无法进入系统',
      success: res => { if (res.confirm) { Store.disableUser(e.currentTarget.dataset.id); this.loadUsers(); } }
    });
  },

  editUserName(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '修改昵称', editable: true, placeholderText: '输入新昵称', content: name,
      success: res => {
        if (res.confirm && res.content && res.content.trim()) {
          Store.updateUser(id, { realName: res.content.trim() }); this.loadUsers();
        }
      }
    });
  },

  // ========== 工单管理 ==========
  loadOrders() {
    const all = Store.getAllOrders();
    const filtered = all.filter(o =>
      this.data.orderTab === 'done' ? Util.isWorkOrderDone(o) : !Util.isWorkOrderDone(o)
    );
    const orders = filtered.map(this._formatOrder);
    this.setData({ orders });
  },

  _formatOrder(order) {
    return {
      ...order,
      pct: Util.calcProgress(order),
      deadlineLabel: order.deadline ? '交付：' + order.deadline : '',
      steps: order.steps.map(step => {
        let timeStr = '—', duration = '';
        if (step.status === 'done') { duration = Util.calcDuration(step.startTime, step.endTime); timeStr = step.startTime + ' → ' + step.endTime; }
        else if (step.status === 'active') { timeStr = step.startTime + ' 开始'; }
        let bc = 'badge-pending', bt = '待开始';
        if (step.status === 'active') { bc = 'badge-active'; bt = '进行中'; }
        if (step.status === 'done') { bc = 'badge-done'; bt = '完成'; }
        return { ...step, timeStr, duration, badgeClass: bc, badgeText: bt };
      })
    };
  },

  editOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/create-order/create-order?id=' + id });
  },

  deleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除工单', content: '工单将被移入回收站，60天内可恢复',
      success: res => { if (res.confirm) { Store.deleteOrder(id); this.loadOrders(); } }
    });
  },

  // ========== 回收站 ==========
  loadDeletedOrders() {
    const deleted = Store.getDeletedOrders();
    const orders = deleted.map(o => ({
      ...o,
      daysAgo: Util.daysAgo(o.deletedAt),
      pct: Util.calcProgress(o)
    }));
    this.setData({ deletedOrders: orders });
  },

  restoreOrder(e) {
    Store.restoreOrder(e.currentTarget.dataset.id);
    this.loadDeletedOrders();
    wx.showToast({ title: '已恢复', icon: 'success' });
  },

  permanentDeleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '永久删除', content: '该工单将被彻底删除，无法恢复',
      success: res => { if (res.confirm) { Store.permanentDelete(id); this.loadDeletedOrders(); } }
    });
  },

  // ========== 切换 ==========
  switchSection(e) {
    const s = e.currentTarget.dataset.section;
    this.setData({ section: s });
    if (s === 'recycle') this.loadDeletedOrders();
  },

  switchOrderTab(e) {
    this.setData({ orderTab: e.currentTarget.dataset.tab });
    this.loadOrders();
  },

  goCreateOrder() {
    wx.navigateTo({ url: '/pages/create-order/create-order' });
  },

  onPullDownRefresh() {
    this.loadData(); wx.stopPullDownRefresh();
  }
});
