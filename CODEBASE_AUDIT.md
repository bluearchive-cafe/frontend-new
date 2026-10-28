# 仓库审计报告（当前状态）

> 审计日期：2026-10-28　|　审计基线：`main@f397646`，报告现状对账至 `main@9139578`　|　模式：full（面向 UI/UX、动画、架构、样式、可维护性）
>
> 上次全量审计为 2026-09-13（基线 `ce59c46`，已归档至 `.repository-audit/history/CODEBASE_AUDIT_2026-09-13.md`）。此后 16 个提交集中在 UI/交互层（亮暗主题、页面转场、焦点恢复、文案精简、Linux 下载），因此本次对 UI 层按全量重审，其余领域做增量对账。
>
> **本报告描述"当前已知状态"，不是审计当时的快照**：本次登记的 21 条发现里，15 条已在 `9a985f6`…`9139578` 这 19 个修复提交里关闭，AUD-UI-004 由审计前的 `3c5edf3` 关闭，正文只保留仍未解决的 5 条；已关闭的连同修法、取舍与被推翻的原建议一起写在"已解决"。台账见 `.repository-audit/findings.json`（open 5 / resolved 16，其中 3 条 open 已部分解决）。
>
> 该台账目录**只存在于本机**：维护者已决定整体不入库（`9139578` 在 `.gitignore` 加了 `.repository-audit/`），本报告引用的 `checks/*.log`、`checks/*.mjs` 与截图因此换一台机器即不可读——每条发现的证据都已完整抄写在本文件正文里，不复述台账。

## 结论摘要

仓库健康度：**良好，代码质量高，"静默失败"面已明显收窄**。当前本机验证全绿（`npm test` 44 文件 224 例、`lint`、`typecheck`、`build`、`audit` 均退出码 0），部署通道正常。剩余 open 没有一条是"发现没修"：一条需要仓库外权限，一条需要推送后在真实边缘实测状态码，两条是可直接代做的文档与测试收尾。

Open findings：**Critical 0 / High 1 / Medium 1 / Low 3**（其中 3 条已部分解决，见"已解决"）。

本轮修复（`9a985f6`…`9139578`，19 个提交）关闭 15 条：AUD-SEO-001/002、AUD-CONTENT-001/002、AUD-MAINT-001/002/003/004、AUD-UI-001/002/003、AUD-ARCH-003、AUD-HERO-001、AUD-DEP-002、AUD-HOUSE-001。**上一版报告列出的 3 项待决策已全部由维护者拍板并落地**：作者语法边界（不收宽白名单，改为作者规范 + 构建期告警）、下载卡 hover（删除死声明，不加反馈）、`.repository-audit/` 跟踪策略（整体不入库）。

需要的决策（1 项，需人工拍板）：
1. **模板 `elevation`/`bg-color` props 的去留**（AUD-ARCH-001）：删 props 会改变语义但不改变渲染，写注释则承认现状。这是仓库内唯一还卡着表态的条目。

最重要的风险与行动：
1. **AUD-DEP-001（High）**：`npm run audit` 作为 PR 与部署的硬门禁，6 周内两次（09-13、10-28）让发布通道整体红灯，只能手工 `npm audit fix` 恢复。实测 `dependabot_security_updates: disabled`——上次报告的首要建议从未落地。开一个仓库设置即可根治，**这是本次唯一无法在仓库内修、也是唯一不改代码的动作**。
2. **AUD-OPS-001（Medium）**：ESA `notFoundStrategy: singlePageApplication` 让**任意**缺失路径返回 **200 + text/html**（不是 404），并按 30 天缓存——实测连带 `no-cors` 的缺失图片也一样，比官方文档描述的"非导航请求会落到 404"更宽松。这是 AUD-SEO-001 那类断链能长期静默存活的根因。构建期产物资产校验已落地（`45887d5`），策略本身已按官方文档改为 `404Page`（前提"每条路由都已静态化"已核实并加了构建期守卫，见该条正文）。**残余只在部署侧**：实测状态码是否真是 404（文档两处自相矛盾），以及旧 30 天错误缓存需要主动 purge。
3. **AUD-ARCH-001（Low）**：模板里的 `elevation`/`bg-color` props 被 `global.css` 的未分层声明恒胜架空，读模板会得出与渲染相反的结论。同批次的另一条"意图与实现相反"（AUD-ARCH-003，www 重定向不短路）已在 `3fe7900` 闭环。
4. **AUD-ARCH-002 + AUD-TEST-001（Low，均已部分解决）**：`src/shared/` 与 `tests/` 仍未写进 `AGENTS.md` 结构清单；churn 最高的 `HeroSection`/`NewsSection`/`toolbar-loader` 仍无同级测试。两条都不需要再决策，等一个"go"。

## 自上次审计以来的变更面

16 个提交、44 个文件、+1372/−816。风险映射：

| 变更 | 领域 | 本次处理 |
|---|---|---|
| `4e684c4` 亮暗主题 + 静态视觉统一 | 样式/主题 | 全量重审（AUD-MAINT-003、UI-002） |
| `3c5edf3` 页面切换跳变与锚点重复入场 | 动画/路由 | 重审并确认已修（见"各领域观察 · 动画"） |
| `96ef29b` 焦点恢复、滚动与筛选 | 可访问性 | 抽查通过（`tests/dialog-focus.test.ts` 6 例真断言） |
| `b164393` 移除信息卡片悬停 | 交互一致性 | 引出 AUD-UI-003 的决策项，已按"不加 hover"关闭（`38228dd`） |
| `1788b51`/`f162d12` 依赖升级 | 依赖/CI | AUD-DEP-001 复发证据 |
| `f397646` Linux 下载 | 架构/可维护性 | 引出 AUD-MAINT-004 的改动放大证据 |

## High Priority Findings

### AUD-DEP-001 — 依赖审计门禁是发布通道单点，已复发两次且无自动修复路径

