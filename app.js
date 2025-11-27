// 全局数据存储
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
      { month: '1月', count: 0 },
      { month: '2月', count: 0 },
      { month: '3月', count: 0 },
      { month: '4月', count: 0 },
      { month: '5月', count: 0 },
      { month: '6月', count: 0 }
    ]
  }
};

// DOM元素缓存
const dom = {
  // 主要元素
  createRootListBtn: document.getElementById('createRootListBtn'),
  listsTree: document.getElementById('listsTree'),
  menuBtn: document.getElementById('menuBtn'),
  mobileMenu: document.getElementById('mobileMenu'),
  
  // 模态框
  listModal: document.getElementById('listModal'),
  resourceModal: document.getElementById('resourceModal'),
  commentModal: document.getElementById('commentModal'),
  
  // 列表表单
  modalTitle: document.getElementById('modalTitle'),
  listForm: document.getElementById('listForm'),
  listName: document.getElementById('listName'),
  listType: document.getElementById('listType'),
  listDescription: document.getElementById('listDescription'),
  listId: document.getElementById('listId'),
  parentListId: document.getElementById('parentListId'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  submitListBtn: document.getElementById('submitListBtn'),
  
  // 资源表单
  resourceModalTitle: document.getElementById('resourceModalTitle'),
  resourceForm: document.getElementById('resourceForm'),
  resourceName: document.getElementById('resourceName'),
  resourceDesc: document.getElementById('resourceDesc'),
  resourceCover: document.getElementById('resourceCover'),
  resourceUrl: document.getElementById('resourceUrl'),
  resourceId: document.getElementById('resourceId'),
  resourceListId: document.getElementById('resourceListId'),
  cancelResourceModalBtn: document.getElementById('cancelResourceModalBtn'),
  submitResourceBtn: document.getElementById('submitResourceBtn'),
  
  // 评论模态框
  commentContent: document.getElementById('commentContent'),
  commentsList: document.getElementById('commentsList'),
  commentModalTitle: document.getElementById('commentModalTitle'),
  submitCommentBtn: document.getElementById('submitCommentBtn'),
  cancelCommentModalBtn: document.getElementById('cancelCommentModalBtn'),
  
  // 资源容器
  desktopAppsContainer: document.getElementById('desktopAppsContainer'),
  webAppsContainer: document.getElementById('webAppsContainer'),
  videosContainer: document.getElementById('videosContainer'),
  notesContainer: document.getElementById('notesContainer'),
  codeLibraryContainer: document.getElementById('codeLibraryContainer'),
  
  // 图表
  resourceChart: document.getElementById('resourceChart'),
  resourceAddChart: document.getElementById('resourceAddChart')
};

// 当前选中的资源（用于评论）
let currentResourceId = null;

// 初始化
function init() {
  loadDataFromLocalStorage();
  renderListsTree();
  renderAllResources();
  initCharts();
  bindEvents();
  updateStats();
}

// 从本地存储加载数据
function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem('learnHubData');
  if (savedData) {
    try {
      appData = JSON.parse(savedData);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
  }
}

// 保存数据到本地存储
function saveDataToLocalStorage() {
  localStorage.setItem('learnHubData', JSON.stringify(appData));
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 渲染列表树
function renderListsTree() {
  dom.listsTree.innerHTML = '';
  
  const rootLists = appData.lists.filter(list => !list.parentId);
  
  if (rootLists.length === 0) {
    dom.listsTree.innerHTML = '<p class="text-gray-400">暂无列表，点击"创建根列表"开始</p>';
    return;
  }
  
  rootLists.forEach(list => {
    const listEl = createListElement(list);
    dom.listsTree.appendChild(listEl);
  });
}

// 创建列表元素
function createListElement(list) {
  const listEl = document.createElement('div');
  listEl.className = 'list-item';
  listEl.dataset.id = list.id;
  
  const listHeader = document.createElement('div');
  listHeader.className = 'list-header';
  
  // 获取子列表
  const childLists = appData.lists.filter(child => child.parentId === list.id);
  const hasChildren = childLists.length > 0;
  
  // 展开/折叠按钮
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'list-action-btn';
  toggleBtn.innerHTML = hasChildren ? 
    '<i class="fa fa-caret-right list-icon"></i>' : 
    '<i class="fa fa-minus list-icon" style="color: var(--color-gray-300);"></i>';
  toggleBtn.title = hasChildren ? '展开/折叠' : '无子列表';
  
  if (hasChildren) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const childListsEl = listEl.querySelector('.child-lists');
      if (childListsEl) {
        childListsEl.classList.toggle('active');
        toggleBtn.innerHTML = childListsEl.classList.contains('active') ? 
          '<i class="fa fa-caret-down list-icon"></i>' : 
          '<i class="fa fa-caret-right list-icon"></i>';
      }
    });
  }
  
  // 列表图标
  const listIcon = document.createElement('i');
  listIcon.className = 'fa fa-folder list-icon';
  
  // 列表名称
  const listNameEl = document.createElement('span');
  listNameEl.className = 'list-name';
  listNameEl.textContent = list.name;
  listNameEl.title = list.description || '';
  
  // 列表操作按钮
  const listActions = document.createElement('div');
  listActions.className = 'list-actions';
  
  // 添加子列表按钮
  const addChildBtn = document.createElement('button');
  addChildBtn.className = 'list-action-btn';
  addChildBtn.innerHTML = '<i class="fa fa-plus"></i>';
  addChildBtn.title = '添加子列表';
  addChildBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openListModal('create', null, list.id);
  });
  
  // 添加资源按钮
  const addResourceBtn = document.createElement('button');
  addResourceBtn.className = 'list-action-btn';
  addResourceBtn.innerHTML = '<i class="fa fa-file-o"></i>';
  addResourceBtn.title = '添加资源';
  addResourceBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openResourceModal('create', null, list.id);
  });
  
  // 编辑列表按钮
  const editBtn = document.createElement('button');
  editBtn.className = 'list-action-btn';
  editBtn.innerHTML = '<i class="fa fa-edit"></i>';
  editBtn.title = '编辑列表';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openListModal('edit', list.id);
  });
  
  // 删除列表按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'list-action-btn';
  deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
  deleteBtn.title = '删除列表';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteList(list.id);
  });
  
  // 组装列表头部
  listActions.appendChild(addChildBtn);
  listActions.appendChild(addResourceBtn);
  listActions.appendChild(editBtn);
  listActions.appendChild(deleteBtn);
  
  listHeader.appendChild(toggleBtn);
  listHeader.appendChild(listIcon);
  listHeader.appendChild(listNameEl);
  listHeader.appendChild(listActions);
  
  listEl.appendChild(listHeader);
  
  // 子列表容器
  if (hasChildren) {
    const childListsEl = document.createElement('div');
    childListsEl.className = 'child-lists';
    
    childLists.forEach(child => {
      const childEl = createListElement(child);
      childListsEl.appendChild(childEl);
    });
    
    listEl.appendChild(childListsEl);
  }
  
  return listEl;
}

