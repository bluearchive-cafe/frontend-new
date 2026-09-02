// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} })
}))

import DownloadPage from './DownloadPage.vue'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  vi.unstubAllGlobals()
})

// 页面级冒烟测试只验证模板接线:菜单选中 → 对话框标题与下载源说明、
// 客户端状态提示与继续下载反馈;行为细节由 useDownloadGuide 单测覆盖。
// 状态请求通过替换全局 fetch 在网络边界打桩,不再 mock 模块内部。
describe('DownloadPage download dialog wiring', () => {
  it('renders the dialog title and the selected variant notice', async () => {
    const { container } = mountDownloadPage()

    selectVariant(container, 'Android 平台', '手动安装')
    await flushUpdates()

    expect(container.querySelector('#download-dialog-title')?.textContent)
      .toContain('Android 平台 · 手动安装')
    expect(container.querySelector('.variant-notice')?.textContent)
      .toContain('卸载官方原版客户端')
  })

  it('keeps the continue button usable and surfaces status trouble and download feedback', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network failed'))))
    const { container } = mountDownloadPage()

    selectVariant(container, 'iOS 平台', '手动安装')
    await flushUpdates()

    const notice = container.querySelector('.client-status-notice')
    expect(notice?.getAttribute('role')).toBe('alert')
    expect(notice?.textContent).toContain('暂时无法确认该客户端状态')

    const continueButton = findButton(container, '继续下载')
    expect(continueButton?.disabled).toBeFalsy()

    continueButton?.click()
    await flushUpdates()

    expect(container.querySelector('.download-feedback')).not.toBeNull()
  })
})

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
  app.component('VAlert', passthroughComponent)
  app.component('VIcon', emptyComponent)
  app.component('VBtn', buttonComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { container }
}

const passthroughComponent: Component = {
  template: '<div><slot /><slot name="append" /><slot name="prepend" /></div>'
}

const buttonComponent: Component = {
  inheritAttrs: false,
  emits: ['click'],
  template: '<button @click="$emit(\'click\')"><slot /></button>'
}

const emptyComponent: Component = {
  template: '<span />'
}

function findButton(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find((candidate) => candidate.textContent?.includes(text))
}

/** Picks a variant from a platform's download options list (the menu activator is inert in tests). */
function selectVariant(container: HTMLElement, platformName: string, variantName: string) {
  const platformCard = [...container.querySelectorAll<HTMLElement>('.platform-card')]
    .find((card) => card.querySelector('h2')?.textContent === platformName)

  expect(platformCard, `platform card not found: ${platformName}`).toBeDefined()

  const item = [...platformCard?.querySelectorAll<HTMLElement>('.variant-menu > div') ?? []]
    .find((candidate) => candidate.getAttribute('title') === variantName)

  expect(item, `variant item not found: ${platformName} / ${variantName}`).toBeDefined()
  item?.click()
}

async function flushUpdates() {
  await nextTick()
  // fetchStatus 内部还有 await response.json() 等多层微任务,逐层排空。
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
  await nextTick()
}