- Category: dependencies / CI
- Severity: **High**（置信 96 / status: open / disposition: **Add Guard**）

**Evidence**
- `gh run list`：2026-10-28 两次 `Deploy to GitHub Pages` 失败（run `40674472568` 25s、`40678427929` 18s），`gh run view --log-failed` 显示失败步骤是 `npm run audit`，报告 *7 vulnerabilities (1 low, 3 moderate, 3 high)*，含 `undici`、`deepmerge`、`@vitest/mocker`；`f162d12`（12:24）后恢复 success，`f397646`（12:50）success。
- 本机 `npm audit --audit-level=moderate` 当前退出码 0（本机 `.repository-audit/checks/npm-audit.log`，台账未入库），即症状已清、根因未动。
- `gh api repos/bluearchive-cafe/frontend-new` → `security_and_analysis.dependabot_security_updates.status = "disabled"`；`.github/dependabot.yml` 只有 weekly version updates。
- 同一根因在 2026-09-13 也发生过一次（旧报告基线即因此冻结 4 个提交）。

**Impact**
公告发布 → 所有 PR 与部署同时红灯 → 紧急内容/修复无法上线；单人维护无绕过路径，也没有自动开升级 PR 的机制。`sharp`/`undici` 属 devDependency 或传递依赖，真实漏洞暴露面小，代价是纯流程性的——但这正是它反复咬人的原因。

**Recommendation**
1. 打开仓库的 **Dependabot security updates**（与现有 weekly 版本更新互补：公告即开 PR）。
2. 若希望进一步降低阻塞面：把 `npm run audit` 从 PR/部署门禁改为"告警 + 每周专门的 audit job"，让 moderate 级公告不冻结发布；或保留门禁但加 `--audit-level=high`。

**Recommendation validation**: Verified（设置项状态由 API 实测；门禁失败位置由 CI 日志实测；同法已两次成功恢复）。

**Suggested guard**: Dependabot security updates——"公告 → lock PR → 门禁恢复"的最小闭环。这是本次审计唯一"改一次设置就永久消除一类阻塞"的动作。

## Medium Priority Findings

### AUD-OPS-001 — SPA 回退策略把所有缺失资源变成 200 HTML（软 404）

- Category: architecture / ops ｜ Severity: Medium ｜ 置信 95 ｜ status: **partial**（构建期守卫 `45887d5` + 策略已改 `404Page`，**待部署后实测状态码**）｜ disposition: Architecture Decision

**Evidence**
- 原配置：`esa.jsonc` `assets.notFoundStrategy: "singlePageApplication"`。
- 实测 `https://bluearchive.cafe/definitely-not-a-page-xyz` → `200 text/html`（任意缺失路径皆然，见 AUD-SEO-001 的 `/favicon.jpg`）。
- 构建期确实为已知路由生成了静态回退页（`scripts/create-pages-fallback.mjs`），因此 SPA 回退只对"本不该存在的 URL"生效。
- 运行时 `NotFoundPage` 会由 `applyRouteSeo` 补 `noindex, follow`（`src/shared/site-routes.mjs:95-100`），但这依赖 JS 执行。

**官方文档核实（2026-10-29，维护者提供 ESA Pages `esa.jsonc` 文档）**
- `notFoundStrategy` 只有三个取值：不配置（默认模式）、`singlePageApplication`、`404Page`。**没有"仅对非资源路径回退"这一档**——原报告设想的第三种策略不存在。
- 文档描述的 SPA 流程本应对"非导航请求"（不带 `Sec-Fetch-Mode: navigate`）跳过回退、落到"无 ER 函数 → `404 Not Found`"。**线上实测不成立**：同一缺失路径在 `Sec-Fetch-Mode` 分别为缺失 / `navigate` / `no-cors` / `cors` 四种情况下全部 `200 text/html`；缺失的 `.png`（带 `no-cors` + `Accept: image/*`）与缺失的 `.js`（带 `cors`）同样返回 200 HTML。即当前边缘是**无条件兜底**，比文档更宽松——这正是断链能长期静默存活的原因，也推翻了"资源请求天然会 404"的假设。
- `404Page` 的语义在文档里**自相矛盾**：参数表写"返回 `404.html` 文件及 `404 Not Found` 状态码"，而"静态站点生成"流程小节第 2.1 步写"响应 `200 OK` 并且返回 `/404.html` 内容"。因此本条的最后一环不能靠文档断定，必须在部署后实测。
- 附带事实：Pages 默认开启自动尾部斜杠（`/about` → 307 → `/about/`，实测一致），对三种策略都生效，与本次改动无关。

**Impact**
三类后果：(a) 缺失的图片/字体/JS 返回 200 HTML，浏览器按图片解码失败 → 破图而非可观测的错误，`<img>` 的 `onerror` 也不会触发；(b) 错拼路径与已删内容都是软 200，不执行 JS 的抓取器与链接检查工具看不到 404；(c) 边缘会把错误响应按资源类型长时间缓存（本例 30 天）。

**Recommendation（已按文档落地）**
`esa.jsonc` 改为 `notFoundStrategy: "404Page"`。前提是**每条路由都已静态化**，这一点已核实：dist 里 11 个 HTML 覆盖 `/` + 4 个静态路由 + 5 篇已发布文章 + `404.html`（`getSitemapRoutes()` 与 `create-pages-fallback.mjs` 同源，含 `/news/` 别名所需的 `dist/news/index.html`），所以 `404Page` 不会打死任何正常页面的深链；而未 materialize 的路径会拿到 `dist/404.html`（正是品牌化 404 页，`noindex, follow` 已在静态 HTML 里写好，不再依赖 JS）。GitHub Pages 那条通道本来就用同一份 dist 与原生 404 行为，改后两通道语义一致。
为守住这个前提，`scripts/verify-dist-assets.mjs` 增加第二段检查：`getSitemapRoutes()` 的每条路由必须在 dist 里有对应 `index.html`，且 `404.html` 必须存在，缺失即构建失败——`404Page` 之后"漏生成一个路由文件"的代价从"客户端仍能接管"变成"真 404"，必须在下构建前拦住。当前输出 `Verified local asset references across 41 built files and 11 static route files.`。反向验证：删掉 `dist/404.html` 后脚本以 `Sitemap routes without a static file in dist (404Page would 404 them for real): - 404.html` 失败退出码 1（`404.html` 与路由文件走同一段 filter，路由缺失分支由 `dist/status/index.html` 的删除实测触发过，只是先被前一段资产检查捕获）。

