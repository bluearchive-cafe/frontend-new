# 仓库地图(Repository Map)

> 生成于仓库审计阶段 1:仓库发现。

## 基本信息

- 项目:`bluearchive-cafe-frontend`(BlueArchive.Cafe 官网前端)
- 语言:TypeScript(strict)、JavaScript(ESM 构建脚本)、SCSS、Vue SFC
- 框架:Vue 3.5 + Vuetify 4 + Vite 8(Rolldown)
- 路由:vue-router(静态路由 + 懒加载页面)
- 运行时:Node.js >= 24.11.0 < 25(见 package.json engines 与 .nvmrc)
- 部署:GitHub Pages(`/frontend-new/` base)与 ESA(`esa.jsonc`)
- 测试:Vitest 4 + jsdom
- 检查:ESLint 10(flat config,类型感知)+ vue-tsc

## 架构

单页站点,无后端。构建期用 `scripts/*.mjs` 从 `src/content/news/**`(Markdown + frontmatter)生成 `src/content/news.generated.ts`(gitignored),原始 HTML 经 sanitize-html 允许列表清理;`scripts/create-pages-fallback.mjs` 与 `scripts/generate-sitemap.mjs` 为静态路由生成回退页与 sitemap,静态路由/SEO 元数据与 `src/shared/site-routes.mjs` 共享。

```
src/
  main.ts              # 入口:www 重定向、Vuetify 主题与图标、彩蛋音效
  router.ts            # 路由表(来自 shared/site-routes.mjs)
  App.vue
  pages/               # 路由级页面组件(Home/News/NewsArticle/Download/Status/About/NotFound)
  components/          # 可复用 UI 组件(AppHeader、HeroSection、NewsSection、SiteFooter 等)
  utils/               # 浏览器逻辑:status、seo、analytics、easter-egg、console-brand、toolbar-loader
  content/             # 新闻 Markdown、生成产物、下载配置、hero 图清单
  shared/site-routes.mjs   # 静态路由 / SEO / sitemap 共享配置(含 .d.mts 类型)
  styles/              # Vuetify 主题与全局样式(settings.scss、fonts.scss、global.css)
scripts/               # 构建与内容生成脚本(各带 *.test.mjs)
tests/                 # 跨模块/源码结构测试
public/                # 静态资源:hero 图、彩蛋贴图与音频、favicon
.github/workflows/     # PR CI 与 GitHub Pages 部署
docs/superpowers/      # 设计文档与计划(MD2 兼容、Vuetify 4 视觉兼容等)
```

## 模块划分

- `src/pages/*` — 7 个路由页面
- `src/components/*` — 约 13 个可复用组件
- `src/utils/*` — 6 个浏览器侧工具模块
- `scripts/*` — 10 个构建/内容生成脚本(其中 4 个带测试)
- `tests/*` — 9 个跨模块测试
- 生成物(不入库):`dist/`、`src/content/news.generated.ts`、`public/assets/img/hero/optimized/`
- 忽略目录:`.worktrees/`(本地 worktree)、`.claude/`、`.agents/`(Agent 技能,不参与构建)

## 约定

- 提交:Conventional Commits(中文主题,如 `feat: 添加下载方式`)
- 代码风格:两空格缩进、单引号、无分号;PascalCase.vue、kebab-case 脚本、camelCase TS 符号
- 提交前必须通过:`npm run audit`、`npm run lint`、`npm test`、`npm run build`
