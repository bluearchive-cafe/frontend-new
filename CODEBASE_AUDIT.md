# 仓库审计报告（当前状态）

> 审计日期：2026-09-13　|　审计基线：`main@ce59c46`　|　模式：full
>
> 按维护者要求，本次为忽略既有报告的全新全量审计：未与 2026-08-14 旧报告对账（旧报告已归档至 `.repository-audit/history/CODEBASE_AUDIT_2026-08-14.md`，仅作背景）。领域覆盖：架构、可维护性、安全、依赖/供应链、测试、性能、CI、Git 历史。仓库地图与风险画像见 `.repository-audit/repository-map.md`，发现台账见 `.repository-audit/findings.json`。

## 结论摘要

仓库健康度：**良好，但发布通道当前被依赖审计门槛阻断**。代码层质量高：内容清洗、SEO 单一来源、请求生命周期、测试形态均有明确契约与守卫，本机验证（test 170/170、lint、typecheck、build）全绿。风险集中在发布链路：一个高危构建依赖公告使 CI 与部署工作流连续失败，main 领先生产产物 4 个提交。

Open findings：**Critical 0 / High 1 / Medium 1 / Low 2**（另含若干咨询级观察）。

需要的决策：无架构级决策；AUD-SEO-001 的长期方案（是否制作专门 og 分享图）与部署恢复后是否补充 Lighthouse 类检查属产品/流程选择。

最重要的风险与行动：
1. **AUD-DEP-001（High）**：`npm audit` 门槛使 deploy-pages 与 PR CI 全红，4 个提交未能部署。`npm audit fix`（sharp 0.35.4、vitest 4.1.11，均在现有 caret 范围内）即可恢复；并启用 Dependabot security updates 防复发。
2. **AUD-SEO-001（Medium）**：`og:image`/`twitter:image`/JSON-LD logo 指向已被 `62a69d4` 删除的 `favicon.jpg`，下次成功部署后所有分享卡片将 404。改指现存资产即可，中期建议专门的分享图。
3. **AUD-DEP-002 / AUD-MAINT-001（Low）**：`vite-plugin-vuetify` 应移入 devDependencies；字体版本存在 package.json 与 CDN URL 双源，建议加一致性守卫。

## High Priority Findings

### AUD-DEP-001 — 依赖审计门槛阻断发布流水线（部署冻结）

- Category: dependencies / CI
- Severity: **High**（发布链单点完全失效；不评级 Critical 是因为站点仍在正常服务、门禁属保守失败而非产物完整性破坏）
- Confidence: 98
- Status: open
- Disposition: Fix

**Evidence**
- 本机复现：`npm audit --audit-level=moderate` 退出码 1，共 3 项：`sharp 0.35.3` **high**（libheif，GHSA-rgj7-g3m4-5g8c / GHSA-g89c-p67h-r497 / GHSA-2jg2-4ch7-h545，修复版 0.35.4）；`vitest 4.1.10 → @vitest/mocker` moderate（修复版 4.1.11）。两者均在 `package.json` 现有 caret 范围内。
- CI 实况（`gh run view 34751970489`）：`Deploy to GitHub Pages` 的 build job 在 **"Audit dependencies"** 步骤（deploy-pages.yml `run: npm run audit`）失败；2026-09-13 三次推送（08:13/10:14/10:29 UTC）全部同样失败。最后一次成功部署为 2026-09-02 16:58 UTC（`24bd3f9`）。`ci.yml` 含同一步骤，PR CI 同样全红。
- main 当前领先生产产物 4 个提交（`21a5d71`、`2716a6c`、`f5063d9`、`ce59c46`，均为用户可见的 MD2 文案/下载页修复）。

**Impact**
- 发布通道中断：任何新提交都无法到达 GitHub Pages；下载页修复滞留。`sharp` 为 devDependency 且仅处理仓库内受信 LFS hero 图，libheif 漏洞实际暴露面小——真正的代价是流程性的。
- 复发模式：9 月 2 日刚以同样方式处理过一次（`e55caf1` 升级 sanitize-html 至 2.17.7 修复审计）。公告发布时间与 Dependabot weekly 周期错位时，门槛必然红且无自动修复路径。

