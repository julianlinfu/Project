const STEPS = ['裁切', '印刷', '装订', '质检'];
const ADMIN_PASSWORD = '1234';

const ROLE = {
  PENDING: 'pending',
  WORKER: 'worker',
  ADMIN: 'admin',
  DISABLED: 'disabled'
};

const ROLE_LABEL = {
  pending: '待审批',
  worker: '已通过',
  admin: '管理员',
  disabled: '已停用'
};

const Util = {
  nowTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' +
           d.getMinutes().toString().padStart(2, '0');
  },

  nowDateTime() {
    const d = new Date();
    return d.getFullYear() + '-' +
           (d.getMonth() + 1).toString().padStart(2, '0') + '-' +
           d.getDate().toString().padStart(2, '0') + ' ' +
           Util.nowTime();
  },

  nowDate() {
    const d = new Date();
    return d.getFullYear() + '-' +
           (d.getMonth() + 1).toString().padStart(2, '0') + '-' +
           d.getDate().toString().padStart(2, '0');
  },

  calcDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '';
    if (mins < 60) return mins + '分钟';
    return Math.floor(mins / 60) + '小时' + (mins % 60) + '分钟';
  },

  calcProgress(workOrder) {
    const done = workOrder.steps.filter(s => s.status === 'done').length;
    return Math.round((done / workOrder.steps.length) * 100);
  },

  isWorkOrderDone(workOrder) {
    return workOrder.steps.every(s => s.status === 'done');
  },

  daysAgo(dateStr) {
    if (!dateStr) return '';
    const then = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diff < 1) return '今天';
    if (diff === 1) return '昨天';
    if (diff < 30) return diff + '天前';
    if (diff < 60) return Math.floor(diff / 30) + '个月前';
    return Math.floor(diff / 30) + '个月前';
  },

  RECYCLE_DAYS: 60
};

module.exports = { STEPS, ADMIN_PASSWORD, ROLE, ROLE_LABEL, Util };