// 打开列表模态框
function openListModal(mode, listId = null, parentId = null) {
  dom.listForm.reset();
  
  if (mode === 'create') {
    dom.modalTitle.textContent = parentId ? '创建子列表' : '创建根列表';
    dom.submitListBtn.textContent = '确认创建';
    dom.listId.value = '';
    dom.parentListId.value = parentId || '';
  } else {
    const list = appData.lists.find(l => l.id === listId);
    if (!list) return;
    
    dom.modalTitle.textContent = '编辑列表';
    dom.submitListBtn.textContent = '保存修改';
    dom.listId.value = list.id;
    dom.listName.value = list.name;
    dom.listType.value = list.type;
    dom.listDescription.value = list.description || '';
    dom.parentListId.value = list.parentId || '';
  }
  
  dom.listModal.classList.add('active');
}

// 打开资源模态框
function openResourceModal(mode, resourceId = null, listId = null) {
  dom.resourceForm.reset();
  
  if (mode === 'create') {
    dom.resourceModalTitle.textContent = '添加资源';
    dom.submitResourceBtn.textContent = '确认添加';
    dom.resourceId.value = '';
    dom.resourceListId.value = listId;
  } else {
    const resource = appData.resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    dom.resourceModalTitle.textContent = '编辑资源';
    dom.submitResourceBtn.textContent = '保存修改';
    dom.resourceId.value = resource.id;
    dom.resourceName.value = resource.name;
    dom.resourceDesc.value = resource.description;
    dom.resourceCover.value = resource.cover || '';
    dom.resourceUrl.value = resource.url || '';
    dom.resourceListId.value = resource.listId;
  }
  
  dom.resourceModal.classList.add('active');
}

