// 全局数据存储（初始化+本地存储）
let appData = {
  lists: [],
  resources: [],
  comments: [],
  stats: {
    visits: 0,
    likes: 0,
    comments: 0,
    resourceCounts: {
      'desktop-app': 0,
      'web-app': 0,
      'video': 0,
      'note': 0,
      'code': 0
    },
    monthlyAdds: [
      {"month": "1月", "count": 0},
      {"month": "2月", "count": 0},
      {"month": "3月", "count": 0},
      {"month": "4月", "count": 0},
      {"month": "5月", "count": 0},
      {"month": "6月", "count": 0}
    ]
  }
};

// DOM元素缓存（优化选择器，减少重复查询）
const dom = {
  createRootListBtn: document.getElementById('createRootListBtn'),
  listsTree: document.getElementById('listsTree'),
  listModal: document.getElementById('listModal'),
  modalTitle: document.getElementById('modalTitle'),
  listForm: document.getElementById('listForm'),
  listName: document.getElementById('listName'),
  listType: document.getElementById('listType'),
  listDescription: document.getElementById('listDescription'),
  listId: document.getElementById('listId'),
  parentListId: document.getElementById('parentListId'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  submitListBtn: document.getElementById('submitListBtn'),
  modalClose: document.querySelectorAll('.modal-close'),
  resourceModal: document.getElementById('resourceModal'),
  resourceName: document.getElementById('resourceName'),
  resourceDesc: document.getElementById('resourceDesc'),
  resourceCover: document.getElementById('resourceCover'),
  resourceUrl: document.getElementById('resourceUrl'),
  resourceId: document.getElementById('resourceId'),
  resourceListId: document.getElementById('resourceListId'),
  cancelResourceModalBtn: document.getElementById('cancelResourceModalBtn'),
  submitResourceBtn: document.getElementById('submitResourceBtn'),
  commentModal: document.getElementById('commentModal'),
  commentContent: document.getElementById('commentContent'),
  commentsList: document.getElementById('commentsList'),
  commentModalTitle: document.getElementById('commentModalTitle'),
  submitCommentBtn: document.getElementById('submitCommentBtn'),
  cancelCommentModalBtn: document.getElementById('cancelCommentModalBtn'),
  containers: {
    'desktop-app': document.getElementById('desktopAppsContainer'),
    'web-app': document.getElementById('webAppsContainer'),
    'video': document.getElementById('videosContainer'),
    'note': document.getElementById('notesContainer'),
    'code': document.getElementById('codeLibraryContainer')
  },
  charts: {
    resource: document.getElementById('resourceChart'),
    add: document.getElementById('resourceAddChart')
  },
  menuBtn: document.getElementById('menuBtn'),
  mobileMenu: document.getElementById('mobileMenu'),
  navbar: document.getElementById('navbar'),
  subscribeForm: document.querySelector('.subscribe-form')
};

// 初始化应用（入口函数）
function initApp() {
  loadData();       // 加载本地存储数据
  renderLists();    // 渲染列表树
  renderAllResources(); // 渲染所有资源
  initCharts();     // 初始化图表
  bindEvents();     // 绑定所有事件（关键！之前缺失）
}

// 加载本地存储数据
function loadData() {
  const saved = localStorage.getItem('learnHubData');
  if (saved) {
    try {
      appData = JSON.parse(saved);
    }
    catch (e) {
      console.error('数据加载失败，使用默认数据', e);
      saveData(); // 重置数据
    }
  }
}

// 保存数据到本地存储
function saveData() {
  localStorage.setItem('learnHubData', JSON.stringify(appData));
}

// 生成唯一ID（优化性能）
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 获取资源类型文本
function getTypeText(type) {
  const typeMap = {
    'desktop-app': '桌面应用',
    'web-app': 'Web应用',
    'video': '视频',
    'note': '笔记',
    'code': '代码'
  };
  return typeMap[type] || '未知类型';
}

// 获取列表名称
function getListName(listId) {
  const list = appData.lists.find(item => item.id === listId);
  return list ? list.name : '未知列表';
}

// 滚动到指定区域
function scrollToSection(selector) {
  const section = document.querySelector(selector);
  if (section) {
    window.scrollTo({
      top: section.offsetTop - 80,
      behavior: 'smooth'
    });
  }
}

// ==========================================
// 列表相关功能
// ==========================================
function renderLists() {
  const rootLists = appData.lists.filter(list => !list.parentId);
  
  if (rootLists.length === 0) {
    dom.listsTree.innerHTML = '<p class="text-gray-400">暂无列表，点击"创建根列表"开始</p>';
    return;
  }
  
  dom.listsTree.innerHTML = '';
  rootLists.forEach(list => {
    dom.listsTree.appendChild(createListElement(list));
  });
}

function createListElement(list) {
  const listEl = document.createElement('div');
  listEl.className = 'list-item';
  listEl.dataset.id = list.id;
  
  // 列表头部
  const header = document.createElement('div');
  header.className = 'list-header';
  
  // 展开/折叠按钮
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'list-action-btn';
  toggleBtn.innerHTML = '<i class="fa fa-caret-right list-icon"></i>';
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const childContainer = listEl.querySelector('.child-lists');
    if (childContainer) {
      childContainer.classList.toggle('active');
      toggleBtn.innerHTML = childContainer.classList.contains('active') 
        ? '<i class="fa fa-caret-down list-icon"></i>' 
        : '<i class="fa fa-caret-right list-icon"></i>';
    }
  });
  
  // 列表名称
  const nameEl = document.createElement('span');
  nameEl.className = 'list-name';
  nameEl.textContent = list.name;
  
  // 操作按钮
  const actions = document.createElement('div');
  actions.className = 'list-actions';
  
  const addChildBtn = createActionBtn('fa-plus', '子列表', () => openListModal('create', list.id));
  const addResourceBtn = createActionBtn('fa-plus', '资源', () => openResourceModal('create', list.id));
  const editBtn = createActionBtn('fa-edit', '', () => openListModal('edit', null, list));
  const deleteBtn = createActionBtn('fa-trash', '', () => deleteList(list.id));
  
  actions.append(addChildBtn, addResourceBtn, editBtn, deleteBtn);
  header.append(toggleBtn, nameEl, actions);
  
  // 子列表容器
  const childContainer = document.createElement('div');
  childContainer.className = 'child-lists';
  
  // 渲染子列表
  const childLists = appData.lists.filter(item => item.parentId === list.id);
  childLists.forEach(child => {
    childContainer.appendChild(createListElement(child));
  });
  
  // 组装元素
  listEl.append(header, childContainer);
  
  // 点击列表跳转
  header.addEventListener('click', () => {
    const sectionMap = {
      'desktop-app': '#desktop-apps',
      'web-app': '#web-apps',
      'video': '#videos',
      'note': '#notes',
      'code': '#code-library'
    };
    scrollToSection(sectionMap[list.type] || '#home');
    renderResources(list.type);
  });
  
  return listEl;
}

