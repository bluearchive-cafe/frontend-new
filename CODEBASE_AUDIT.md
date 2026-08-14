# 仓库审计报告（整改后）

> 审计与整改日期：2026-08-14
>
> 审计基线：`main@fe942d2`
>
> 范围：架构、可维护性、安全、依赖、测试、CI、性能与技术债

## 结论摘要

本轮审计确认的 6 条高置信问题已完成代码层整改。A1、T1、T2、T3、P1 已关闭；TD1 按维护者要求保留全部 Hero 原图，并将当前版本的 11 张 master 迁移到 Git LFS。旧提交中的普通 Git 大对象未改写。

整改后仓库可在干净锁文件安装环境中通过依赖审计、lint、类型检查、146 项测试与生产构建。没有发现 critical/high 应用安全问题，`npm audit` 为 0 漏洞。

| 编号 | 原问题 | 状态 | 整改结果 |
| --- | --- | --- | --- |
| A1 | `.mjs` 实现未进入严格类型检查 | 已关闭 | 对共享与构建脚本启用 `allowJs`/`checkJs`，用 JSDoc 直接约束实现并删除重复声明文件 |
| T1 | GitHub Actions 未执行 lint | 已关闭 | PR CI 与 Pages build job 均加入 lint；部署工作流同时补齐依赖审计 |
| T2 | 自定义 Markdown 规则缺少直接测试 | 已关闭 | 新增 alert、任务列表、链接、图片与 query/hash 的表驱动行为测试 |
| T3 | 关键 UI 交互仅检查源码字符串 | 已关闭 | AppHeader、FloatingScrollHint、NewsPage 改为 jsdom 挂载交互测试，删除重复行为字符串断言 |
| P1 | 中文字体放大入口 CSS 与部署资产 | 已关闭 | 移除完整 Noto Sans SC 分片，中文回退到系统 CJK 字体栈 |
| TD1 | Hero 原图占用普通 Git 存储 | 当前版本已关闭 | 按维护者要求保留全部图片，11 张 master 改由 Git LFS 管理，CI checkout 同步启用 LFS |

## 整改明细

### A1：直接类型检查 JavaScript ESM 实现

- `tsconfig.json` 与 `tsconfig.node.json` 已启用 `allowJs`、`checkJs`。
- `src/shared/**/*.mjs` 与 `scripts/**/*.mjs` 已进入 `vue-tsc -b`；测试脚本单独排除，避免 Node 测试环境与生产模块类型边界混杂。
- 为新闻解析、静态 HTML、sitemap、路由和 SEO 等实现补齐 JSDoc 类型。
- 删除 `scripts/news-content.d.mts`、`scripts/news-entries.d.mts`、`src/shared/seo.d.mts`、`src/shared/site-routes.d.mts`，不再人工维护实现之外的重复契约。
- 启用检查时发现 `buildArticleSeo()` 的实现确实漏掉声明要求的 `robots` 字段；已补为 `index, follow`，并新增回归断言。这验证了原风险不是理论问题。

### T1：统一 CI 质量门禁

- `.github/workflows/ci.yml`：`npm run audit` 后执行 `npm run lint`。
- `.github/workflows/deploy-pages.yml`：安装后依次执行依赖审计与 lint，再运行测试和构建。
- CI 与直接发布分支不再允许 ESLint/类型感知规则回归绕过门禁。

### T2、T3：补真实行为测试

新增或替换的重点覆盖：

- 五类 Markdown alert、畸形 alert 回退、勾选/未勾选任务列表。
- 外链安全属性、站内链接保持、相对图片解析、资源 query/hash 拆分。
- AppHeader 抽屉打开后的焦点、Escape 关闭与焦点恢复、跨路由关闭、不回焦菜单按钮、全局监听清理。
- FloatingScrollHint 随滚动隐藏/恢复以及监听清理。
- NewsPage 分类点击后真实过滤文章、无分类时隐藏控件。

