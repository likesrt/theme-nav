// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  // 初始化各种功能
  initWelcomeAndDateTime();
  initSearchFunctionality();
  initNavigationMenu();
  initScrollHandling();
  initThemeHandling();
});

// 初始化欢迎消息和日期时间
function initWelcomeAndDateTime() {
  // 更新欢迎消息
  updateWelcomeMessage();
  
  // 更新日期时间并设置定时器
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

// 更新欢迎消息
function updateWelcomeMessage() {
  const hour = new Date().getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "早上好";
  } else if (hour >= 12 && hour < 14) {
    greeting = "中午好";
  } else if (hour >= 14 && hour < 18) {
    greeting = "下午好";
  } else if (hour >= 18 && hour < 22) {
    greeting = "晚上好";
  } else {
    greeting = "夜深了";
  }

  document.getElementById('welcomeMessage').textContent = `${greeting}，祝您使用愉快！`;
}

// 更新日期时间
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  document.getElementById('dateTime').textContent = now.toLocaleDateString('zh-CN', options);
}

// 初始化搜索功能
function initSearchFunctionality() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  // 搜索框实时筛选
  searchInput.addEventListener('input', function() {
    filterBookmarks(this.value);
  });

  // 搜索按钮点击事件
  searchBtn.addEventListener('click', function() {
    handleSearch(searchInput.value);
  });

  // 回车键搜索
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch(this.value);
    }
  });
}

// 处理搜索操作
function handleSearch(searchTerm) {
  searchTerm = searchTerm.trim();
  if (searchTerm) {
    searchBaidu(searchTerm);
  }
}

// 百度搜索
function searchBaidu(searchTerm) {
  window.open('https://www.baidu.com/s?wd=' + encodeURIComponent(searchTerm), '_blank');
}

// 筛选书签
function filterBookmarks(searchTerm) {
  searchTerm = searchTerm.toLowerCase();
  const bookmarkItems = document.querySelectorAll('.bookmark-item');
  const sections = document.querySelectorAll('.bookmark-section');
  
  // 重置所有区块显示
  sections.forEach(section => section.style.display = 'block');
  
  // 筛选条目
  bookmarkItems.forEach(function(item) {
    const name = item.querySelector('.bookmark-name').textContent.toLowerCase();
    const desc = item.querySelector('.bookmark-desc').textContent.toLowerCase();
    
    item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'flex' : 'none';
  });
  
  // 隐藏没有匹配项的分类
  sections.forEach(function(section) {
    const visibleItems = section.querySelectorAll('.bookmark-item[style="display: flex;"]').length;
    if (visibleItems === 0) {
      section.style.display = 'none';
    }
  });
}

// 初始化导航菜单
function initNavigationMenu() {
  // 移动端菜单切换
  const toggleNavBtn = document.getElementById('toggleNav');
  const categoryMenu = document.getElementById('categoryMenu');
  
  toggleNavBtn.addEventListener('click', function() {
    categoryMenu.classList.toggle('expanded');
    this.innerHTML = categoryMenu.classList.contains('expanded') ?
      '隐藏分类菜单 <i class="fas fa-chevron-up"></i>' :
      '显示分类菜单 <i class="fas fa-chevron-down"></i>';
  });
  
  // 分类点击事件
  document.querySelectorAll('.category-link').forEach(function(link) {
    link.addEventListener('click', function() {
      // 在移动设备上点击后收起菜单
      if (window.innerWidth <= 768) {
        categoryMenu.classList.remove('expanded');
        toggleNavBtn.innerHTML = '显示分类菜单 <i class="fas fa-chevron-down"></i>';
      }
      
      // 延迟更新高亮状态
      setTimeout(updateActiveCategory, 300);
    });
  });
  
  // 为所有书签添加波纹效果
  document.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', createRippleEffect);
  });
}

// 创建点击波纹效果
function createRippleEffect(e) {
  const button = this;
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  button.appendChild(ripple);

  // 获取点击位置
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  // 动画完成后移除元素
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// 初始化滚动处理
function initScrollHandling() {
  // 滚动事件处理
  window.addEventListener('scroll', handleScroll);
  
  // 返回顶部按钮
  document.getElementById('backToTop').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 处理滚动事件
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const navBar = document.getElementById('categoryNav');
  const backToTop = document.getElementById('backToTop');

  // 导航栏样式变化
  navBar.classList.toggle('scrolled', scrollTop > 50);

  // 返回顶部按钮显示/隐藏
  backToTop.classList.toggle('visible', scrollTop > 300);

  // 更新当前分类高亮
  updateActiveCategory();
}

// 更新当前分类的高亮状态
function updateActiveCategory() {
  const sections = document.querySelectorAll('.bookmark-section');
  const categoryLinks = document.querySelectorAll('.category-link');

  // 获取可视区域的中心点
  const windowHeight = window.innerHeight;
  const middleScreenPos = window.scrollY + (windowHeight / 3);

  // 默认激活第一个
  let activeIndex = 0;

  // 找到当前在视口中心的分类
  sections.forEach(function(section, index) {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionBottom = sectionTop + rect.height;

    if (middleScreenPos >= sectionTop && middleScreenPos <= sectionBottom) {
      activeIndex = index;
    }
  });

  // 移除所有高亮并添加当前分类的高亮
  categoryLinks.forEach((link, index) => {
    link.classList.toggle('active', index === activeIndex);
  });
}

// 初始化主题处理
function initThemeHandling() {
  // 深色模式切换
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  
  // 检查存储的主题模式
  checkSavedTheme();
}

// 切换深色模式
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');

  // 更新图标
  const icon = document.getElementById('darkModeToggle').querySelector('i');
  icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';

  // 保存设置到本地存储
  localStorage.setItem('darkMode', isDarkMode);
}

// 检查保存的主题设置
function checkSavedTheme() {
  // 检查本地存储的主题设置
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
    return;
  }

  // 检查系统主题偏好
  if (localStorage.getItem('darkMode') === null &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
  }
}
