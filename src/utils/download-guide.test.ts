// @vitest-environment jsdom

import { createApp, defineComponent, h, type App, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { trackDownloadClickMock } = vi.hoisted(() => ({
  trackDownloadClickMock: vi.fn()
}))

vi.mock('./analytics', () => ({
  trackDownloadClick: trackDownloadClickMock
}))

import { useDownloadGuide } from './download-guide'
import { platformLinks, type PlatformLink } from '../content/downloads'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  trackDownloadClickMock.mockReset()
})

describe('useDownloadGuide', () => {
  describe('platform visibility', () => {
    it('hides internal variants unless show_hidden=1 is requested', () => {
      const defaultGuide = mountGuide()

      const android = defaultGuide.visiblePlatformLinks.value.find((platform) => platform.name === 'Android 平台')
      expect(android?.variants.map((variant) => variant.name)).not.toContain('Android 安装器（测试）')

      const internalGuide = mountGuide({ show_hidden: '1' })

      const internalAndroid = internalGuide.visiblePlatformLinks.value.find((platform) => platform.name === 'Android 平台')
      expect(internalAndroid?.variants.map((variant) => variant.name)).toContain('Android 安装器（测试）')
    })

    it('drops platforms whose variants are all hidden', () => {
      const guide = mountGuide()

      expect(guide.visiblePlatformLinks.value.map((platform) => platform.name)).toEqual(
        platformLinks.filter((platform) => !platform.hidden).map((platform) => platform.name)
      )
    })
  })

  describe('dialog state machine', () => {
    it('exposes the selection and derives the dialog title', () => {
      const guide = mountGuide()

      const platform = findPlatform('iOS 平台')
      const variant = findVariant(platform, '手动安装')

      guide.openDownloadGuide(platform, variant)

      expect(guide.downloadDialog.value).toBe(true)
      expect(guide.selectedPlatform.value).toStrictEqual(platform)
      expect(guide.selectedVariant.value).toStrictEqual(variant)
      expect(guide.selectedDownloadTitle.value).toBe(`${platform.name} · ${variant.name}`)
    })

    it('resets the attempted flag each time the dialog opens', () => {
      const guide = mountGuide()

      const platform = findPlatform('iOS 平台')
      const variant = findVariant(platform, '手动安装')
      guide.openDownloadGuide(platform, variant)
      guide.markDownloadAttempted()
      expect(guide.downloadAttempted.value).toBe(true)

      guide.downloadDialog.value = false
      guide.openDownloadGuide(platform, findVariant(platform, '通过 AltStore 安装'))

      expect(guide.downloadAttempted.value).toBe(false)
      expect(guide.downloadDialog.value).toBe(true)
    })

    it('stays silent until a platform is selected', () => {
      const guide = mountGuide()

      expect(guide.selectedStatusNotice.value).toBeNull()
      expect(guide.selectedDownloadTitle.value).toBe('')
    })
  })

  describe('analytics', () => {
    it('tracks the selected download only when the user continues', async () => {
      const guide = mountGuide()
      await flushUpdates()

      const platform = findPlatform('iOS 平台')
      const variant = findVariant(platform, '手动安装')
      guide.openDownloadGuide(platform, variant)

      expect(trackDownloadClickMock).not.toHaveBeenCalled()

      guide.markDownloadAttempted()

      expect(trackDownloadClickMock).toHaveBeenCalledOnce()
      expect(trackDownloadClickMock).toHaveBeenCalledWith({
        platform: platform.name,
        variant: variant.name,
        downloadUrl: variant.downloadUrl
      })
    })
  })

  describe('client status wiring', () => {
    it('keeps the download flow available when the status request fails', async () => {
      const guide = mountGuide({}, rejectingStatusFetch(new Error('Network failed')))
      await flushUpdates()

      guide.openDownloadGuide(findPlatform('iOS 平台'), findVariant(findPlatform('iOS 平台'), '手动安装'))

      expect(guide.selectedStatusNotice.value).toMatchObject({ role: 'alert' })
      expect(guide.selectedStatusNotice.value?.message).toContain('暂时无法确认该客户端状态')

      guide.markDownloadAttempted()
      expect(guide.downloadAttempted.value).toBe(true)
    })

    it('maps synchronized clients to no notice', async () => {
      const guide = mountGuide({}, resolvingStatusFetch({
        ios: {
          official: { version: '1.0', time: '2026-07-29 11:35:05' },
          localized: { version: '1.0', time: '2026-07-29 12:30:57' }
        }
      }))
      await flushUpdates()

      const platform = findPlatform('iOS 平台')
      guide.openDownloadGuide(platform, findVariant(platform, '手动安装'))

      expect(guide.selectedStatusNotice.value).toBeNull()
    })
  })
})

function mountGuide(query: Record<string, unknown> = {}, fetchImplementation: typeof fetch = resolvingStatusFetch()) {
  return mountGuideApp(query, fetchImplementation).guide
}

function mountGuideApp(query: Record<string, unknown>, fetchImplementation: typeof fetch) {
  let guide!: ReturnType<typeof useDownloadGuide>
  const app = createApp(defineComponent({
    setup() {
      guide = useDownloadGuide(() => query, { fetchImplementation })
      return () => h('div')
    }
  }))

  const container = document.createElement('div')
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { app, guide }
}

function resolvingStatusFetch(data: Record<string, unknown> = {}) {
  return vi.fn(() => Promise.resolve(new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })))
}

function rejectingStatusFetch(reason: Error) {
  return vi.fn(() => Promise.reject(reason))
}

function findPlatform(name: string) {
  const platform = platformLinks.find((item) => item.name === name)

  expect(platform, `platform not found: ${name}`).toBeDefined()
  return platform!
}

function findVariant(platform: PlatformLink, name: string) {
  const variant = platform.variants.find((item) => item.name === name)

  expect(variant, `variant not found: ${platform.name} / ${name}`).toBeDefined()
  return variant!
}

async function flushUpdates() {
  await nextTick()
  // fetchStatus 内部还有 await response.json() 等多层微任务,逐层排空。
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
  await nextTick()
}
