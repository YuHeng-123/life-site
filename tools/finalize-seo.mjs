#!/usr/bin/env node
/* ============================================================
   花影食途 · 上线前的 SEO 补全
   ------------------------------------------------------------
   og:image / og:url / canonical 按规范必须是绝对地址，sitemap 也是。
   这些都得知道你自己的域名才能写对，所以这一步单独拿出来，
   拿到域名后跑一条命令即可：

     node tools/finalize-seo.mjs https://你的域名

   它会做三件事：
     1. 把 6 个页面里 og:image / twitter:image 的相对路径换成绝对地址
     2. 给每个页面补 <link rel="canonical"> 与 <meta property="og:url">
     3. 生成 sitemap.xml 与 robots.txt

   可以反复运行，已有 canonical / og:url 会就地更新，不会重复插入。
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const BACKUP = join(ROOT, "_backup-seo");

const PAGES = [
  { file: "index.html", priority: "1.0", freq: "weekly" },
  { file: "movies.html", priority: "0.9", freq: "monthly" },
  { file: "travel.html", priority: "0.9", freq: "monthly" },
  { file: "food.html", priority: "0.9", freq: "monthly" },
  { file: "flowers.html", priority: "0.9", freq: "monthly" },
  { file: "settings.html", priority: "0.3", freq: "yearly" }
];

const raw = process.argv[2];
if (!raw) {
  console.error("用法：node tools/finalize-seo.mjs https://你的域名");
  console.error("（需要真实域名才能写出正确的 sitemap 与 og:image；这里不猜。）");
  process.exit(1);
}

let base;
try {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("只支持 http/https");
  base = url.origin + url.pathname.replace(/\/+$/, "");
} catch (err) {
  console.error(`域名不合法：${raw}（${err.message}）`);
  process.exit(1);
}

mkdirSync(BACKUP, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
let touched = 0;

for (const page of PAGES) {
  const path = join(ROOT, page.file);
  if (!existsSync(path)) {
    console.warn(`跳过（不存在）：${page.file}`);
    continue;
  }
  const before = readFileSync(path, "utf8");
  let html = before;
  const pageUrl = `${base}/${page.file}`;

  /* og:image / twitter:image → 绝对地址 */
  html = html.replace(
    /(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")(?!https?:\/\/)([^"]+)(")/g,
    (_, head, src, tail) => head + `${base}/${src.replace(/^\.?\//, "")}` + tail
  );

  /* canonical + og:url：已存在就地更新，否则插到 </head> 前 */
  const canonical = `  <link rel="canonical" href="${pageUrl}">`;
  const ogUrl = `  <meta property="og:url" content="${pageUrl}">`;

  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(/<link\s+rel="canonical"[^>]*>/, canonical.trim());
  } else {
    html = html.replace("</head>", `${canonical}\n</head>`);
  }
  if (/<meta\s+property="og:url"/.test(html)) {
    html = html.replace(/<meta\s+property="og:url"[^>]*>/, ogUrl.trim());
  } else {
    html = html.replace("</head>", `${ogUrl}\n</head>`);
  }

  if (html !== before) {
    copyFileSync(path, join(BACKUP, page.file));
    writeFileSync(path, html, "utf8");
    touched += 1;
    console.log(`  更新 ${page.file}`);
  }
}

/* sitemap.xml */
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...PAGES.map((p) =>
    [
      "  <url>",
      `    <loc>${base}/${p.file}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${p.freq}</changefreq>`,
      `    <priority>${p.priority}</priority>`,
      "  </url>"
    ].join("\n")
  ),
  "</urlset>",
  ""
].join("\n");
writeFileSync(join(ROOT, "sitemap.xml"), sitemap, "utf8");
console.log("  写入 sitemap.xml");

/* robots.txt */
writeFileSync(
  join(ROOT, "robots.txt"),
  ["User-agent: *", "Allow: /", "", `Sitemap: ${base}/sitemap.xml`, ""].join("\n"),
  "utf8"
);
console.log("  写入 robots.txt");

console.log(`\n完成：${touched} 个页面已补全绝对地址，站点根地址 ${base}`);
console.log(`原文件备份在 ${BACKUP.replace(ROOT, ".")}/`);
