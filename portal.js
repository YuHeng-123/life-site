/* ============================================================
   花影食途 · 旗舰交互控制脚本 portal.js
   ------------------------------------------------------------
   - 主题切换：Zen Dark Mode (玄青深夜纸感)
   - 全局搜索：Command Palette (Cmd+K / Ctrl+K 跨栏目联想)
   - 随心偶遇：Daily Serendipity (今日灵感推荐)
   - 灵感手帐：Wishlist Drawer (多栏目收藏汇总抽屉)
   - 悬浮返顶：Back to Top 智能按钮
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. 主题控制 (Zen Dark Mode)
     ------------------------------------------------------------ */
  var THEME_KEY = "life-site:theme";
  var html = document.documentElement;

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      html.setAttribute("data-theme", saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.setAttribute("data-theme", "light");
    }
  }
  initTheme();

  function toggleTheme() {
    var current = html.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    updateThemeBtn();
    showToast(next === "dark" ? "🌙 已切换至玄青深夜模式" : "☀️ 已切换至复古米纸模式");
  }

  function updateThemeBtn() {
    var btn = document.querySelector(".portal-theme-btn");
    if (!btn) return;
    var isDark = html.getAttribute("data-theme") === "dark";
    btn.innerHTML = isDark
      ? '<span style="font-size:14px;">☀️</span><span class="btn-text">日间</span>'
      : '<span style="font-size:14px;">🌙</span><span class="btn-text">深夜</span>';
    btn.title = isDark ? "切换为米纸日间模式" : "切换为玄青深夜模式";
  }

  /* ------------------------------------------------------------
     2. 导航栏交互集群注入 (Search, Wishlist, Theme)
     ------------------------------------------------------------ */
  function injectNavCluster() {
    var navLinks = document.querySelector(".topbar .nav-links");
    if (!navLinks || document.querySelector(".nav-actions-cluster")) return;

    var cluster = document.createElement("div");
    cluster.className = "nav-actions-cluster";

    // 搜索按钮
    var searchBtn = document.createElement("button");
    searchBtn.type = "button";
    searchBtn.className = "portal-nav-btn portal-search-btn";
    searchBtn.title = "全局搜索 (快捷键 Ctrl+K / ⌘K)";
    searchBtn.innerHTML = '<span>🔍</span><span class="btn-text">搜索</span><kbd>Ctrl K</kbd>';
    searchBtn.addEventListener("click", openPalette);

    // 心愿手帐按钮
    var wishlistBtn = document.createElement("button");
    wishlistBtn.type = "button";
    wishlistBtn.className = "portal-nav-btn portal-wishlist-btn";
    wishlistBtn.title = "查看我的灵感手帐与心愿单";
    wishlistBtn.innerHTML = '<span>📖</span><span class="btn-text">手帐</span><span class="portal-nav-badge">0</span>';
    wishlistBtn.addEventListener("click", openWishlist);

    // 主题切换按钮
    var themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "portal-nav-btn portal-theme-btn";
    themeBtn.addEventListener("click", toggleTheme);

    cluster.appendChild(searchBtn);
    cluster.appendChild(wishlistBtn);
    cluster.appendChild(themeBtn);
    navLinks.appendChild(cluster);

    updateThemeBtn();
    updateWishlistBadge();
  }

  /* ------------------------------------------------------------
     3. 轻提示 (Toast)
     ------------------------------------------------------------ */
  var toastEl = null;
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "portal-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ------------------------------------------------------------
     4. 全局搜索 (Command Palette)
     ------------------------------------------------------------ */
  var paletteBackdrop = null;
  var paletteInput = null;
  var paletteResults = null;
  var paletteTabs = null;
  var activeCategory = "all";
  var selectedIndex = 0;
  var currentFilteredResults = [];

  var CATEGORY_NAMES = {
    movies: { label: "电影", icon: "🎬", url: "movies.html" },
    travel: { label: "旅行", icon: "✈️", url: "travel.html" },
    food: { label: "美食", icon: "🍜", url: "food.html" },
    flowers: { label: "百花", icon: "🌸", url: "flowers.html" }
  };

  function getAllItems() {
    var raw = window.LIFE_SITE_DATA || {};
    var all = [];
    Object.keys(CATEGORY_NAMES).forEach(function (catKey) {
      var cat = raw[catKey];
      if (cat && Array.isArray(cat.items)) {
        cat.items.forEach(function (item) {
          all.push({
            category: catKey,
            categoryLabel: CATEGORY_NAMES[catKey].label,
            categoryIcon: CATEGORY_NAMES[catKey].icon,
            url: CATEGORY_NAMES[catKey].url + "#item=" + item.id,
            id: item.id,
            title: item.title,
            group: item.group,
            meta: item.meta,
            image: item.image,
            summary: item.summary,
            story: item.story,
            feeling: item.feeling
          });
        });
      }
    });
    return all;
  }

  function initPaletteDOM() {
    if (paletteBackdrop) return;

    paletteBackdrop = document.createElement("div");
    paletteBackdrop.className = "cmd-palette-backdrop";
    paletteBackdrop.innerHTML = [
      '<div class="cmd-palette-modal" role="dialog" aria-modal="true" aria-label="全局搜索">',
      '  <div class="cmd-search-header">',
      '    <svg class="cmd-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      '    <input class="cmd-search-input" type="text" placeholder="搜索电影、旅行胜地、风味料理或百花图鉴... (Esc 关闭)" autofocus>',
      '  </div>',
      '  <div class="cmd-filter-tabs">',
      '    <button type="button" class="cmd-tab-chip is-active" data-cat="all">全部</button>',
      '    <button type="button" class="cmd-tab-chip" data-cat="movies">🎬 电影</button>',
      '    <button type="button" class="cmd-tab-chip" data-cat="travel">✈️ 旅行</button>',
      '    <button type="button" class="cmd-tab-chip" data-cat="food">🍜 美食</button>',
      '    <button type="button" class="cmd-tab-chip" data-cat="flowers">🌸 百花</button>',
      '  </div>',
      '  <div class="cmd-results-viewport"></div>',
      '  <div class="cmd-footer-shortcuts">',
      '    <span><kbd>↑</kbd><kbd>↓</kbd> 选择 &nbsp; <kbd>Enter</kbd> 查看详情 &nbsp; <kbd>Esc</kbd> 退出</span>',
      '    <span>花影食途 · 灵感检索</span>',
      '  </div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(paletteBackdrop);

    paletteInput = paletteBackdrop.querySelector(".cmd-search-input");
    paletteResults = paletteBackdrop.querySelector(".cmd-results-viewport");
    paletteTabs = paletteBackdrop.querySelectorAll(".cmd-tab-chip");

    paletteBackdrop.addEventListener("click", function (e) {
      if (e.target === paletteBackdrop) closePalette();
    });

    paletteInput.addEventListener("input", function () {
      renderPaletteResults();
    });

    paletteTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        paletteTabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        activeCategory = tab.dataset.cat;
        renderPaletteResults();
        paletteInput.focus();
      });
    });

    paletteInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        commitSelection();
      } else if (e.key === "Escape") {
        closePalette();
      }
    });
  }

  function openPalette() {
    initPaletteDOM();
    paletteBackdrop.classList.add("is-open");
    paletteInput.value = "";
    activeCategory = "all";
    paletteTabs.forEach(function (t) {
      t.classList.toggle("is-active", t.dataset.cat === "all");
    });
    renderPaletteResults();
    setTimeout(function () {
      paletteInput.focus();
    }, 50);
  }

  function closePalette() {
    if (!paletteBackdrop) return;
    paletteBackdrop.classList.remove("is-open");
  }

  function highlightMatch(text, query) {
    if (!query || !text) return text || "";
    var reg = new RegExp("(" + query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + ")", "gi");
    return text.replace(reg, '<span class="cmd-highlight">$1</span>');
  }

  function renderPaletteResults() {
    var query = (paletteInput.value || "").trim().toLowerCase();
    var all = getAllItems();

    currentFilteredResults = all.filter(function (item) {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      if (!query) return true;
      var haystack = [
        item.title,
        item.group,
        item.meta,
        item.summary,
        item.story,
        item.feeling
      ].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    // 默认展示上限 15 项
    var displayList = currentFilteredResults.slice(0, 15);
    selectedIndex = 0;

    if (displayList.length === 0) {
      paletteResults.innerHTML = [
        '<div class="cmd-empty-state">',
        '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '  <p>未找到与 “' + query + '” 相关的生活灵感<br><small>试着搜索“千与千寻”、“富士山”、“抹茶”或“樱花”</small></p>',
        '</div>'
      ].join("\n");
      return;
    }

    var htmlStr = displayList.map(function (item, index) {
      var titleHl = highlightMatch(item.title, query);
      var descHl = highlightMatch(item.summary || item.feeling, query);
      var metaStr = item.group ? item.group + " · " + item.meta : item.meta;
      return [
        '<a class="cmd-result-item' + (index === 0 ? ' is-selected' : '') + '" href="' + item.url + '" data-index="' + index + '">',
        '  <img class="cmd-result-thumb" src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
        '  <div class="cmd-result-info">',
        '    <div class="cmd-result-top">',
        '      <span class="cmd-result-badge">' + item.categoryIcon + ' ' + item.categoryLabel + '</span>',
        '      <strong class="cmd-result-title">' + titleHl + '</strong>',
        '      <small style="color:var(--muted);font-size:12px;">' + metaStr + '</small>',
        '    </div>',
        '    <div class="cmd-result-snippet">' + descHl + '</div>',
        '  </div>',
        '  <span style="font-size:12px;color:var(--gold);font-weight:700;">跳转 →</span>',
        '</a>'
      ].join("\n");
    }).join("\n");

    paletteResults.innerHTML = htmlStr;

    paletteResults.querySelectorAll(".cmd-result-item").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var idx = parseInt(el.dataset.index, 10);
        setSelectedIndex(idx);
      });
      el.addEventListener("click", function () {
        closePalette();
      });
    });
  }

  function setSelectedIndex(index) {
    selectedIndex = index;
    var items = paletteResults.querySelectorAll(".cmd-result-item");
    items.forEach(function (el, idx) {
      el.classList.toggle("is-selected", idx === selectedIndex);
    });
  }

  function moveSelection(step) {
    var items = paletteResults.querySelectorAll(".cmd-result-item");
    if (!items.length) return;
    selectedIndex = (selectedIndex + step + items.length) % items.length;
    setSelectedIndex(selectedIndex);
    items[selectedIndex].scrollIntoView({ block: "nearest" });
  }

  function commitSelection() {
    var items = paletteResults.querySelectorAll(".cmd-result-item");
    if (items[selectedIndex]) {
      closePalette();
      window.location.href = items[selectedIndex].href;
    }
  }

  /* ------------------------------------------------------------
     5. 心愿单手帐抽屉 (Wishlist Drawer)
     ------------------------------------------------------------ */
  var wishlistBackdrop = null;
  var wishlistPanel = null;
  var wishlistList = null;
  var wishlistBadge = null;
  var activeWishlistFilter = "all";

  function getWishlistItems() {
    var all = getAllItems();
    var result = [];

    Object.keys(CATEGORY_NAMES).forEach(function (catKey) {
      var key = "life-site:marks:" + catKey;
      var raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        var marks = JSON.parse(raw);
        if (marks && typeof marks === "object") {
          Object.keys(marks).forEach(function (itemId) {
            var markVal = marks[itemId];
            var found = all.find(function (it) { return it.category === catKey && it.id === itemId; });
            if (found) {
              result.push({
                item: found,
                category: catKey,
                markVal: markVal,
                markLabel: markVal === 1
                  ? (catKey === "movies" ? "看过" : catKey === "travel" ? "去过" : catKey === "food" ? "吃过" : "拍过")
                  : (catKey === "movies" ? "想看" : catKey === "travel" ? "想去" : catKey === "food" ? "想吃" : "想拍")
              });
            }
          });
        }
      } catch (e) {}
    });

    return result;
  }

  function updateWishlistBadge() {
    var badge = document.querySelector(".portal-nav-badge");
    if (!badge) return;
    var items = getWishlistItems();
    badge.textContent = items.length;
    badge.style.display = items.length > 0 ? "inline-flex" : "none";
  }

  function initWishlistDOM() {
    if (wishlistBackdrop) return;

    wishlistBackdrop = document.createElement("div");
    wishlistBackdrop.className = "wishlist-drawer-backdrop";
    wishlistBackdrop.innerHTML = [
      '<div class="wishlist-drawer-panel" role="dialog" aria-modal="true" aria-label="我的灵感手帐">',
      '  <div class="wishlist-drawer-header">',
      '    <div>',
      '      <h2 class="wishlist-drawer-title">📖 我的灵感手帐</h2>',
      '      <p class="wishlist-drawer-subtitle">已收录您标记的生活灵感与心愿清单</p>',
      '    </div>',
      '    <button type="button" class="wishlist-close-btn" aria-label="关闭">&times;</button>',
      '  </div>',
      '  <div class="wishlist-drawer-filter">',
      '    <button type="button" class="cmd-tab-chip is-active" data-filter="all">全部</button>',
      '    <button type="button" class="cmd-tab-chip" data-filter="movies">🎬 电影</button>',
      '    <button type="button" class="cmd-tab-chip" data-filter="travel">✈️ 旅行</button>',
      '    <button type="button" class="cmd-tab-chip" data-filter="food">🍜 美食</button>',
      '    <button type="button" class="cmd-tab-chip" data-filter="flowers">🌸 百花</button>',
      '  </div>',
      '  <div class="wishlist-drawer-list"></div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(wishlistBackdrop);

    wishlistPanel = wishlistBackdrop.querySelector(".wishlist-drawer-panel");
    wishlistList = wishlistBackdrop.querySelector(".wishlist-drawer-list");

    wishlistBackdrop.addEventListener("click", function (e) {
      if (e.target === wishlistBackdrop) closeWishlist();
    });

    wishlistBackdrop.querySelector(".wishlist-close-btn").addEventListener("click", closeWishlist);

    wishlistBackdrop.querySelectorAll(".wishlist-drawer-filter .cmd-tab-chip").forEach(function (tab) {
      tab.addEventListener("click", function () {
        wishlistBackdrop.querySelectorAll(".wishlist-drawer-filter .cmd-tab-chip").forEach(function (t) {
          t.classList.remove("is-active");
        });
        tab.classList.add("is-active");
        activeWishlistFilter = tab.dataset.filter;
        renderWishlistList();
      });
    });
  }

  function openWishlist() {
    initWishlistDOM();
    wishlistBackdrop.classList.add("is-open");
    renderWishlistList();
  }

  function closeWishlist() {
    if (!wishlistBackdrop) return;
    wishlistBackdrop.classList.remove("is-open");
  }

  function renderWishlistList() {
    var rawItems = getWishlistItems();
    var filtered = rawItems.filter(function (entry) {
      return activeWishlistFilter === "all" || entry.category === activeWishlistFilter;
    });

    var subTitle = wishlistBackdrop.querySelector(".wishlist-drawer-subtitle");
    if (subTitle) {
      subTitle.textContent = "已收录 " + rawItems.length + " 项标记与心愿清单";
    }

    if (filtered.length === 0) {
      wishlistList.innerHTML = [
        '<div class="wishlist-empty-box">',
        '  <span style="font-size:36px;">🍃</span>',
        '  <p><strong>暂无记录</strong><br>在电影、旅行、美食与百花栏目中点击「想去/想看/想吃/想拍」，它们就会自动收录在你的手帐里。</p>',
        '</div>'
      ].join("\n");
      return;
    }

    var htmlStr = filtered.map(function (entry) {
      var item = entry.item;
      var markBadgeBg = entry.markVal === 1 ? "var(--green)" : "var(--gold)";
      return [
        '<article class="wishlist-card">',
        '  <img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
        '  <div class="wishlist-card-body">',
        '    <h3 class="wishlist-card-title">' + item.title + '</h3>',
        '    <div class="wishlist-card-meta">',
        '      <span style="display:inline-block;padding:1px 6px;border-radius:4px;color:#fff;font-size:11px;font-weight:700;background:' + markBadgeBg + ';">' + entry.markLabel + '</span>',
        '      &nbsp;<span>' + item.categoryLabel + ' · ' + (item.group || item.meta) + '</span>',
        '    </div>',
        '    <div class="wishlist-card-actions">',
        '      <a class="wishlist-jump-link" href="' + item.url + '" onclick="LifePortal.closeWishlist()">去详情看 →</a>',
        '      <button class="wishlist-unmark-btn" type="button" data-cat="' + entry.category + '" data-id="' + item.id + '">取消标记</button>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("\n");
    }).join("\n");

    wishlistList.innerHTML = htmlStr;

    wishlistList.querySelectorAll(".wishlist-unmark-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.dataset.cat;
        var id = btn.dataset.id;
        unmarkItem(cat, id);
      });
    });
  }

  function unmarkItem(category, itemId) {
    var key = "life-site:marks:" + category;
    try {
      var marks = JSON.parse(localStorage.getItem(key) || "{}");
      delete marks[itemId];
      localStorage.setItem(key, JSON.stringify(marks));
      renderWishlistList();
      updateWishlistBadge();
      showToast("已从手帐中移除");
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     6. 今日灵感 · 随心偶遇 (Daily Serendipity Controller)
     ------------------------------------------------------------ */
  function initSerendipityWidget() {
    var container = document.getElementById("daily-serendipity");
    if (!container) return;

    var all = getAllItems();
    if (!all.length) return;

    // 基于日期的伪随机种子
    var today = new Date();
    var daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    var currentIndex = daySeed % all.length;

    function renderCard(index, animate) {
      var item = all[index];
      var wrapper = container.querySelector(".serendipity-wrapper");
      if (!item || !wrapper) return;

      var imgEl = wrapper.querySelector(".serendipity-photo-box img");
      var pillEl = wrapper.querySelector(".serendipity-tag-pill");
      var eyebrowEl = wrapper.querySelector(".serendipity-eyebrow");
      var titleEl = wrapper.querySelector(".serendipity-title");
      var quoteEl = wrapper.querySelector(".serendipity-quote");
      var linkEl = wrapper.querySelector(".serendipity-btn.primary");
      var starBtn = wrapper.querySelector(".serendipity-btn.wish-toggle");

      if (animate) {
        wrapper.style.opacity = "0.4";
        wrapper.style.transform = "scale(0.985)";
        setTimeout(function () {
          updateData();
          wrapper.style.opacity = "1";
          wrapper.style.transform = "none";
        }, 180);
      } else {
        updateData();
      }

      function updateData() {
        imgEl.src = item.image;
        imgEl.alt = item.title;
        pillEl.textContent = item.categoryIcon + " " + item.categoryLabel;
        eyebrowEl.textContent = "今日灵感签 · 宜" + (item.category === "movies" ? "静思" : item.category === "travel" ? "远行" : item.category === "food" ? "尝鲜" : "赏芳");
        titleEl.textContent = item.title;
        quoteEl.textContent = "“" + (item.feeling || item.summary) + "”";
        linkEl.href = item.url;
        linkEl.textContent = "品读 " + item.categoryLabel + "详情 →";

        // 检查是否已在心愿单
        checkWishState();
      }

      function checkWishState() {
        if (!starBtn) return;
        var key = "life-site:marks:" + item.category;
        var marks = JSON.parse(localStorage.getItem(key) || "{}");
        var isMarked = marks[item.id] !== undefined;
        starBtn.innerHTML = isMarked
          ? '<span>✓</span> 已收入手帐'
          : '<span>🔖</span> 收入手帐';
        starBtn.classList.toggle("is-marked", isMarked);
      }

      if (starBtn && !starBtn._bound) {
        starBtn._bound = true;
        starBtn.addEventListener("click", function () {
          var curItem = all[currentIndex];
          var key = "life-site:marks:" + curItem.category;
          var marks = JSON.parse(localStorage.getItem(key) || "{}");
          if (marks[curItem.id] !== undefined) {
            delete marks[curItem.id];
            showToast("已移出手帐");
          } else {
            marks[curItem.id] = 0; // 0 = 想去/想看
            showToast("✨ 已收录进「我的灵感手帐」");
          }
          localStorage.setItem(key, JSON.stringify(marks));
          checkWishState();
          updateWishlistBadge();
        });
      }
    }

    var randomBtn = container.querySelector(".serendipity-btn.random");
    if (randomBtn) {
      randomBtn.addEventListener("click", function () {
        currentIndex = Math.floor(Math.random() * all.length);
        renderCard(currentIndex, true);
      });
    }

    renderCard(currentIndex, false);
  }

  /* ------------------------------------------------------------
     7. 环形进度回到顶部按钮 (Back to Top)
     ------------------------------------------------------------ */
  var backToTopBtn = null;
  function initBackToTop() {
    if (backToTopBtn) return;
    backToTopBtn = document.createElement("button");
    backToTopBtn.type = "button";
    backToTopBtn.className = "portal-back-to-top";
    backToTopBtn.title = "回到顶部";
    backToTopBtn.setAttribute("aria-label", "回到顶部");
    backToTopBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>';

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.body.appendChild(backToTopBtn);

    window.addEventListener("scroll", function () {
      var visible = window.scrollY > 320;
      backToTopBtn.classList.toggle("is-visible", visible);
    }, { passive: true });
  }

  /* ------------------------------------------------------------
     8. 全局快捷键监听 (Ctrl+K, ⌘K, Escape)
     ------------------------------------------------------------ */
  function initGlobalShortcuts() {
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (paletteBackdrop && paletteBackdrop.classList.contains("is-open")) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === "Escape") {
        closePalette();
        closeWishlist();
      }
    });
  }

  /* ------------------------------------------------------------
     9. 页面启动与全局接口导出
     ------------------------------------------------------------ */
  function boot() {
    injectNavCluster();
    initBackToTop();
    initGlobalShortcuts();
    initSerendipityWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // 暴露给全局调用
  window.LifePortal = {
    openPalette: openPalette,
    closePalette: closePalette,
    openWishlist: openWishlist,
    closeWishlist: closeWishlist,
    toggleTheme: toggleTheme,
    showToast: showToast
  };
})();
