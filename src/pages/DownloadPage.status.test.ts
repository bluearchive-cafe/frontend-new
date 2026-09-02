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

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  fetchStatusMock.mockReset()
})

describe('DownloadPage client status notice', () => {
  it('shows a non-blocking status while the initial request is pending', async () => {
    fetchStatusMock.mockImplementation(() => new Promise(() => {
      // Intentionally never resolves: keeps the status request pending.
    }))
    const { container } = mountDownloadPage()

    selectVariant(container, 'iOS 平台', '手动安装')
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
      ios: {
        official: { version: '1.0', time: '2026-07-29 11:35:05' },
        localized: { version: '1.0', time: '2026-07-29 12:30:57' }
      }
    })
    const { container } = mountDownloadPage()
    await flushUpdates()

    selectVariant(container, 'iOS 平台', '手动安装')
    await flushUpdates()

    expect(container.querySelector('.client-status-notice')).toBeNull()
  })

  it.each([
    {
      response: {
        ios: {
          official: { version: '2.0', time: '2026-07-29 11:35:05' },
          localized: { version: '1.0', time: '2026-06-24 12:12:40' }
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

    selectVariant(container, 'iOS 平台', '手动安装')
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

    selectVariant(container, 'iOS 平台', '手动安装')
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
  await Promise.resolve()
  await nextTick()
}
