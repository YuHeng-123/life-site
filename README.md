# 🌿 花影食途 // Life-Site · 世界生活灵感志

<div align="center">

![Static Site](https://img.shields.io/badge/Architecture-Vanilla%20ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/Styling-Custom%20CSS%20Design%20System-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Design Style](https://img.shields.io/badge/Aesthetics-Kinfolk%20Editorial-8A5A36?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%7C%20Vercel-success?style=for-the-badge&logo=githubpages&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**慢生活与世界灵感杂志 · 高美学全端适配极简生活门户与个人仪表盘**

[在线预览 Demo (GitHub Pages)](https://yuheng-123.github.io/life-site/) • [核心设计矩阵](#-核心设计与功能矩阵) • [技术亮点](#-技术亮点与工程架构) • [本地运行与部署](#-本地运行与云端部署)

</div>

---

## 📖 项目愿景 (Design Philosophy)

**花影食途 (Life-Site)** 是一套践行**《Kinfolk》与《暮しの手帖》现代主义慢生活编辑美学**的沉浸式生活志 Web 应用。

它摆脱了传统长页面的拥挤与冰冷，将**电影、旅行、美食与百花**四个生活切片拆解为独立优雅的杂志馆藏。全站遵循**渐进增强（Progressive Enhancement）**原则，坚持**纯原生前端标准（Zero-Dependency Vanilla Web）**，不依赖任何第三方重量级框架，以毫秒级极速响应与丝滑微交互诠释高水准的前端美学与工程把控力。

---

## ✨ 核心设计与功能矩阵 (Key Features)

### 1. 🔍 全局即时联想搜索 (Command Palette // `Cmd+K` / `Ctrl+K`)
- **键盘级极客操控**：支持快捷键 `Ctrl+K`（Mac `⌘K`）或点击导航栏快速唤起毛玻璃全息搜索浮窗。
- **跨栏目秒级联想**：深度遍历四大馆藏共计 60+ 处生活灵感，匹配标题、标签、台词、风味与故事，支持关键词红字高亮与上下箭头回车直达。

### 2. 🌿 情绪灵感配方生成器 (Mood Recipe / AI 生活解药)
- 输入当前心绪（如“放空治愈”、“渴望远行”、“温暖解压”），算法即时配比出一套专属生活解药：**[一部治愈电影 + 一个避世秘境 + 一道暖汤 + 一朵花]**。
- 将慢生活美学与情感共鸣完美串联，形成独特的生活情绪处方。

### 3. 🖼️ 拍立得生活明信片一键生成与下载 (Canvas Card Export)
- 任何生活金句、旅行风景或每日灵感，纯前端 HTML5 Canvas 实时离线渲染为 **Kinfolk 杂志质感的高清拍立得明信片**。
- 自动生成日期水印与优雅纸墨边框，支持一键下载至手机与本地相册，极具社交分享力。

### 4. ☕ 慢生活环境白噪音伴读播放器 (Synthesized Web Audio Ambience)
- 零外部音频文件加载，纯原生 Web Audio 实时物理震荡器与滤波器合成：
  - **🌧️ 窗外淅沥小雨 (Rain & Droplets)**
  - **🍃 深山晨风漫卷 (Mountain Breeze)**
  - **🔥 温暖壁炉柴火 (Fireplace Crackle)**
  - **🌙 静谧夏夜微鸣 (Summer Night Cicadas)**
- 左下角配备旋转黑胶微型唱机，伴随音乐沉浸式阅读生活志。

### 5. 🗺️ 环球足迹点位交互地图 (Interactive World Map Pins)
- 在旅行地图中集成交互式矢量世界地图，全球 16 大胜地配备脉冲呼吸信标，点击光点平滑漫游聚焦到目的地详情。

### 6. 🎲 每日灵感 · 随心偶遇 (Daily Serendipity Widget)
- 首页集成拍立得式质感灵感卡片，根据每日日期自动锚定“今日生活签”，并支持点击“🎲 换一份灵感”动态翻转抽取未知惊喜。
- 支持一键将偶遇的电影、旅行目的地或美食收入心愿手帐。

### 7. 🌙 玄青深夜纸感深色模式 (Zen Dark Mode)
- 告别生硬纯黑，定制**“玄青暗岩与暖炭金”**的深夜护眼纸墨质感（`#141210` 炭黑基底 + 柔和雅金 + 磨砂环境光）。
- 顶部导航一键平滑淡入切换，支持跨页面记住选择并智能遵循系统深色偏好。

### 8. 📖 我的灵感手帐 (Wishlist Drawer)
- 全站闭环的个人心愿单抽屉：实时聚合用户在各大栏目标记的“想看 / 想去 / 想吃 / 想拍”与“已打卡”生活足迹。
- 采用非侵入式 `localStorage` 离线持久化存储，顶部配备灵动计数徽章，支持分类筛选与一键溯源详情。

### 9. 🗂️ 四大独立生活灵感主题馆 (Curated Catalogs)
- **🎬 电影馆**：精选世界影史经典，涵盖台词共鸣、深刻哲思与观后灵感感悟。
- **✈️ 旅行地图**：全球自然胜景与人文秘境，收录当地风俗特色与慢旅行视角。
- **🍜 世界餐桌**：跨越亚欧非美的特色烟火风味，兼顾烹饪故事与味觉记忆。
- **🌸 百花图鉴**：高清植物摄影、花期节令与文化寓意。

### 10. ⚡ 电影级微动效与 FLIP 布局重排
- 独创 **FLIP（First-Last-Invert-Play）** 动效机制，卡片筛选与切换视图时平滑滑移，丝滑不掉帧。
- 鼠标视差微光辉斑、动态阅读滚动进度条与环形返顶指示球。

---

## 🛠️ 技术亮点与工程架构 (Architecture)

```
life-site/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 零配置一键自动部署流
├── assets/                     # 摄影高清画质资产与 SVG 图标
├── catalog-data.js             # 结构化核心生活馆藏数据中心
├── catalog-page.js             # 栏目页 FLIP 动效渲染引擎与详情抽屉
├── portal.js                   # 旗舰交互：搜索、手帐、暗黑模式、灵感卡片
├── enhance.js                  # 视差微光斑、视口进入动画与原生增强
├── styles.css                  # 核心设计系统（色彩变量、排版、卡片阴影）
├── motion.css                  # 物理级柔和动效与响应式布局
├── portal.css                  # 旗舰功能层样式（深色模式覆盖、命令面板）
├── index.html                  # 门户首页（生活精选与每日灵感）
├── movies.html                 # 电影馆
├── travel.html                 # 旅行地图
├── food.html                   # 世界餐桌
├── flowers.html                # 百花图鉴
└── settings.html               # 网站设置与维护状态说明
```

---

## 🚀 本地运行与云端部署 (Getting Started & Deploy)

### 本地预览 (Local Preview)
由于采用现代化静态 Web 架构，您无需复杂的 Node 构建编译流程：
```bash
# 方式 1：使用任意静态服务器（例如 VS Code Live Server 或 Python）
python -m http.server 8080

# 方式 2：使用 Node 内置 serve
npx serve .
```
在浏览器打开 `http://localhost:8080` 即可尽情体验。

### 云端一键部署 (One-Click Deploy)

#### 1. GitHub Pages (已内置自动工作流)
将代码推送到 GitHub `main` 分支后：
1. 进入仓库 **Settings -> Pages**
2. **Build and deployment -> Source** 选择 **GitHub Actions**
3. Actions 部署完成后即可通过 `https://<username>.github.io/<repo-name>/` 访问！

#### 2. Vercel 部署
直接在 [Vercel 官网](https://vercel.com) 导入本 GitHub 仓库，框架预设选择 `Other`，直接点击 Deploy 即可在 30 秒内完成全网 CDN 加速部署。

---

## 📄 开源许可 (License)

本项目遵循 [MIT License](LICENSE) 开源许可。
