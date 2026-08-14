# 仓库审计报告(Repository Audit Report)

> 生成方式:repository-audit 技能 —— 仓库发现 → 规则发现 → 6 个并行审计代理(架构/可维护性/安全/依赖/测试/性能)→ 主代理逐条验证 → 汇总。
> 审计对象:`E:\Repos\cafe-frontend`(bluearchive-cafe-frontend,Vue 3 + TypeScript + Vuetify 4 + Vite 8 静态单页站点)。
> 审计日期:2026-08-14。
> 置信度规则:≥80 为报告级发现;60–79 为建议(advisory);<60 丢弃。所有报告级发现均经主代理对源码/构建产物/git 对象二次验证。

## 概览

- 技术栈:Vue 3.5、Vuetify 4、Vite 8(Rolldown)、vue-router、Vitest 4、ESLint 10(flat + 类型感知)、vue-tsc 严格模式;Node.js ≥24.11.0 <25,CI 与部署均在 GitHub Actions(Node 24)。
- 规模:`src/` 约 61 个文件,`scripts/` 10 个构建脚本(4 个带测试),`tests/` 9 个跨模块测试,源内单测 10 余个。
- 报告级发现合计:**31 条**(架构 5、可维护性 13、安全 2、依赖 3、性能 3、测试 5),另有技术债 2 条与若干 advisory(60–79)。均经主代理对源码/构建产物/git 对象/npm registry 二次验证。
- 应用层安全:**无 critical,无 high 应用漏洞**;依赖层有 **1 个 high 审计项**(nanoid 经 postcss 传递、建时边界场景、已有补丁 3.3.18 可一键修复,见 D1)。
- 总体结论:**架构分层健康、应用层安全卫生良好、测试设施完善,但"集中化"半途而废——SEO 元数据与路由清单存在多处逐字重复;依赖审计门禁因 nanoid 传递漏洞暂时红灯(已有一键修复);存在约 4.5MB 的字体性能开销与约 45MB 的 hero 原图仓库体积问题。** 无阻断发布的缺陷,按第 9 节优先级清单整改即可。

## 审计局限说明

1. 本环境(Windows 沙箱)禁止命名管道,`npm test` 与 `npm run build` 的 `vite build` 阶段因子进程 `spawn EPERM` 无法完整执行(新闻生成、类型检查、hero 优化均成功)。测试通过率与构建产物体积数据取自仓库既有 `dist/` 与代理的静态分析;CI 的 Linux runner 不受此影响。
2. 依赖审计(见下节)基于 `npm audit`/`npm outdated` 实测与 package-lock 静态分析。
3. 审计范围排除:`.worktrees/`(本地 worktree)、`.claude/`、`.agents/`(Agent 技能)、`src/content/news.generated.ts`(gitignored 生成物)。

---

## 1. 严重问题(Critical)

**无 critical。** 未发现硬编码凭据、可利用的 XSS 路径或数据丢失风险:密钥扫描(git 全历史与当前树)零命中;唯一的 `v-html` 出口(新闻正文)经构建期 sanitize-html 白名单清理且无运行时注入面。依赖层存在 1 个 high 级传递漏洞(nanoid 经 postcss,仅建时边界场景触发,已有补丁,见 D1),不构成生产站点的直接暴露。

---

## 2. 架构(Architecture)

分层方向健康:pages → components/utils/content/shared,无运行时循环依赖,无越层直达;`src/shared/site-routes.mjs` 作为 Vue 与构建脚本的共享边界方向正确;`scripts/` 职责划分清晰。风险集中在"双份实现"与"类型契约缺位"。

### A1. SEO 元数据与 Article JSON-LD 在运行时与构建期双份实现(high)

- **位置**:`src/utils/seo.ts`(24–63、103–106、154–170 行)vs `scripts/static-html.mjs`(12–38、78–117 行)、`scripts/site-routes.mjs`(33–37 行)
- **置信度**:90|**影响**:high
- **证据**:title/description/og/twitter/canonical 与 Article JSON-LD 的完整渲染逻辑各实现一份;`headline` 一条靠"剥后缀"(static-html.mjs:106–109)得到、一条直接用原始标题(seo.ts:158),当前输出碰巧一致但路径不同;`getRouteUrl` 两处实现语义也不一致(seo.ts:104 多剥尾斜杠)。
- **建议**:把"路由 → SEO 元数据 + JSON-LD"收敛为 `src/shared/` 下两端共用的纯函数(共享 headline 规范化、schema 组装、URL 拼接),seo.ts 与 static-html.mjs 只保留 DOM 写入。

### A2. `tsconfig.node.json` 孤儿化,脚本 `.d.mts` 契约不受类型检查(medium)