**残余（需要部署才能收口，仓库内无法再推进）**
1. 推送 + 部署后实测三件事：缺失资源是否真返回 404（而非文档流程小节说的 200）、`/404.html` 的状态码、深链正常路由仍 200。
2. 旧的 30 天错误缓存不会因为改配置而消失——**需要主动 purge**，否则已缓存的软 200 会继续服务一段时间。
3. 运行时动态拼出的 URL（hero 随机图、外部图片代理）仍不被构建期检查覆盖，这是本次改动天然的边界，不是回归。

## Low Priority Findings

### AUD-ARCH-001 — 模板里的 `elevation`/`bg-color` props 被全局样式架空
置信 90 ｜ Document 或删无效 props。证据：实测页面上不存在 `.v-card--elevated` 类；`global.css:250-252` 的 `.v-card{border:0; box-shadow: var(--md2-elevation-card)}` 未分层，恒胜 Vuetify 4 的 `@layer` 样式，故 `elevation="1"`（`NewsSection.vue:15/37`、`NotFoundState.vue:2`、`DownloadPage.vue:15`、`NewsPage.vue:33/61`）与 `elevation="4"`（`AppHeader.vue:2`）不产生任何效果；`bg-color="transparent"`（`src/pages/AboutSection.vue:31/60`、`DownloadPage.vue:132`）被同规则块的 `background: var(--color-card-soft) !important`（`AboutSection.vue:250`、`DownloadPage.vue:419`）反杀。全仓 `!important` 23 处（`src/` + `index.html`，本次复核修正原报的 43——原计数不可复现）。影响：读模板会得出与渲染相反的结论。`main.ts:106-108` 已为按钮/卡片圆角写过同类说明（"单一来源在 settings.scss 与 global.css"），建议把 elevation 一并写进去。本轮未动：这是"改写注释"还是"删 props"的决策，删 props 会改变语义但不改变渲染，需要维护者表态。

### AUD-ARCH-002 — 关于页真实视图在 `components/`，与自家分层规则不符（部分解决）
置信 92 ｜ status: **partial**（视图已归位 `3a71999`，文档清单仍缺）。原证据：`src/pages/AboutPage.vue:1-8` 只是 `<AboutSection />` 的转发，真实视图（`<h1>关于本站</h1>`、三个 section、对话框、约 250 行样式）在 `src/components/AboutSection.vue`，唯一消费者就是 AboutPage；规则见 `AGENTS.md`「Put route-level views in `src/pages/`, reusable UI in `src/components/`」。
本轮已做：`git mv` 到 `src/pages/AboutSection.vue`（相似度 100%，无内容改动），并同步 3 处引用（`AboutPage.vue`、`tests/dialog-focus.test.ts`、`tests/md2-routes.test.ts`）；`/about` 已浏览器实测渲染正常、恰 1 个 `<h1>`。
余下未做：`AGENTS.md` 的结构清单完全没提 `src/shared/` 与 `tests/`，而 `src/shared/` 恰是浏览器与构建脚本双消费的最敏感层（`README.md` 有列）。改 `AGENTS.md` 是项目规则文档变更，应由维护者确认措辞，故本条保持 open。

### AUD-TEST-001 — 空过断言与示例内容耦合；高 churn 组件无同级测试（部分解决）
置信 85 ｜ status: **partial**（`cc1f238` 解决前半，后半仍 open）。
已解决的前半：`src/content/news.test.ts` 原先在全部文章都 `pinned` 时直接 `return`，此时该用例只剩长度断言即算通过；且 `:20-23` 写死依赖 `hello-world` 这篇示例稿（`src/content/news/hello-world.md:8` 是 `draft: true`、正文自述"可以编辑或删除"）——删示例即测试变红，且只有 `generate:news:dev` 产物能满足。现在改为：置顶区用 `slice(0, pinnedCount)` / `slice(pinnedCount)` 双向断言"前缀全置顶、后缀全不置顶"，两个分组各自再断言 `publishedAtTimestamp` 倒序；slug 从 `newsArticles[0]` 取，不再点名任何具体文章。
**余下的后半**：近 6 月 churn 最高的 `HeroSection.vue`（23 次）、`NewsSection.vue`（19 次）与 `toolbar-loader.ts` 无同名测试，与 `AGENTS.md`「add focused tests beside changed utilities」的要求不符。给这三处补测试需要先定义"断言什么"（hero 的随机选图与 srcset 契约、新闻卡排序/空态、工具条加载的写入-清理配对），是成工作量项，不是顺手改。
反例（强度合格，可作为写法参考）：`tests/dialog-focus.test.ts` 6 例真断言焦点归还、`src/utils/status.test.ts:65-94` 覆盖超时/外部 abort/已 abort 竞态、`scripts/static-html.test.mjs:34-49` 真断言 JSON-LD 转义。

## 各领域观察

**架构**：分层总体清晰，`src/shared/*.mjs` 作为浏览器/构建双消费契约层的设计是对的——`tsconfig.json:10,22` 与 `tsconfig.node.json:10,22-23` 都对 `src/shared/**/*.mjs` 开了 `checkJs`，所以**类型确实被编译期校验**（这是上次报告未覆盖的正面事实）。两条 SEO 消费路径共用 `applySeoToDocument`，meta/canonical 不会漂移。原报的两处真实弱点已闭环：日期格式（AUD-SEO-002 → `0da6207`，`publishedAtDateTime` 单一来源）与同一事实两处写法（AUD-MAINT-004 → `e5a4dd1`，平台清单/图标 alias 两条契约）。仍值得盯的是 `utils/toolbar-loader.ts:3-13` 是模块级可变单例（页面写、头部读，无 provider 约束），当前只有 `StatusPage` 一个写入方且有 `:176-178` 清理，暂不构成缺陷，但增加写入方时容易漏清理导致进度条卡死——这也是 AUD-TEST-001 余下那半（无同级测试）真正该补的位置。

