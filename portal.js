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

      var postcardBtn = wrapper.querySelector(".serendipity-btn.postcard-trigger");
      if (postcardBtn && !postcardBtn._bound) {
        postcardBtn._bound = true;
        postcardBtn.addEventListener("click", function () {
          var curItem = all[currentIndex];
          exportPostcard(curItem);
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
     9. 慢生活环境白噪音播放器 (Ambience Player // Web Audio API)
     ------------------------------------------------------------ */
  var ambienceCtx = null;
  var currentAmbienceTrack = "none";
  var ambienceSourceNodes = [];

  function getAmbienceContext() {
    if (!ambienceCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ambienceCtx = new AC();
    }
    if (ambienceCtx && ambienceCtx.state === "suspended") {
      ambienceCtx.resume();
    }
    return ambienceCtx;
  }

  function stopAmbience() {
    ambienceSourceNodes.forEach(function (n) {
      try { n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    ambienceSourceNodes = [];
    currentAmbienceTrack = "none";
    updateAmbienceUI();
  }

  function playAmbience(trackId) {
    stopAmbience();
    if (trackId === "none") return;

    var ctx = getAmbienceContext();
    if (!ctx) return;

    currentAmbienceTrack = trackId;
    updateAmbienceUI();

    var bufferSize = ctx.sampleRate * 2;
    var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    var whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    var filter = ctx.createBiquadFilter();
    var gain = ctx.createGain();

    if (trackId === "rain") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (trackId === "wind") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.Q.value = 1.8;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
    } else if (trackId === "fire") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
    } else if (trackId === "night") {
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2400, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();

    ambienceSourceNodes.push(whiteNoise);
    showToast("🎵 已开启慢生活白噪音：" + (trackId === "rain" ? "窗外小雨" : trackId === "wind" ? "深山晨风" : trackId === "fire" ? "壁炉柴火" : "夏夜微鸣"));
  }

  function updateAmbienceUI() {
    var floatBtn = document.querySelector(".ambience-trigger-btn");
    if (!floatBtn) return;
    floatBtn.classList.toggle("is-playing", currentAmbienceTrack !== "none");
    var label = floatBtn.querySelector(".ambience-btn-label");
    if (label) {
      label.textContent = currentAmbienceTrack === "none" ? "慢音伴读" : "白噪音播放中";
    }

    document.querySelectorAll(".ambience-track-chip").forEach(function (chip) {
      chip.classList.toggle("is-active", chip.dataset.track === currentAmbienceTrack);
    });
  }

  function initAmbiencePlayer() {
    if (document.querySelector(".ambience-vinyl-float")) return;

    var container = document.createElement("div");
    container.className = "ambience-vinyl-float";
    container.innerHTML = [
      '<button type="button" class="ambience-trigger-btn" title="慢生活白噪音伴读播放器">',
      '  <div class="vinyl-mini-disc"></div>',
      '  <span class="ambience-btn-label">慢音伴读</span>',
      '</button>',
      '<div class="ambience-control-panel">',
      '  <h4 class="ambience-panel-title">',
      '    <span>☕ 慢生活白噪音</span>',
      '    <small style="font-size:11px;color:var(--muted);font-weight:400;">纯净声音伴读</small>',
      '  </h4>',
      '  <div class="ambience-tracks-list">',
      '    <button type="button" class="ambience-track-chip is-active" data-track="none"><span>⏸️ 静音模式</span></button>',
      '    <button type="button" class="ambience-track-chip" data-track="rain"><span>🌧️ 窗外淅沥小雨</span></button>',
      '    <button type="button" class="ambience-track-chip" data-track="wind"><span>🍃 深山晨风漫卷</span></button>',
      '    <button type="button" class="ambience-track-chip" data-track="fire"><span>🔥 温暖壁炉柴火</span></button>',
      '    <button type="button" class="ambience-track-chip" data-track="night"><span>🌙 静谧夏夜微鸣</span></button>',
      '  </div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(container);

    var triggerBtn = container.querySelector(".ambience-trigger-btn");
    var panel = container.querySelector(".ambience-control-panel");

    triggerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.classList.toggle("is-open");
    });

    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        panel.classList.remove("is-open");
      }
    });

    container.querySelectorAll(".ambience-track-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var track = chip.dataset.track;
        playAmbience(track);
      });
    });
  }

  /* ------------------------------------------------------------
     10. 拍立得生活明信片一键导出 (Canvas Card Export Generator)
     ------------------------------------------------------------ */
  var postcardBackdrop = null;

  function exportPostcard(item) {
    if (!item) return;

    if (!postcardBackdrop) {
      postcardBackdrop = document.createElement("div");
      postcardBackdrop.className = "postcard-modal-backdrop";
      postcardBackdrop.innerHTML = [
        '<div class="postcard-modal-dialog" role="dialog" aria-modal="true">',
        '  <h3 style="margin:0;font-size:18px;font-family:\'Noto Serif SC\',serif;color:var(--ink);">🖼️ 生活灵感明信片</h3>',
        '  <div class="postcard-preview-box">',
        '    <canvas id="postcard-canvas" width="600" height="850"></canvas>',
        '  </div>',
        '  <div class="postcard-actions-row">',
        '    <button type="button" class="postcard-btn secondary" id="postcard-close-btn">关闭</button>',
        '    <button type="button" class="postcard-btn primary" id="postcard-download-btn">📥 保存明信片到本地</button>',
        '  </div>',
        '</div>'
      ].join("\n");
      document.body.appendChild(postcardBackdrop);

      postcardBackdrop.addEventListener("click", function (e) {
        if (e.target === postcardBackdrop) postcardBackdrop.classList.remove("is-open");
      });
      postcardBackdrop.querySelector("#postcard-close-btn").addEventListener("click", function () {
        postcardBackdrop.classList.remove("is-open");
      });
    }

    var canvas = document.getElementById("postcard-canvas");
    var ctx = canvas.getContext("2d");

    // 绘制卡片
    var isDark = html.getAttribute("data-theme") === "dark";
    var bgGrad = ctx.createLinearGradient(0, 0, 0, 850);
    if (isDark) {
      bgGrad.addColorStop(0, "#1f1b17");
      bgGrad.addColorStop(1, "#141210");
    } else {
      bgGrad.addColorStop(0, "#fffefb");
      bgGrad.addColorStop(1, "#f4ece2");
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 850);

    // 外边框
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.15)" : "#e2d5c5";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 560, 810);
    ctx.strokeRect(24, 24, 552, 802);

    // 头部文字
    ctx.fillStyle = isDark ? "#c89d58" : "#a87425";
    ctx.font = "bold 13px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("L I F E - S I T E   //   花 影 食 途", 300, 60);

    // 加载图片并绘制
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = item.image;
    img.onload = function () {
      ctx.save();
      // 照片投影
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, 45, 85, 510, 380);
      ctx.restore();

      // 照片白边框
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(45, 85, 510, 380);

      // 分类与标签
      ctx.fillStyle = isDark ? "#d8a452" : "#a64032";
      ctx.font = "bold 14px -apple-system, sans-serif";
      ctx.fillText((item.categoryLabel || "生活") + " · " + (item.group || item.meta || ""), 300, 520);

      // 主标题
      ctx.fillStyle = isDark ? "#f5eee4" : "#22211e";
      ctx.font = "bold 32px 'Noto Serif SC', Georgia, serif";
      ctx.fillText(item.title, 300, 568);

      // 金句引言
      ctx.fillStyle = isDark ? "#b0a596" : "#59534a";
      ctx.font = "italic 16px -apple-system, sans-serif";
      var quote = "“" + (item.feeling || item.summary || "") + "”";
      // 简单两行折行
      if (quote.length > 24) {
        ctx.fillText(quote.substring(0, 24), 300, 625);
        ctx.fillText(quote.substring(24), 300, 652);
      } else {
        ctx.fillText(quote, 300, 635);
      }

      // 底部分割线与印章
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.12)" : "#decbb7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 715);
      ctx.lineTo(500, 715);
      ctx.stroke();

      ctx.fillStyle = isDark ? "#7a7266" : "#999083";
      ctx.font = "12px monospace";
      var todayStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
      ctx.fillText("慢生活灵感切片 · " + todayStr + " · 收集于自然与人间", 300, 745);

      postcardBackdrop.classList.add("is-open");

      var downloadBtn = document.getElementById("postcard-download-btn");
      downloadBtn.onclick = function () {
        var link = document.createElement("a");
        link.download = "花影食途明信片-" + item.title + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("✨ 明信片已成功下载到相册！");
      };
    };
  }

  /* ------------------------------------------------------------
     11. 情绪灵感配方生成器 (Mood Recipe Controller)
     ------------------------------------------------------------ */
  function initMoodRecipeWidget() {
    var container = document.getElementById("mood-recipe-container");
    if (!container) return;

    var input = container.querySelector(".mood-input");
    var submitBtn = container.querySelector(".mood-submit-btn");
    var grid = container.querySelector(".mood-recipe-grid");
    var chips = container.querySelectorAll(".mood-tag-chip");
    var all = getAllItems();

    function craftRecipe(keyword) {
      if (!all.length) return;
      keyword = (keyword || "治愈").toLowerCase();

      var movies = all.filter(function (it) { return it.category === "movies"; });
      var travels = all.filter(function (it) { return it.category === "travel"; });
      var foods = all.filter(function (it) { return it.category === "food"; });
      var flowers = all.filter(function (it) { return it.category === "flowers"; });

      // 根据关键词挑选匹配项
      function pickMatch(list) {
        var matched = list.filter(function (it) {
          return (it.title + it.group + it.summary + it.feeling).toLowerCase().indexOf(keyword) !== -1;
        });
        return matched.length ? matched[Math.floor(Math.random() * matched.length)] : list[Math.floor(Math.random() * list.length)];
      }

      var quad = [
        pickMatch(movies),
        pickMatch(travels),
        pickMatch(foods),
        pickMatch(flowers)
      ];

      grid.innerHTML = quad.map(function (it, idx) {
        var label = idx === 0 ? "🎬 治愈电影" : idx === 1 ? "✈️ 避世胜地" : idx === 2 ? "🍜 暖心风味" : "🌸 一束芬芳";
        return [
          '<article class="mood-quad-card">',
          '  <img class="mood-quad-thumb" src="' + it.image + '" alt="' + it.title + '" loading="lazy">',
          '  <div class="mood-quad-content">',
          '    <span class="mood-quad-badge">' + label + '</span>',
          '    <h4 class="mood-quad-title">' + it.title + '</h4>',
          '    <p class="mood-quad-desc">“' + (it.feeling || it.summary) + '”</p>',
          '    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">',
          '      <a class="mood-quad-link" href="' + it.url + '">详情 →</a>',
          '      <button type="button" class="wishlist-jump-link" style="background:none;border:none;cursor:pointer;font-size:12px;" onclick=\'LifePortal.exportPostcard(' + JSON.stringify(it).replace(/'/g, "&#39;") + ')\'>🖼️ 导出明信片</button>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join("\n");
      }).join("\n");

      showToast("✨ 已为您配比专属生活解药四味！");
    }

    if (submitBtn && input) {
      submitBtn.addEventListener("click", function () {
        craftRecipe(input.value);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") craftRecipe(input.value);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var val = chip.textContent.replace(/^[^\s]+\s*/, "");
        if (input) input.value = val;
        craftRecipe(val);
      });
    });

    craftRecipe("放空治愈");
  }

  /* ------------------------------------------------------------
     12. 旅行足迹世界交互地图 (Interactive Travel Map)
     ------------------------------------------------------------ */
  function initTravelMap() {
    var container = document.getElementById("travel-world-map");
    if (!container) return;

    var PINS = [
      { id: "fuji", name: "富士山与河口湖", x: 810, y: 195 },
      { id: "paris", name: "埃菲尔铁塔", x: 485, y: 170 },
      { id: "santorini", name: "圣托里尼", x: 535, y: 205 },
      { id: "marrakech", name: "马拉喀什老城", x: 445, y: 225 },
      { id: "great-wall", name: "箭扣长城", x: 755, y: 185 },
      { id: "grand-canyon", name: "大峡谷", x: 205, y: 195 },
      { id: "giza", name: "吉萨金字塔", x: 550, y: 230 },
      { id: "taj-mahal", name: "泰姬陵", x: 675, y: 225 },
      { id: "zhangjiajie", name: "张家界", x: 745, y: 220 },
      { id: "banff", name: "班夫国家公园", x: 215, y: 145 },
      { id: "cappadocia", name: "卡帕多奇亚", x: 555, y: 195 },
      { id: "machu-picchu", name: "马丘比丘", x: 295, y: 340 },
      { id: "queenstown", name: "皇后镇", x: 890, y: 440 },
      { id: "aurora", name: "冰岛极光", x: 460, y: 105 },
      { id: "barcelona", name: "圣家堂", x: 478, y: 195 },
      { id: "great-barrier-reef", name: "大堡礁", x: 855, y: 350 }
    ];

    var svgContent = [
      '<svg class="travel-map-svg" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">',
      '  <defs>',
      '    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">',
      '      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168,116,37,0.07)" stroke-width="1"/>',
      '    </pattern>',
      '  </defs>',
      '  <rect width="1000" height="500" fill="url(#gridPattern)" />',
      '  <!-- 极简大陆轮廓示意 -->',
      '  <path d="M 150 110 Q 220 80 280 120 T 320 200 T 260 250 T 170 200 Z" fill="rgba(168,116,37,0.08)" />',
      '  <path d="M 270 270 Q 320 280 340 350 T 300 450 T 250 370 Z" fill="rgba(168,116,37,0.08)" />',
      '  <path d="M 450 100 Q 560 90 600 150 T 520 230 T 450 180 Z" fill="rgba(168,116,37,0.08)" />',
      '  <path d="M 460 230 Q 550 240 560 330 T 510 430 T 440 320 Z" fill="rgba(168,116,37,0.08)" />',
      '  <path d="M 600 120 Q 780 110 840 180 T 780 290 T 630 240 Z" fill="rgba(168,116,37,0.08)" />',
      '  <path d="M 800 320 Q 880 330 870 410 T 790 390 Z" fill="rgba(168,116,37,0.08)" />'
    ];

    PINS.forEach(function (pin) {
      svgContent.push([
        '  <g class="map-pin-beacon" data-id="' + pin.id + '" transform="translate(' + pin.x + ',' + pin.y + ')">',
        '    <circle class="map-pin-pulse" cx="0" cy="0" r="10" />',
        '    <circle class="map-pin-circle" cx="0" cy="0" r="4.5" />',
        '    <text x="8" y="4" font-size="10" font-family="sans-serif" font-weight="bold" fill="var(--ink)" opacity="0.85">' + pin.name + '</text>',
        '  </g>'
      ].join("\n"));
    });

    svgContent.push('</svg>');
    container.innerHTML = svgContent.join("\n");

    container.querySelectorAll(".map-pin-beacon").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.dataset.id;
        var targetCard = document.querySelector('[data-id="' + id + '"]') || document.getElementById(id);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          targetCard.classList.add("is-target-glow");
          setTimeout(function () { targetCard.classList.remove("is-target-glow"); }, 2000);
        } else {
          window.location.hash = "item=" + id;
        }
      });
    });
  }

  /* ------------------------------------------------------------
     13. 页面启动与全局接口导出
     ------------------------------------------------------------ */
  function boot() {
    injectNavCluster();
    initBackToTop();
    initGlobalShortcuts();
    initSerendipityWidget();
    initAmbiencePlayer();
    initMoodRecipeWidget();
    initTravelMap();
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
    showToast: showToast,
    exportPostcard: exportPostcard,
    playAmbience: playAmbience,
    stopAmbience: stopAmbience
  };
})();

