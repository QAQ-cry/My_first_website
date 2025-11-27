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
      { month: '6月', count: 0 },
      { month: '7月', count: 0 },
      { month: '8月', count: 0 },
      { month: '9月', count: 0 },
      { month: '10月', count: 0 },
      { month: '11月', count: 0 },
      { month: '12月', count: 0 }
    ]
  }
};

// 公共资源存储（模拟云端数据）
let publicResources = {
  'desktop-app': [],
  'web-app': [],
  'video': [],
  'note': [],
  'code': []
};

// 用户标识（用于区分不同用户）
let userId = localStorage.getItem('learnHubUserId') || generateId();

// DOM元素缓存
const dom = {
  // 主要元素
  createRootListBtn: document.getElementById('createRootListBtn'),
  dataManagementBtn: document.getElementById('dataManagementBtn'),
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
  resourceAddChart: document.getElementById('resourceAddChart'),
  
  // 统计卡片
  totalViews: document.getElementById('totalViews'),
  totalLikes: document.getElementById('totalLikes'),
  totalComments: document.getElementById('totalComments'),
  totalResources: document.getElementById('totalResources')
};

// 当前选中的资源（用于评论）
let currentResourceId = null;
// 图表实例
let resourceChartInstance = null;
let resourceAddChartInstance = null;

// 初始化
function init() {
  // 保存用户ID
  localStorage.setItem('learnHubUserId', userId);
  
  loadDataFromLocalStorage();
  loadPublicResources();
  renderListsTree();
  renderAllResources();
  initCharts();
  bindEvents();
  updateStats();
  updateStatsCards();
  
  // 添加示例数据（首次使用时）
  if (appData.lists.length === 0 && appData.resources.length === 0) {
    addSampleData();
  }
}