**Recommendation**
1. 立即：`npm audit fix` 更新 lock（sharp→0.35.4、vitest→4.1.11），本机复跑 `npm run audit` 确认退出码 0 后提交推送。
2. 防复发：启用 GitHub 仓库设置中的 **Dependabot security updates**（与现有 dependabot.yml 的 weekly 版本更新互补，公告发布即开升级 PR）；可选：在 audit 步骤失败信息中提示 `npm audit fix` 路径。

**Recommendation validation**: Verified（本地复现失败；`npm audit` 明确给出 in-range 修复版本；该团队 9 月 2 日已用同法成功处置同类问题）。

**Suggested guard**: Dependabot security updates（见上）。这是"公告→lock 更新→门禁恢复"自动化的最小闭环。

## Medium Priority Findings

### AUD-SEO-001 — og:image / twitter:image / JSON-LD logo 指向已删除的 favicon.jpg

- Category: SEO / content
- Severity: Medium
- Confidence: 97
- Status: open
- Disposition: Fix

**Evidence**
- `src/shared/site-routes.mjs:4` `defaultImage = ${siteUrl}favicon.jpg`；`src/shared/seo.mjs:178/182` 将其写入 `og:image` 与 `twitter:image`，`:119`（Article publisher logo）与 `:134`（Organization logo，另有一处硬编码副本）引用同一值。
- 当前构建产物 `dist/index.html` 实际发出 `og:image content="https://bluearchive.cafe/favicon.jpg"`，但 `public/` 与 `dist/` 均无 `favicon.jpg`（仅有 favicon.ico / favicon.png）。
- 根因：`62a69d4`（fix: 修改 favicon.ico，2026-09-02）删除了 `public/favicon.jpg`（及 favicon.svg），未同步更新 SEO 引用。
- 时序说明：该提交尚未部署成功（被 AUD-DEP-001 掩盖），线上当前仍 302/200 到旧产物；下一次成功部署后此 404 立即生效。

**Impact**
- 所有页面的社交/IM 分享卡片无图，JSON-LD Organization/Article publisher logo 404。该站主要传播渠道是社区分享，直接影响触达。

**Recommendation**
1. 短期：`defaultImage` 改指现存资产（如 `${siteUrl}favicon.png`），并把 `seo.mjs:134` 的硬编码 logo 收敛到 `defaultImage` 单一来源。
2. 中期（产品决策）：提供专门的 1200×630 og 分享图；favicon 级尺寸（192px PNG）仅是及线方案。

**Recommendation validation**: Strongly Supported（404 事实已用产物 + 文件系统双重验证；替代图选型需产品确认）。

**Suggested guard**: 契约测试断言 `defaultImage` 对应文件真实存在于 `public/`（构建期或 Vitest 读文件系统即可）。

## Low Priority Findings

### AUD-DEP-002 — vite-plugin-vuetify 依赖分类错误

- Category: dependencies
- Severity: Low / Confidence: 90 / Status: open / Disposition: Fix

**Evidence**：`package.json:31` 将其列于 dependencies；唯一消费点是 `vite.config.ts`（grep 证实 `src/`、`scripts/`、`tests/` 无运行时引用）；同类构建插件 `vite`、`@vitejs/plugin-vue`、`vue-tsc` 均在 devDependencies。

**Impact**：`npm ci --omit=dev` 语义失真、依赖审计面虚增；对纯静态站点无产物级影响。

**Recommendation**：移入 devDependencies 并重新锁定。**Validation**: Verified。

### AUD-MAINT-001 — 字体版本双源可静默漂移

- Category: maintainability
- Severity: Low / Confidence: 85 / Status: open / Disposition: Add Guard

**Evidence**：`src/styles/fonts.scss:7,16` 从 jsdelivr 按 **精确版本** `@fontsource/noto-sans@5.3.0` / `@fontsource-variable/noto-sans-sc@5.3.0` 加载字体文件，npm 包仅提供 SCSS metadata；`package.json` 声明 `^5.3.0`。Dependabot 升级 package.json 不会改 CDN URL，构建不会报错。

**Impact**：metadata 与实际加载字形版本可能静默不一致。（jsdelivr 精确版本 URL 为不可变缓存，供应链风险本身低；`@font-face` 不支持 SRI，故不以此为由报缺陷。字体托管方式近两个月反复过两次——`7912cb2` 回退打包、`24bd3f9` 迁 CDN——属维护者已两次决策的既定方向。）

**Recommendation**：在 fonts.scss 头部注释声明"两处版本必须同步"；加一个小契约测试断言 package.json 的 `@fontsource*` 版本与 CDN URL 版本一致。**Validation**: Strongly Supported。

