// @vitest-environment jsdom

import { createApp, defineComponent, h, type App } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { VApp } from 'vuetify/components/VApp'
import { VAlert } from 'vuetify/components/VAlert'
import { VAvatar } from 'vuetify/components/VAvatar'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardText } from 'vuetify/components/VCard'
import { VChip } from 'vuetify/components/VChip'
import { VDialog } from 'vuetify/components/VDialog'
import { VContainer } from 'vuetify/components/VGrid'
import { VIcon } from 'vuetify/components/VIcon'
import { VList, VListItem } from 'vuetify/components/VList'
import { VMenu } from 'vuetify/components/VMenu'

import AboutSection from '../src/components/AboutSection.vue'
import DownloadPage from '../src/pages/DownloadPage.vue'

let app: App | undefined

beforeEach(() => {
  vi.stubGlobal('visualViewport', undefined)
  vi.stubGlobal('ResizeObserver', class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  })
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })))
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{}'))))
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('dialog focus recovery', () => {
  it('opens the Linux download directly and restores focus after Escape', async () => {
    await mountPage(DownloadPage)
    const card = [...document.querySelectorAll<HTMLElement>('.platform-card')]
      .find((item) => item.querySelector('h2')?.textContent === 'Linux 平台')!
    const trigger = card.querySelector<HTMLButtonElement>('button')!
    trigger.focus()
    trigger.click()

    await vi.waitFor(() => {
      expect(document.querySelector('#download-dialog-title')?.textContent).toBe('Linux 平台：Cafe Launcher')
    })
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
    expect(dialog.querySelector('.variant-notice')?.textContent).toContain('实验性支持')
    expect(dialog.querySelector('.client-status-notice')).toBeNull()
    expect(dialog.querySelector('a[href="https://github.com/bluearchive-cafe/Cafe.Launcher.Avalonia/releases"]')).not.toBeNull()
    expect(dialog.querySelector('a[href="https://docs.bluearchive.cafe/cafe-launcher/installation"]')).not.toBeNull()

    await closeDialog()
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('returns focus to the platform entry after a menu selection and Escape', async () => {
    await mountPage(DownloadPage)
    const trigger = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('查看下载选项'))!
    trigger.focus()
    trigger.click()

    await vi.waitFor(() => {
      expect(document.querySelector('.variant-menu .v-list-item')).not.toBeNull()
    })
    expect(trigger.getAttribute('aria-label')).toBe('Android 平台：查看下载选项')
    expect(document.querySelector('.variant-menu')?.getAttribute('role')).toBe('menu')
    const option = document.querySelector<HTMLElement>('.variant-menu .v-list-item')!
    expect(option.tagName).toBe('BUTTON')
    expect(option.getAttribute('role')).toBe('menuitem')
    expect(option.getAttribute('type')).toBe('button')
    option.focus()
    option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await closeDialog()

    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it.each(['ArrowDown', 'ArrowUp'])('returns focus to the current platform after opening with %s', async (key) => {
    await mountPage(DownloadPage)
    const previousTrigger = document.querySelector<HTMLButtonElement>('[aria-label="iOS 平台：查看下载选项"]')!
    previousTrigger.focus()
    previousTrigger.click()

    await vi.waitFor(() => {
      expect(document.querySelector('.v-menu.v-overlay--active .v-list-item')).not.toBeNull()
    })
    document.querySelector<HTMLElement>('.v-menu.v-overlay--active .v-list-item')!.click()
    await closeDialog()
    await vi.waitFor(() => expect(document.activeElement).toBe(previousTrigger))

    const trigger = document.querySelector<HTMLButtonElement>('[aria-label="Android 平台：查看下载选项"]')!
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

    await vi.waitFor(() => {
      expect(document.querySelector('.v-menu.v-overlay--active .v-list-item')).not.toBeNull()
    })
    const option = document.querySelector<HTMLElement>('.v-menu.v-overlay--active .v-list-item')!
    option.focus()
    option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await closeDialog()

    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it.each(['Enter', ' '])('opens the sponsor dialog with %j and returns focus after closing', async (key) => {
    await mountPage(AboutSection)
    const trigger = document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.getAttribute('role')).toBe('button')
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.tabIndex).toBe(0)
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))

    await closeDialog()

    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})

async function mountPage(component: typeof DownloadPage | typeof AboutSection) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component }]
  })
  await router.push('/')
  const vuetify = createVuetify({
    components: { VApp, VAlert, VAvatar, VBtn, VCard, VCardText, VChip, VDialog, VContainer, VIcon, VList, VListItem, VMenu },
    icons: {
      aliases: Object.fromEntries([
        'android', 'appleIos', 'microsoftWindows', 'apple', 'linux', 'download', 'chevronDown',
        'arrowRight', 'infoOutline', 'bookOpenOutline', 'helpCircleOutline', 'linkVariant',
        'fileDocumentEditOutline', 'messageAlertOutline', 'videoOutline', 'accountGroupOutline',
        'github', 'openInNew', 'imageOutline', 'alertCircleOutline'
      ].map((name) => [name, 'mdi-circle']))
    }
  })
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(defineComponent({ render: () => h(VApp, () => h(component)) }))
  app.use(router).use(vuetify).mount(container)
}

async function closeDialog() {
  await vi.waitFor(() => {
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })
  // VOverlay listens on window, as it does for the real browser's bubbled Escape.
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await vi.waitFor(() => {
    expect(document.querySelector('.v-dialog.v-overlay--active')).toBeNull()
  })
}
