/* ============================================================
   花影食途 · 交互增强 enhance.js
   ------------------------------------------------------------
   原则：
   - 渐进增强：脚本不加载时页面依然完整可用，不靠 JS 才有内容
   - 只改 transform / opacity 与 CSS 变量，不触发重排
   - 原生 API，零依赖
   - 系统开启"减少动态效果"或设备无精确指针时自动降级
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var desktop = window.matchMedia("(min-width: 721px)");
  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* 把高频事件压进一帧里执行 */
  function onFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  }

  /* ----------------------------------------------------------
     1. 顶部滚动进度条
     ---------------------------------------------------------- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  function paintProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.setProperty("--scroll-p", ratio.toFixed(4));
  }

  /* ----------------------------------------------------------
     2 & 3. 滚动：导航状态、Hero 视差
     ---------------------------------------------------------- */
  var topbar = document.querySelector(".topbar");
  var hero = document.querySelector(".hero");
  var heroStage = hero || document.querySelector(".simple-header");
  var barHeight = 84;
  var lastY = window.scrollY;

  function measure() {
    if (topbar) barHeight = topbar.offsetHeight || 84;
  }

  function paintScroll() {
    var y = window.scrollY;

    if (topbar && desktop.matches) {
      var stuck = y > barHeight;
      topbar.classList.toggle("is-stuck", stuck);
      /* 只在下滑且已经离开首屏时才让路，避免小幅晃动就藏起来 */
      if (stuck && y > barHeight + 160) {
        topbar.classList.toggle("is-hidden", y > lastY + 3);
      } else {
        topbar.classList.remove("is-hidden");
      }
    }

    /* Hero 视差：最多下移 0.10 倍。幅度必须小于图片层预留的余量，
       否则上边缘会露出空白 */
    if (heroStage && !reduce.matches) {
      var shift = Math.min(y, window.innerHeight) * 0.1;
      heroStage.style.setProperty("--hero-y", shift.toFixed(1) + "px");
    }

    lastY = y;
  }

  var handleScroll = onFrame(function () {
    paintProgress();
    paintScroll();
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener(
    "resize",
    onFrame(function () {
      measure();
      paintProgress();
    }),
    { passive: true }
  );

  /* ----------------------------------------------------------
     4. Hero 暖色光斑跟随鼠标
     ---------------------------------------------------------- */
  if (hero && finePointer.matches && !reduce.matches) {
    var glow = document.createElement("div");
    glow.className = "hero-glow";
    glow.setAttribute("aria-hidden", "true");
    hero.insertBefore(glow, hero.firstChild);

    hero.addEventListener(
      "pointermove",
      onFrame(function (event) {
        var rect = hero.getBoundingClientRect();
        var mx = ((event.clientX - rect.left) / rect.width) * 100;
        var my = ((event.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--mx", mx.toFixed(2) + "%");
        hero.style.setProperty("--my", my.toFixed(2) + "%");
        hero.classList.add("is-live");
      }),
      { passive: true }
    );

    hero.addEventListener("pointerleave", function () {
      hero.classList.remove("is-live");
    });
  }

  /* ----------------------------------------------------------
     5. 进场：元素首次进入视口时上浮淡入
     用 Web Animations + fill: "backwards"，
     动画结束后自动回到 CSS 状态，不会和悬停 transform 打架
     ---------------------------------------------------------- */
  var REVEAL_SELECTOR = [
    ".quick-panel a",
    ".intro-grid article",
    ".feature-links a",
    ".deploy-grid article"
    /* 注意：.tools-card（搜索筛选条）故意不在这里。
       它是首屏第一眼就要用的工具，不是"滚到才出现的内容"，
       卷进进场动画会让它先以 opacity:0 停留一会儿，看起来像没加载出来。 */
  ].join(",");

  var revealObserver = null;

  if (!reduce.matches && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          observer.unobserve(el);

          /* 同一行里按顺序错开，视线跟得上 */
          var siblings = el.parentNode ? el.parentNode.children : [];
          var order = Array.prototype.indexOf.call(siblings, el);
          var delay = (order > -1 ? order % 4 : 0) * 70;

          el.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "none" }
            ],
            { duration: 720, delay: delay, easing: EASE, fill: "backwards" }
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
  }

  function observeReveal(scope) {
    if (!revealObserver) return;
    (scope || document).querySelectorAll(REVEAL_SELECTOR).forEach(function (el) {
      if (el.dataset.revealed === "1") return;
      el.dataset.revealed = "1";
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     6. 卡片：跟随鼠标的轻微倾斜 + 落点高光
     倾斜上限 5 度、抬高 6px —— 再多就开始晕了
     ---------------------------------------------------------- */
  var TILT_SELECTOR = [
    ".quick-panel a",
    ".feature-links a",
    ".intro-grid article",
    ".movie-card",
    ".catalog-card",
    ".image-card"
  ].join(",");

  var MAX_TILT = 5;
  var LIFT = 6;

  function bindTilt(el) {
    if (el.dataset.tilt === "1") return;
    el.dataset.tilt = "1";
    el.classList.add("tilt-card");

    var frame = null;

    el.addEventListener(
      "pointermove",
      function (event) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          var rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          var px = (event.clientX - rect.left) / rect.width;
          var py = (event.clientY - rect.top) / rect.height;
          var ry = (px - 0.5) * 2 * MAX_TILT;
          var rx = (0.5 - py) * 2 * MAX_TILT;

          el.style.transform =
            "perspective(900px) rotateX(" +
            rx.toFixed(2) +
            "deg) rotateY(" +
            ry.toFixed(2) +
            "deg) translateY(-" +
            LIFT +
            "px)";
          el.style.setProperty("--gx", (px * 100).toFixed(2) + "%");
          el.style.setProperty("--gy", (py * 100).toFixed(2) + "%");
          el.classList.add("is-hover");
        });
      },
      { passive: true }
    );

    el.addEventListener("pointerleave", function () {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      el.style.transform = "";
      el.classList.remove("is-hover");
    });
  }

  function bindTiltAll(scope) {
    (scope || document).querySelectorAll(TILT_SELECTOR).forEach(bindTilt);
  }

  /* ----------------------------------------------------------
     7. 统一刷新：栏目页内容是 JS 动态渲染的，这里跟上
     ---------------------------------------------------------- */
  function refresh(scope) {
    observeReveal(scope);
    if (finePointer.matches && !reduce.matches) bindTiltAll(scope);
  }

  var results = document.querySelector(".catalog-results");
  if (results && "MutationObserver" in window) {
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        refresh(results);
      });
    }).observe(results, { childList: true, subtree: true });
  }

  /* ----------------------------------------------------------
     8. 初始化
     ---------------------------------------------------------- */
  measure();
  refresh(document);
  paintProgress();
  paintScroll();
})();
