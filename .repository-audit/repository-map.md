# 仓库地图（Repository Map）

> 更新于 2026-09-13，审计基线为 `main@ce59c46`（full audit）。

## 基本信息

- 项目：`bluearchive-cafe-frontend`（BlueArchive.Cafe 官网前端）
- 类型：无后端的 Vue 静态单页站点（信息展示 + 客户端下载入口 + 资源同步状态），兼顾 GitHub Pages / ESA 静态部署
- 语言：TypeScript（strict、noUnused*）、启用 `checkJs` 的 JavaScript ESM、Vue SFC、SCSS/CSS、Markdown
- 框架：Vue 3.5、Vue Router 5、Vuetify 4（按 MD2 规格收敛）、Vite 8（Rolldown）
- 运行时：Node.js `>=24.11.0 <25`
- 质量工具：Vitest 4、jsdom、ESLint 10（flat config，`src/` 类型感知）、`vue-tsc`
- 依赖：8 个 dependencies、21 个 devDependencies（另见 `CODEBASE_AUDIT.md` 依赖章节）

## 运行时架构

```text
src/main.ts                              组合根：www→apex 重定向、Vuetify 主题/图标/defaults
  ├─ Vuetify 主题、图标与全局样式
  ├─ src/router.ts
  │    ├─ src/shared/site-routes.mjs     静态路由清单（path/SEO/导航标签单一数据源）
  │    ├─ src/utils/seo.ts               客户端 SEO 写入（复用 shared/seo.mjs）
  │    └─ src/pages/*                    懒加载路由页面
  └─ src/App.vue
       ├─ src/components/*               共享 UI
       └─ RouterView
```

路由页面均懒加载。`src/shared/site-routes.mjs` 是路由路径、导航标签和静态 SEO 的单一数据源；`src/shared/seo.mjs` 的 `applySeoToDocument` 在浏览器端与构建脚本（JSDOM 回退页）间共享同一实现。共享与脚本 `.mjs` 实现由 JSDoc + TypeScript `checkJs` 直接检查。无运行时服务定位器或隐藏全局依赖（彩蛋音效的模块级单例与全局 pointerup 委托是有意设计）。

## 内容与构建数据流

```text
src/content/news/**/*.md
  -> scripts/news-content.mjs
     -> scripts/news-markdown.mjs        alert 块/任务列表/外链加固/资产占位
     -> scripts/news-sanitize.mjs        白名单清理（唯一出口）
     -> src/content/news.generated.ts    （gitignored）
        -> 新闻页面与静态路由生成

src/content/hero-images.json + public/assets/img/hero/*（LFS）
  -> scripts/optimize-hero-images.mjs
     -> 960/1440/1920 WebP（gitignored）
        -> Vite dist
           -> scripts/prune-dist-hero-originals.mjs 删除生产 master

Vite dist/index.html + 共享路由/SEO
  -> scripts/create-pages-fallback.mjs
     -> 10 个路由 HTML + 404.html
  -> scripts/generate-sitemap.mjs
     -> sitemap.xml（10 URLs）
```

## 测试与自动化

- 36 个 Vitest 文件、170 项测试（本机全绿）
- `src/**/*.test.ts`：工具、路由、SEO 与组件行为（含 jsdom 挂载测试）
- `scripts/*.test.mjs`：新闻渲染/生成、静态 HTML、sitemap、共享路由
- `tests/*.test.ts`：跨模块行为与设计契约（如 `home-surface` 断言样式 token 收敛）
- 网络依赖经 fetch 注入 seam 打桩（`useClientStatus({ fetchImplementation })`），无真实外网/定时器依赖
- PR CI：LFS checkout、依赖审计、lint、测试、类型检查、构建
- Pages build：同门禁 + 生产构建、上传与部署（deploy job 最小权限 `pages: write`/`id-token: write`）
- Dependabot：npm 依赖每周检查（另见审计报告的防护建议）

## 生成物与忽略项

- `dist/`、`*.tsbuildinfo`
- `src/content/news.generated.ts`、`src/content/news-entries.generated.json`
- `public/assets/img/hero/optimized/`
- `node_modules/`、`.worktrees/`、`.agents/`、`.claude/`、`CLAUDE.md`

## 仓库约定

- 两空格、TypeScript 单引号、无分号
- Vue SFC 顺序：`template` → `script setup` → `style scoped`
- 新闻图片必须位于 `src/content/news/` 内；draft 只进开发模式
- 新增静态路由：`site-routes.mjs` 加条目 + `router.ts` routeComponents 注册（有测试守卫）
- Conventional Commits，可使用中文描述
- 提交前要求：`npm run audit`、`npm run lint`、`npm test`、`npm run build`

## 风险画像（Risk Profile）

- 项目类型：静态信息站点；无后端、无用户数据持久化、无特权操作
- 信任边界：
  1. 状态 API `https://api.bluearchive.cafe/status/list`（运行时 fetch；形状校验后仅文本渲染）
  2. 构建期新闻 Markdown/HTML（维护者受控；白名单清洗后进产物）
  3. jsdelivr 字体 CDN（精确版本 URL，不可变缓存）
  4. gtag / GA4（公开 ID）
- 关键工作流：内容生成 → 清洗 → 构建 → 回退页 → sitemap → 部署 的发布链
- 高代价故障：发布通道中断；SEO/分享元数据损坏；下载入口指向错误来源
- 领域权重：dependencies/CI = critical（发布链单点）；security = medium（攻击面小）；architecture/maintainability/testing/performance = medium

## 前次审计状态

- 上次 full audit：`main@fe942d2`（2026-08-14；报告已归档至 `history/CODEBASE_AUDIT_2026-08-14.md`）
- 本次：2026-09-13 full audit @ `ce59c46`；按维护者要求未与旧报告对账，旧报告仅作背景
