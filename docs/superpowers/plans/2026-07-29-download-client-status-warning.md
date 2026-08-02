# Download Client Status Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在下载页提前读取对应平台的客户端状态，并在状态异常或请求失败时提供不阻塞下载的提示。

**Architecture:** 下载内容数据显式声明平台到状态资源的映射，避免从展示名称或 URL 推断。`DownloadPage.vue` 复用 `fetchStatus` 与 `mapStatusResources`，只管理一次页面级请求、选中平台和对话框提示；状态页与下载页继续共享同一套版本判定。

**Tech Stack:** Node.js 24、Vue 3 Composition API、TypeScript、Vuetify 4、Vitest、jsdom

## Global Constraints

- “继续下载”在检查中、未同步、未获取和请求失败时始终可用。
- HTTP 错误、网络错误、无效响应和 10 秒超时统一视为“暂时无法确认”。
- 页面卸载触发的 `AbortError` 不显示异常提示。
- 已同步状态不增加提示。
- 检查中使用 `info` 与 `role="status"`；异常使用 `warning` 与 `role="alert"`。
- 提示必须同时包含图标和文字，不能只依赖颜色。
- 不增加状态重试按钮，不修改状态页，不判断数据是否过期。
- 不修改 `.worktrees/` 下的任何文件。

---

## File Structure

- Modify: `src/content/downloads.ts`
  - 为下载平台声明受类型约束的 `statusKey`。
- Modify: `src/content/downloads.test.ts`
  - 验证四个平台和状态资源的一一映射。
- Modify: `src/pages/DownloadPage.vue`
  - 管理状态请求生命周期，派生所选平台提示，并在下载对话框中渲染提示。
- Create: `src/pages/DownloadPage.status.test.ts`
  - 验证请求、取消、状态提示和非阻塞下载行为。
- Preserve: `src/utils/status.ts`
  - 继续作为请求、超时、响应校验和状态映射的唯一来源，不复制或修改其规则。

### Task 1: 建立下载平台与状态资源的显式映射

**Files:**
- Modify: `src/content/downloads.ts:1-112`
- Modify: `src/content/downloads.test.ts:1-34`

**Interfaces:**
- Consumes: `StatusResourceKey` from `src/utils/status.ts`
- Produces: `ClientStatusResourceKey` and required `PlatformLink.statusKey`

- [ ] **Step 1: 写入失败测试**

在 `src/content/downloads.test.ts` 的 import 中加入 `platformLinks`，并添加：

```ts
it('maps every client platform to its status resource', () => {
  expect(platformLinks.map(({ name, statusKey }) => ({ name, statusKey }))).toEqual([
    { name: 'Android 客户端', statusKey: 'android' },
    { name: 'iOS 客户端', statusKey: 'ios' },
    { name: 'Windows 启动器', statusKey: 'windows' },
    { name: 'macOS 客户端', statusKey: 'macos' }
  ])
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```powershell
npx vitest run src/content/downloads.test.ts --exclude ".worktrees/**"
```

Expected: FAIL，因为 `PlatformLink` 和平台对象尚无 `statusKey`。

- [ ] **Step 3: 实现最小映射**

在 `src/content/downloads.ts` 顶部加入：

```ts
import type { StatusResourceKey } from '../utils/status'

export type ClientStatusResourceKey = Extract<
  StatusResourceKey,
  'android' | 'ios' | 'windows' | 'macos'
