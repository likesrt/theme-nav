    // 初始化页面
    document.addEventListener('DOMContentLoaded', function () {
      // 更新欢迎消息
      updateWelcomeMessage();

      // 更新日期时间
      updateDateTime();
      setInterval(updateDateTime, 1000);


      // 搜索功能
      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');

      // 搜索框实时筛选
      searchInput.addEventListener('input', function () {
        filterBookmarks(this.value);
      });

      // 搜索按钮
      searchBtn.addEventListener('click', function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          searchBaidu(searchTerm);
        }
      });

      // 回车键搜索
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          const searchTerm = this.value.trim();
          if (searchTerm) {
            searchBaidu(searchTerm);
          }
        }
      });

      // 移动端菜单切换
      document.getElementById('toggleNav').addEventListener('click', function () {
        const menu = document.getElementById('categoryMenu');
        menu.classList.toggle('expanded');
        this.innerHTML = menu.classList.contains('expanded') ?
          '隐藏分类菜单 <i class="fas fa-chevron-up"></i>' :
          '显示分类菜单 <i class="fas fa-chevron-down"></i>';
      });

      // 滚动事件处理
      window.addEventListener('scroll', function () {
        handleScroll();
      });

      // 返回顶部按钮
      document.getElementById('backToTop').addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // 深色模式切换
      document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

      // 检查存储的主题模式
      checkSavedTheme();
    });


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

    // 渲染分类菜单
    function renderCategoryMenu(bookmarkData) {
      const menu = document.getElementById('categoryMenu');
      menu.innerHTML = '';

      // 创建所有分类项
      bookmarkData.forEach(function (category, index) {
        const sectionId = 'cat-' + category.category.replace(/\s+/g, '-').toLowerCase();

        const li = document.createElement('li');
        li.innerHTML = `
                    <a href="#${sectionId}" class="category-link">
                        <span class="nav-icon">${category.icon}</span>
                        ${category.category}
                    </a>
                `;
        menu.appendChild(li);

        // 添加延迟动画
        li.style.opacity = '0';
        li.style.animation = `fadeInDown 0.5s ease ${0.1 + (index * 0.05)}s forwards`;
      });

      // 分类点击事件
      document.querySelectorAll('.category-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
          // 在移动设备上点击后收起菜单
          if (window.innerWidth <= 768) {
            document.getElementById('categoryMenu').classList.remove('expanded');
            document.getElementById('toggleNav').innerHTML = '显示分类菜单 <i class="fas fa-chevron-down"></i>';
          }

          // 一小段延迟，等待滚动完成后更新高亮
          setTimeout(function () {
            updateActiveCategory();
          }, 300);
        });
      });
    }

    // 渲染书签
    function renderBookmarks(bookmarkData) {
      const container = document.getElementById('bookmarkContainer');
      container.innerHTML = '';

      // 为每个分类创建一个区块
      bookmarkData.forEach(function (category, categoryIndex) {
        const sectionId = 'cat-' + category.category.replace(/\s+/g, '-').toLowerCase();

        const section = document.createElement('div');
        section.className = 'bookmark-section';
        section.id = sectionId;
        section.style.setProperty('--section-index', categoryIndex + 1);

        let html = `
                    <h2 class="section-title">
                        <span class="section-icon">${category.icon}</span>
                        ${category.category}
                    </h2>
                    <div class="bookmark-grid">
                `;

        // 为每个链接创建一个书签
        category.links.forEach(function (link, index) {
          // 确定是否有用户自定义图标
          const hasUserIcon = !!link.icon;

          // 获取图标内容
          let iconContent = '';
          if (link.icon) {
            // 检查是否是URL
            if (link.icon.startsWith('http')) {
              iconContent = `<img src="${link.icon}" alt="icon" class="favicon-img">`;
            } else {
              iconContent = link.icon; // Emoji或文字图标
            }
          } else {
            iconContent = link.name.charAt(0); // 首字母作为默认图标
          }

          // 为每个链接分配一个确定的颜色 (基于URL的哈希值，确保相同URL总是同一个颜色)
          const colorClass = getColorForUrl(link.url, index);

          html += `
                        <a href="${link.url}" class="bookmark-item" target="_blank">
                            <div class="bookmark-icon ${colorClass}" data-has-user-icon="${hasUserIcon}">
                                ${iconContent}
                            </div>
                            <div class="bookmark-info">
                                <div class="bookmark-name">${link.name}</div>
                                <div class="bookmark-desc">${link.desc || ''}</div>
                            </div>
                        </a>
                    `;
        });

        html += '</div>';
        section.innerHTML = html;
        container.appendChild(section);
      });

      // 加载网站图标
      loadFavicons();

      // 添加点击波纹效果
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

    // 为URL生成一个确定的颜色类 (确保同一网站总是获得相同的颜色)
    function getColorForUrl(url, fallbackIndex) {
      // 从URL生成一个简单的哈希值
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        hash = ((hash << 5) - hash) + url.charCodeAt(i);
        hash = hash & hash; // 转换为32位整数
      }

      // 如果URL为空或哈希计算失败，则使用索引作为备用
      if (!url || hash === 0) {
        hash = fallbackIndex;
      }

      // 确保哈希值为正数
      hash = Math.abs(hash);

      // 获取可用的颜色类数量
      const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];
      const numColors = colorClasses.length;

      // 使用哈希值确定颜色索引
      const colorIndex = hash % numColors;

      return colorClasses[colorIndex];
    }

    // 处理滚动事件
    function handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const navBar = document.getElementById('categoryNav');
      const backToTop = document.getElementById('backToTop');

      // 导航栏样式变化
      if (scrollTop > 50) {
        navBar.classList.add('scrolled');
      } else {
        navBar.classList.remove('scrolled');
      }

      // 返回顶部按钮显示/隐藏
      if (scrollTop > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }

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
      sections.forEach(function (section, index) {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (middleScreenPos >= sectionTop && middleScreenPos <= sectionBottom) {
          activeIndex = index;
        }
      });

      // 移除所有高亮
      categoryLinks.forEach(function (link) {
        link.classList.remove('active');
      });

      // 添加当前分类的高亮
      if (categoryLinks[activeIndex]) {
        categoryLinks[activeIndex].classList.add('active');
      }
    }

    // 加载网站图标
    function loadFavicons() {
      const bookmarkItems = document.querySelectorAll('.bookmark-item');

      bookmarkItems.forEach(function (item) {
        const iconElement = item.querySelector('.bookmark-icon');
        const url = item.getAttribute('href');

        // 检查是否有用户自定义图标
        const hasUserIcon = iconElement.getAttribute('data-has-user-icon') === 'true';

        // 如果没有用户自定义图标，尝试加载favicon
        if (!hasUserIcon) {
          // 直接从后端获取favicon URL
          fetch(`/api/favicon?url=${encodeURIComponent(url)}`)
            .then(response => response.text())
            .then(faviconUrl => {
              // 处理可能的转义字符
              faviconUrl = faviconUrl.replace(/\\u0026/g, '&');

              // 创建图片元素
              const img = document.createElement('img');
              img.className = 'favicon-img';
              img.src = faviconUrl;
              img.alt = '';

              // 加载成功时清除原有内容并插入图片
              img.onload = function () {
                if (img.naturalWidth > 0) {
                  iconElement.textContent = '';
                  iconElement.appendChild(img);
                }
              };

              // 为图片添加错误处理
              img.onerror = function () {
                console.error('Failed to load favicon:', faviconUrl);
                // 恢复到默认显示（网站名称首字母）
                iconElement.textContent = item.querySelector('.bookmark-name').textContent.charAt(0);
              };
            })
            .catch(error => {
              console.error('Error fetching favicon:', error);
            });
        }
      });
    }




    // 筛选书签
    function filterBookmarks(searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      const bookmarkItems = document.querySelectorAll('.bookmark-item');

      bookmarkItems.forEach(function (item) {
        const name = item.querySelector('.bookmark-name').textContent.toLowerCase();
        const desc = item.querySelector('.bookmark-desc').textContent.toLowerCase();

        if (name.includes(searchTerm) || desc.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });

      // 隐藏没有匹配项的分类
      document.querySelectorAll('.bookmark-section').forEach(function (section) {
        const visibleItems = section.querySelectorAll('.bookmark-item[style="display: flex;"]').length;
        const hiddenItems = section.querySelectorAll('.bookmark-item[style="display: none;"]').length;
        const totalItems = visibleItems + hiddenItems;

        if (totalItems > 0 && visibleItems === 0) {
          section.style.display = 'none';
        } else {
          section.style.display = 'block';
        }
      });
    }

    // 百度搜索
    function searchBaidu(searchTerm) {
      window.open('https://www.baidu.com/s?wd=' + encodeURIComponent(searchTerm), '_blank');
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
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeToggle').querySelector('i');
        icon.className = 'fas fa-sun';
      }

      // 检查系统主题偏好
      if (localStorage.getItem('darkMode') === null &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeToggle').querySelector('i');
        icon.className = 'fas fa-sun';
      }
    }