// 创建操作按钮（复用逻辑）
function createActionBtn(icon, text, callback) {
  const btn = document.createElement('button');
  btn.className = 'list-action-btn';
  btn.innerHTML = `<i class="fa ${icon}"></i>${text ? ' ' + text : ''}`;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    callback();
  });
  return btn;
}

function openListModal(type, parentId = null, list = null) {
  dom.modalTitle.textContent = type === 'create' ? '创建列表' : '编辑列表';
  dom.submitListBtn.textContent = type === 'create' ? '确认创建' : '确认修改';
  
  // 重置表单
  dom.listForm.reset();
  dom.listId.value = '';
  dom.parentListId.value = parentId || '';
  
  // 编辑模式填充数据
  if (type === 'edit' && list) {
    dom.listName.value = list.name;
    dom.listType.value = list.type;
    dom.listDescription.value = list.description || '';
    dom.listId.value = list.id;
    dom.parentListId.value = list.parentId || '';
  }
  
  dom.listModal.style.display = 'flex';
}

function saveList() {
  const id = dom.listId.value || generateId();
  const name = dom.listName.value.trim();
  const type = dom.listType.value;
  const description = dom.listDescription.value.trim();
  const parentId = dom.parentListId.value || null;
  
  if (!name) {
    alert('列表名称不能为空！');
    return;
  }
  
  const listData = {
    id,
    name,
    type,
    description,
    parentId,
    createTime: new Date().getTime()
  };
  
  // 编辑或新增
  const index = appData.lists.findIndex(item => item.id === id);
  if (index !== -1) {
    appData.lists[index] = listData;
  }
  else {
    appData.lists.push(listData);
  }
  
  saveData();
  renderLists();
  dom.listModal.style.display = 'none';
}

