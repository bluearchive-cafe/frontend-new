# frontend-new

BlueArchive.Cafe 官网，使用 Vue 3、TypeScript、Vuetify 和 Vite 构建。

## 环境

- Node.js 24，最低版本为 24.11.0
- npm 与 `package-lock.json`

安装锁定依赖：

```powershell
npm ci
```

## 开发与验证

```powershell
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run dev` 会生成开发新闻模块并包含草稿。`npm run build` 会重新生成生产新闻模块，在 Vite 读取内容前排除草稿及其本地资源，并为静态路由生成独立 HTML 元数据。

提交前运行：

```powershell
npm run audit
npm test
npm run build
```

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

## 路由与部署

静态路由、SEO、sitemap 和 GitHub Pages 回退页面共享 `src/shared/site-routes.mjs`。新增静态页面时同时添加页面组件映射，测试会检查共享路由是否注册到 Vue Router。

推送到 `main` 或 `master` 后，GitHub Actions 会测试并部署 `dist/`。Pull Request 会独立执行依赖审计、测试、类型检查和 GitHub Pages 模式构建。

提交信息遵循 Conventional Commits，例如：

```text
feat: 添加新闻内容
fix(seo): 修复文章规范链接
chore(deps): 更新前端依赖
```
