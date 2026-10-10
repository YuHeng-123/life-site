#!/usr/bin/env node
/* ============================================================
   花影食途 · 数据与资源自检
   ------------------------------------------------------------
   目的是防住「图忘了补 / 字段写漏 / id 撞车 / 引用了不存在的文件」
   这类只能靠肉眼发现的问题。

   检查项：
     1. catalog-data.js 能加载，且是 window.LIFE_SITE_DATA
     2. 每个条目必填字段齐全且非空
     3. id 在栏目内、以及全站范围内都不重复
     4. image 指向的文件真实存在
     5. 每张图的响应式派生图齐全（480/960/1440 的 webp + avif，以及 960 的 jpg 兜底）
     6. 每张图在 lqip.js 里有模糊占位
     7. 栏目页存在、body 上有对应的 data-catalog，且引用了 lqip.js
     8. 分享封面（assets/share/*-cover.jpg）齐全

   用法：node tools/validate-data.mjs
   全部通过退出码 0，有问题退出码 1。
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, basename } from "node:path";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const REQUIRED = ["id", "title", "group", "meta", "image", "summary", "story", "feeling", "tip"];
const CARD_WIDTHS = [480, 960, 1440];
const FORMATS = ["webp", "avif"];
const CATEGORIES = { movies: "电影", travel: "旅行", food: "美食", flowers: "百花" };

const errors = [];
const warnings = [];
let checked = 0;

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function rel(p) { return p.replace(ROOT + "\\", "").replace(ROOT + "/", ""); }

/* ---------- 1. 加载数据 ---------- */
function loadScript(relPath) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(ROOT, relPath), "utf8"), sandbox, { filename: relPath });
  return sandbox;
}

let data;
try {
  data = loadScript("catalog-data.js").window.LIFE_SITE_DATA;
  if (!data || typeof data !== "object") fail("catalog-data.js 没有导出 window.LIFE_SITE_DATA");
} catch (err) {
  fail(`catalog-data.js 加载失败：${err.message}`);
}

let lqip = {};
try {
  lqip = loadScript("assets/derived/lqip.js").window.LIFE_SITE_LQIP || {};
} catch (err) {
  fail(`assets/derived/lqip.js 加载失败：${err.message}`);
}

if (data) {
  /* ---------- 2~6. 逐条检查 ---------- */
  const seenIds = new Map();

  for (const [cat, group] of Object.entries(data)) {
    if (!CATEGORIES[cat]) warn(`出现未登记的栏目「${cat}」（页面/页头图映射里没有它）`);
    if (!Array.isArray(group.items) || !group.items.length) {
      fail(`栏目 ${cat} 没有 items`);
      continue;
    }
    if (!group.label) fail(`栏目 ${cat} 缺 label`);

    const localIds = new Set();
    for (const item of group.items) {
      checked += 1;
      const where = `${cat}/${item.id || "(无 id)"}`;

      for (const field of REQUIRED) {
        const value = item[field];
        if (value === undefined || value === null || String(value).trim() === "") {
          fail(`${where} 缺必填字段 ${field}`);
        }
      }
      if (!item.id) continue;

      if (localIds.has(item.id)) fail(`${where} 在 ${cat} 内 id 重复`);
      localIds.add(item.id);
      if (seenIds.has(item.id)) fail(`${where} 与 ${seenIds.get(item.id)} 的 id 全局重复`);
      else seenIds.set(item.id, cat);

      /* 图片文件 */
      if (item.image) {
        const full = join(ROOT, item.image);
        if (!existsSync(full)) {
          fail(`${where} 引用的图片不存在：${item.image}`);
          continue;
        }
        if (!item.image.endsWith(".jpg")) {
          warn(`${where} 的 image 不是 .jpg：${item.image}`);
        }

        /* 派生图 */
        const stem = basename(item.image).replace(/\.[^.]+$/, "");
        for (const width of CARD_WIDTHS) {
          for (const ext of FORMATS) {
            const f = join(ROOT, "assets", "derived", `${stem}-${width}.${ext}`);
            if (!existsSync(f)) fail(`${where} 缺派生图 ${rel(f)}`);
          }
        }
        const fallback = join(ROOT, "assets", "derived", `${stem}-960.jpg`);
        if (!existsSync(fallback)) fail(`${where} 缺兜底图 ${rel(fallback)}`);

        /* 模糊占位 */
        if (!lqip[stem]) fail(`${where} 在 lqip.js 里没有占位（stem=${stem}）`);
      }
    }

    /* ---------- 7. 栏目页 ---------- */
    const page = `${cat}.html`;
    if (!existsSync(join(ROOT, page))) {
      fail(`缺栏目页 ${page}`);
    } else {
      const html = readFileSync(join(ROOT, page), "utf8");
      if (!html.includes(`data-catalog="${cat}"`)) fail(`${page} 的 body 上没有 data-catalog="${cat}"`);
      if (!html.includes("assets/derived/lqip.js")) fail(`${page} 没有引入 assets/derived/lqip.js`);
      if (!html.includes("catalog-page.js")) fail(`${page} 没有引入 catalog-page.js`);

      /* ---------- 8. 分享封面 ---------- */
      const cover = join(ROOT, "assets", "share", `hero-${cat}-cover.jpg`);
      if (!existsSync(cover)) fail(`${page} 的分享封面缺失：${rel(cover)}`);
    }
  }

  if (data.movies && lqip && Object.keys(lqip).length) {
    const orphan = Object.keys(lqip).filter((k) => ![...Object.values(data)]
      .some((g) => g.items.some((i) => basename(i.image || "").replace(/\.[^.]+$/, "") === k)));
    if (orphan.length) warn(`lqip.js 里有 ${orphan.length} 个用不上的条目：${orphan.slice(0, 5).join(", ")}…`);
  }

  /* 首页/设置页共用薰衣草封面 */
  for (const page of ["index.html", "settings.html"]) {
    const html = readFileSync(join(ROOT, page), "utf8");
    if (!html.includes('property="og:image"')) fail(`${page} 缺 og:image`);
    if (!html.includes("assets/share/hero-lavender-cover.jpg")) warn(`${page} 的 og:image 不是薰衣草封面`);
  }
}

/* ---------- 输出 ---------- */
console.log(`花影食途 · 数据自检`);
console.log(`  检查条目：${checked} 条`);
console.log(`  模糊占位：${Object.keys(lqip).length} 张`);
if (warnings.length) {
  console.log(`\n提醒 ${warnings.length} 条：`);
  for (const w of warnings) console.log(`  · ${w}`);
}
if (errors.length) {
  console.log(`\n错误 ${errors.length} 条：`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\n结果：不通过`);
  process.exit(1);
}
console.log(`\n结果：全部通过 ✓`);