// 打开评论模态框
function openCommentModal(resourceId) {
  currentResourceId = resourceId;
  const resource = appData.resources.find(r => r.id === resourceId);
  
  if (resource) {
    dom.commentModalTitle.textContent = `评论 - ${resource.name}`;
    dom.commentContent.value = '';
    renderComments(resourceId);
    dom.commentModal.classList.add('active');
  }
}

// 渲染评论
function renderComments(resourceId) {
  const comments = appData.comments.filter(c => c.resourceId === resourceId);
  dom.commentsList.innerHTML = '';
  
  if (comments.length === 0) {
    dom.commentsList.innerHTML = '<p class="text-gray-400 text-center">暂无评论</p>';
    return;
  }
  
  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item';
    
    const time = new Date(comment.timestamp).toLocaleString('zh-CN');
    
    commentEl.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.author}</span>
        <span class="comment-time">${time}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
      <div class="comment-actions">
        <button class="comment-action" onclick="likeComment('${comment.id}')">
          <i class="fa fa-thumbs-up"></i> 点赞 (${comment.likes || 0})
        </button>
        <button class="comment-action" onclick="deleteComment('${comment.id}')">
          <i class="fa fa-trash"></i> 删除
        </button>
      </div>
    `;
    
    dom.commentsList.appendChild(commentEl);
  });
}

// 提交列表表单
function submitListForm() {
  const name = dom.listName.value.trim();
  const type = dom.listType.value;
  const description = dom.listDescription.value.trim();
  const id = dom.listId.value;
  const parentId = dom.parentListId.value || null;
  
  if (!name) {
    alert('请输入列表名称');
    return;
  }
  
  if (id) {
    // 编辑模式
    const listIndex = appData.lists.findIndex(l => l.id === id);
    if (listIndex !== -1) {
      appData.lists[listIndex] = {
        ...appData.lists[listIndex],
        name,
        type,
        description,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    // 创建模式
    const newList = {
      id: generateId(),
      name,
      type,
      description,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appData.lists.push(newList);
  }
  
  saveDataToLocalStorage();
  renderListsTree();
  closeModal(dom.listModal);
  showNotification(id ? '列表更新成功' : '列表创建成功');
}

// 提交资源表单
function submitResourceForm() {
  const name = dom.resourceName.value.trim();
  const description = dom.resourceDesc.value.trim();
  const cover = dom.resourceCover.value.trim();
  const url = dom.resourceUrl.value.trim();
  const id = dom.resourceId.value;
  const listId = dom.resourceListId.value;
  
  if (!name || !description) {
    alert('请填写资源名称和描述');
    return;
  }
  
  if (!listId) {
    alert('请先创建列表');
    return;
  }
  
  const list = appData.lists.find(l => l.id === listId);
  if (!list) {
    alert('列表不存在');
    return;
  }
  
  if (id) {
    // 编辑模式
    const resourceIndex = appData.resources.findIndex(r => r.id === id);
    if (resourceIndex !== -1) {
      appData.resources[resourceIndex] = {
        ...appData.resources[resourceIndex],
        name,
        description,
        cover: cover || `https://picsum.photos/seed/${name}/400/300`,
        url,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    // 创建模式
    const newResource = {
      id: generateId(),
      name,
      description,
      cover: cover || `https://picsum.photos/seed/${name}/400/300`,
      url,
      listId,
      type: list.type,
      views: 0,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appData.resources.push(newResource);
    
    // 更新统计
    updateMonthlyStats();
  }
  
  saveDataToLocalStorage();
  renderAllResources();
  updateStats();
  closeModal(dom.resourceModal);
  showNotification(id ? '资源更新成功' : '资源添加成功');
}

// 提交评论
function submitComment() {
  const content = dom.commentContent.value.trim();
  
  if (!content) {
    alert('请输入评论内容');
    return;
  }
  
  if (!currentResourceId) {
    alert('资源不存在');
    return;
  }
  
  const newComment = {
    id: generateId(),
    resourceId: currentResourceId,
    content,
    author: '当前用户',
    likes: 0,
    timestamp: new Date().toISOString()
  };
  
  appData.comments.push(newComment);
  appData.stats.comments++;
  
  saveDataToLocalStorage();
  renderComments(currentResourceId);
  dom.commentContent.value = '';
  updateStats();
  showNotification('评论发表成功');
}

// 点赞评论
function likeComment(commentId) {
  const comment = appData.comments.find(c => c.id === commentId);
  if (comment) {
    comment.likes = (comment.likes || 0) + 1;
    saveDataToLocalStorage();
    renderComments(currentResourceId);
  }
}