**样式/主题**：亮暗双主题实现是**双轨**的——Vuetify `defaultTheme: 'system'`（`main.ts:100`）驱动 `--v-theme-*`，`global.css:137` 的 `prefers-color-scheme` 驱动派生 token。实测两侧当前同步（`:root` 上 `--v-theme-background: 18,18,18` 与派生 `--color-bg: rgb(18,18,18)` 一致），亮色块覆盖了所有文字/阴影/罩色 token，未发现单侧失配导致的可读性事故。风险在于**将来加手动切换开关时 media query 侧不会跟随**——这是需要记录的前提约束。组件层硬编码十六进制仅 3 处（`HeroSection.vue:64-66` 里 `#29aeea` 复刻了 `theme.ts:6`、`global.css:66` 与 `index.html:6` 的 `#191d24` 已在注释里自认需手工同步），治理水平高于同类项目。
本轮 token 治理（`98700ac`）：删除 18 个零消费 token（原报 17，复核时又多找出一个 `--md2-duration-short`；其中 `--color-success-border-strong` 差点被误删——它以字符串字面量形式被 `src/content/status-resources.ts` 动态消费，探针扩到识别 `'--x'` 字面量后才排除）；页宽与阅读宽收敛到 `--container-page`/`--container-reading` 两个 token，10 个模板的 `max-width="1120"`/`"860"` 字面量全部替换，并由 `tests/css-token-contract.test.ts` 断言"模板里出现的每个容器 `max-width` 必须是 `var(--…)` 形式"。`global.css` 的 token 定义行号因此整体前移，本报告中所有 `global.css:` 引用已按当前文件复核。

**动画**：`3c5edf3` 的修复经确认是完整的——`App.vue:11` 的 `:key="route.path"` 让同页锚点不再重挂载，`:26` 的 `inert` 阻断离场页交互与焦点，`:80-85` 用同格 grid + 离场 absolute 避免两页上下堆叠，`App.test.ts` 有回归断言。全站动画只动 `transform`/`translate`/`opacity`，无 `height`/`top`/`box-shadow` 重排型过渡。`prefers-reduced-motion` 有全局兜底（`global.css:404-417`）+ 9 处组件级 `animation: none`（冗余但无害），`router.ts:54` 的锚点平滑滚动也读了该媒体查询。JS 侧清理无泄漏：`FloatingScrollHint.vue:23-27` passive 监听 + 卸载移除、`NewsArticlePage.vue:100` medium-zoom detach、`StatusPage.vue:195-199` 定时器 clearTimeout。
原报的唯一失效项 AUD-UI-001 已修（`17e86b2`：`global.css:372-375` 的 `animation` 简写去掉非法角度分量，`easter-egg.ts` 那条整串非法的内联赋值直接删除——它从未生效过，时长与尺寸仍由 `readCssDurationToken`/`readCssPixelToken` 提供），`tests/easter-egg-animation.test.ts` 现在静态断言简写里不再混入 `var(--ee-rot)`。**新观察（不另立发现，属同一条的残留）**：`--ee-rot` 至今没有任何 `setProperty` 写入点，只在 `@keyframes` 的 `rotate: var(--ee-rot, -8deg)`（`global.css:388/394/400`）里被消费，因此彩蛋贴图永远转到同一个 `-8deg`——这是一个已经失效的旋钮，而 `:366` 的注释还宣称"旋转由 `--ee-rot` 覆盖"。要么接线、要么删掉这条注释与变量。

**可访问性**：`skip-link`（`App.vue:3`，实测 z-index 2500 高于所有浮层）、`:focus-visible` 全局 3px 轮廓（`global.css:293-296`）、抽屉焦点归还（`AppHeader.vue:100-110`）、对话框焦点归还与 Escape（`tests/dialog-focus.test.ts` 6 例）、`aria-expanded`/`aria-controls`/`aria-label` 均在位。实测 5 条路由无横向溢出、无缺 `alt` 的 `<img>`、每页恰 1 个 `<h1>`。已知小项：`v-progress-linear` 路由加载条无 `aria-live`，屏幕阅读器用户感知不到导航进行中；`--type-meta` 在 ≤1023px（`global.css:206`）与 ≤640px（`:223`）都降到 `--md2-type-caption`（12px），中文日期/字数在手机上偏小——这是 MD2 caption 规范值，属风格决策，未列发现。

**z-index 体系**：app bar 1006 < scroll-hint 1200 < medium-zoom 2400 < skip-link 2500 < 彩蛋 3000，且 medium-zoom 只在文章页、对话框只在下载页，实测无同页叠置冲突。

**性能**：`npm test` 11.10s（43 文件 216 例）；页面级懒加载；hero 三档 WebP srcset 与 `sizes` 和 CSS 宽度一致（`HeroSection.vue:7` ↔ `:162-172`）；`index.html:14-16` 对 jsdelivr/GA 做了 preconnect。两处值得记录的开销：`AppHeader.vue:157-163` 的固定应用栏用 `backdrop-filter: blur(10px)` + 半透明 surface，滚动时每帧合成，低端安卓机代价明显；`HeroSection.vue:56-60` 每次加载随机选 hero 图，无法命中确定性缓存。未见用户可见热路径问题。构建产物主包 `index-*.js` 36.02 kB（gzip 15.48 kB）+ `vuetify-*.js` 312.97 kB（gzip 107.97 kB），本轮改动对包体无可见影响。

