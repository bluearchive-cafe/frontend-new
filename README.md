# BlueArchive.Cafe 官网

蔚蓝咖啡厅（BlueArchive.Cafe）官网前端，提供汉化服务介绍、安装教程、公告资讯、客户端下载入口与资源同步状态查询。使用 Vue 3、TypeScript、Vuetify 4 与 Vite 构建，部署于 GitHub Pages / ESA。

## 页面

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：站点介绍、置顶公告与最新新闻 |
| `/news` | 新闻列表；`/news/:slug` 为 Markdown 文章页 |
| `/download` | 各平台客户端下载入口与下载源说明 |
| `/status` | 汉化资源、客户端与资源包的同步状态 |
| `/about` | 项目介绍、维护团队与友情链接 |

## 环境

- Node.js 24（最低 24.11.0，见 `.nvmrc`）
- npm 与 `package-lock.json`

安装锁定依赖：

```powershell
npm ci
```

## 常用命令

```powershell
npm run dev            # 启动开发服务器（127.0.0.1），包含草稿新闻
npm test               # 运行全部测试（Vitest）
npm run lint           # ESLint 检查
npm run typecheck      # Vue / TypeScript 严格类型检查
npm run build          # 生产构建到 dist/，排除草稿，生成回退页面与 sitemap
npm run preview        # 本地预览生产构建
npm run audit          # 依赖安全审计
```

提交前运行：

```powershell
npm run audit
npm run lint
npm test
npm run build
```

`npm run dev` 会先生成开发新闻模块并包含草稿；`npm run build` 重新生成生产新闻模块，在 Vite 读取内容前排除草稿及其本地资源，并为静态路由生成独立 HTML 元数据。

## 测试

测试框架是 Vitest，按被测代码的位置就近存放：

- `src/` 下与模块同目录的 `*.test.ts`（如 `src/utils/status.test.ts`）—— 单元测试
- `tests/` 下的 `*.test.ts` —— 跨模块或面向源码的整体性测试（如 `tests/home-surface.test.ts` 直接读取 Vue 源码与全局样式断言结构）
- `scripts/` 下的 `*.test.mjs` —— 构建与内容生成脚本的测试

运行全部测试：

```powershell
npm test
```

运行单个文件（Vitest 会把路径当作过滤器）：

```powershell
npx vitest run tests/home-surface.test.ts
```

需要 DOM 的测试在文件顶部声明 `// @vitest-environment jsdom`；需要网络或定时器的场景用 `vi.mock`、`vi.hoisted` 与 `vi.fn` 打桩，组件挂载类测试在 `afterEach` 中统一卸载并清理 DOM。

## 代码检查

ESLint 使用 `eslint.config.js`（flat config）检查 `src/`、`tests/`、`scripts/` 与 `vite.config.ts`，其中 `src/` 走 TypeScript 类型感知检查：

```powershell
npm run lint
npm run lint:fix
```

`npm run lint:fix` 会自动修复可修复问题；模板排版类 vue 规则保持关闭，避免 `--fix` 重排手写模板，`v-html` 等有意的用法在代码中以行内注释注明原因。

## 新闻内容

新闻 Markdown 放在 `src/content/news/`。文件名或包含 `index.md` 的目录路径会成为文章 slug。

Frontmatter 使用以下精确字段：

```yaml
---
title: 标题
author: 作者
publishedAt: 2026-01-02 03:04
category: 分类
summary: 摘要
pinned: false
draft: true
---
```

- `publishedAt` 必须存在且能解析为日期时间。
- `draft: true` 只在开发模式展示，不进入生产 JavaScript、HTML 或资源产物。
- Markdown 中的相对图片必须位于 `src/content/news/` 内；缺失文件或越出目录会让生成失败。
- 原始 HTML 会在构建期按允许列表清理，脚本、事件属性、非法 URL 和不支持的样式不会进入页面。
- `src/content/news.generated.ts` 是忽略的生成文件，不手动编辑。

## 目录结构

```
src/
  main.ts             # 入口：重定向 www、Vuetify 主题与图标、彩蛋音效
  router.ts           # 路由表（静态路由来自 shared/site-routes.mjs）
  App.vue
  pages/              # 路由级页面组件
  components/         # 可复用 UI 组件
  utils/              # 状态查询、SEO、分析、彩蛋、控制台品牌
  content/            # 新闻 Markdown 与生成产物、下载/平台/站点内容配置
  shared/site-routes.mjs   # 静态路由 / SEO / sitemap 共享配置
  shared/seo.mjs           # 路由 SEO 元数据与 JSON-LD 派生(浏览器端与构建脚本共用)
  styles/             # Vuetify 主题与全局样式
public/               # 静态资源：hero 图、彩蛋贴图与音频、favicon
scripts/              # 构建与内容生成脚本（含各自的测试）
.github/workflows/    # CI 与 GitHub Pages 部署
```

## 路由与部署

静态路由、SEO、sitemap 和 GitHub Pages 回退页面共享 `src/shared/site-routes.mjs`，路由级 SEO 元数据与 JSON-LD 的派生逻辑统一在 `src/shared/seo.mjs`（浏览器端 `src/utils/seo.ts` 与构建脚本 `scripts/static-html.mjs` 共用）。新增静态页面时：在 `src/shared/site-routes.mjs` 的 `staticRoutes` 中添加条目（含导航标签 `label`），并在 `src/router.ts` 的 `routeComponents` 注册页面组件——顶部导航与页脚链接会自动派生；测试会检查共享路由是否注册到 Vue Router。

推送到 `main` 或 `master` 后，GitHub Actions 会测试并部署 `dist/`。Pull Request 会独立执行依赖审计、测试、类型检查和 GitHub Pages 模式构建。

提交信息遵循 Conventional Commits，例如：

```text
feat: 添加新闻内容
fix(seo): 修复文章规范链接
chore(deps): 更新前端依赖
```

## 许可

[MIT](LICENSE)。