function deleteList(listId) {
  if (!confirm('确定删除该列表？关联的子列表和资源也会被删除！')) return;
  
  // 递归删除子列表和资源
  function deleteRecursive(currentId) {
    // 删除子列表
    const childLists = appData.lists.filter(item => item.parentId === currentId);
    childLists.forEach(child => deleteRecursive(child.id));
    
    // 删除关联资源
    const resourcesToDelete = appData.resources.filter(res => res.listId === currentId);
    resourcesToDelete.forEach(res => {
      // 删除资源评论
      appData.comments = appData.comments.filter(cmt => cmt.resourceId !== res.id);
      // 更新统计
      appData.stats.resourceCounts[res.type]--;
      appData.stats.comments -= res.commentCount;
    });
    
    // 删除当前列表和资源
    appData.lists = appData.lists.filter(item => item.id !== currentId);
    appData.resources = appData.resources.filter(res => res.listId !== currentId);
  }
  
  deleteRecursive(listId);
  saveData();
  renderLists();
  renderAllResources();
  initCharts();
}

// ==========================================
// 资源相关功能
// ==========================================
function renderAllResources() {
  Object.keys(dom.containers).forEach(type => {
    renderResources(type);
  });
}

function renderResources(type) {
  const container = dom.containers[type];
  const resources = appData.resources.filter(res => res.type === type);
  
  // 清空容器
  container.innerHTML = '';
  
  // 空状态
  if (resources.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa ${getEmptyIcon(type)} empty-icon"></i>
        <p class="empty-text">暂无${getTypeText(type)}资源，可通过左侧列表添加</p>
      </div>
    `;
    return;
  }
  
  // 渲染资源卡片
  resources.forEach(res => {
    container.appendChild(createResourceCard(res));
  });
}

function getEmptyIcon(type) {
  const iconMap = {
    'desktop-app': 'fa-folder-open-o',
    'web-app': 'fa-globe',
    'video': 'fa-play-circle-o',
    'note': 'fa-book',
    'code': 'fa-code'
  };
  return iconMap[type] || 'fa-file-o';
}

function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'card card-hover resource-card';
  card.dataset.id = resource.id;
  
  // 卡片内容
  card.innerHTML = `
    <img src="${resource.cover || `https://picsum.photos/id/${resource.id.charCodeAt(0) % 200}/600/400`}" alt="${resource.name}">
    <div class="resource-card-body">
      <div class="resource-meta">
        <span><i class="fa fa-calendar-o"></i> ${formatDate(resource.createTime)}</span>
        <span><i class="fa fa-folder-o"></i> ${getListName(resource.listId)}</span>
      </div>
      <h3 class="resource-title">${resource.name}</h3>
      <p class="resource-desc">${resource.description}</p>
      ${resource.url ? `<a href="${resource.url}" target="_blank" class="resource-link"><i class="fa fa-external-link"></i> 访问资源</a>` : ''}
      <div class="resource-stats">
        <div class="stat-item">
          <i class="fa fa-eye stat-icon"></i>
          <span>${resource.visitCount} 浏览</span>
        </div>
        <div class="stat-item">
          <i class="fa fa-thumbs-up stat-icon"></i>
          <span>${resource.likeCount} 点赞</span>
        </div>
        <div class="stat-item">
          <i class="fa fa-comment-o stat-icon"></i>
          <span>${resource.commentCount} 评论</span>
        </div>
        <div class="resource-actions">
          <button class="list-action-btn like-btn" data-id="${resource.id}">
            <i class="fa fa-thumbs-up"></i>
          </button>
          <button class="list-action-btn comment-btn" data-id="${resource.id}" data-name="${resource.name}">
            <i class="fa fa-comment"></i>
          </button>
          <button class="list-action-btn edit-btn" data-id="${resource.id}">
            <i class="fa fa-edit"></i>
          </button>
          <button class="list-action-btn delete-btn" data-id="${resource.id}">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // 绑定事件
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.list-action-btn') && !e.target.closest('a')) {
      visitResource(resource.id);
    }
  });
  
  // 点赞
  card.querySelector('.like-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    likeResource(resource.id);
  });
  
  // 评论
  card.querySelector('.comment-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openCommentModal(resource.id, resource.name);
  });
  
  // 编辑
  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openResourceModal('edit', null, resource);
  });
  
  // 删除
  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteResource(resource.id);
  });
  
  return card;
}