>
```

在 `PlatformLink` 中加入必填字段：

```ts
statusKey: ClientStatusResourceKey
```

分别为四个平台对象加入：

```ts
statusKey: 'android'
statusKey: 'ios'
statusKey: 'windows'
statusKey: 'macos'
```

- [ ] **Step 4: 运行测试并确认 GREEN**

Run:

```powershell
npx vitest run src/content/downloads.test.ts --exclude ".worktrees/**"
```

Expected: PASS，现有可见性过滤测试也保持通过。

- [ ] **Step 5: 提交平台映射**

```powershell
git add src/content/downloads.ts src/content/downloads.test.ts
git commit -m "feat(download): 关联客户端状态资源"
```

### Task 2: 请求状态并在下载对话框中展示提示

**Files:**
- Create: `src/pages/DownloadPage.status.test.ts`
- Modify: `src/pages/DownloadPage.vue:141-263`
- Modify: `src/pages/DownloadPage.vue:492-494`

**Interfaces:**
- Consumes: `PlatformLink.statusKey`, `fetchStatus(signal?: AbortSignal)`, `mapStatusResources(statusData)`
- Produces: `selectedStatusNotice: ComputedRef<ClientStatusNotice | null>`

- [ ] **Step 1: 创建组件测试基础设施**

创建 `src/pages/DownloadPage.status.test.ts`，使用与 `DownloadPage.analytics.test.ts` 相同的 jsdom 挂载模式，并只 mock 状态请求：

```ts
// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { fetchStatusMock } = vi.hoisted(() => ({
  fetchStatusMock: vi.fn()
}))

vi.mock('../utils/status', async (importOriginal) => ({
  ...await importOriginal<typeof import('../utils/status')>(),
  fetchStatus: fetchStatusMock
}))

vi.mock('../utils/analytics', () => ({
  trackDownloadClick: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} })
}))

import DownloadPage from './DownloadPage.vue'

const mountedApps: Array<{ app: App; container: HTMLElement }> = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  fetchStatusMock.mockReset()
})
```

加入完整的挂载和组件 stub：

```ts
function mountDownloadPage() {
  const container = document.createElement('div')
  const app = createApp(DownloadPage)

  app.component('VContainer', passthroughComponent)
  app.component('VCard', passthroughComponent)
  app.component('VCardText', passthroughComponent)
  app.component('VAvatar', passthroughComponent)
  app.component('VChip', passthroughComponent)
  app.component('VList', passthroughComponent)
  app.component('VListItem', passthroughComponent)
  app.component('VMenu', passthroughComponent)
  app.component('VDialog', passthroughComponent)
  app.component('VAlert', alertComponent)
  app.component('VIcon', emptyComponent)
  app.component('VBtn', buttonComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { app, container }
}

const passthroughComponent: Component = {
  template: '<div><slot /><slot name="append" /><slot name="prepend" /></div>'
}

const alertComponent: Component = {
  inheritAttrs: false,
  template: '<div :class="$attrs.class" :role="$attrs.role" :data-color="$attrs.color" :data-icon="$attrs.icon"><slot /></div>'
}

const buttonComponent: Component = {
  inheritAttrs: false,
  props: {
    disabled: Boolean
  },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
}

const emptyComponent: Component = {
  template: '<span />'
}

function findButton(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find((candidate) => candidate.textContent?.includes(text))
}

function clickButton(container: HTMLElement, text: string) {
  const button = findButton(container, text)

  expect(button).toBeDefined()
  button?.click()
}

async function flushUpdates() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}
```

- [ ] **Step 2: 写入全部行为测试**

```ts
describe('DownloadPage client status notice', () => {
  it('shows a non-blocking status while the initial request is pending', async () => {
    fetchStatusMock.mockImplementation(() => new Promise(() => {}))
    const { container } = mountDownloadPage()

    clickButton(container, '下载安装包')
    await flushUpdates()

    const notice = container.querySelector('.client-status-notice')
    const continueButton = findButton(container, '继续下载')

    expect(notice?.getAttribute('role')).toBe('status')
    expect(notice?.getAttribute('data-color')).toBe('info')
    expect(notice?.getAttribute('data-icon')).toBe('$infoOutline')
    expect(notice?.textContent).toContain('正在检查客户端状态')
    expect(continueButton?.disabled).toBe(false)
  })

  it('does not add a notice when the selected client is synchronized', async () => {
    fetchStatusMock.mockResolvedValue({
      android: {
        official: { version: '1.0' },
        localized: { version: '1.0' }
      }
    })
    const { container } = mountDownloadPage()
    await flushUpdates()

    clickButton(container, '下载安装包')
    await flushUpdates()

    expect(container.querySelector('.client-status-notice')).toBeNull()
  })
})
```

继续在同一个 `describe` 中加入三类异常和卸载取消测试：

```ts
it.each([
  {
    response: {
      android: {
        official: { version: '2.0' },
        localized: { version: '1.0' }
      }
    },
    message: '本地化客户端可能尚未同步'
  },
  {
    response: {},
    message: '暂时未取得该客户端状态'
  }
])('warns without disabling download: $message', async ({ response, message }) => {
  fetchStatusMock.mockResolvedValue(response)
  const { container } = mountDownloadPage()
  await flushUpdates()

  clickButton(container, '下载安装包')
  await flushUpdates()

  const notice = container.querySelector('.client-status-notice')
  expect(notice?.getAttribute('role')).toBe('alert')
  expect(notice?.getAttribute('data-color')).toBe('warning')
  expect(notice?.getAttribute('data-icon')).toBe('$alertCircleOutline')
  expect(notice?.textContent).toContain(message)
  expect(findButton(container, '继续下载')?.disabled).toBe(false)
})