## 各领域观察（咨询级，不单列台账）

- **供应链**：GitHub Actions 全部按主版本浮动 tag 引用（`actions/checkout@v6` 等），未 pin SHA。工作流权限已最小化（顶层 `contents: read`，仅 deploy job 提升），攻击面可控；如需收紧可 pin 到 commit SHA。npm 安装一律 `npm ci`，lock 一致性由 CI 强制。
- **可维护性**：单一主要维护者（205/224 提交，其余为 dependabot 与协作者），bus factor 1——社区项目属性，记录备查。`tsconfig.node.json` 有意排除 `scripts/**/*.test.mjs`（脚本测试仅 eslint 语法级 + vitest 运行时兜底），可接受。churn 热点（DownloadPage 27 次、StatusPage 20 次、global.css 18 次）与近两周 MD2 收敛迭代吻合，未见 revert 循环异常（字体迁移的两次反转已有决策记录）。
- **性能**：构建 3.32s；`vuetify` 共享 chunk 310KB（gzip 107KB），页面级懒加载，index chunk 32.7KB；hero 图三档 WebP srcset + `display=swap`；状态请求有 10s 超时与 abort 级联。未发现用户可见热路径问题。可选增强：恢复部署后做一次 Lighthouse 基线。
- **测试**：无 flaky 信号（无 sleep/轮询/真实外网/共享可变状态）；fetch 注入 seam、jsdom 按需声明、契约型测试（home-surface 等）服务近期的样式收敛目标。覆盖率无阈值——符合项目规则，未见未防护的关键路径。

## 已验证的优势（Positive Verification）

1. **内容清洗管线**（`scripts/news-sanitize.mjs`）：标签/属性/class/scheme 全白名单、禁 protocol-relative、`target=_blank` 强制 `noopener noreferrer`、非 checkbox 的 input 过滤；全站唯一 `v-html` 消费点（NewsArticlePage）有行内注释说明来源已清洗。
2. **生成管线健壮性**（`scripts/news-content.mjs`）：资产越界双重检查（词法 + realpath）、重复 slug 检测、生成代码经 `JSON.stringify` 转义、占位符替换带未知占位符校验。
3. **SEO 单一实现**：`shared/seo.mjs` 的 `applySeoToDocument` 同时服务浏览器与 JSDOM 构建回退页，meta/canonical/JSON-LD 永不漂移；JSON-LD 序列化转义 `<>&` 防提前闭合 script。
4. **请求生命周期**（`utils/status.ts` + `utils/client-status.ts`）：超时、AbortSignal 级联、过期响应防护、卸载清理、fetch 注入 seam，语义只定义一次。
5. **CI 门禁设计**：最小权限、concurrency 取消、PR 与部署同一组门禁（audit/lint/test/typecheck/build）——正是这道门禁按设计拦下了带漏洞依赖的发布。
6. **路由/SEO 共享契约**：新增静态路由只需两处改动且有测试守卫（router.test / md2-routes）。

## 建议优先级

1. `npm audit fix` → 验证 `npm run audit` → 推送恢复部署（当天可完成）。
2. 启用 Dependabot security updates（仓库设置，一次性）。
3. 修复 `defaultImage` 指向并收敛 `seo.mjs:134` 硬编码（可与 1 同批提交）。
4. `vite-plugin-vuetify` 移入 devDependencies；补字体版本一致性守卫（随手清理）。
5. 部署恢复后抽查分享卡片实际效果，评估是否制作专门 og 图。

## 审计方法与局限

- 验证命令在本机（Windows 10 / Git Bash / Node 24）实际执行：`npm test`（170/170 通过）、`npm run lint`、`npm run typecheck`、`npm run build` 全部退出码 0；`npm audit` 退出码 1（即 AUD-DEP-001）。
- CI 状态经 `gh run list/view` 读取 GitHub Actions 实况（run 34751970489 等）。
- 逐行审阅了入口/路由/SEO/清洗/生成/回退页/状态请求等关键路径与全部构建脚本；组件层为代表性抽阅。未做浏览器端 Lighthouse/可访问性实测，未评估 ESA 通道的线上状态（`esa.jsonc` 仅作配置审阅）。
- 漏洞结论以 `npm audit`（advisory DB）为准；`sharp` 的 libheif 公告影响未单独复现（其输入为仓库受信 LFS 图像）。