function openResourceModal(type, listId = null, resource = null) {
  dom.resourceModalTitle.textContent = type === 'create' ? '添加资源' : '编辑资源';
  dom.submitResourceBtn.textContent = type === 'create' ? '确认添加' : '确认修改';
  
  // 重置表单
  dom.resourceForm.reset();
  dom.resourceId.value = '';
  dom.resourceListId.value = listId || '';
  
  // 编辑模式填充数据
  if (type === 'edit' && resource) {
    dom.resourceName.value = resource.name;
    dom.resourceDesc.value = resource.description || '';
    dom.resourceCover.value = resource.cover || '';
    dom.resourceUrl.value = resource.url || '';
    dom.resourceId.value = resource.id;
    dom.resourceListId.value = resource.listId;
  }
  
  dom.resourceModal.style.display = 'flex';
}

function saveResource() {
  const id = dom.resourceId.value || generateId();
  const listId = dom.resourceListId.value;
  const name = dom.resourceName.value.trim();
  const description = dom.resourceDesc.value.trim();
  const cover = dom.resourceCover.value.trim();
  const url = dom.resourceUrl.value.trim();
  
  // 验证
  if (!name || !description) {
    alert('资源名称和描述不能为空！');
    return;
  }
  
  const list = appData.lists.find(item => item.id === listId);
  if (!list) {
    alert('所属列表不存在！');
    return;
  }
  
  // 构建资源数据
  const resourceData = {
    id,
    listId,
    name,
    description,
    cover,
    url,
    type: list.type,
    createTime: dom.resourceId.value ? appData.resources.find(r => r.id === id).createTime : new Date().getTime(),
    visitCount: dom.resourceId.value ? appData.resources.find(r => r.id === id).visitCount : 0,
    likeCount: dom.resourceId.value ? appData.resources.find(r => r.id === id).likeCount : 0,
    commentCount: dom.resourceId.value ? appData.resources.find(r => r.id === id).commentCount : 0
  };
  
  // 编辑或新增
  const index = appData.resources.findIndex(r => r.id === id);
  if (index !== -1) {
    appData.resources[index] = resourceData;
  }
  else {
    appData.resources.push(resourceData);
    // 更新统计
    appData.stats.resourceCounts[list.type]++;
    const currentMonth = new Date().getMonth();
    appData.stats.monthlyAdds[currentMonth].count++;
  }
  
  saveData();
  renderAllResources();
  initCharts();
  dom.resourceModal.style.display = 'none';
}

