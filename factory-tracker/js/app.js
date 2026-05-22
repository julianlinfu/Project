/* ============================================
   app.js — 界面逻辑层
   
   负责页面切换、渲染、用户交互。
   数据操作全部通过 data.js 里的 DB 对象完成。
   ============================================ */

const App = {

  // 当前登录工人信息
  currentWorker: '',
  currentBatchId: '',

  // 管理员当前选中的 tab
  adminTab: 'active',

  // ---- 页面切换 ----
  goto(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },

  // ---- 工人：去登录页，顺便刷新批次下拉框 ----
  gotoWorkerLogin() {
    this.goto('screen-worker-login');
    this._renderBatchSelect();
  },

  // ---- 管理员：去登录页 ----
  gotoAdminLogin() {
    this.goto('screen-admin-login');
  },

  // ---- 刷新批次下拉框 ----
  _renderBatchSelect() {
    const sel = document.getElementById('select-batch');
    const batches = DB.getAllBatches().filter(b => !Utils.isBatchDone(b));
    if (batches.length === 0) {
      sel.innerHTML = '<option>暂无进行中的批次</option>';
      return;
    }
    sel.innerHTML = batches
      .map(b => `<option value="${b.id}">${b.id}（${b.qty}件）</option>`)
      .join('');
  },

  // ---- 工人登录 ----
  workerLogin() {
    const name = document.getElementById('input-worker-name').value.trim();
    const batchId = document.getElementById('select-batch').value;
    if (!name) {
      alert('请输入你的姓名');
      return;
    }
    this.currentWorker = name;
    this.currentBatchId = batchId;
    this._renderWorkerOps();
    this.goto('screen-worker-ops');
  },

  // ---- 渲染工人操作页 ----
  _renderWorkerOps() {
    const batch = DB.getBatch(this.currentBatchId);
    if (!batch) return;

    // 顶部批次信息
    document.getElementById('worker-batch-info').textContent =
      `批次：${batch.id}  |  数量：${batch.qty}件  |  工人：${this.currentWorker}`;

    // 工序列表
    const list = document.getElementById('steps-list');
    list.innerHTML = batch.steps.map((step, i) => {
      const prevDone = i === 0 || batch.steps[i - 1].status === 'done';
      return this._renderStepCard(step, i, prevDone);
    }).join('');
  },

  // ---- 渲染单张工序卡片 ----
  _renderStepCard(step, index, prevDone) {
    // 状态徽章
    const badgeMap = {
      pending: '<span class="badge badge-pending">未开始</span>',
      active:  '<span class="badge badge-active">进行中</span>',
      done:    '<span class="badge badge-done">已完成</span>',
    };

    // 操作按钮区域
    let actionHTML = '';
    if (step.status === 'done') {
      const dur = Utils.calcDuration(step.startTime, step.endTime);
      actionHTML = `
        <div class="step-time-info">
          <span>${step.startTime} → ${step.endTime}</span>
          ${dur ? `<span class="duration-tag">${dur}</span>` : ''}
        </div>`;
    } else if (step.status === 'active') {
      actionHTML = `
        <div class="step-actions">
          <button class="btn-step btn-finish" onclick="App.completeStep(${index})">
            ✓ 标记完成
          </button>
        </div>`;
    } else if (prevDone) {
      actionHTML = `
        <div class="step-actions">
          <button class="btn-step btn-start" onclick="App.startStep(${index})">
            ▶ 开始此工序
          </button>
        </div>`;
    } else {
      actionHTML = `
        <div class="step-actions">
          <button class="btn-step btn-waiting" disabled>等待上一道工序完成</button>
        </div>`;
    }

    return `
      <div class="step-card">
        <div class="step-header">
          <span class="step-name">${index + 1}. ${step.name}</span>
          ${badgeMap[step.status]}
        </div>
        <div class="step-meta">${step.worker ? '操作人：' + step.worker : '暂未分配'}</div>
        ${actionHTML}
      </div>`;
  },

  // ---- 工人：开始工序 ----
  startStep(stepIndex) {
    DB.startStep(this.currentBatchId, stepIndex, this.currentWorker);
    this._renderWorkerOps();
  },

  // ---- 工人：完成工序 ----
  completeStep(stepIndex) {
    DB.completeStep(this.currentBatchId, stepIndex);
    this._renderWorkerOps();
  },

  // ---- 管理员登录 ----
  adminLogin() {
    const pwd = document.getElementById('input-admin-pwd').value;
    if (pwd !== ADMIN_PASSWORD) {
      alert('密码错误');
      return;
    }
    this.adminTab = 'active';
    this._renderAdminDash();
    this.goto('screen-admin-dash');
  },

  // ---- 切换 tab ----
  switchTab(tab) {
    this.adminTab = tab;
    document.getElementById('tab-active').classList.toggle('active', tab === 'active');
    document.getElementById('tab-done').classList.toggle('active', tab === 'done');
    this._renderAdminDash();
  },

  // ---- 渲染管理看板 ----
  _renderAdminDash() {
    const container = document.getElementById('admin-batches');
    const all = DB.getAllBatches();
    const filtered = all.filter(b =>
      this.adminTab === 'done' ? Utils.isBatchDone(b) : !Utils.isBatchDone(b)
    );

    if (filtered.length === 0) {
      const label = this.adminTab === 'done' ? '已完成' : '进行中';
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div>暂无${label}的批次</div>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(batch => this._renderAdminBatchCard(batch)).join('');
  },

  // ---- 渲染单个管理批次卡片 ----
  _renderAdminBatchCard(batch) {
    const pct = Utils.calcProgress(batch);
    const stepRows = batch.steps.map(step => {
      let timeStr = '—';
      let durHTML = '';
      if (step.status === 'done') {
        const dur = Utils.calcDuration(step.startTime, step.endTime);
        timeStr = `${step.startTime} → ${step.endTime}`;
        if (dur) durHTML = `<span class="duration-tag">${dur}</span>`;
      } else if (step.status === 'active') {
        timeStr = `${step.startTime} 开始`;
      }
      const badgeMap = {
        pending: '<span class="badge badge-pending">待开始</span>',
        active:  '<span class="badge badge-active">进行中</span>',
        done:    '<span class="badge badge-done">完成</span>',
      };
      return `
        <div class="step-row">
          <span class="step-row-left">${step.name}${step.worker ? ' · ' + step.worker : ''}</span>
          <span class="step-row-right">
            <span>${timeStr}</span>
            ${durHTML}
            ${badgeMap[step.status]}
          </span>
        </div>`;
    }).join('');

    return `
      <div class="admin-batch-card">
        <div class="admin-batch-header">
          <span class="admin-batch-id">${batch.id}</span>
          <span class="admin-batch-meta">${batch.qty}件 · ${pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        ${stepRows}
      </div>`;
  },

  // ---- 管理员：新建批次 ----
  createBatch() {
    const input = prompt('请输入生产数量（件）：');
    if (!input) return;
    const qty = parseInt(input);
    if (isNaN(qty) || qty <= 0) {
      alert('请输入有效的数量');
      return;
    }
    DB.createBatch(qty);
    this._renderAdminDash();
    // 同步更新工人登录页的下拉框
    this._renderBatchSelect();
    alert('批次创建成功！');
  }
};