it('warns without disabling download when the status request fails', async () => {
  fetchStatusMock.mockRejectedValue(new Error('Network failed'))
  const { container } = mountDownloadPage()
  await flushUpdates()

  clickButton(container, '下载安装包')
  await flushUpdates()

  expect(container.querySelector('.client-status-notice')?.textContent)
    .toContain('暂时无法确认该客户端状态')
  expect(findButton(container, '继续下载')?.disabled).toBe(false)
})

it('aborts the active status request when the page unmounts', async () => {
  let requestSignal: AbortSignal | undefined
  fetchStatusMock.mockImplementation((signal?: AbortSignal) => new Promise((_resolve, reject) => {
    requestSignal = signal
    signal?.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  }))
  const { app } = mountDownloadPage()
  await flushUpdates()

  app.unmount()
  await flushUpdates()

  expect(requestSignal?.aborted).toBe(true)
})
```

`findButton` 返回匹配文字的按钮，`clickButton` 复用它并断言按钮存在。

- [ ] **Step 3: 运行测试并确认 RED**

Run:

```powershell
npx vitest run src/pages/DownloadPage.status.test.ts --exclude ".worktrees/**"
```

Expected: FAIL，因为下载页尚未请求状态、没有 `.client-status-notice`，卸载也不会取消请求。失败不能来自测试挂载错误或未处理 Promise。

- [ ] **Step 4: 添加请求状态与提示派生逻辑**

将 Vue import 改为：

```ts
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
```

加入状态工具 import：

```ts
import {
  fetchStatus,
  mapStatusResources,
  type StatusResourceView
} from '../utils/status'
```

在现有 refs 后加入：

```ts
type ClientStatusLoadState = 'loading' | 'ready' | 'failed'

interface ClientStatusNotice {
  color: 'info' | 'warning'
  icon: '$infoOutline' | '$alertCircleOutline'
  message: string
  role: 'status' | 'alert'
}

const statusRequestController = new AbortController()
const clientStatusLoadState = ref<ClientStatusLoadState>('loading')
const clientStatuses = ref<Record<PlatformLink['statusKey'], StatusResourceView> | null>(null)
```

加入所选平台提示：

```ts
const selectedStatusNotice = computed<ClientStatusNotice | null>(() => {
  const platform = selectedPlatform.value

  if (!platform) {
    return null
  }

  if (clientStatusLoadState.value === 'loading') {
    return {
      color: 'info',
      icon: '$infoOutline',
      message: '正在检查客户端状态……',
      role: 'status'
    }
  }

  if (clientStatusLoadState.value === 'failed') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时无法确认该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  return createStatusNotice(clientStatuses.value?.[platform.statusKey])
})
```

加入纯派生函数：

```ts
function createStatusNotice(statusResource?: StatusResourceView): ClientStatusNotice | null {
  if (!statusResource || statusResource.status.state === 'loading') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时未取得该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  if (statusResource.status.state === 'error') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '本地化客户端可能尚未同步到最新官方版本。你仍可继续下载。',
      role: 'alert'
    }
  }

  return null
}
```

加入请求生命周期：

```ts
onMounted(async () => {
  try {
    const statusData = await fetchStatus(statusRequestController.signal)
    clientStatuses.value = mapStatusResources(statusData)
    clientStatusLoadState.value = 'ready'
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    clientStatusLoadState.value = 'failed'
  }
})