function deleteResource(resourceId) {
  if (!confirm('确定删除该资源？关联的评论也会被删除！')) return;
  
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    // 删除评论
    appData.comments = appData.comments.filter(cmt => cmt.resourceId !== resourceId);
    
    // 更新统计
    appData.stats.resourceCounts[resource.type]--;
    appData.stats.visits -= resource.visitCount;
    appData.stats.likes -= resource.likeCount;
    appData.stats.comments -= resource.commentCount;
    
    // 删除资源
    appData.resources = appData.resources.filter(r => r.id !== resourceId);
  }
  
  saveData();
  renderAllResources();
  initCharts();
}

function visitResource(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.visitCount++;
    appData.stats.visits++;
    saveData();
    // 局部更新访问量，避免重新渲染整个列表
    const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
    if (card) {
      card.querySelector('.stat-item:nth-child(1) span:last-child').textContent = `${resource.visitCount} 浏览`;
    }
  }
}

function likeResource(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.likeCount++;
    appData.stats.likes++;
    saveData();
    // 局部更新点赞数
    const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
    if (card) {
      card.querySelector('.stat-item:nth-child(2) span:last-child').textContent = `${resource.likeCount} 点赞`;
    }
  }
}

// ==========================================
// 评论相关功能
// ==========================================
function openCommentModal(resourceId, resourceName) {
  dom.commentModalTitle.textContent = `${resourceName} 的评论`;
  dom.commentContent.value = '';
  dom.resourceId.value = resourceId;
  
  // 渲染评论
  renderComments(resourceId);
  
  dom.commentModal.style.display = 'flex';
}