**依赖/供应链**：`npm audit` 0 漏洞（当前）；CI 全部 `npm ci`，lock 一致性由 CI 强制；`vite-plugin-vuetify` 已归位 devDependencies（`43b4c3e`，AUD-DEP-002），`npm ci --omit=dev` 语义恢复正确。GitHub Actions 仍按主版本浮动 tag 引用未 pin SHA（顶层 `contents: read`、仅 deploy job 提升权限，攻击面可控）。`gh api` 实测 `secret_scanning: disabled`、`dependabot_security_updates: disabled`——对一个公开静态站前者无所谓，后者见 AUD-DEP-001，是本次唯一需要仓库外权限才能修的高危项。

## 已解决

本轮 19 个修复提交（`9a985f6`…`9139578`）关闭下列 15 条发现。**每条新守卫都做过反向验证**（把被守护的东西改坏，确认测试真的变红），因为一条永真的断言比没有断言更危险。

### 原 Medium

- **AUD-SEO-001 — og:image / JSON-LD logo 指向不存在的图片**（`9a985f6`，待部署）：新增 `public/og-image.png`（1200×630，取自站点自有横幅 `hero.png`），`site-routes.mjs:4` 的 `defaultImage` 改指它，`seo.mjs:134` 的硬编码收敛到 `defaultImage`。选 `public/` 根而不是 `favicon.png`（192×192）或 `hero/optimized/*.webp`：前者尺寸即 og 标准、PNG 抓取器支持面最广，且不受 `prune-dist-hero-originals.mjs` 清理、也不在 gitignore 的构建产物目录里。守卫两条（`scripts/site-routes.test.mjs` 断言文件真实存在，`src/shared/seo.test.ts` 断言 `og:image`/`twitter:image`/Organization logo 全等于 `defaultImage`）。**换 URL 即绕开旧的 30 天错误缓存，无需 purge**。构建产物已核对：`dist/og-image.png` 存在，10 个回退页与 `404.html` 的 `og:image` 与 JSON-LD `logo` 均指向它，`favicon.jpg` 在 dist 中 0 引用。
- **AUD-SEO-002 — 机器可读日期非 ISO 8601**（`0da6207`）：`buildArticleSeo` 与 `buildArticleSchema` 改用 `publishedAtDateTime`（`src/shared/seo.mjs:81/115`），该字段一并进入 `projectNewsEntries`（`scripts/news-content.mjs:125`）与 sitemap 条目（`scripts/site-routes.mjs:25`），三个 typedef 都补齐；`publishedAt` 降级为"给人看的展示值"并在注释里写明。守卫：`src/shared/seo.test.ts` + `src/utils/seo.test.ts` 断言 `datePublished`/`article:published_time` 匹配 ISO 正则，`scripts/site-routes.test.mjs` 断言构建期回退页同样输出 ISO 值。反向验证：把 `seo.mjs` 改回 `article.publishedAt` 即红。
- **AUD-CONTENT-002 — frontmatter 写错即按"可发布"处理**（`259e794`）：`parseFrontmatterRaw` 现在跳过 `#` 注释行，`news-content.mjs` 对 7 个已知键之外的键直接 throw（`has unknown frontmatter key: …`），`pinned`/`draft` 走新的 `parseBooleanFlag(value, key, filePath)`——无法识别的值抛错而不是静默当作 `false`。效果：`Draft:` 大小写笔误、`draft: true # 待补`、键名拼错全部在 `npm run build` 阶段硬失败，与 `publishedAt` 的严格程度对齐。守卫 3 例（未知键 / 非法布尔值 / 注释键）。
- **AUD-MAINT-002 — JS 消费的 CSS token 无契约测试**（`93ad903` + `98700ac`）：新增 `tests/css-token-contract.test.ts`，从 `global.css` 解析 `:root` 声明集合、从 `src/utils/css-tokens.ts` 提取字面量参数，断言每个被消费的 token 都有定义，并额外用一条不依赖扫描结果的硬名单守住 4 个崩溃关键 token（`--app-bar-height`/`--anchor-offset`/`--ee-sticker-size`/`--ee-sticker-duration`）——扫描正则一旦失效，这条仍会响。同文件第三个用例见 AUD-MAINT-003。同轮把 `tests/md2-theme.test.ts` 里指向死 token 的断言（`--md2-type-h1: 96px`，该 token 已随 MAINT-003 删除）改到仍在用的 `--md2-type-h3: 48px`，"测试保护了没人用的"这半句因此不再成立。反向验证：从 `global.css` 删掉 `--anchor-offset` 定义即变红。守卫落点选 `tests/` 而非 `src/`：`src/**/*.ts` 走 type-aware lint 且 `tsconfig.json` 无 node 类型，读文件的守卫在 `src/` 里会同时踩 TS2591 与 11 个 `no-unsafe-call`。
- **AUD-UI-002 — 文章代码块与页面同色**（`8ff0c8f`）：`--markdown-pre-bg` 从 `var(--color-bg)` 改指 `var(--color-neutral-softer)`，并在注释写明原因（暗色主题 background 与 surface 同为 `#121212`，只有 neutral-softer 混合档能在两套主题下都比底色亮一档）。未采用原建议的 `--color-surface-raised`——它经复核是零消费死 token，已在 `98700ac` 删除；改用同文件已在用的表格隔行色，避免为单个场景新增 token。
- **AUD-MAINT-004 — 加一个下载平台要改 5 处、其中 2 处不报错**（`e5a4dd1` + `bc0bfb3`）：两条契约守卫。`src/content/downloads.test.ts` 解析 `staticRoutes` 里下载页 description 的平台串，与 `platformLinks` 的非 hidden 名单做集合相等断言（`site-routes.mjs` 是 `.mjs`、被裸 `node` 加载，永远不能 import `downloads.ts`，所以只能在测试期对账而非运行时派生）。`tests/icon-alias-registration.test.ts` 双向校验：模板/脚本里用到的 `$xxx` 图标别名必须已在 `main.ts` 注册；反向（注册了但没人用）也查，唯一豁免是 `menu`——它是 Vuetify `VAppBarNavIcon` 的内部默认值，文本扫描看不见，已写成带注释的显式白名单而不是砍掉这个方向。反向验证当场抓到真死代码：`lightningBolt` 从未被引用，已在 `bc0bfb3` 删除。反向验证 description 过期：改回旧平台串即红。
- **AUD-HERO-001 — hero 名单与源图无校验**（`834b80a`）：`tests/hero-images.test.ts` 断言 `hero-images.json` 无重复名，且每个名字在源目录里恰有一个对应文件。方向是刻意单向的（名单 → 源文件），反向会让临时素材无法入库。
- **AUD-CONTENT-001 — 清洗白名单静默丢弃合法作者语法**（`3889ca3`）：维护者拍板**不收宽白名单**，因此 inline `style`、表格对齐、`<details>/<summary>`、`<iframe>/<video>`、`language-*` 代码类继续被丢弃——但不再静默。`scripts/news-sanitize.mjs` 新增 `describeDroppedStructures(rendered, sanitized)`，按开标签统计标签名、`标签|属性名`、class 词元的出现次数并做前后差集，`readNewsArticles` 据此逐文件 `console.warn`（**提示，不 fail 构建**，因为丢弃本身是安全侧的有意行为）；属性名与类名统一小写比对，避免 `viewBox`→`viewbox` 这类 sanitize-html 规范化被误报成丢弃。`README.md` 新增「支持的作者语法」：8 行受支持写法表格（其中明确标注表格对齐与语言类**不生效**）+ 明确不支持清单 + frontmatter 键值约束。`example-article/index.md` 原本演示的 `style`/`<iframe>`/`<details>` 改成"这些不要用"的反例说明——这是必须的：`npm run lint` 与 `npm run typecheck` 都跑 `generate:news:dev`（含草稿），示例一旦触发告警就会每次执行都刷屏。**两处偏离原样**：(1) 白名单实际加了一个 token `contains-task-list`——它不是作者语法，而是 markdown-it 任务列表渲染自己注入的，漏在 `allowedClassNames` 外会让每篇带勾选框的文章都触发告警，另两个同族类名本就在列；(2) `news-markdown.mjs:104` 的告警图标 SVG 上 `data-component="Octicon"` 全仓零消费，选择从源头删掉而不是放行，否则每篇带告警块的文章白送 5 条假告警。守卫 5 例（`describeDroppedStructures`：受支持语法零丢弃 / `<details>` / `th style` / `language-js` / `viewBox` 假阳性）。反向验证：告警实跑触发过一次，文件名与计数正确；把 `contains-task-list` 从白名单删掉即出现误报。原证据里的 `style` 精确放行方案（按 `text-align` 白名单）随本决策作废。

