/* ============================================================
   花影食途 · 栏目页渲染 catalog-page.js
   ------------------------------------------------------------
   在「搜索 + 筛选 + 查看详情」之上做五件事：
   1. FLIP：筛选后卡片从旧位置平滑滑到新位置，看得清发生了什么
   2. 详情改成右侧抽屉 + 大图，不再把整个列表顶走
   3. 记录标记（看过 / 去过 / 吃过 / 拍过…），存 localStorage，可筛选
   4. 搜索命中的关键词在标题、标签、摘要里高亮
   5. 卡片 / 列表两种视图，选择会被记住

   JS 不加载时页面依然完整；所有动效在 prefers-reduced-motion 下自动关闭。
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.dataset.catalog;
  var data = window.LIFE_SITE_DATA && window.LIFE_SITE_DATA[page];
  if (!data) return;

  var tools = document.querySelector(".catalog-tools");
  var results = document.querySelector(".catalog-results");
  if (!tools || !results) return;

  var LQIP = window.LIFE_SITE_LQIP || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* ------------------------------------------------------------
     每个栏目的一组「记录」标记，存的是 0 / 1 两档
     ------------------------------------------------------------ */
  var MARKS = {
    movies: ["看过", "想看"],
    travel: ["去过", "想去"],
    food: ["吃过", "想吃"],
    flowers: ["拍过", "想拍"]
  }[page] || ["已记录", "想记录"];

  var MARK_KEY = "life-site:marks:" + page;
  var VIEW_KEY = "life-site:view:" + page;

  var groups = ["全部"].concat(
    Array.from(new Set(data.items.map(function (item) { return item.group; })))
  );

  var marks = readJSON(MARK_KEY, {});
  var view = readText(VIEW_KEY) === "list" ? "list" : "grid";
  var activeGroup = "全部";
  var activeMark = "all";
  var search = "";
  var currentId = null;
  var lastFocus = null;
  var hashScrolled = false;

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      var value = raw ? JSON.parse(raw) : null;
      return value && typeof value === "object" ? value : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function readText(key) {
    try { return localStorage.getItem(key) || ""; } catch (err) { return ""; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* 隐私模式下忽略 */ }
  }

  /* ------------------------------------------------------------
     文本处理：先转义，再高亮
     ------------------------------------------------------------ */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* 先按关键词切分原文、再分别转义，避免把 HTML 实体切开 */
  function highlight(text, query) {
    var raw = String(text == null ? "" : text);
    var q = String(query || "").trim();
    if (!q) return escapeHtml(raw);
    var lowered = raw.toLowerCase();
    var needle = q.toLowerCase();
    var out = "";
    var from = 0;
    var hits = 0;
    while (hits < 30) {
      var at = lowered.indexOf(needle, from);
      if (at < 0) break;
      out += escapeHtml(raw.slice(from, at)) +
        "<mark>" + escapeHtml(raw.slice(at, at + q.length)) + "</mark>";
      from = at + q.length;
      hits += 1;
    }
    return out + escapeHtml(raw.slice(from));
  }

  /* ------------------------------------------------------------
     图片：统一走 <picture>，avif → webp → jpg
     img 的 src 指向派生的小图，并把它自己的 16px 模糊缩略图当背景，
     真图解码完成前先显示这层模糊占位 —— 纯 CSS，不依赖 JS。
     ------------------------------------------------------------ */
  var SIZES_CARD = "(max-width: 720px) calc(100vw - 28px), (max-width: 980px) 50vw, 376px";
  var SIZES_DRAWER = "min(480px, 94vw)";

  function stemOf(imagePath) {
    return String(imagePath).replace(/^.*\//, "").replace(/\.[^.]+$/, "");
  }

  function mediaTemplate(item, sizes, extraClass) {
    if (!item.image) {
      return '<div class="text-poster" aria-hidden="true">' + escapeHtml(item.group) + "</div>";
    }
    var stem = stemOf(item.image);
    var lqip = LQIP[stem];
    var cls = extraClass ? ' class="' + extraClass + '"' : "";
    var style = lqip ? " style=\"background-image:url('" + lqip + "')\"" : "";
    var srcset = function (ext) {
      return "assets/derived/" + stem + "-480." + ext + " 480w, " +
             "assets/derived/" + stem + "-960." + ext + " 960w, " +
             "assets/derived/" + stem + "-1440." + ext + " 1440w";
    };
    return "<picture>" +
      '<source type="image/avif" srcset="' + srcset("avif") + '" sizes="' + sizes + '">' +
      '<source type="image/webp" srcset="' + srcset("webp") + '" sizes="' + sizes + '">' +
      '<img' + cls + ' src="assets/derived/' + stem + '-960.jpg" width="480" height="270"' +
      ' alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async"' + style + ">" +
      "</picture>";
  }

  /* ------------------------------------------------------------
     模板
     ------------------------------------------------------------ */
  function markButtons(item) {
    var chosen = marks[item.id];
    return '<div class="mark-row" role="group" aria-label="记录标记">' +
      MARKS.map(function (label, index) {
        return '<button type="button" class="mark-btn' +
          (chosen === index ? " is-on" : "") +
          '" data-mark-id="' + escapeHtml(item.id) + '" data-mark="' + index +
          '" aria-pressed="' + (chosen === index) + '">' + escapeHtml(label) + "</button>";
      }).join("") +
      "</div>";
  }

  function cardTemplate(item) {
    return '<article class="catalog-card' +
      (marks[item.id] != null ? " is-marked" : "") +
      '" data-card-id="' + escapeHtml(item.id) + '">' +
      mediaTemplate(item, SIZES_CARD, "") +
      "<div>" +
      '<p class="tag">' + highlight(item.meta, search) + "</p>" +
      "<h3>" + highlight(item.title, search) + "</h3>" +
      "<p>" + highlight(item.summary, search) + "</p>" +
      markButtons(item) +
      '<button type="button" class="detail-btn" data-id="' + escapeHtml(item.id) + '">查看详情</button>' +
      "</div></article>";
  }

  /* ------------------------------------------------------------
     FLIP
     ------------------------------------------------------------ */
  function capturePositions() {
    var map = new Map();
    results.querySelectorAll("[data-card-id]").forEach(function (el) {
      map.set(el.dataset.cardId, el.getBoundingClientRect());
    });
    return map;
  }

  function playMove(before) {
    if (reduceMotion) return;
    results.querySelectorAll("[data-card-id]").forEach(function (el) {
      var prev = before.get(el.dataset.cardId);
      if (!prev) return;
      var next = el.getBoundingClientRect();
      var dx = prev.left - next.left;
      var dy = prev.top - next.top;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      el.animate(
        [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }],
        { duration: 460, easing: EASE }
      );
    });
  }

  function playEnter(before) {
    if (reduceMotion) return;
    var order = 0;
    results.querySelectorAll("[data-card-id]").forEach(function (el) {
      if (before.has(el.dataset.cardId)) return;
      el.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "none" }
        ],
        { duration: 460, delay: Math.min(order, 7) * 55, easing: EASE, fill: "backwards" }
      );
      order += 1;
    });
  }

  function paintCurrent(id) {
    results.querySelectorAll("[data-card-id]").forEach(function (el) {
      el.classList.toggle("is-current", !!id && el.dataset.cardId === id);
    });
  }

  /* ------------------------------------------------------------
     筛选
     ------------------------------------------------------------ */
  function matches(item) {
    var text = [item.title, item.group, item.meta, item.summary,
                item.story, item.feeling, item.tip].join(" ").toLowerCase();
    if (activeGroup !== "全部" && item.group !== activeGroup) return false;
    if (search && text.indexOf(search.toLowerCase()) === -1) return false;
    if (activeMark === "none") return marks[item.id] == null;
    if (activeMark !== "all") return marks[item.id] === Number(activeMark);
    return true;
  }

  function markCount() {
    return data.items.filter(function (item) { return marks[item.id] != null; }).length;
  }

  function syncTools() {
    groupButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.group === activeGroup);
    });
    markFilterButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.markFilter === activeMark);
    });
    viewButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.view === view);
    });
  }

  /* 只改现有按钮的状态，不重建 DOM —— 用于标记切换，保住悬停态 */
  function syncMarks() {
    document.querySelectorAll("[data-mark-id]").forEach(function (button) {
      var on = marks[button.dataset.markId] === Number(button.dataset.mark);
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
    results.querySelectorAll("[data-card-id]").forEach(function (card) {
      card.classList.toggle("is-marked", marks[card.dataset.cardId] != null);
    });
    var counter = results.querySelector(".mark-count");
    if (counter) {
      var total = markCount();
      counter.textContent = total ? "· 已记录 " + total : "";
    }
  }

  function render() {
    var before = capturePositions();
    var items = data.items.filter(matches);
    var marked = markCount();

    syncTools();

    results.innerHTML =
      '<div class="result-head">' +
        '<p class="eyebrow">' + escapeHtml(data.label) + "内容</p>" +
        "<h2>共 " + items.length + " 条" +
          '<span class="mark-count">' + (marked ? "· 已记录 " + marked : "") + "</span>" +
        "</h2>" +
      "</div>" +
      '<div class="catalog-list' + (view === "list" ? " is-list" : "") + '">' +
        items.map(cardTemplate).join("") +
      "</div>";

    playMove(before);
    playEnter(before);

    /* 详情被筛掉了就关掉；还在（或来自 #item= 深链）就保持打开 */
    var hashId = decodeURIComponent(location.hash.replace("#item=", ""));
    var targetId = hashId || currentId;
    if (targetId && items.some(function (entry) { return entry.id === targetId; })) {
      openDetail(targetId, { updateHash: false, focus: false });
      if (hashId && !hashScrolled) {
        var card = results.querySelector('[data-card-id="' + targetId + '"]');
        if (card) {
          card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
        hashScrolled = true;
      }
    } else if (currentId) {
      closeDetail({ clearHash: false });
    }
  }

  /* ------------------------------------------------------------
     详情抽屉
     ------------------------------------------------------------ */
  function lockScroll() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--sbw", Math.max(0, sbw) + "px");
  }

  function openDetail(id, options) {
    var opts = options || {};
    var item = data.items.find(function (entry) { return entry.id === id; });
    if (!item) return;

    lastFocus = document.activeElement;

    drawerInner.innerHTML =
      '<div class="detail-hero">' + mediaTemplate(item, SIZES_DRAWER, "detail-media") + "</div>" +
      '<div class="detail-body">' +
        '<p class="eyebrow">' + escapeHtml(item.group) + " · " + escapeHtml(item.meta) + "</p>" +
        "<h2>" + highlight(item.title, search) + "</h2>" +
        "<p><b>简介：</b>" + highlight(item.summary, search) + "</p>" +
        "<p><b>故事：</b>" + highlight(item.story, search) + "</p>" +
        "<p><b>感受：</b>" + highlight(item.feeling, search) + "</p>" +
        "<p><b>记录建议：</b>" + highlight(item.tip, search) + "</p>" +
        '<p class="mark-title">我的记录</p>' +
        markButtons(item) +
      "</div>";

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.classList.add("is-open");
    lockScroll();
    document.body.classList.add("drawer-open");
    currentId = id;
    paintCurrent(id);

    if (opts.focus !== false) {
      var closeButton = drawer.querySelector(".detail-close");
      if (closeButton) closeButton.focus({ preventScroll: true });
    }
    if (opts.updateHash !== false) {
      history.replaceState(null, "", "#item=" + encodeURIComponent(id));
    }
  }

  function closeDetail(options) {
    var opts = options || {};
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    document.documentElement.style.removeProperty("--sbw");
    currentId = null;
    paintCurrent(null);
    if (opts.clearHash !== false) history.replaceState(null, "", location.pathname);
    if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  function toggleMark(id, value) {
    if (!id) return;
    if (marks[id] === value) delete marks[id];
    else marks[id] = value;
    write(MARK_KEY, JSON.stringify(marks));
    if (activeMark !== "all") render();
    else syncMarks();
  }

  /* ------------------------------------------------------------
     工具栏
     ------------------------------------------------------------ */
  tools.innerHTML =
    '<div class="tools-card">' +
      '<label class="search-box">' +
        "<span>搜索" + escapeHtml(data.label) + "</span>" +
        '<input type="search" placeholder="输入名字、国家、类型或关键词">' +
      "</label>" +
      '<div class="filter-row" aria-label="' + escapeHtml(data.filterLabel) + '筛选">' +
        groups.map(function (group) {
          return '<button type="button" data-group="' + escapeHtml(group) + '">' +
            escapeHtml(group) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="tools-foot">' +
        '<div class="filter-row filter-row--marks" aria-label="按记录筛选">' +
          '<span class="filter-label">记录</span>' +
          '<button type="button" data-mark-filter="all">全部</button>' +
          '<button type="button" data-mark-filter="0">' + escapeHtml(MARKS[0]) + "</button>" +
          '<button type="button" data-mark-filter="1">' + escapeHtml(MARKS[1]) + "</button>" +
          '<button type="button" data-mark-filter="none">未记录</button>' +
        "</div>" +
        '<div class="view-switch" role="group" aria-label="切换视图">' +
          '<button type="button" data-view="grid">卡片</button>' +
          '<button type="button" data-view="list">列表</button>' +
        "</div>" +
      "</div>" +
    "</div>";

  var input = tools.querySelector("input");
  var groupButtons = Array.from(tools.querySelectorAll("[data-group]"));
  var markFilterButtons = Array.from(tools.querySelectorAll("[data-mark-filter]"));
  var viewButtons = Array.from(tools.querySelectorAll("[data-view]"));

  /* 抽屉与遮罩挂在 body 上，不随列表重绘被重建 */
  var backdrop = document.createElement("div");
  backdrop.className = "detail-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  document.body.appendChild(backdrop);

  var drawer = document.createElement("aside");
  drawer.className = "detail-panel";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", data.label + "详情");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML =
    '<button class="detail-close" type="button" aria-label="关闭详情">×</button>' +
    '<div class="detail-inner"></div>';
  var drawerInner = drawer.querySelector(".detail-inner");
  document.body.appendChild(drawer);

  /* ------------------------------------------------------------
     事件
     ------------------------------------------------------------ */
  input.addEventListener("input", function () {
    search = input.value.trim();
    render();
  });

  groupButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeGroup = button.dataset.group;
      render();
    });
  });

  markFilterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeMark = button.dataset.markFilter;
      render();
    });
  });

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      view = button.dataset.view === "list" ? "list" : "grid";
      write(VIEW_KEY, view);
      render();
    });
  });

  results.addEventListener("click", function (event) {
    var markButton = event.target.closest(".mark-btn");
    if (markButton && results.contains(markButton)) {
      toggleMark(markButton.dataset.markId, Number(markButton.dataset.mark));
      return;
    }
    var detailButton = event.target.closest(".detail-btn");
    if (detailButton) openDetail(detailButton.dataset.id);
  });

  drawer.addEventListener("click", function (event) {
    if (event.target.closest(".detail-close")) {
      closeDetail();
      return;
    }
    var markButton = event.target.closest(".mark-btn");
    if (markButton) toggleMark(markButton.dataset.markId, Number(markButton.dataset.mark));
  });

  backdrop.addEventListener("click", function () { closeDetail(); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) closeDetail();
  });

  render();
})();