function renderComments(resourceId) {
  const comments = appData.comments.filter(cmt => cmt.resourceId === resourceId);
  
  if (comments.length === 0) {
    dom.commentsList.innerHTML = '<p class="text-gray-400">暂无评论，快来抢沙发～</p>';
    return;
  }
  
  // 按时间排序（最新在前）
  comments.sort((a, b) => b.createTime - a.createTime);
  
  dom.commentsList.innerHTML = '';
  comments.forEach(cmt => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item';
    commentEl.dataset.id = cmt.id;
    
    commentEl.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">匿名用户</span>
        <span class="comment-time">${formatDate(cmt.createTime)}</span>
        <div class="comment-actions">
          <span class="comment-action delete-comment" data-id="${cmt.id}"><i class="fa fa-trash"></i> 删除</span>
        </div>
      </div>
      <div class="comment-content">${cmt.content}</div>
    `;
    
    // 删除评论
    commentEl.querySelector('.delete-comment').addEventListener('click', () => {
      deleteComment(cmt.id);
    });
    
    dom.commentsList.appendChild(commentEl);
  });
}

function submitComment() {
  const resourceId = dom.resourceId.value;
  const content = dom.commentContent.value.trim();
  
  if (!content) {
    alert('评论内容不能为空！');
    return;
  }
  
  // 创建评论数据
  const comment = {
    id: generateId(),
    resourceId,
    content,
    createTime: new Date().getTime()
  };
  
  // 添加到评论列表
  appData.comments.push(comment);
  
  // 更新资源评论数
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.commentCount++;
    appData.stats.comments++;
  }
  
  saveData();
  renderComments(resourceId);
  dom.commentContent.value = '';
  
  // 局部更新资源卡片的评论数
  const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
  if (card) {
    card.querySelector('.stat-item:nth-child(3) span:last-child').textContent = `${resource.commentCount} 评论`;
  }
}

function deleteComment(commentId) {
  if (!confirm('确定删除该评论？')) return;
  
  // 找到评论并获取资源ID
  const commentIndex = appData.comments.findIndex(cmt => cmt.id === commentId);
  if (commentIndex === -1) return;
  
  const resourceId = appData.comments[commentIndex].resourceId;
  
  // 更新资源评论数
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.commentCount--;
    appData.stats.comments--;
  }
  
  // 删除评论
  appData.comments.splice(commentIndex, 1);
  
  saveData();
  renderComments(resourceId);
  
  // 局部更新资源卡片的评论数
  const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
  if (card) {
    card.querySelector('.stat-item:nth-child(3) span:last-child').textContent = `${resource.commentCount} 评论`;
  }
}

// ==========================================
// 图表相关功能
// ==========================================
let resourceChartInstance = null;
let resourceAddChartInstance = null;

function initCharts() {
  // 销毁已有图表（避免重复创建）
  if (resourceChartInstance) resourceChartInstance.destroy();
  if (resourceAddChartInstance) resourceAddChartInstance.destroy();
  
  // 资源访问分布图表（饼图）
  const resourceCtx = dom.charts.resource.getContext('2d');
  resourceChartInstance = new Chart(resourceCtx, {
    type: 'pie',
    data: {
      labels: ['桌面应用', 'Web应用', '视频资源', '学习笔记', '代码库'],
      datasets: [{
        data: [
          appData.stats.resourceCounts['desktop-app'],
          appData.stats.resourceCounts['web-app'],
          appData.stats.resourceCounts['video'],
          appData.stats.resourceCounts['note'],
          appData.stats.resourceCounts['code']
        ],
        backgroundColor: [
          '#165DFF',
          '#36CFC9',
          '#722ED1',
          '#FFC53D',
          '#F53F3F'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
  
  // 月度资源添加量图表（柱状图）
  const addCtx = dom.charts.add.getContext('2d');
  resourceAddChartInstance = new Chart(addCtx, {
    type: 'bar',
    data: {
      labels: appData.stats.monthlyAdds.map(item => item.month),
      datasets: [{
        label: '资源添加量',
        data: appData.stats.monthlyAdds.map(item => item.count),
        backgroundColor: '#165DFF',
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ==========================================
// 事件绑定（关键！之前缺失导致无响应）
// ==========================================
function bindEvents() {
  // 1. 创建根列表按钮
  dom.createRootListBtn.addEventListener('click', () => openListModal('create'));
  
  // 2. 列表模态框相关
  dom.submitListBtn.addEventListener('click', saveList);
  dom.cancelModalBtn.addEventListener('click', () => dom.listModal.style.display = 'none');
  dom.modalClose.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.listModal.style.display = 'none';
      dom.resourceModal.style.display = 'none';
      dom.commentModal.style.display = 'none';
    });
  });
  
  // 3. 资源模态框相关
  dom.submitResourceBtn.addEventListener('click', saveResource);
  dom.cancelResourceModalBtn.addEventListener('click', () => dom.resourceModal.style.display = 'none');
  
  // 4. 评论模态框相关
  dom.submitCommentBtn.addEventListener('click', submitComment);
  dom.cancelCommentModalBtn.addEventListener('click', () => dom.commentModal.style.display = 'none');
  
  // 5. 移动端菜单
  dom.menuBtn.addEventListener('click', () => {
    dom.mobileMenu.classList.toggle('active');
  });
  
  // 6. 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === dom.listModal) dom.listModal.style.display = 'none';
    if (e.target === dom.resourceModal) dom.resourceModal.style.display = 'none';
    if (e.target === dom.commentModal) dom.commentModal.style.display = 'none';
  });
  
  // 7. 导航栏滚动效果
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      dom.navbar.classList.add('nav-scrolled');
    }
    else {
      dom.navbar.classList.remove('nav-scrolled');
    }
  });
  
  // 8. 订阅表单提交
  dom.subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = dom.subscribeForm.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      alert('请输入有效的邮箱地址！');
      return;
    }
    
    alert('订阅成功！我们会及时发送更新通知～');
    emailInput.value = '';
  });
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);
