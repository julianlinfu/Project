const { STEPS, Util } = require('./util');

const KEY_ORDERS = 'factory_orders';
const KEY_USERS = 'factory_users';

const Store = {
  // ========== 工单 ==========
  _readOrders() {
    return wx.getStorageSync(KEY_ORDERS) || [];
  },
  _writeOrders(orders) {
    wx.setStorageSync(KEY_ORDERS, orders);
  },

  getAllOrders() {
    return this._readOrders().filter(o => !o.deleted);
  },

  getOrder(id) {
    return this._readOrders().find(o => o.id === id) || null;
  },

  createOrder(data) {
    const orders = this._readOrders();
    const now = Util.nowDateTime();
    const newOrder = {
      id: data.id || 'GD' + now.replace(/[-:\s]/g, '').slice(2),
      name: data.name || '',
      productType: data.productType || '',
      qty: data.qty,
      deadline: data.deadline || '',
      notes: data.notes || '',
      alerts: data.alerts || '',
      createdAt: data.createdAt || now,
      deleted: false,
      deletedAt: null,
      steps: data.steps || STEPS.map(name => ({
        name,
        status: 'pending',
        worker: null,
        startTime: null,
        endTime: null
      }))
    };
    orders.push(newOrder);
    this._writeOrders(orders);
    return newOrder;
  },

  updateOrder(id, data) {
    const orders = this._readOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    orders[idx] = { ...orders[idx], ...data };
    this._writeOrders(orders);
    return true;
  },

  deleteOrder(id) {
    return this.updateOrder(id, { deleted: true, deletedAt: Util.nowDateTime() });
  },

  restoreOrder(id) {
    return this.updateOrder(id, { deleted: false, deletedAt: null });
  },

  permanentDelete(id) {
    const orders = this._readOrders();
    const filtered = orders.filter(o => o.id !== id);
    this._writeOrders(filtered);
    return true;
  },

  getDeletedOrders() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Util.RECYCLE_DAYS);
    return this._readOrders().filter(o => {
      if (!o.deleted || !o.deletedAt) return false;
      return new Date(o.deletedAt) >= cutoff;
    });
  },

  cleanRecycleBin() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Util.RECYCLE_DAYS);
    const orders = this._readOrders().filter(o => {
      if (!o.deleted || !o.deletedAt) return true;
      return new Date(o.deletedAt) >= cutoff;
    });
    this._writeOrders(orders);
  },

  startStep(orderId, stepIndex, workerName) {
    const orders = this._readOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    order.steps[stepIndex].status = 'active';
    order.steps[stepIndex].worker = workerName;
    order.steps[stepIndex].startTime = Util.nowTime();
    this._writeOrders(orders);
    return true;
  },

  completeStep(orderId, stepIndex) {
    const orders = this._readOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    order.steps[stepIndex].status = 'done';
    order.steps[stepIndex].endTime = Util.nowTime();
    this._writeOrders(orders);
    return true;
  },

  // ========== 用户 ==========
  _readUsers() {
    return wx.getStorageSync(KEY_USERS) || [];
  },
  _writeUsers(users) {
    wx.setStorageSync(KEY_USERS, users);
  },

  getAllUsers() {
    return this._readUsers();
  },

  getUser(openId) {
    return this._readUsers().find(u => u.id === openId) || null;
  },

  registerUser(openId, nickname, realName) {
    const users = this._readUsers();
    const existing = users.find(u => u.id === openId);
    if (existing) return existing;

    const newUser = {
      id: openId,
      nickname: nickname || '微信用户',
      realName: realName.trim(),
      role: 'pending',
      createdAt: Util.nowDateTime()
    };
    users.push(newUser);
    this._writeUsers(users);
    return newUser;
  },

  updateUser(openId, updates) {
    const users = this._readUsers();
    const user = users.find(u => u.id === openId);
    if (!user) return false;
    Object.assign(user, updates);
    this._writeUsers(users);
    return true;
  },

  approveUser(openId) {
    return this.updateUser(openId, { role: 'worker' });
  },

  disableUser(openId) {
    return this.updateUser(openId, { role: 'disabled' });
  }
};

module.exports = Store;