onBeforeUnmount(() => {
  statusRequestController.abort()
})
```

- [ ] **Step 5: 在对话框中渲染最小提示**

在 `.dialog-copy` 后、原有 `.download-feedback` 前加入：

```vue
<v-alert
  v-if="selectedStatusNotice"
  class="client-status-notice"
  :color="selectedStatusNotice.color"
  density="comfortable"
  :icon="selectedStatusNotice.icon"
  :role="selectedStatusNotice.role"
  variant="outlined"
>
  {{ selectedStatusNotice.message }}
</v-alert>
```

将现有样式改为共享间距：

```css
.client-status-notice,
.download-feedback {
  margin-top: var(--space-5);
}
```

- [ ] **Step 6: 运行测试并确认 GREEN**

Run:

```powershell
npx vitest run src/pages/DownloadPage.status.test.ts --exclude ".worktrees/**"
```

Expected: PASS，检查中不禁用下载，已同步不提示，三类异常分别提示，卸载取消请求。

- [ ] **Step 7: 运行相关回归测试**

```powershell
npx vitest run src/pages/DownloadPage.status.test.ts src/pages/DownloadPage.analytics.test.ts src/utils/status.test.ts --exclude ".worktrees/**"
```

Expected: PASS；状态提示、原有分析事件和共享状态逻辑全部通过。

- [ ] **Step 8: 提交下载提示**

```powershell
git add src/pages/DownloadPage.vue src/pages/DownloadPage.status.test.ts
git commit -m "feat(download): 提示客户端状态异常"
```

### Task 3: 完整验证与真实界面验收

**Files:**
- Verify only: `src/content/downloads.ts`
- Verify only: `src/pages/DownloadPage.vue`
- Verify only: related tests

**Interfaces:**
- Consumes: Tasks 1–2 completed commits
- Produces: automated and rendered evidence that the feature is safe to ship

- [ ] **Step 1: 运行完整自动化门禁**

依次运行：

```powershell
npm run audit
npm test -- --exclude ".worktrees/**"
npm run typecheck
npm run build
git diff --check
```

Expected:

- audit reports `found 0 vulnerabilities`
- all main-checkout tests pass
- typecheck exits 0
- production build exits 0
- diff check reports no whitespace errors

- [ ] **Step 2: 启动最新生产预览**

```powershell
npm run preview -- --port 4173
```

使用刚生成的 `dist`，不要复用旧预览产物。

- [ ] **Step 3: 验证桌面端状态**

通过浏览器打开 `http://127.0.0.1:4173/download`，检查：

- 状态请求在页面加载时发出一次。
- 若接口当前存在未同步平台，选择该平台时对话框显示 warning 提示。
- “继续下载”保持可用。
- 选择已同步平台时不显示状态提示。
- 对话框无横向溢出，控制台无 error 或 warning。

- [ ] **Step 4: 验证 360px 移动端**

将视口设为 `360 × 800`。若接口当前存在未同步平台，重复其状态检查；若接口已全部同步，则以组件测试作为异常分支证据，不为制造异常而修改生产代码：

- 对话框和提示没有横向溢出。
- 提示没有遮挡或挤出“继续下载”按钮。
- 按钮触控目标保持至少 `48 × 48`。

- [ ] **Step 5: 检查提交与工作区**

```powershell
git status --short
git log -3 --oneline
```

Expected: 工作区干净，顶部提交包含平台映射和客户端状态提示两个聚焦提交。