当前仍保留少量读取源码的测试，用于 CSS token、Material 布局和禁止样式等设计契约；关键交互不再依赖源码字符串证明。

### P1：缩减字体与构建产物

移除 `@fontsource-variable/noto-sans-sc`，保留 Noto Sans Latin 400/500/700，中文使用已有系统 CJK 回退栈。

| 指标 | 整改前 | 整改后 | 变化 |
| --- | ---: | ---: | ---: |
| `@font-face` | 100 | 3 | -97% |
| 字体文件 | 97 / 4.29 MB | 3 / 40.08 KB | 约 -99% 体积 |
| 入口 CSS | 310.70 kB / gzip 77.02 kB | 203.98 kB / gzip 31.16 kB | gzip -59.5% |
| `dist/` | 178 文件 / 8.85 MB | 84 文件 / 4.72 MB | 体积 -46.7% |

该变化需要在部署后的真实浏览器中继续观察中文字体观感；功能正确性与构建输出已验证。

### TD1：将 Hero 原图迁移到 Git LFS

按维护者要求保留全部 11 张 Hero 源图，共 46,014,488 bytes（约 43.88 MiB）。`.gitattributes` 分别匹配 Hero 目录下的 JPG、JPEG、PNG 与 WebP，当前版本中的 11 个文件已重新规范化为 LFS 指针。

`src/content/hero-images.json` 仍只选择其中 8 张参与响应式 WebP 生成；其余 3 张作为保留素材存在。生产构建会统一清除 `dist` 中的所有 Hero master，因此这些保留素材不会增加部署产物体积。

PR CI 与 Pages 部署的 `actions/checkout` 已设置 `lfs: true`，保证构建前下载真实图片内容。此次只迁移当前版本，没有执行 `git lfs migrate import` 或重写旧提交；历史中的普通 Git 大对象仍保留，避免影响现有贡献者。

## 安全与依赖复核

- 当前树与 Git 历史的高特征凭据扫描无命中。
- 新闻 `v-html` 输出仍经过 `sanitize-html` 标签、属性、class 与协议白名单。
- 静态 JSON-LD 会转义 `<`、`>`、`&`，避免结束 `script` 标签。
- GitHub Pages 写权限与 OIDC 权限只授予 deploy job。
- `npm ci` 安装 301 个 package；`npm audit --audit-level=moderate` 为 0 漏洞。
- 本机 npm 仍提示 `@parcel/watcher` 可选安装脚本未在 `allowScripts` 中批准，但精确安装后的类型检查、测试和生产构建均通过。

## 验证记录

```text
npm ci                 PASS（301 packages，0 vulnerabilities）
npm run audit          PASS（0 vulnerabilities）
npm run lint           PASS
npm run typecheck      PASS
npm test               PASS（33 files，146 tests）
npm run build          PASS（325 modules，9 route HTML + 404 + sitemap）
```

生产构建摘要：

- JS：入口 32.79 kB（gzip 14.04 kB），Vuetify 共享块 310.38 kB（gzip 107.05 kB）
- CSS：13 个文件，共 333.86 kB；入口 203.98 kB（gzip 31.16 kB）
- Fonts：3 个文件，共 40.08 KB
- `dist/`：84 个文件，共 4,719,600 bytes

## 保留建议

以下没有阻断本轮整改：

- 如供应链基线要求更高，可将 `actions/*@v5/v6` 固定到完整 commit SHA，并由 Dependabot 更新。
- `parsePublishedAt` 仍使用 `Date.parse`；若未来内容由非开发者编辑，可补严格日历日期校验。
- `markdown-it 15` 与 TypeScript 7 属于主版本升级，应单独验证，不与日常补丁合并。
- 如需进一步缩减旧 clone 历史，可另行评估 `git lfs migrate import`；该操作会改写提交并需要所有贡献者协调。
- 本轮未运行部署环境中的 Lighthouse、Core Web Vitals、读屏器或多设备视觉回归。

仓库结构与数据流见 `.repository-audit/repository-map.md`。
