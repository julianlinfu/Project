const { STEPS, Util } = require('./util');

const STORAGE_KEY = 'factory_batches';

const Store = {
  _read() {
    return wx.getStorageSync(STORAGE_KEY) || [];
  },

  _write(batches) {
    wx.setStorageSync(STORAGE_KEY, batches);
  },

  getAllBatches() {
    return this._read();
  },

  getBatch(batchId) {
    return this._read().find(b => b.id === batchId) || null;
  },

  createBatch(qty) {
    const batches = this._read();
    const now = Util.nowDateTime();
    const id = 'B' + now.replace(/[-:\s]/g, '').slice(2);
    const newBatch = {
      id,
      qty,
      createdAt: now,
      steps: STEPS.map(name => ({
        name,
        status: 'pending',
        worker: null,
        startTime: null,
        endTime: null
      }))
    };
    batches.push(newBatch);
    this._write(batches);
    return newBatch;
  },

  startStep(batchId, stepIndex, workerName) {
    const batches = this._read();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return false;
    batch.steps[stepIndex].status = 'active';
    batch.steps[stepIndex].worker = workerName;
    batch.steps[stepIndex].startTime = Util.nowTime();
    this._write(batches);
    return true;
  },

  completeStep(batchId, stepIndex) {
    const batches = this._read();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return false;
    batch.steps[stepIndex].status = 'done';
    batch.steps[stepIndex].endTime = Util.nowTime();
    this._write(batches);
    return true;
  }
};

module.exports = Store;
