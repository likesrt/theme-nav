// 搜索引擎配置
const searchEngines = [
  { name: 'Baidu', icon: 'fas fa-search', searchUrl: 'https://www.baidu.com/s?wd=' },
  { name: 'Google', icon: 'fab fa-google', searchUrl: 'https://www.google.com/search?q=' },
  { name: 'Bing', icon: 'fab fa-microsoft', searchUrl: 'https://www.bing.com/search?form=AAA&q=222' }
];
let currentEngineIndex = 1;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  initWelcomeAndDateTime();
  initSearchFunctionality();
  initNavigationMenu();
  initScrollHandling();
  initThemeHandling();
});

// 初始化欢迎消息和日期时间
function initWelcomeAndDateTime() {
  updateWelcomeMessage();
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
  const searchEngineToggle = document.getElementById('searchEngineToggle');

  searchInput.addEventListener('input', function() {
    filterBookmarks(this.value);
  });

  searchBtn.addEventListener('click', function() {
    handleSearch(searchInput.value);
  });

  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch(this.value);
    }
  });

  // 添加搜索引擎切换功能
  searchEngineToggle.addEventListener('click', function(e) {
    e.preventDefault(); // 防止触发搜索
    toggleSearchEngine();
  });

  // 初始化搜索引擎图标
  toggleSearchEngine();
}

// 切换搜索引擎
function toggleSearchEngine() {
  currentEngineIndex = (currentEngineIndex + 1) % searchEngines.length;
  const currentEngine = searchEngines[currentEngineIndex];
  const searchIcon = document.getElementById('searchEngineToggle');
  searchIcon.className = currentEngine.icon + ' search-icon';
  searchIcon.title = '当前搜索引擎：' + currentEngine.name;
}

// 处理搜索操作
function handleSearch(searchTerm) {
  searchTerm = searchTerm.trim();
  if (searchTerm) {
    const currentEngine = searchEngines[currentEngineIndex];
    window.open(currentEngine.searchUrl + encodeURIComponent(searchTerm), '_blank');
  }
}

// 筛选书签
function filterBookmarks(searchTerm) {
  searchTerm = searchTerm.toLowerCase();
  const bookmarkItems = document.querySelectorAll('.bookmark-item');
  const sections = document.querySelectorAll('.bookmark-section');
  
  sections.forEach(section => section.style.display = 'block');
  
  bookmarkItems.forEach(function(item) {
    const name = item.querySelector('.bookmark-name').textContent.toLowerCase();
    const desc = item.querySelector('.bookmark-desc').textContent.toLowerCase();
    
    item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'flex' : 'none';
  });
  
  sections.forEach(function(section) {
    const visibleItems = section.querySelectorAll('.bookmark-item[style="display: flex;"]').length;
    if (visibleItems === 0) {
      section.style.display = 'none';
    }
  });
}

// 初始化导航菜单
function initNavigationMenu() {
  const toggleNavBtn = document.getElementById('toggleNav');
  const categoryMenu = document.getElementById('categoryMenu');
  
  toggleNavBtn.addEventListener('click', function() {
    categoryMenu.classList.toggle('expanded');
    this.innerHTML = categoryMenu.classList.contains('expanded') ?
      '隐藏分类菜单 <i class="fas fa-chevron-up"></i>' :
      '显示分类菜单 <i class="fas fa-chevron-down"></i>';
  });
  
  document.querySelectorAll('.category-link').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        categoryMenu.classList.remove('expanded');
        toggleNavBtn.innerHTML = '显示分类菜单 <i class="fas fa-chevron-down"></i>';
      }
      setTimeout(updateActiveCategory, 300);
    });
  });
  
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

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// 初始化滚动处理
function initScrollHandling() {
  window.addEventListener('scroll', handleScroll);
  
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

  navBar.classList.toggle('scrolled', scrollTop > 50);
  backToTop.classList.toggle('visible', scrollTop > 300);
  updateActiveCategory();
}

// 更新当前分类的高亮状态
function updateActiveCategory() {
  const sections = document.querySelectorAll('.bookmark-section');
  const categoryLinks = document.querySelectorAll('.category-link');

  const windowHeight = window.innerHeight;
  const middleScreenPos = window.scrollY + (windowHeight / 3);

  let activeIndex = 0;

  sections.forEach(function(section, index) {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionBottom = sectionTop + rect.height;

    if (middleScreenPos >= sectionTop && middleScreenPos <= sectionBottom) {
      activeIndex = index;
    }
  });

  categoryLinks.forEach((link, index) => {
    link.classList.toggle('active', index === activeIndex);
  });
}

// 初始化主题处理
function initThemeHandling() {
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  checkSavedTheme();
}

// 切换深色模式
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');

  const icon = document.getElementById('darkModeToggle').querySelector('i');
  icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';

  localStorage.setItem('darkMode', isDarkMode);
}

// 检查保存的主题设置
function checkSavedTheme() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
    return;
  }

  if (localStorage.getItem('darkMode') === null &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').querySelector('i').className = 'fas fa-sun';
  }
}
