// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { trackDownloadClickMock, fetchStatusMock } = vi.hoisted(() => ({
  trackDownloadClickMock: vi.fn(),
  fetchStatusMock: vi.fn()
}))

vi.mock('../utils/analytics', () => ({
  trackDownloadClick: trackDownloadClickMock
}))

// 打桩状态接口:单元测试不得发起真实网络请求。
vi.mock('../utils/status', async (importOriginal) => ({
  ...await importOriginal<typeof import('../utils/status')>(),
  fetchStatus: fetchStatusMock
}))

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
  trackDownloadClickMock.mockReset()
  fetchStatusMock.mockReset()
})

describe('DownloadPage analytics wiring', () => {
  it('tracks the selected download only when the user continues', async () => {
    fetchStatusMock.mockResolvedValue({})
    const { container } = mountDownloadPage()
    await flushUpdates()

    selectVariant(container, 'iOS 平台', '手动安装')
    await flushUpdates()

    expect(trackDownloadClickMock).not.toHaveBeenCalled()

    clickButton(container, '继续下载')

    expect(trackDownloadClickMock).toHaveBeenCalledOnce()
    expect(trackDownloadClickMock).toHaveBeenCalledWith({
      platform: 'iOS 平台',
      variant: '手动安装',
      downloadUrl: 'https://download.bluearchive.cafe/ios/latest'
    })
  })

  it('keeps the download flow available when the status request fails', async () => {
    fetchStatusMock.mockRejectedValue(new Error('Network failed'))
    const { container } = mountDownloadPage()
    await flushUpdates()

    selectVariant(container, 'iOS 平台', '手动安装')
    await flushUpdates()

    expect(container.textContent).toContain('暂时无法确认该客户端状态')
    expect(container.textContent).toContain('继续下载')
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

function clickButton(container: HTMLElement, text: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find((candidate) => candidate.textContent?.includes(text))

  expect(button).toBeDefined()
  button?.click()
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

async function flushUpdates() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}
