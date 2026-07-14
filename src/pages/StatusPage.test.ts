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

import StatusPage from './StatusPage.vue'

const mountedApps: Array<{ app: App; container: HTMLElement }> = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  fetchStatusMock.mockReset()
})

describe('StatusPage requests', () => {
  it('aborts the active request when the page unmounts', async () => {
    let requestSignal: AbortSignal | undefined
    fetchStatusMock.mockImplementation((signal?: AbortSignal) => new Promise((_resolve, reject) => {
      requestSignal = signal
      signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'))
      }, { once: true })
    }))

    const { app } = mountStatusPage()
    await flushUpdates()

    app.unmount()
    await flushUpdates()

    expect(requestSignal?.aborted).toBe(true)
  })

  it('disables manual retry while loading and clears the error after success', async () => {
    fetchStatusMock.mockRejectedValueOnce(new Error('Network failed'))
    const { container } = mountStatusPage()
    await flushUpdates()

    const retryButton = container.querySelector<HTMLButtonElement>('button')
    expect(retryButton?.textContent).toContain('重新获取')

    let resolveRetry: ((value: unknown) => void) | undefined
    fetchStatusMock.mockImplementationOnce(() => new Promise((resolve) => {
      resolveRetry = resolve
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

  return { app, container }
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
  await Promise.resolve()
  await nextTick()
}
