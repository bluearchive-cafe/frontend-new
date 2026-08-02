// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { trackDownloadClickMock } = vi.hoisted(() => ({
  trackDownloadClickMock: vi.fn()
}))

vi.mock('../utils/analytics', () => ({
  trackDownloadClick: trackDownloadClickMock
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
  trackDownloadClickMock.mockReset()
})

describe('DownloadPage analytics wiring', () => {
  it('tracks the selected download only when the user continues', async () => {
    const { container } = mountDownloadPage()

    clickButton(container, '下载应用包')
    await flushUpdates()

    expect(trackDownloadClickMock).not.toHaveBeenCalled()

    clickButton(container, '继续下载')

    expect(trackDownloadClickMock).toHaveBeenCalledOnce()
    expect(trackDownloadClickMock).toHaveBeenCalledWith({
      platform: 'iOS 客户端',
      variant: '应用包',
      downloadUrl: 'https://download.bluearchive.cafe/ios/latest'
    })
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