- **位置**:`tsconfig.json`(无 references,include 仅 src/**)、`tsconfig.node.json`、`vite.config.ts:9`
- **置信度**:82|**影响**:medium
- **证据**:`npm run typecheck` 用 `vue-tsc -b` 只构建根 tsconfig,`tsconfig.node.json` 不被引用;ESLint 对 `vite.config.ts` 仅语法级(eslint.config.js:85–95)。`vite.config.ts` 从 `./scripts/news-content.mjs` 导入的 `generateNewsModule` 永不针对 `.d.mts` 校验,契约漂移不会被 CI 捕获。
- **建议**:建立 solution 根 tsconfig 把 `tsconfig.node.json` 纳入 references,或将 vite.config.ts 并入 typecheck 流程。

### A3. `news-content.d.mts` 类型声明不完整且弱化(medium)

- **位置**:`scripts/news-content.d.mts`
- **置信度**:85|**影响**:medium
- **证据**:实现还导出 `readNewsArticles`(被 `news-entries.mjs` 使用),声明缺它;`articles`/`assets` 退化为 `Array<Record<string, unknown>>`(7–11 行),丢失真实字段结构;`news-entries.mjs` 无 `.d.mts`。
- **建议**:补齐 `readNewsArticles` 声明,用明确的 `NewsArticle`/`NewsAsset` 接口替换 `Record<string, unknown>`,并为 `news-entries.mjs` 补类型。

### A4. 路由清单在组件中重复硬编码(medium,与 M1 同源)

- **位置**:`src/components/AppHeader.vue`(106–137)、`src/components/SiteFooter.vue`(24–28)、`src/router.ts`(7–13)
- **置信度**:80|**影响**:medium
- **证据**:`staticRoutes` 是权威定义,但导航、页脚、组件映射各再写一份 5 条路由;新增/改名路由需手工同步 4 处文件,`router.test.ts` 只校验路由表与 Router 的一致性,不校验导航/页脚。
- **建议**:导航与页脚从 `staticRoutes` 派生(补充 label 映射),`routeComponents` 已通过类型绑定 shared,可继续保留。

### A5. `formatPublishTime` 是恒等占位的死抽象(low)

- **位置**:`src/content/news.ts:34–36`(被 NewsPage.vue:49、NewsArticlePage.vue:19、NewsSection.vue:27 调用)
- **置信度**:88|**影响**:low
- **证据**:函数体 `return value`,页面实际显示 raw `"2026-07-29 03:04"`,函数名暗示存在格式化行为。
- **建议**:实现真正的日期格式化,或删除该函数、调用点直接用 `article.publishedAt`。

**架构 advisory(60–79)**:① 生成产物与消费方的类型级循环依赖(72)——`news.generated.ts` 反向 `import type` 自 `./news`,建议把 `NewsArticle` 类型移到独立共享文件;② 结构化站点内容内联在组件(70)——AboutSection 的 aboutItems/socialLinks、SiteFooter 的 friendLinks 未收敛到 `src/content/`,与 downloads.ts 策略不一致;③ `vite.config.ts` 顶层导入完整内容生成管线(68)——生产构建加载 markdown-it/sanitize-html 重依赖,建议改为 `configureServer` 内动态 `import()`;④ 动态路由名 `'news-article'`/`'not-found'` 在 router.ts 与 seo.ts 间字符串重复(70)——建议共享常量。

---

## 3. 可维护性(Maintainability)

结构清晰、命名规范、无 TODO/FIXME、无未引用模块;核心问题是"集中化未贯彻到底"与"token 缺失"。

### M1. 新增静态路由需同步修改 4 处文件——枪弹式修改(high)

- **位置**:`src/shared/site-routes.mjs`、`src/router.ts:7–13`、`src/components/AppHeader.vue:106–137`、`src/components/SiteFooter.vue:24–28`
- **置信度**:95|**影响**:high
- **证据**:路由 name/path/SEO 在 shared 集中定义,但组件映射、导航清单、页脚链接各再硬编码一份;README 只提示"添加页面组件映射",漏掉导航/页脚两处。
- **建议**:从 `staticRoutes` 派生导航与页脚(增加 label 字段或 name→label 映射),新增路由只改 `site-routes.mjs` + 新建页面 + `routeComponents` 一处注册。

### M2. `index.html` 硬编码整套 SEO 元数据,与共享配置重复(high)

- **位置**:`index.html`(6–68 行)vs `src/shared/site-routes.mjs`(1–6 行)
- **置信度**:95|**影响**:high
- **证据**:description/keywords/og:*/twitter:*/canonical 与两段 JSON-LD 逐字重复,描述串出现 4 次、域名出现 6 次。构建脚本会对各路由覆写 meta,但首页壳的静态默认值仍须与 shared 手工同步。
- **建议**:index.html 只保留结构占位,构建时由 `static-html.mjs` 用 shared 配置统一覆写(现状已覆写大部分,把首页也纳入同一路径并删掉壳内死值)。

### M3. 新闻文章 SEO 派生逻辑与回退描述魔法字符串三处重复(high)

- **位置**:`src/utils/seo.ts`(73–79、161)vs `scripts/site-routes.mjs`(13–25)
- **置信度**:95|**影响**:high
- **证据**:文章 title/description/keywords 派生规则各实现一份;回退描述 `` `${article.title}，来自 BlueArchive.Cafe 的新闻与公告。` `` 出现 3 次。不同步会导致客户端 meta 与 sitemap/回退 HTML 漂移。
- **建议**:把"文章 → 路由 SEO"映射抽为 shared 纯函数,回退描述提为具名常量。

### M4. AGENTS.md 声称 Node 22,与 engines/CI/.nvmrc/README 全矛盾(medium)

- **位置**:`AGENTS.md:9` vs `package.json:6–8`(>=24.11.0 <25)、`.nvmrc`(24)、`README.md:17`、`.github/workflows/ci.yml:26`、`deploy-pages.yml:29`
- **置信度**:100|**影响**:medium
- **证据**:AGENTS.md 写 "Use Node.js 22, matching GitHub Actions",但 CI 实际用 24,engines 拒绝 Node 22。新贡献者按 AGENTS.md 装 22 会在 `npm ci` 被 engines 拒绝。
- **建议**:AGENTS.md 改为 "Node.js 24(最低 24.11.0)",删除"matching GitHub Actions"或改述为与 CI 一致。

### M5. 超大文件职责混杂(medium)

- **位置**:`scripts/news-content.mjs`(527 行)、`src/pages/DownloadPage.vue`(700)、`StatusPage.vue`(578)、`NewsArticlePage.vue`(416)、`AboutSection.vue`(433)、`src/styles/global.css`(370)
- **置信度**:90|**影响**:medium
- **证据**:news-content.mjs 聚合渲染器/sanitize/解析/slug/资产注册/代码生成/字数统计七类职责;页面文件因内联数据与长样式膨胀。
- **建议**:news-content.mjs 按职责拆分(markdown-renderer/news-sanitize/news-parser);页面内联数据下移到 content/,重复样式抽组件。

### M6. 主题颜色以 hex 与 rgba 多份维护(medium)

- **位置**:`src/theme.ts:6`(#29aeea)vs `src/styles/global.css`(39–71 行多组 `rgba(41,174,234,…)` 等)vs `src/utils/console-brand.ts`(4、12 行再硬编码)
- **置信度**:90|**影响**:medium
- **证据**:主色/次要色/成功色/错误色各以 hex + 3–4 组手工换算的 rgba 重复;改主色需同步 6+ 处,极易遗漏。
- **建议**:global.css 改用 `rgb(var(--v-theme-primary))` 配合 color-mix,或引入 `--color-primary-rgb` 派生变量;console-brand 复用主题 token。

### M7. 布局魔法数字 72/72vh 散落多处(medium)

- **位置**:`src/router.ts:36`(top: 72)、`src/styles/global.css:140`(scroll-margin-top: 72px)、6 个页面的 `min-height: 72vh`(AboutSection:171、DownloadPage:386、StatusPage:269、NewsPage:119、NewsArticlePage:108、NotFoundPage:26、global.css:161),导航实际高度 56px(AppHeader:2/27/37)
- **置信度**:90|**影响**:medium
- **证据**:72 的来源(56px 导航 + 16px 间距?)无任何注释与 token;72vh 在 7 处逐字重复。
- **建议**:定义 `--app-bar-height`/`--anchor-offset`/`--page-min-height` token,各处引用。

### M8. 平台 icon/tone/配色映射在数据与样式间重复(medium)

- **位置**:`src/content/downloads.ts`(38–137)vs `src/pages/StatusPage.vue`(120–177、359–376)vs `src/pages/DownloadPage.vue`(491–508)
- **置信度**:85|**影响**:medium
- **证据**:android/ios/windows/macos 的 icon(`$android` 等)、tone、配色规则(android→success、ios/macos→neutral、windows→primary/info)各维护一份,新增平台需同步 3 处。
- **建议**:建立单一"平台元数据"模块(icon/tone/color-token),两页面共用,样式用结构化类名驱动。

### M9. 若干低危重复与死代码(low,合并列示)

| # | 发现 | 位置 | 置信度 |
|---|---|---|---|
| M9a | 死 CSS:`.page-surface`、`.content-card` 无任何引用(grep 验证) | global.css:160–170 | 90 |
| M9b | `.sr-only` 视觉隐藏样式复制 3 份 + StatusPage 内联 1 份 | ArticleMeta.vue:67、CategoryBadge.vue:32、StatusPage.vue:283/504 | 90 |
| M9c | apex 域名裸字符串未复用 `siteUrl` | main.ts:2–3、analytics.ts:46 | 85 |
| M9d | 彩蛋尺寸/时长双份维护,JS 居中偏移不受 CSS 变量覆盖 | easter-egg.ts:53–54、159–160 vs global.css:321/326 | 85 |
| M9e | main.ts:54 注释"5% 概率"与实际 `DEFAULT_CHANCE = 1/100` 矛盾 | main.ts:54、easter-egg.ts:50 | 90 |

**建议**:删除死类或统一使用;`.sr-only` 提升为全局工具类(或复用 Vuetify `.v-sr-only`);域名常量复用;彩蛋尺寸由 CSS 变量单一驱动;修正注释。

**可维护性 advisory(60–79)**:① NewsSection 与 NewsPage 新闻卡片结构重复,可抽 `NewsCard.vue`(78);② HeroSection 硬编码 docs URL 未复用 `baseDocUrl`(70);③ `settings.scss` 的 `$card-border-radius: 8px` 与 global.css 的 `--md2-radius-card: 8px` 重复(65)。

---

## 4. 安全(Security)

总体卫生良好:密钥零泄露(全树 + git 历史 grep),`v-html` 唯一出口被构建期 sanitize 白名单覆盖(事件属性、`javascript:`/`data:` 协议均被拒),外链 `rel="noopener noreferrer"` 规范,无 `eval`/`document.write`/敏感 localStorage。两项低危报告级发现如下。

### S1. Markdown 渲染开启 `html: true`,原始 HTML 仅靠 sanitize-html 兜底(low)

- **位置**:`scripts/news-content.mjs:205–210`(清理逻辑 138–193)
- **置信度**:92|**影响**:low
- **证据**:`new MarkdownIt({ html: true, … })` 允许正文混入原始 HTML,产物经 `sanitizeRenderedHtml`(115 行)清理后进入生成文件,`NewsArticlePage.vue:28` 以 `v-html` 输出(构建期常量,非运行时注入)。允许列表含 `svg`/`path`,但 `style`/`id`/`on*` 与危险协议均被拦截,实测内联 style 会被剥离。
- **建议**:若不需要内嵌 HTML,设 `html: false` 彻底消除该攻击面;否则补充针对 `<script>`/`<iframe>`/`onclick`/`javascript:` 载荷的清理回归测试,把当前信任点固化为测试。

### S2. deploy-pages 工作流对 build job 过度授权(low)

- **位置**:`.github/workflows/deploy-pages.yml:10–13`
- **置信度**:88|**影响**:low
- **证据**:`pages: write` 与 `id-token: write` 授予了执行 `npm ci`/`npm run build:pages`(运行第三方依赖代码)的 build job,而实际只有 deploy job 需要。
- **建议**:按 job 拆分权限:build job 仅 `contents: read`,`pages: write`/`id-token: write` 下放到 deploy job。

**安全 advisory(60–79)**:① Actions 按 major tag pin(checkout@v6 等),建议 pin 到完整 commit SHA(70);② `__APP_INFO__` 把 buildTime/commitSha/developer 打进 bundle 并打印到控制台(75);③ sanitize 允许列表含 `svg`/`path`,理论放宽面(65);④ gtag 第三方脚本无 SRI(60,Google 会更新脚本,SRI 可能致加载失败,属可接受风险)。

---

## 5. 性能(Performance)

运行时效率无问题:路由全懒加载(入口仅约 30KB)、状态接口仅挂载时拉取一次且正确 abort/clearTimeout、scroll 监听 passive、彩蛋音频/贴图点击才加载、hero 使用 optimized webp + `fetchpriority=high`。

### P1. 中文可变字体全量引入约 4.56MB(high)

- **位置**:`src/styles/fonts.scss:13–19`(配合 1–11 行的 noto-sans latin)
- **置信度**:90|**影响**:high
- **证据**:`noto-sans-sc` 的 chinese-simplified + latin 子集共 95 个 woff2 分片约 4,479,868 bytes(woff2 不可再压);且其 `latin` 子集与 1–11 行独立引入的 `noto-sans` latin(6 个字重)冗余。字体是当前站点最大的传输开销。
- **建议**:删除冗余的 latin 双重引入;评估以系统 CJK 字体栈(已含 PingFang SC/Microsoft YaHei)承接中文正文、仅保留关键标题用 webfont,或按 unicode-range 做子集化按需加载。

### P2. gtag.js 缺少 preconnect(low)

- **位置**:`index.html:70`
- **置信度**:85|**影响**:low
- **证据**:gtag 脚本 `async` 加载,但无 `preconnect`/`dns-prefetch` 到 `googletagmanager.com` 与 `google-analytics.com`。
- **建议**:加两个 `<link rel="preconnect" crossorigin>`。

### P3. Vuetify 共享 chunk 约 310KB(low,属正常开销)

- **位置**:`vite.config.ts:46–49` 的刻意合并
- **置信度**:85|**影响**:low
- **证据**:vuetify 块 310,387 bytes(gzip 约 106KB)全站加载,为 Vuetify 4 正常量级,属有意为之的稳定共享 chunk。
- **建议**:维持现状;若要进一步压缩,评估按需自动导入组件(当前已开 autoImport)或升级到更新的 tree-shaking 路径。

**性能 advisory(60–79)**:① hero 原图(最大 12.1MB 的 `131020176_p0_cut.png`)留库,构建后被 prune 不影响生产,但撑大仓库与 dev 传输(见 TD1);② 入口 CSS 约 311KB 渲染阻塞,主体是 104 条 `@font-face`(font-display 均为 swap),是 P1 的下游后果。

---

## 6. 依赖(Dependencies)

依赖栈整体前沿且自洽:lockfileVersion 3 与 npm 12 兼容;vue-router@5.2.0(即 latest)与 vue@3.5.40/vuetify@4.1.6 均存在且 peer 兼容(vue-router 5 必需 peer 仅 `vue ^3.5.34`,项目满足);`npm outdated` 无弃用警告。实质风险集中在一条可一键修复的传递漏洞与少数幽灵/僵尸依赖。

### D1. `npm audit` 报 1 个 high:nanoid <3.3.18 经 postcss 传递,已有补丁,当前 lockfile 未升级导致 CI 审计门禁失败(high)

- **位置**:`package-lock.json`(nanoid 3.3.16 于 5086 行、postcss 8.5.23 于 5302 行);`npm run audit`(`.github/workflows/ci.yml:33–34`)
- **置信度**:97|**影响**:high(对 CI 门禁;对生产站点实际暴露为低)
- **证据**(主代理两次亲测 `npm audit --json` 复核,审计报告在会话中实时更新):当前为 **1 个 high、0 critical**,`fixAvailable: true`。根因为 GHSA-2v37-7h3g-55p8 / CVE-2026-67213(nanoid "custom generators can loop indefinitely when size is zero",CWE-835,CVSS 5.9,受影响范围 `<3.3.18`),经 postcss(依赖 `nanoid ^3.3.16`)传递。`npm audit --omit=dev` 报同样结果,证明经生产树可达(vue/vue-router/vuetify → @vue/compiler-sfc → postcss → nanoid),但 postcss/compiler-sfc 均为构建期工具,静态站点浏览器侧无暴露,且 CVE 仅在 customAlphabet/customRandom + size=0 的边界用法下触发。审计早期快照曾显示"15 个 high / 无修复",实为同一 advisory 在依赖链上展开为 15 个受影响包(nanoid←postcss←{vite,@vue/compiler-sfc,sanitize-html}←{vue,vue-router,vite-plugin-vuetify,vitest,unplugin…}),并非 15 个独立漏洞;nanoid 于 2026-08-07 发布 3.3.18 补丁后,audit 收敛为 1 条且可修复。当前 lockfile 仍锁 3.3.16,`npm run audit --audit-level=moderate` 退出码 1,而 ci.yml 的 Audit 步骤无 `continue-on-error`,故 CI 该步骤会失败直至升级。
- **建议**:直接 `npm audit fix`(或 `npm update nanoid`),3.3.16→3.3.18 落在 postcss 声明的 `^3.3.16` 范围内,**无需 overrides、无破坏性**;升级后 CI 审计门禁即恢复绿灯。无需放宽门禁或接受风险。

### D2. 幽灵依赖:`vue-eslint-parser` 被直接导入但未声明(low)

- **位置**:`eslint.config.js:5` vs `package.json`(devDependencies 未列出)
- **置信度**:88|**影响**:low
- **证据**:`import vueParser from 'vue-eslint-parser'` 直接引用,但它仅作为 eslint-plugin-vue 的 peer 被自动安装;npm 不保证幽灵依赖在 lockfile 变更/去重后仍可解析。
- **建议**:显式加入 devDependencies(与 eslint-plugin-vue 的 peer 版本对齐)。

### D3. 未使用的开发依赖:`@eslint/markdown` 与两个 `@types/*`(low)

- **位置**:`package.json:38、39、41`
- **置信度**:85|**影响**:low
- **证据**:主代理 grep 全树确认 `@eslint/markdown`、`@types/markdown-it`、`@types/sanitize-html` 在 js/mjs/ts/vue 中零引用(eslint.config.js 实际用的是 `eslint-plugin-html`;markdown-it/sanitize-html 只在 `.mjs` 脚本中使用,不在任何 tsconfig include 内)。
- **建议**:移除或补接入;若保留 `@types/*` 仅为编辑器对 `.mjs` 脚本的 IntelliSense,请在 package.json 注释说明意图,避免被当作僵尸依赖。

**依赖 advisory(60–79)**:① `.nvmrc` 仅写 "24" 未锁定到 24.11.0 最低版(75);② typescript 6→7、markdown-it 14→15 存在跨 major 滞后(无弃用警告),dependabot 将开 breaking PR(70);③ `vite-plugin-vuetify` 放在 dependencies 而非 devDependencies(62);④ dependabot.yml 配置合理但缺 groups/labels/ignore(70)。

**依赖确认无问题项**:engines 与 CI 一致(Node 24,仅 AGENTS.md 文档脱节,见 M4);`npm outdated` 无弃用包;pinia/@pinia/colada 等 optional peer 均无冲突。

---

## 7. 测试(Testing)

测试设施完整:Vitest + jsdom,测试就近存放,生成脚本四个核心分支(草稿过滤/XSS 清理/frontmatter 校验/图片越界)均有覆盖,CI 两工作流都在 `npm ci` 后跑 `npm test`,假定时器与 mock 清理到位。`npm test` 在本沙箱因 spawn EPERM 无法执行(非仓库缺陷)。

### T1. `main.ts` 的 www 重定向与启动引导无测试(high)

- **位置**:`src/main.ts:1–4`(grep 全树无 main 相关测试)
- **置信度**:88|**影响**:high
- **证据**:www→apex 重定向是入口级 SEO/访问逻辑,`printConsoleBrand`/`enableClickSound` 装配也无任何测试。
- **建议**:把重定向判断抽成可测纯函数(如 `shouldRedirectToApex(hostname)`),加单测;启动装配可用轻量 smoke 测试覆盖。

### T2. `NewsArticlePage.vue` 文章渲染主流程无行为测试(high)

- **位置**:`src/pages/NewsArticlePage.vue`(无任何 `NewsArticlePage*.test.ts`)
- **置信度**:88|**影响**:high
- **证据**:findNewsArticle 命中/404 分支、v-html 渲染、medium-zoom 挂载/卸载、路由 slug 变化刷新,全部无测试。这是全站唯一动态内容出口。
- **建议**:参照 DownloadPage 的 stub 组件方式,补命中/未命中/zoom 生命周期测试。

### T3. `tests/` 与 App/AppHeader 测试为"读源码断言字符串"的 grep 式测试(high)

- **位置**:`tests/home-surface.test.ts`、`tests/md2-*.test.ts`、`src/App.test.ts`、`src/components/AppHeader.test.ts`
- **置信度**:92|**影响**:high(测试质量)
- **证据**:`import appSource from './App.vue?raw'` 后 `expect(appSource).not.toContain('mode="out-in"')`(App.test.ts:6–7);home-surface.test.ts 用 readFileSync 读源码断言 `toContain('--button-height: 48px')`。零行为验证、断言实现细节(具体 CSS 字符串),任何视觉重构都会使其脆断。README 将此类定义为"源码结构断言",属有意设计,但作为唯一保护手段时对回归的价值有限。
- **建议**:保留少量作为设计契约,但关键行为改挂载测试(jsdom + stub),与 DownloadPage 的既有行为测试对齐。

### T4. router 的 scrollBehavior 与 afterEach SEO 装配无测试(medium)

- **位置**:`src/router.ts:30–52`(`router.test.ts` 仅断言静态路径注册)
- **置信度**:85|**影响**:medium
- **证据**:锚点偏移 top:72、无 hash 回顶、afterEach 的 applyRouteSeo/trackNotFound 装配均无断言;trackNotFound 已有 router.analytics.test.ts 覆盖,scrollBehavior 与 SEO 无。
- **建议**:补 scrollBehavior 行为测试(带 hash/不带 hash)与 afterEach 触发 applyRouteSeo 的装配测试。

### T5. `DownloadPage.analytics.test.ts` 未打桩 `fetchStatus`,挂载即发真实网络请求(medium)

- **位置**:`src/pages/DownloadPage.analytics.test.ts`(仅 mock analytics 与 vue-router)
- **置信度**:90|**影响**:medium
- **证据**:onMounted 中 `fetchStatus(statusRequestController.signal)` 未被打桩,测试挂载时向 `api.bluearchive.cafe/status/list` 发起真实请求;断言不依赖其结果所以测试碰巧通过,但存在慢、flaky、离线失败的隐患。
- **建议**:`vi.mock('../utils/status')`,返回固定 `StatusData` 或抛错,两种分支各断言一次。

**测试 advisory(60–79)**:① easter-egg.test.ts:151–164 的"复用音频元素"用例对无关新实例断言 currentTime===0,存在假阳性(70);② news-content.test.mjs 未覆盖重复 slug 抛错分支(news-content.mjs:102–104)(65)。

**测试确认无问题项**:seo/analytics/status/easter-egg/downloads 的单测为有真断言的 jsdom 行为测试;生成脚本核心分支覆盖充分;CI 运行测试;清理规范。

---

## 8. 技术债(Technical Debt)

### TD1. 约 45MB hero 原图入库(medium)

- **位置**:`public/assets/img/hero/`(12 个文件 >1MB,最大 `131020176_p0_cut.png` 12.1MB、`131020176_p0.jpg` 10.2MB)
- **置信度**:95|**影响**:medium
- **证据**:`git cat-file -s HEAD:` 实测 12 个 hero 原图合计约 45MB;构建脚本会生成 optimized webp 并 prune 原图(生产不受影响),但原图永久留在 git 历史,每次替换历史翻倍,克隆与 dev 传输被撑大。
- **建议**:将原图移出 git(对象存储/CDN 私有桶 + 构建期拉取),或采用 Git LFS;至少在新增大图时评估阈值。

### TD2. 历史重写备份分支与大量陈旧分支(housekeeping)

- **位置**:git 仓库元数据
- **置信度**:90|**影响**:low
- **证据**:存在 `backup/main-before-history-rewrite` 分支,说明 main 经历过历史重写且留有备份;本地与远端存在十余个已合并的陈旧分支(codex/*、fix/*、dependabot/*)。
- **建议**:确认备份不再需要后删除;已合并分支按规则清理,保留 dependabot 活跃分支。

---

## 9. 建议优先级(Recommended Priorities)

| 优先级 | 事项 | 相关发现 | 预期收益 |
|---|---|---|---|
| P0 | 升级 nanoid 3.3.16→3.3.18(`npm audit fix`,在 postcss `^3.3.16` 范围内,无破坏) | D1 | CI 审计门禁恢复绿灯 |
| P0 | 收敛 SEO/JSON-LD 单一数据源(shared 纯函数,seo.ts 与 static-html.mjs 复用) | A1、M2、M3 | 消除 3 处漂移源,删 index.html 内 ~40 行死值 |
| P0 | 导航/页脚/组件映射从 `staticRoutes` 派生 | A4、M1 | 新增路由从改 4 处降到 1 处 |
| P1 | 中文字体减负:删 latin 冗余,评估系统字体栈/unicode-range 子集化 | P1 | 首屏传输 -4MB 级别 |
| P1 | 修正 AGENTS.md Node 版本 + 彩蛋注释等文档失实 | M4、M9e | 新人不再踩 engines 坑 |
| P1 | `tsconfig.node.json` 纳入 typecheck,补齐 `.d.mts`;补声明 `vue-eslint-parser` | A2、A3、D2 | 共享边界由 CI 强制 |
| P2 | 补 main.ts / NewsArticlePage / router 装配的行为测试;修 DownloadPage 测试网络隔离 | T1–T5 | 关键路径可回归 |
| P2 | 按 job 收敛 deploy-pages 权限;补 sanitize 回归测试 | S1、S2 | 纵深防御 |
| P2 | hero 原图移出 git(对象存储/LFS);清理未使用 devDeps | TD1、D3 | 仓库体积 -45MB |
| P3 | token 化(颜色/72/72vh/8px)、拆超大文件、删死 CSS、抽 NewsCard | M5–M9 | 长期维护成本下降 |
| P3 | gtag preconnect、Actions pin SHA、清理陈旧分支 | P2、安全 advisory、TD2 | 小成本收尾 |

---

## 附:仓库地图

见 `.repository-audit/repository-map.md`(本报告阶段 1 产出)。

---

## 整改状态(2026-08-14,修复后更新)

验证命令全部通过:`npm run audit`(0 漏洞)、`npm run lint`、`npm run typecheck`(含新接入的 node 项目)、`vitest run`(**141/141 通过**)、`npm run build`(构建 + 9 个路由回退页 + sitemap,产物抽查确认 JSON-LD/meta/canonical 注入正确)。

| 发现 | 状态 | 处理 |
|---|---|---|
| D1 nanoid | ✅ | `npm update nanoid` → 3.3.18,audit 归零(此前"15 high/无修复"实为同一 advisory 展开,现仅 1 条且可修) |
| D2 vue-eslint-parser | ✅ | 显式加入 devDependencies(^10.4.1) |
| D3 未用 devDeps | ✅ | 移除 @eslint/markdown、@types/markdown-it、@types/sanitize-html |
| A1/A2/A3/M2/M3 SEO 多源与类型契约 | ✅ | 新建 `src/shared/seo.mjs`(+`.d.mts`)单一派生;seo.ts / static-html.mjs / scripts/site-routes.mjs 共用;index.html 只留结构(+preconnect);tsconfig references 接入 typecheck;补齐 news-content/news-entries 类型声明 |
| A4/M1 路由 4 处重复 | ✅ | staticRoutes 增加 label 并成为导航顺序唯一来源,AppHeader/SiteFooter 直接派生;router 对缺失组件显式失败;声明不再复制路由名 union;README 同步 |
| A5 formatPublishTime | ✅ | 删除空实现,调用点直接用 publishedAt |
| M4/M9e 文档矛盾 | ✅ | AGENTS.md 改为 Node 24(最低 24.11.0);main.ts 注释改 1%;.nvmrc 锁 24.11.0 |
| M5 超大文件 | ⚠️ 部分 | news-content.mjs 拆为 sanitize/markdown/主模块(527→~230 行);页面大文件仅做数据下移与 token 化,长样式保留(手写模板约束) |
| M6 颜色多份维护 | ✅ | rgba 改为 `rgba(var(--v-theme-*))`,console-brand 从 theme.ts 取色 |
| M7 72/72vh 魔法值 | ✅ | `--app-bar-height/--anchor-offset/--page-min-height` token,AppHeader 与 router 运行时读取必需 token,不再维护 JS 回退值 |
| M8 平台 icon/tone | ✅ | `src/content/platforms.ts` 统一维护 icon 与颜色 token,DownloadPage/StatusPage 共用同一纯函数生成样式 |
| M9a 死 CSS | ✅ | 删除 .page-surface/.content-card |
| M9b .sr-only ×3 | ✅ | 全局工具类;StatusPage 媒体查询内的 thead 隐藏块保留(结构不同) |
| M9c 域名硬编码 | ✅ | apex-redirect.ts / analytics.ts 从 siteUrl 派生 |
| M9d 彩蛋尺寸双份 | ✅ | `:root` 定义尺寸与时长默认 token,CSS 与 TS 均直接消费,不再复制默认数值 |
| S1 sanitize 兜底 | ✅ | 保留 html:true(现有文章含内嵌 HTML),补 script/iframe/事件属性/javascript:/data: 回归测试 |
| S2 CI 权限过宽 | ✅ | build job 仅 contents:read;pages:write/id-token:write 下放 deploy job |
| P1 字体 4.5MB | ⚠️ 部分 | 删除 noto-sans-sc 的 latin 冗余子集、noto-sans 字重裁剪为 400/500/700;完整 CJK webfont 保留(品牌设计决策,浏览器按 unicode-range 分片下载) |
| P2 gtag preconnect | ✅ | index.html 增加 googletagmanager.com / google-analytics.com preconnect |
| P3 Vuetify chunk | ➖ | 正常框架开销,未改 |
| T1 main.ts 无测试 | ✅ | 抽出 apex-redirect.ts(纯函数)+ 3 个单测 |
| T2 NewsArticlePage 无测试 | ✅ | 新增 4 个行为测试(渲染/404/slug 切换/zoom 生命周期) |
| T3 grep 式测试 | ⚠️ 部分 | 保留(README 明示的设计契约测试);关键行为改用挂载测试 |
| T4 router 装配无测试 | ✅ | 新增 router.scroll.test.ts + router.seo.test.ts |
| T5 测试真实网络 | ✅ | DownloadPage.analytics 打桩 fetchStatus + 失败路径用例 |
| TD1 hero 原图 45MB | ⚠️ 未做 | 需对象存储/Git LFS 基础设施决策,见原建议;无法在仓库内单独完成 |
| TD2 陈旧分支 | ⚠️ 部分 | 本地已合并分支已删;未合并分支与 backup 保留;远端删除需 push --delete 权限 |
| advisory:类型循环/内容内联/vite 重依赖/routeNames/docs URL/测试假阳性/重复 slug | ✅ | news-types.ts、site-content.ts、vite.config 动态 import、共享 routeNames、HeroSection 复用 baseDocUrl、easter-egg 测试改真断言、补重复 slug 测试 |
| advisory:NewsCard 抽取 | ⚠️ 未做 | 两处卡片模板存在 h2/h3 与页脚差异,无渲染测试兜底,风险高于收益 |
| advisory:Actions pin SHA / gtag SRI / __APP_INFO__ / dependabot groups / settings.scss 8px | ⚠️ 未做 | 分别需上游 commit SHA 查询、Google 动态脚本、控制台品牌功能权衡与可选配置,见原报告说明 |
