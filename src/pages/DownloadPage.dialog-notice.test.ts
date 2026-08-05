// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../utils/analytics', () => ({
  trackDownloadClick: vi.fn()
}))

vi.mock('../utils/status', async (importOriginal) => ({
  ...await importOriginal<typeof import('../utils/status')>(),
  fetchStatus: vi.fn().mockResolvedValue({})
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
})

describe('DownloadPage dialog source notice', () => {
  it('shows the selected variant notice in the dialog', async () => {
    const { container } = mountDownloadPage()

    selectVariant(container, 'APKS 安装包')
    await flushUpdates()

    const notice = container.querySelector('.variant-notice')
    expect(notice).not.toBeNull()
    expect(notice?.textContent).toContain('需要通过支持 APKS 的安装器安装')
  })

  it('shows the notice for a previously unnoted variant', async () => {
    const { container } = mountDownloadPage()

    selectVariant(container, '直接下载应用包')
    await flushUpdates()

    const notice = container.querySelector('.variant-notice')
    expect(notice).not.toBeNull()
    expect(notice?.textContent).toContain('无法验证开发者')
  })

  it('updates the notice when the selected variant changes', async () => {
    const { container } = mountDownloadPage()

    selectVariant(container, 'APKS 安装包')
    await flushUpdates()
    expect(container.querySelector('.variant-notice')?.textContent).toContain('APKS')

    clickButton(container, '稍后再说')
    await flushUpdates()

    selectVariant(container, '通过 PlayCover 安装')
    await flushUpdates()

    expect(container.querySelector('.variant-notice')?.textContent)
      .toContain('首次打开应用时')
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

function clickButton(container: HTMLElement, text: string) {
  const button = findButton(container, text)

  expect(button).toBeDefined()
  button?.click()
}

/** Picks a variant from the download options list (the menu activator is inert in tests). */
function selectVariant(container: HTMLElement, variantName: string) {
  const item = [...container.querySelectorAll<HTMLElement>('.variant-menu > div')]
    .find((candidate) => candidate.getAttribute('title') === variantName)

  expect(item, `variant item not found: ${variantName}`).toBeDefined()
  item?.click()
}

async function flushUpdates() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}
