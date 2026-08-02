# 下载与 404 分析事件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 记录精准的下载意图和未知路由，并将真实下载意图配置为 GA4 关键事件。

**Architecture:** `src/utils/analytics.ts` 是唯一 GA4 调用边界；下载页面和路由只在明确时机调用它。该模块只发送归一化字段，且 `gtag` 缺失时无副作用。

**Tech Stack:** Vue 3、Vue Router、TypeScript、Vitest、Vite、GA4。

## Global Constraints

- Node.js 必须为 `>=22.18.0 <23`；不新增依赖。
- 不改变下载链接、路由匹配、页面结构或视觉样式。
- `download_click` 仅代表发起下载，不追踪跨域下载完成。
- 下载事件只发送 `platform`、`variant`、`link_host`；404 事件只发送 `page_path` 和可选 `referrer_host`。
- 不发送完整 URL、查询参数或 hash；不新增重定向。
- 仅在生产环境实际收到 `download_click` 后才在 GA4 标为关键事件；`not_found`、`click`、`purchase` 维持非关键事件。

---

### Task 1: 实现可测试的事件工具

**Files:**

- Create: `src/utils/analytics.ts`
- Create: `src/utils/analytics.test.ts`

**Interfaces:**

- Produces: `trackDownloadClick(input: { platform: string; variant: string; downloadUrl: string }): void`。
- Produces: `trackNotFound(pagePath: string, referrer?: string): void`。
- Consumes: 可选 `window.gtag('event', eventName, parameters)`。

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackDownloadClick, trackNotFound } from './analytics'

describe('analytics events', () => {
  beforeEach(() => { window.gtag = undefined })
  it('sends download intent without its full url', () => {
    const gtag = vi.fn(); window.gtag = gtag
    trackDownloadClick({ platform: 'Android', variant: '国际服 APK', downloadUrl: 'https://download.bluearchive.cafe/android/latest?token=hidden' })
    expect(gtag).toHaveBeenCalledWith('event', 'download_click', { platform: 'Android', variant: '国际服 APK', link_host: 'download.bluearchive.cafe' })
  })
  it('sends only path and referrer host for unknown routes', () => {
    const gtag = vi.fn(); window.gtag = gtag
    trackNotFound('/old-download', 'https://example.com/link?campaign=private')
    expect(gtag).toHaveBeenCalledWith('event', 'not_found', { page_path: '/old-download', referrer_host: 'example.com' })
  })
  it('handles invalid referrers and unavailable gtag', () => {
    expect(() => trackNotFound('/missing', 'not a url')).not.toThrow()
  })
})
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/utils/analytics.test.ts`

Expected: FAIL because `./analytics` does not exist.

- [ ] **Step 3: Implement the minimal tool**

```ts
export type DownloadClickInput = { platform: string; variant: string; downloadUrl: string }
type Parameters = Record<string, string>
declare global { interface Window { gtag?: (command: 'event', name: string, parameters: Parameters) => void } }

export function trackDownloadClick(input: DownloadClickInput) {
  const linkHost = host(input.downloadUrl)
  track('download_click', { platform: input.platform, variant: input.variant, ...(linkHost ? { link_host: linkHost } : {}) })
}
export function trackNotFound(pagePath: string, referrer = document.referrer) {
  const referrerHost = host(referrer)
  track('not_found', { page_path: pagePath, ...(referrerHost ? { referrer_host: referrerHost } : {}) })
}
function track(name: string, parameters: Parameters) { window.gtag?.('event', name, parameters) }
function host(value: string) { try { return new URL(value).host } catch { return '' } }
```

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run src/utils/analytics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/utils/analytics.ts src/utils/analytics.test.ts && git commit -m "feat(analytics): 记录下载与 404 事件"`

### Task 2: 接入下载页与路由

**Files:**

- Modify: `src/pages/DownloadPage.vue:188-252`
- Modify: `src/router.ts:1-36`
- Create: `src/pages/DownloadPage.analytics.test.ts`
- Create: `src/router.analytics.test.ts`

**Interfaces:**

- Consumes: `trackDownloadClick`、`trackNotFound` from `src/utils/analytics.ts`。
- Produces: “继续下载”发送一次下载事件；仅 `not-found` 发送 404 事件。

- [ ] **Step 1: Write the failing wiring tests**

```ts
// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const path = fileURLToPath(new URL('./DownloadPage.vue', import.meta.url))
describe('DownloadPage analytics wiring', () => {
  it('tracks selected download details', async () => {
    const source = await readFile(path, 'utf-8')
    expect(source).toContain("import { trackDownloadClick } from '../utils/analytics'")
    expect(source).toContain('downloadUrl: selectedVariant.value.downloadUrl')
  })
})
```

```ts
// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const path = fileURLToPath(new URL('./router.ts', import.meta.url))
describe('router analytics wiring', () => {
  it('tracks only not-found routes', async () => {
    const source = await readFile(path, 'utf-8')
    expect(source).toContain("if (to.name === 'not-found')")
    expect(source).toContain('trackNotFound(to.path)')
  })
})
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run src/pages/DownloadPage.analytics.test.ts src/router.analytics.test.ts`

Expected: FAIL because no analytics calls exist in the production files.

- [ ] **Step 3: Add the minimal calls**

```ts
// DownloadPage.vue
import { trackDownloadClick } from '../utils/analytics'
function markDownloadAttempted() {
  if (selectedPlatform.value && selectedVariant.value) {
    trackDownloadClick({ platform: selectedPlatform.value.name, variant: selectedVariant.value.name, downloadUrl: selectedVariant.value.downloadUrl })
  }
  downloadAttempted.value = true
}

// router.ts, after applyRouteSeo(to)
if (to.name === 'not-found') {
  trackNotFound(to.path)
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run src/utils/analytics.test.ts src/pages/DownloadPage.analytics.test.ts src/router.analytics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/pages/DownloadPage.vue src/router.ts src/pages/DownloadPage.analytics.test.ts src/router.analytics.test.ts && git commit -m "feat(analytics): 接入下载与未知路由追踪"`

### Task 3: 完整验证与 GA4 配置

**Files:**

- Verify only: `src/utils/analytics.ts`, `src/pages/DownloadPage.vue`, `src/router.ts`
- Modify after telemetry exists: GA4 Admin → Events

**Interfaces:**

- Consumes: `download_click`、`not_found`。
- Produces: 已验证构建，以及生产事件出现后的 `download_click` 关键事件设置。

- [ ] **Step 1: Run complete checks**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: every command exits 0.

- [ ] **Step 2: Verify browser payloads locally**

Run: `npm run dev`

Open `/download`, open a download dialog, and inspect network/debug tooling before following the external link: `download_click` contains only `platform`、`variant`、`link_host`. Open `/a-path-that-does-not-exist`: `not_found` contains only `page_path` and optional `referrer_host`.

- [ ] **Step 3: Release only with maintainer authorization**

After an approved production release, trigger one normal download-link click and one controlled unknown route so GA4 receives both events.

- [ ] **Step 4: Mark the actual download intent as key event**

In GA4 Admin → Events, once `download_click` appears, star it. Verify `not_found`, `click`, and `purchase` remain unstarred.

- [ ] **Step 5: Verify privacy and defer remediation until evidence exists**

In Realtime or DebugView, verify no full URL, query string, or hash is stored. Defer a 404 redirect or source correction until repeated `page_path` and `referrer_host` identify the broken route.