### 原 Low

- **AUD-UI-001 — 彩蛋贴图动画完全失效**（`17e86b2` + `93ad903`）：见"动画"段。`animation` 简写去掉非法角度分量后 `@keyframes` 恢复生效，`easter-egg.ts` 里那条被 CSSOM 整条丢弃的内联赋值删除。静态守卫 `tests/easter-egg-animation.test.ts` 断言简写里不再出现 `--ee-rot`、且 `@keyframes easter-egg-sticker` 仍存在（jsdom 不实现动画，运行时断言做不到）。
- **AUD-MAINT-003 — 18 个零消费 token、页宽 8 处硬编码**（`98700ac`）：删除 18 个死 token（原报 17，复核又多找出 `--md2-duration-short`；`--color-success-border-strong` 差点被误删——它以字符串字面量被 `status-resources.ts` 动态消费，探针扩到识别 `'--x'` 后才排除），并修正两处随之失真的注释（overlay dp 阶梯表、elevation 阶梯里从未接线的"抽屉 16dp"）。页宽收敛到 `--container-page: 1120px` / 新增 `--container-reading: 860px`，10 个模板的 `max-width="1120"`/`"860"` 字面量全部替换成 `var(--…)`——Vuetify 的 `convertToUnit` 对 `Number()` 得 NaN 的字符串原样返回，因此 `max-width="var(--container-page)"` 会渲染成内联 `max-width: var(--container-page)`，这条依赖已在 `node_modules/vuetify/lib/components/VGrid/VContainer.js` 核实。守卫在 `tests/css-token-contract.test.ts` 第三个用例：收集所有 `<v-container>` 的 `max-width` 字面量，断言数量 ≥8（防扫描空转）且每个都匹配 `/^var\(--[\w-]+\)$/`。浏览器实测宽度未变（首页容器 computed 仍 `1120px`，404 与文章页 `860px`）。
- **AUD-DEP-002 — `vite-plugin-vuetify` 分类错误**（`43b4c3e`）：移入 devDependencies，lock 同步。
- **AUD-MAINT-001 — 字体版本双源**（`5cd7fb4`）：`tests/font-version-parity.test.ts` 从 `fonts.scss` 抽出 jsdelivr 的 `@scope/name@version` 钉版，与 `node_modules/<pkg>/package.json` 的实装版本逐一比对；同时断言钉版集合恰好是那两个 noto 包（漏加第三条 CDN 依赖会被抓到）、且每个包都在 package.json 里声明。Dependabot 升 package.json 而忘改 CDN URL 时，这条测试变红。
- **AUD-TEST-001（前半）— 空过断言与示例内容耦合**（`cc1f238`）：见该条正文。
- **AUD-UI-003 — 下载页平台卡 hover 三条死声明**（`38228dd`）：维护者拍板"删掉三条空声明，不加 hover"，与关于页信息卡（`b164393`）统一为静态视觉。删除 `.platform-card` 的 `transition` 声明与整条 `@media (hover: hover) and (pointer: fine)` 规则（原 `:491-497`）。三条各自的问题：`border-color` 无 border 可改（`global.css:250` 的 `.v-card{border:0}`，组件自身未声明）；`box-shadow: var(--md2-elevation-card)` 与静止态实测同值，写它反而把卡片阴影按回静止档位；`transform` 过渡没有对应的 hover 规则。浏览器复核：`/download` 5 张卡 computed `border-width: 0px`、阴影与改动前逐字节一致、`transition` 只剩 Vuetify 自带的 `box-shadow, opacity, background, --v-elevation-overlay`。删除未产生新的零消费 token（`--color-border-hover`、`--md2-elevation-card` 另有消费方）。
- **AUD-ARCH-003 — `main.ts` 的 www 重定向不短路**（`3fe7900`）：维护者在三个修法里选了"保留语句位置 + `replace` 后短路挂载"。`shouldRedirectToApex` 的结果存进 `redirectingToApex`，`printConsoleBrand()`、`enableClickSound()` 与整条挂载链收进 `if (!redirectingToApex)`；Vuetify 配置抽出为 `const vuetifyOptions: VuetifyOptions`（`VuetifyOptions` 确为 `vuetify` 导出，已在 `node_modules/vuetify/lib/framework.d.ts:2874` 核实），这样 60 行配置字面量不必跟着缩进、diff 只剩首尾。注释如实写明"ES Module 先求值 import，跳转流量仍会付出这一趟已下载的模块图"，把原注释"before any app initialization"的假象改掉。守卫 `tests/apex-redirect-short-circuit.test.ts` 三条：跳转检查早于文件里第一条 `^import `；`!redirectingToApex` 块内含 `createVuetify(`、`.mount('#app')`、`printConsoleBrand()`；顶层不再存在裸的 `createApp(` / `const vuetify = createVuetify(`。选静态源码形状断言而非 jsdom 运行时断言：`main.ts` 一旦在测试里 import 就会执行整张应用图。反向验证：把条件改成 `if (true)` 即红。浏览器复核非跳转分支仍照常挂载并打印 console brand。
- **AUD-HOUSE-001 — `.repository-audit/` 既未跟踪也未忽略**（`9139578`）：维护者选**全部忽略**，`.gitignore` 加 `.repository-audit/`。代价与收益都要写清：台账（`findings.json`、`audit-state.json`、`repository-map.md`）、复现脚本、日志与截图从此绑定本机，换机器或换人无法延续增量审计基线；换来的是 `git add -A` 不再可能把 460 KB 截图与机器相关路径提交进公开仓库，而仓库内唯一需要跨机读的载体是根目录的 `CODEBASE_AUDIT.md`——本报告已把每条发现的证据抄进正文，不依赖台账路径。