// 添加示例数据
function addSampleData() {
  // 添加示例列表
  const sampleLists = [
    {
      id: generateId(),
      name: '前端开发资源',
      type: 'web-app',
      description: '收集前端开发相关的优秀资源',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      name: 'Python学习视频',
      type: 'video',
      description: 'Python编程语言学习视频合集',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  appData.lists.push(...sampleLists);
  
  // 添加示例资源
  const sampleResources = [
    {
      id: generateId(),
      name: 'Vue.js 官方文档',
      description: 'Vue.js 官方文档，包含完整的API参考和教程',
      cover: 'https://picsum.photos/seed/vue/400/300',
      url: 'https://vuejs.org',
      listId: sampleLists[0].id,
      type: 'web-app',
      views: 15,
      likes: 8,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      name: 'React 学习指南',
      description: 'React 从入门到精通的完整学习路径',
      cover: 'https://picsum.photos/seed/react/400/300',
      url: 'https://reactjs.org',
      listId: sampleLists[0].id,
      type: 'web-app',
      views: 12,
      likes: 6,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  appData.resources.push(...sampleResources);
  
  // 更新统计
  updateMonthlyStats();
  updateStats();
  saveDataToLocalStorage();
  
  // 重新渲染
  renderListsTree();
  renderAllResources();
  initCharts();
  updateStatsCards();
}

// 从本地存储加载数据
function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem('learnHubData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      // 确保数据结构完整
      appData = {
        ...appData,
        ...parsedData,
        stats: {
          ...appData.stats,
          ...parsedData.stats
        }
      };
    } catch (e) {
      console.error('加载数据失败:', e);
    }
  }
}

// 保存数据到本地存储
function saveDataToLocalStorage() {
  localStorage.setItem('learnHubData', JSON.stringify(appData));
}

// 加载公共资源（模拟从云端加载）
function loadPublicResources() {
  const savedPublicResources = localStorage.getItem('learnHubPublicResources');
  if (savedPublicResources) {
    try {
      publicResources = JSON.parse(savedPublicResources);
    } catch (e) {
      console.error('加载公共资源失败:', e);
    }
  }
}

// 保存公共资源到本地存储（模拟保存到云端）
function savePublicResources() {
  localStorage.setItem('learnHubPublicResources', JSON.stringify(publicResources));
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 打开数据管理模态框
function openDataManagementModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">数据管理与同步</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="data-management-section">
          <h4>多设备同步</h4>
          <p>导出数据并在其他设备导入以实现同步</p>
          <div class="data-actions">
            <button id="exportDataBtn" class="btn btn-primary">
              <i class="fa fa-download"></i> 导出数据
            </button>
            <button id="importDataBtn" class="btn btn-outline">
              <i class="fa fa-upload"></i> 导入数据
            </button>
            <input type="file" id="importDataFile" accept=".json" style="display: none;">
          </div>
        </div>
        
        <div class="data-management-section mt-4">
          <h4>公共资源</h4>
          <p>将您的资源分享到公共区供其他用户使用</p>
          <div class="public-stats">
            <div class="stat-grid">
              <div class="stat-item-grid">
                <span class="stat-number">${Object.values(publicResources).flat().length}</span>
                <span class="stat-label">公共资源总数</span>
              </div>
              <div class="stat-item-grid">
                <span class="stat-number">${appData.resources.length}</span>
                <span class="stat-label">我的资源总数</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="data-management-section mt-4">
          <h4>用户信息</h4>
          <p>用户ID: <code>${userId}</code></p>
          <p class="text-sm text-gray-600">将此ID在其他设备上使用可实现数据关联</p>
        </div>
        
        <div class="data-management-section mt-4">
          <h4>数据维护</h4>
          <p>清理和重置数据</p>
          <div class="data-actions">
            <button id="clearDataBtn" class="btn btn-outline" style="color: var(--color-danger); border-color: var(--color-danger);">
              <i class="fa fa-trash"></i> 清空所有数据
            </button>
            <button id="resetDataBtn" class="btn btn-outline">
              <i class="fa fa-refresh"></i> 重置为示例数据
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal(this.closest('.modal'))">关闭</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 绑定事件
  modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
  modal.querySelector('#exportDataBtn').addEventListener('click', exportData);
  modal.querySelector('#importDataBtn').addEventListener('click', () => {
    document.getElementById('importDataFile').click();
  });
  modal.querySelector('#importDataFile').addEventListener('change', importData);
  modal.querySelector('#clearDataBtn').addEventListener('click', clearAllData);
  modal.querySelector('#resetDataBtn').addEventListener('click', resetToSampleData);
  
  // 点击外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
}

// 导出数据
function exportData() {
  const dataToExport = {
    appData,
    publicResources,
    userId,
    exportTime: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `learnhub-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification('数据导出成功！');
}

// 导入数据
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (confirm('导入数据将覆盖当前数据，确定要继续吗？')) {
        appData = importedData.appData || appData;
        publicResources = importedData.publicResources || publicResources;
        
        saveDataToLocalStorage();
        savePublicResources();
        
        // 重新初始化界面
        renderListsTree();
        renderAllResources();
        updateStats();
        updateStatsCards();
        initCharts();
        
        showNotification('数据导入成功！');
        
        // 关闭模态框
        const modal = document.querySelector('.modal.active');
        if (modal) closeModal(modal);
      }
    } catch (error) {
      alert('文件格式错误，请选择正确的数据文件');
      console.error('导入数据失败:', error);
    }
  };
  reader.readAsText(file);
  
  // 清空文件输入
  event.target.value = '';
}

// 清空所有数据
function clearAllData() {
  if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
    appData = {
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
        monthlyAdds: Array(12).fill().map((_, i) => ({ 
          month: `${i+1}月`, 
          count: 0 
        }))
      }
    };
    
    publicResources = {
      'desktop-app': [],
      'web-app': [],
      'video': [],
      'note': [],
      'code': []
    };
    
    saveDataToLocalStorage();
    savePublicResources();
    
    renderListsTree();
    renderAllResources();
    updateStats();
    updateStatsCards();
    initCharts();
    
    showNotification('所有数据已清空');
    
    const modal = document.querySelector('.modal.active');
    if (modal) closeModal(modal);
  }
}

// 重置为示例数据
function resetToSampleData() {
  if (confirm('确定要重置为示例数据吗？当前数据将被覆盖！')) {
    clearAllData();
    setTimeout(() => {
      addSampleData();
      showNotification('已重置为示例数据');
    }, 100);
  }
}

// 分享资源到公共区
function shareToPublic(resourceId) {
  const resource = appData.resources.find(r => r.id === resourceId);
  if (!resource) return;
  
  if (confirm(`确定要将"${resource.name}"分享到公共区吗？其他用户都可以看到和使用这个资源。`)) {
    const publicResource = {
      ...resource,
      id: generateId(), // 新ID避免冲突
      originalId: resource.id,
      author: `用户_${userId.slice(-6)}`, // 使用用户ID后6位作为作者名
      isPublic: true,
      sharedAt: new Date().toISOString(),
      publicViews: 0,
      publicLikes: 0,
      publicDownloads: 0
    };
    
    // 添加到公共资源
    publicResources[resource.type].push(publicResource);
    savePublicResources();
    
    // 更新显示
    renderAllResources();
    showNotification('资源已成功分享到公共区！');
  }
}

// 点赞公共资源
function likePublicResource(resourceId, resourceType) {
  const resource = publicResources[resourceType].find(r => r.id === resourceId);
  if (resource) {
    resource.publicLikes = (resource.publicLikes || 0) + 1;
    savePublicResources();
    renderAllResources();
    showNotification('已点赞！');
  }
}

// 下载公共资源
function downloadPublicResource(resourceId, resourceType) {
  const resource = publicResources[resourceType].find(r => r.id === resourceId);
  if (resource) {
    resource.publicDownloads = (resource.publicDownloads || 0) + 1;
    savePublicResources();
    renderAllResources();
    showNotification('下载计数已更新！');
  }
}

// 查看公共资源详情
function viewPublicResource(resourceId, resourceType) {
  const resource = publicResources[resourceType].find(r => r.id === resourceId);
  if (resource) {
    resource.publicViews = (resource.publicViews || 0) + 1;
    savePublicResources();
    
    // 打开详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">资源详情</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="resource-detail">
            <img src="${resource.cover}" alt="${resource.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">${resource.name}</h4>
            <p style="color: var(--color-gray-600); margin-bottom: 1rem;">${resource.description}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <strong>作者:</strong><br>
                <span>${resource.author}</span>
              </div>
              <div>
                <strong>分享时间:</strong><br>
                <span>${new Date(resource.sharedAt).toLocaleString('zh-CN')}</span>
              </div>
              <div>
                <strong>浏览量:</strong><br>
                <span>${resource.publicViews || 0}</span>
              </div>
              <div>
                <strong>点赞数:</strong><br>
                <span>${resource.publicLikes || 0}</span>
              </div>
            </div>
            ${resource.url ? `<p><strong>访问链接:</strong> <a href="${resource.url}" target="_blank">${resource.url}</a></p>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal(this.closest('.modal'))">关闭</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }
}

// 渲染列表树
function renderListsTree() {
  dom.listsTree.innerHTML = '';
  
  const rootLists = appData.lists.filter(list => !list.parentId);
  
  if (rootLists.length === 0) {
    dom.listsTree.innerHTML = '<p class="text-gray-400" style="padding: 1rem; text-align: center;">暂无列表，点击"创建根列表"开始</p>';
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
  listIcon.style.color = getTypeColor(list.type);
  
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

// 获取类型颜色
function getTypeColor(type) {
  const colors = {
    'desktop-app': '#3b82f6',
    'web-app': '#10b981',
    'video': '#f59e0b',
    'note': '#ef4444',
    'code': '#8b5cf6'
  };
  return colors[type] || '#64748b';
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
    
    // 如果从列表点击添加，自动选择列表类型
    if (listId) {
      const list = appData.lists.find(l => l.id === listId);
      if (list) {
        // 这里可以设置默认值，但保持表单清洁
      }
    }
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
  const resource = appData.resources.find(r => r.id === resourceId) || 
                   Object.values(publicResources).flat().find(r => r.id === resourceId);
  
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
    dom.commentsList.innerHTML = '<p class="text-gray-400 text-center" style="padding: 2rem;">暂无评论，快来发表第一条评论吧！</p>';
    return;
  }
  
  // 按时间倒序排列
  comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
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
    showNotification('请输入列表名称');
    return;
  }
  
  if (!type) {
    showNotification('请选择资源类型');
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
    showNotification('请填写资源名称和描述');
    return;
  }
  
  if (!listId) {
    showNotification('请先创建列表');
    return;
  }
  
  const list = appData.lists.find(l => l.id === listId);
  if (!list) {
    showNotification('列表不存在');
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
  updateStatsCards();
  closeModal(dom.resourceModal);
  showNotification(id ? '资源更新成功' : '资源添加成功');
}

// 提交评论
function submitComment() {
  const content = dom.commentContent.value.trim();
  
  if (!content) {
    showNotification('请输入评论内容');
    return;
  }
  
  if (!currentResourceId) {
    showNotification('资源不存在');
    return;
  }
  
  const newComment = {
    id: generateId(),
    resourceId: currentResourceId,
    content,
    author: `用户_${userId.slice(-6)}`,
    likes: 0,
    timestamp: new Date().toISOString()
  };
  
  appData.comments.push(newComment);
  appData.stats.comments++;
  
  saveDataToLocalStorage();
  renderComments(currentResourceId);
  dom.commentContent.value = '';
  updateStats();
  updateStatsCards();
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
    updateStats();
    updateStatsCards();
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
    updateStatsCards();
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
    updateStatsCards();
    showNotification('资源删除成功');
  }
}

// 增加资源浏览量
function incrementViews(resourceId, isPublic = false) {
  if (isPublic) {
    const resource = Object.values(publicResources).flat().find(r => r.id === resourceId);
    if (resource) {
      resource.publicViews = (resource.publicViews || 0) + 1;
      savePublicResources();
      renderAllResources();
    }
  } else {
    const resource = appData.resources.find(r => r.id === resourceId);
    if (resource) {
      resource.views = (resource.views || 0) + 1;
      appData.stats.visits++;
      saveDataToLocalStorage();
      updateStats();
      updateStatsCards();
      renderAllResources();
    }
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
    updateStatsCards();
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
  renderResourcesByType('web-app', dom.webAppsContainer
