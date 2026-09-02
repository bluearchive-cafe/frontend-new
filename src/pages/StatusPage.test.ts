// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import StatusPage from './StatusPage.vue'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  vi.unstubAllGlobals()
})

// 请求生命周期(状态流转、abort、卸载清理)由 useClientStatus 单测覆盖;
// 这里只验证状态页自己的展示:重试按钮的可用性与成功后的横幅清除。
// 状态请求通过替换全局 fetch 在网络边界打桩,不再 mock 模块内部。
describe('StatusPage requests', () => {
  it('disables manual retry while loading and clears the error after success', async () => {
    const statusFetch = vi.fn()
    statusFetch.mockRejectedValueOnce(new Error('Network failed'))
    vi.stubGlobal('fetch', statusFetch)

    const { container } = mountStatusPage()
    await flushUpdates()

    const retryButton = container.querySelector<HTMLButtonElement>('button')
    expect(retryButton?.textContent).toContain('重新获取')

    let resolveRetry: ((data: Record<string, unknown>) => void) | undefined
    statusFetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveRetry = (data) => resolve(new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    }))

    retryButton?.click()
    await flushUpdates()

    expect(retryButton?.disabled).toBe(true)

    resolveRetry?.({
      android: {
        official: { version: '1.0', time: '2026-01-01 00:00:00' },
        localized: { version: '1.0', time: '2026-01-01 01:00:00' }
      }
    })
    await flushUpdates()

    expect(container.querySelector('button')).toBeNull()
    expect(container.textContent).toContain('已同步')
  })
})

function mountStatusPage() {
  const container = document.createElement('div')
  const app = createApp(StatusPage)

  app.component('VContainer', passthroughComponent)
  app.component('VAlert', alertComponent)
  app.component('VBtn', buttonComponent)
  app.component('VAvatar', passthroughComponent)
  app.component('VIcon', emptyComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { container }
}

const passthroughComponent: Component = {
  template: '<div><slot /></div>'
}

const alertComponent: Component = {
  template: '<div><slot /><slot name="append" /></div>'
}

const buttonComponent: Component = {
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    loading: Boolean
  },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
}

const emptyComponent: Component = {
  template: '<span />'
}

async function flushUpdates() {
  await nextTick()
  // fetchStatus 内部还有 await response.json() 等多层微任务,逐层排空。
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
  await nextTick()
}