### 上次报告遗留

- **AUD-DEP-001 的症状**：`package-lock.json` 现解析 sharp 0.35.5 / vitest 4.1.12，本机 `npm audit --audit-level=moderate` 退出码 0，`f397646` 部署成功。根因（无自动修复路径）保持 open，见上。
- **"main 领先生产产物 N 个提交"**：`gh run list` 确认最新两次部署 success，发布通道当前正常。
- **页面切换跳变与锚点重复入场**（`3c5edf3`）：本次以 `App.vue:11/26/80-85` + `App.test.ts` 回归确认修复完整，未列发现。

## 建议优先级

仓库内可机械闭环的部分与待决策项都已清空（上一版的 3 项决策已全部落地），剩下的按"需要一个动作"排序：

1. **打开 Dependabot security updates**（仓库设置，一次点击）——AUD-DEP-001 是唯一 High，也是唯一无法在仓库内修的动作；不开，第三次复发只是时间问题。
2. **部署并实测 ESA 回退**（AUD-OPS-001）——`esa.jsonc` 已改为 `404Page`，仓库内可做的都做完（含"每条路由都必须已静态化"的构建期守卫）。推送后要核三件事：缺失资源是否真 404（官方文档的参数表与流程小节互相矛盾）、`/404.html` 的状态码、正常深链仍 200；旧的 30 天软 200 缓存**需要主动 purge**，不会因改配置消失。
3. **对 `elevation`/`bg-color` 表态**（AUD-ARCH-001）——删 props（改语义、不改渲染）还是在 `main.ts:106-108` 的注释里写明它们无效。仓库内唯一还卡着人工决定的条目。
4. **两个可直接代做的收尾，等一个"go"**：把 `src/shared/` 与 `tests/` 补进 `AGENTS.md` 结构清单（AUD-ARCH-002 余下部分）；给高 churn 的 `HeroSection`/`NewsSection`/`toolbar-loader` 补同级测试（AUD-TEST-001 后半）。
5. **可选的小活**：处理 `--ee-rot` 这个从未接线的旋钮（接线或删注释与变量）；把 `v-progress-linear` 加 `aria-live`。都不紧急，适合和下一次功能改动一起做。
6. **作者侧**：新告警只在 `npm run build` / `generate:news:dev` 时打印，写文章时若看到"有写法被清洗规则丢弃"，按 `README`「支持的作者语法」改写即可。表格对齐与语法高亮类名不在支持范围内，需要单独再提决策。

**部署提醒**：`9a985f6` 起的 19 个修复提交尚未推送，`og:image` 与机器可读日期的线上修复都要等下一次 deploy 才生效；换 URL 已绕开旧的 30 天错误缓存，无需 purge。`.gitignore` 新增的 `.repository-audit/` 只影响本机，不需要清理历史。

## 审计方法与局限

**实际执行**（Windows 10 / Git Bash / Node 24，日志在本机 `.repository-audit/checks/`）：审计当时 `npm test`（38 文件 197 例全通过）、`npm run lint`、`npm run typecheck`、`npm audit --audit-level=moderate` 均退出码 0；`npm run dev` 起 Vite 于 `127.0.0.1:5173`。**修复后的当前状态复核**（至 `9139578`）：`npm test` 44 文件 224 例通过（11.10s）、`npm run lint`、`npm run typecheck`、`npm run build`（含新增的 `verify-dist-assets.mjs` 末步，41 个产物文件校验通过）均退出码 0；`npm run generate:news:dev` 输出 7 篇文章且**无任何清洗告警**（示例稿清理后才能保证这一点，见"已解决" AUD-CONTENT-001）。

