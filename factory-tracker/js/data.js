/* ============================================
   data.js — 数据层
   
   这里存放所有批次数据和工序配置。
   
   【如何修改工序】
   改下面 STEPS 数组里的名字即可，例如：
   const STEPS = ['备料', '冲压', '焊接', '喷涂', '质检'];
   
   【如何对接真实后端】
   把 DB 对象里的方法替换成 fetch() API 调用即可，
   其他代码不需要改动。
   ============================================ */

// ---- 工序配置（在这里修改工序名称）----
const STEPS = ['裁切', '印刷', '装订', '质检'];

// ---- 管理员密码（上线前改掉）----
const ADMIN_PASSWORD = '1234';

// ---- 内存数据库（模拟真实后端）----
const DB = {

  // 初始演示数据
  batches: [
    {
      id: 'B2024-001',
      qty: 500,
      createdAt: '2024-01-15 08:00',
      steps: [
        { name: '裁切',  status: 'done',    worker: '张伟', startTime: '08:15', endTime: '09:42' },
        { name: '印刷',  status: 'active',  worker: '李明', startTime: '09:50', endTime: null },
        { name: '装订',  status: 'pending', worker: null,   startTime: null,    endTime: null },
        { name: '质检',  status: 'pending', worker: null,   startTime: null,    endTime: null },
      ]
    },
    {
      id: 'B2024-002',
      qty: 300,
      createdAt: '2024-01-15 10:00',
      steps: [
        { name: '裁切',  status: 'active',  worker: '王芳', startTime: '10:05', endTime: null },
        { name: '印刷',  status: 'pending', worker: null,   startTime: null,    endTime: null },
        { name: '装订',  status: 'pending', worker: null,   startTime: null,    endTime: null },
        { name: '质检',  status: 'pending', worker: null,   startTime: null,    endTime: null },
      ]
    }
  ],

  // 批次计数器（用于生成新批次 ID）
  _counter: 3,

  // ---- 读取所有批次 ----
  getAllBatches() {
    return this.batches;
  },

  // ---- 读取单个批次 ----
  getBatch(batchId) {
    return this.batches.find(b => b.id === batchId) || null;
  },

  // ---- 新建批次 ----
  createBatch(qty) {
    const id = 'B2024-00' + this._counter++;
    const newBatch = {
      id,
      qty,
      createdAt: Utils.nowDateTime(),
      steps: STEPS.map(name => ({
        name,
        status: 'pending',
        worker: null,
        startTime: null,
        endTime: null,
      }))
    };
    this.batches.push(newBatch);
    return newBatch;
  },

  // ---- 开始某道工序 ----
  startStep(batchId, stepIndex, workerName) {
    const batch = this.getBatch(batchId);
    if (!batch) return false;
    batch.steps[stepIndex].status = 'active';
    batch.steps[stepIndex].worker = workerName;
    batch.steps[stepIndex].startTime = Utils.nowTime();
    return true;
  },

  // ---- 完成某道工序 ----
  completeStep(batchId, stepIndex) {
    const batch = this.getBatch(batchId);
    if (!batch) return false;
    batch.steps[stepIndex].status = 'done';
    batch.steps[stepIndex].endTime = Utils.nowTime();
    return true;
  }
};

// ---- 工具函数 ----
const Utils = {

  // 当前时间，格式 HH:MM
  nowTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  },

  // 当前日期时间
  nowDateTime() {
    return new Date().toLocaleString('zh-CN');
  },

  // 计算两个 HH:MM 之间的耗时，返回可读字符串
  calcDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '';
    if (mins < 60) return mins + '分钟';
    return Math.floor(mins / 60) + '小时' + (mins % 60) + '分钟';
  },

  // 计算批次完成百分比
  calcProgress(batch) {
    const done = batch.steps.filter(s => s.status === 'done').length;
    return Math.round((done / batch.steps.length) * 100);
  },

  // 判断批次是否全部完成
  isBatchDone(batch) {
    return batch.steps.every(s => s.status === 'done');
  }
};