// 删除评论
function deleteComment(commentId) {
  if (confirm('确定要删除这条评论吗？')) {
    appData.comments = appData.comments.filter(c => c.id !== commentId);
    saveDataToLocalStorage();
    renderComments(currentResourceId);
    showNotification('评论删除成功');
  }
}

// 删除列表
function deleteList(listId) {
  if (confirm('确定要删除这个列表吗？相关的所有资源和子列表都会被删除！')) {
    // 删除子列表
    const childLists = appData.lists.filter(l => l.parentId === listId);
    childLists.forEach(child => deleteList(child.id));
    
    // 删除相关资源
    appData.resources = appData.resources.filter(r => r.listId !== listId);
    
    // 删除列表本身
    appData.lists = appData.lists.filter(l => l.id !== listId);
    
    saveDataToLocalStorage();
    renderListsTree();
    renderAllResources();
    updateStats();
    showNotification('列表删除成功');
  }
}

// 删除资源
function deleteResource(resourceId) {
  if (confirm('确定要删除这个资源吗？')) {
    appData.resources = appData.resources.filter(r => r.id !== resourceId);
    appData.comments = appData.comments.filter(c => c.resourceId !== resourceId);
    
    saveDataToLocalStorage();
    renderAllResources();
    updateStats();
    showNotification('资源删除成功');
  }
}

// 增加资源浏览量
function incrementViews(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.views = (resource.views || 0) + 1;
    appData.stats.visits++;
    saveDataToLocalStorage();
    updateStats();
  }
}

// 点赞资源
function likeResource(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.likes = (resource.likes || 0) + 1;
    appData.stats.likes++;
    saveDataToLocalStorage();
    renderAllResources();
    updateStats();
    showNotification('点赞成功');
  }
}

// 下载资源
function downloadResource(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (resource) {
    resource.downloads = (resource.downloads || 0) + 1;
    saveDataToLocalStorage();
    renderAllResources();
    showNotification('下载计数已更新');
  }
}

// 渲染所有资源
function renderAllResources() {
  renderResourcesByType('desktop-app', dom.desktopAppsContainer);
  renderResourcesByType('web-app', dom.webAppsContainer);
  renderResourcesByType('video', dom.videosContainer);
  renderResourcesByType('note', dom.notesContainer);
  renderResourcesByType('code', dom.codeLibraryContainer);
}

