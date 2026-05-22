const STEPS = ['裁切', '印刷', '装订', '质检'];
const ADMIN_PASSWORD = '1234';

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

  calcDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '';
    if (mins < 60) return mins + '分钟';
    return Math.floor(mins / 60) + '小时' + (mins % 60) + '分钟';
  },

  calcProgress(batch) {
    const done = batch.steps.filter(s => s.status === 'done').length;
    return Math.round((done / batch.steps.length) * 100);
  },

  isBatchDone(batch) {
    return batch.steps.every(s => s.status === 'done');
  }
};

module.exports = { STEPS, ADMIN_PASSWORD, Util };