**守卫的反向验证**：本轮新增的每条静态/契约测试都做过"把被守护对象改坏 → 确认变红 → 改回"的负向验证，覆盖彩蛋 `animation` 简写、图标 alias 注册、字体 CDN 钉版漂移、产物资产存在性、下载页 description 过期、容器宽度字面量回归、www 跳转短路（改成 `if (true)` 即红）、清洗丢弃告警（真实触发过一次，文件名与计数正确；把 `contains-task-list` 移出白名单即出现误报）。这一步不是形式：第一次写"页宽不再硬编码"的断言时，我的正则扫到 0 条也会通过，是靠数量下限（`>= 8`）才暴露的；`describeDroppedStructures` 第一版则反过来，在"受支持语法应零丢弃"的夹具上直接报出 `contains-task-list`，那是真 bug 而不是断言写错。

**运行时实测**（browser-use 驱动 Chromium，视口宽 831px）：`:root` 主题变量解析、CSS token 定义/引用全量扫描（含懒加载路由的静态复核）、5 条路由的横向溢出/`h1`/`alt`/小字号巡检、彩蛋贴图 `?kuyashi=1` 强制触发并读取 computed animation、文章页 `pre` 与 body 背景色比对、`.platform-card` 边框与阴影比对、`.v-card--elevated` 存在性。页宽 token 化之后，首页容器 computed 宽度、404 与文章页的 `860px`、以及 `/about` 迁移后的渲染都重新在浏览器里核过。批次 D 之后再复核一次：首页仍 `mounted: true`、4 个容器 computed 宽度 `1120px`；`/download` 5 张卡的 `border-width: 0px`、阴影逐字节不变、`transition` 只剩 Vuetify 自带项；控制台仍有 brand 输出，等于证明非跳转分支的 `printConsoleBrand()` 与挂载没被短路掉。跳转分支本身只改了挂载条件，未在 `www.` 域名下实测。

**外部核实**：`gh run list` / `gh run view --log-failed` 读取部署失败步骤；`gh api` 读取 `dependabot_security_updates` 与 secret scanning 状态；`curl -D-` 验证线上 `/favicon.jpg`、`/favicon.ico` 与随机路径的响应码与 Content-Type。ESA 回退行为按 `Sec-Fetch-Mode`（缺失 / `navigate` / `no-cors` / `cors`）× 路径形态（无扩展名、`.png`、`.js`、`/favicon.jpg`）做了矩阵实测，并核到正常路由 `/about` → 307 → `/about/` → 200 的尾部斜杠行为；结论是兜底与导航头无关，一律 200 + HTML。

**复现脚本**（本机 `.repository-audit/checks/`，未入库；结论已全部抄写进正文）：`.repository-audit/checks/repro-sanitize.mjs`（清洗丢弃合法构造）、`.repository-audit/checks/token-usage.mjs`（零消费 token）。

**局限**：
1. **未能实测亮色模式渲染**——当前浏览器工具无法翻转 `prefers-color-scheme` 仿真，亮色结论全部来自 token 定义与源码比对。已修的 AUD-UI-002 即属此类：暗色侧 `pre` 与 body 同色是实测，"两主题皆零对比"是推断，改用 `--color-neutral-softer` 后的亮色观感仍需维护者肉眼确认。
2. **未做移动端视口实测**——无法改视口尺寸；响应式结论来自断点/字号 token 的静态分析与 831px 下的实测。建议后续用真机或 DevTools 抽查 390×844 与 768px 两档。
3. 未跑 Lighthouse / axe 自动审计；可访问性结论来自源码 + 有限 DOM 检查，不构成 WCAG 合规判定。
4. 组件层为代表性抽阅（`HeroSection`、`AppHeader`、`FloatingScrollHint`、`src/pages/AboutSection.vue`、`DownloadPage` 局部、`NewsArticlePage` 局部），未逐行读完 393~539 行的 4 个大文件。
5. **ESA 侧仍未在控制台核对**——官方 `esa.jsonc` 文档已由维护者提供，`notFoundStrategy` 的可选值与路由流程已明确，AUD-OPS-001 因此完成了策略选型；但文档自身对 `404Page` 的状态码前后矛盾（参数表说 404，流程小节说 200），而实测已经证明**线上行为不等于文档描述的行为**（SPA 模式下非导航请求并未落到 404）。控制台实际配置、以及 `404Page` 部署后的真实状态码仍需在推送后实测——这是本条唯一未收口的部分。
6. 漏洞结论以 `npm audit` advisory DB 为准，未单独复现任何依赖漏洞。
7. **新增守卫本身也是待观察对象**：`tests/css-token-contract.test.ts`、`tests/icon-alias-registration.test.ts`、`scripts/verify-dist-assets.mjs`、`tests/font-version-parity.test.ts`、`tests/apex-redirect-short-circuit.test.ts` 都用正则/字符串扫描实现，本身会随写法演进失效（例如 `<v-container>` 的属性顺序改变、再有 CDN 依赖换加载方式、`main.ts` 里跳转检查与 import 之间插入新语句）。每条都配了数量下限或硬名单兜底，但不等于免疫。`describeDroppedStructures` 同理：它按开标签扫描，前提是"代码块里的 `<` 已被 markdown-it 转义"——一旦渲染配置改动（例如关掉 `html: true` 之外再引入 raw 节点），统计口径要跟着重审。
8. **台账不在仓库里**：`.repository-audit/findings.json`（21 条，含每条的置信度、disposition、首次发现与关闭提交）只在本机。跨机接手的人只能靠 `CODEBASE_AUDIT.md` 正文，其严重程度与置信度已内联在每条标题行，但逐条的复现日志不可读——这是维护者选择"全部忽略"的已知代价（AUD-HOUSE-001）。