// 按类型渲染资源
function renderResourcesByType(type, container) {
  const resources = appData.resources.filter(r => r.type === type);
  
  if (resources.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa ${getTypeIcon(type)} empty-icon"></i>
        <p class="empty-text">暂无${getTypeName(type)}数据，可通过左侧列表添加</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  resources.forEach(resource => {
    const resourceEl = createResourceCard(resource);
    container.appendChild(resourceEl);
  });
}

// 创建资源卡片
function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  
  const time = new Date(resource.updatedAt).toLocaleDateString('zh-CN');
  
  card.innerHTML = `
    <img src="${resource.cover}" alt="${resource.name}" class="resource-cover" onerror="this.src='https://picsum.photos/400/300?random=${resource.id}'">
    <div class="resource-content">
      <h3 class="resource-title">${resource.name}</h3>
      <p class="resource-desc">${resource.description}</p>
      <div class="resource-meta">
        <span>更新: ${time}</span>
        ${resource.url ? `<a href="${resource.url}" target="_blank" onclick="incrementViews('${resource.id}')">访问链接</a>` : ''}
      </div>
      <div class="resource-stats">
        <div class="stat-item">
          <i class="fa fa-eye stat-icon"></i>
          <span>${resource.views || 0}</span>
        </div>
        <div class="stat-item">
          <i class="fa fa-thumbs-up stat-icon"></i>
          <span>${resource.likes || 0}</span>
        </div>
        ${resource.type === 'code' ? `
        <div class="stat-item">
          <i class="fa fa-download stat-icon"></i>
          <span>${resource.downloads || 0}</span>
        </div>
        ` : ''}
        <div class="resource-actions">
          <button class="resource-action-btn" onclick="likeResource('${resource.id}')" title="点赞">
            <i class="fa fa-thumbs-up"></i>
          </button>
          <button class="resource-action-btn" onclick="openCommentModal('${resource.id}')" title="评论">
            <i class="fa fa-comment"></i>
          </button>
          ${resource.type === 'code' ? `
          <button class="resource-action-btn" onclick="downloadResource('${resource.id}')" title="下载">
            <i class="fa fa-download"></i>
          </button>
          ` : ''}
          <button class="resource-action-btn" onclick="openResourceModal('edit', '${resource.id}')" title="编辑">
            <i class="fa fa-edit"></i>
          </button>
          <button class="resource-action-btn" onclick="deleteResource('${resource.id}')" title="删除">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

// 获取类型图标
function getTypeIcon(type) {
  const icons = {
    'desktop-app': 'fa-desktop',
    'web-app': 'fa-globe',
    'video': 'fa-play-circle-o',
    'note': 'fa-book',
    'code': 'fa-code'
  };
  return icons[type] || 'fa-file-o';
}

// 获取类型名称
function getTypeName(type) {
  const names = {
    'desktop-app': '桌面应用',
    'web-app': 'Web应用',
    'video': '视频资源',
    'note': '学习笔记',
    'code': '代码资源'
  };
  return names[type] || '资源';
}

// 更新月度统计
function updateMonthlyStats() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const monthIndex = Math.min(month, 5); // 只统计前6个月
  
  if (appData.stats.monthlyAdds[monthIndex]) {
    appData.stats.monthlyAdds[monthIndex].count++;
  }
}

// 更新统计
function updateStats() {
  // 更新资源类型统计
  appData.stats.resourceCounts = {
    'desktop-app': appData.resources.filter(r => r.type === 'desktop-app').length,
    'web-app': appData.resources.filter(r => r.type === 'web-app').length,
    'video': appData.resources.filter(r => r.type === 'video').length,
    'note': appData.resources.filter(r => r.type === 'note').length,
    'code': appData.resources.filter(r => r.type === 'code').length
  };
  
  // 更新总统计
  appData.stats.visits = appData.resources.reduce((sum, r) => sum + (r.views || 0), 0);
  appData.stats.likes = appData.resources.reduce((sum, r) => sum + (r.likes || 0), 0);
  appData.stats.comments = appData.comments.length;
  
  saveDataToLocalStorage();
  initCharts(); // 重新渲染图表
}

// 初始化图表
function initCharts() {
  // 资源分布图表
  const resourceCtx = dom.resourceChart.getContext('2d');
  const resourceData = {
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
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
      ]
    }]
  };
  
  new Chart(resourceCtx, {
    type: 'doughnut',
    data: resourceData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // 月度添加量图表
  const addCtx = dom.resourceAddChart.getContext('2d');
  const addData = {
    labels: appData.stats.monthlyAdds.map(m => m.month),
    datasets: [{
      label: '资源添加量',
      data: appData.stats.monthlyAdds.map(m => m.count),
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8',
      borderWidth: 2,
      fill: true
    }]
  };
  
  new Chart(addCtx, {
    type: 'line',
    data: addData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// 关闭模态框
function closeModal(modal) {
  modal.classList.remove('active');
}

// 显示通知
function showNotification(message) {
  // 简单的alert通知，可以替换为更优雅的Toast
  alert(message);
}

// 绑定事件
function bindEvents() {
  // 移动端菜单
  dom.menuBtn.addEventListener('click', () => {
    dom.mobileMenu.classList.toggle('active');
  });
  
  // 创建根列表按钮
  dom.createRootListBtn.addEventListener('click', () => {
    openListModal('create');
  });
  
  // 列表表单提交
  dom.submitListBtn.addEventListener('click', submitListForm);
  dom.cancelModalBtn.addEventListener('click', () => closeModal(dom.listModal));
  
  // 资源表单提交
  dom.submitResourceBtn.addEventListener('click', submitResourceForm);
  dom.cancelResourceModalBtn.addEventListener('click', () => closeModal(dom.resourceModal));
  
  // 评论表单提交
  dom.submitCommentBtn.addEventListener('click', submitComment);
  dom.cancelCommentModalBtn.addEventListener('click', () => closeModal(dom.commentModal));
  
  // 关闭模态框
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // 点击模态框外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
  
  // 订阅表单
  document.querySelector('.subscribe-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('.subscribe-input').value;
    if (email) {
      alert(`感谢订阅！我们将向 ${email} 发送更新通知`);
      e.target.reset();
    }
  });
  
  // 导航链接平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          // 关闭移动端菜单
          dom.mobileMenu.classList.remove('active');
        }
      }
    });
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
