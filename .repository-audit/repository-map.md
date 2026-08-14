# 仓库地图（Repository Map）

> 更新于 2026-08-14，审计基线为 `main@fe942d2`，内容反映本轮整改后的工作树。

## 基本信息

- 项目：`bluearchive-cafe-frontend`（BlueArchive.Cafe 官网前端）
- 类型：无后端的 Vue 单页站点，兼顾 GitHub Pages / ESA 静态部署
- 语言：TypeScript（strict）、启用 `checkJs` 的 JavaScript ESM、Vue SFC、SCSS/CSS、Markdown
- 框架：Vue 3.5、Vue Router 5、Vuetify 4、Vite 8（Rolldown）
- 运行时：Node.js `>=24.11.0 <25`
- 质量工具：Vitest 4、jsdom、ESLint 10、`vue-tsc`
- 整改后规模：168 个版本化文件；`src/` 71 个、`scripts/` 18 个、`tests/` 8 个、`docs/` 22 个、`public/` 28 个
- 源码规模：`src/`、`scripts/`、`tests/` 共 89 个 TS/Vue/MJS/SCSS/CSS 文件，约 8,047 行

## 运行时架构

```text
src/main.ts
  ├─ Vuetify 主题、图标与全局样式
  ├─ src/router.ts
  │    ├─ src/shared/site-routes.mjs  静态路由清单
  │    ├─ src/utils/seo.ts            客户端 SEO 写入
  │    └─ src/pages/*                 懒加载路由页面
  └─ src/App.vue
       ├─ src/components/*            共享 UI
       └─ RouterView

src/pages/*
  ├─ src/content/*                    站点内容、下载与平台元数据
  └─ src/utils/*                      状态请求、分析、SEO、CSS token 等浏览器逻辑
```

路由页面均懒加载。`src/shared/site-routes.mjs` 是路由路径、导航标签和静态 SEO 的单一数据源；`src/shared/seo.mjs` 在浏览器端与构建脚本间共享纯 SEO/JSON-LD 派生逻辑。共享与脚本 `.mjs` 实现由 JSDoc + TypeScript `checkJs` 直接检查，不再依靠手写 `.d.mts` 镜像契约。

## 内容与构建数据流

```text
src/content/news/**/*.md
  -> scripts/news-content.mjs
     -> scripts/news-markdown.mjs
     -> scripts/news-sanitize.mjs 白名单清理
     -> src/content/news.generated.ts（gitignored）
        -> 新闻页面与静态路由生成

src/content/hero-images.json + public/assets/img/hero/*
  -> Git LFS                         保存 11 张 master
  -> scripts/optimize-hero-images.mjs
     -> 清单内 8 张生成 960/1440/1920 WebP（gitignored）
        -> Vite dist
           -> scripts/prune-dist-hero-originals.mjs 删除生产 master

Vite dist/index.html + 共享路由/SEO
  -> scripts/create-pages-fallback.mjs
     -> 9 个路由 HTML + 404.html
  -> scripts/generate-sitemap.mjs
     -> sitemap.xml
```

## 测试与自动化

- 33 个 Vitest 文件、146 项测试
- `src/**/*.test.ts`：20 个，覆盖工具、路由、SEO 与组件行为
- `scripts/*.test.mjs`：5 个，覆盖新闻渲染/生成、静态 HTML 与 sitemap
- `tests/*.test.ts`：8 个，覆盖跨模块行为及设计契约
- AppHeader、FloatingScrollHint 与 NewsPage 已使用 jsdom 挂载测试真实交互
- PR CI：LFS checkout、依赖审计、lint、测试、类型检查、构建
- Pages build：LFS checkout、依赖审计、lint、测试、生产构建、上传与部署
- Dependabot：npm 依赖每周检查

## 生成物与忽略项

- `dist/`
- `src/content/news.generated.ts`
- `public/assets/img/hero/optimized/`
- `node_modules/`
- `.worktrees/`、`.agents/`、`.claude/`

## 仓库约定

- 两空格、TypeScript 单引号、无分号
- Vue SFC 顺序：`template` → `script setup` → `style scoped`
- Conventional Commits，可使用中文描述
- 提交前要求：`npm run audit`、`npm run lint`、`npm test`、`npm run build`
