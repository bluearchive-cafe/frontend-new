// @vitest-environment jsdom

import { createApp, defineComponent, h, nextTick, type App, type Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { activeAnnouncements } from '../content/announcements'
import AnnouncementBanner from './AnnouncementBanner.vue'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
  document.documentElement.style.removeProperty('--anchor-offset')
})

// 只验证模板接线:文案、外链和事件;布局高度由 Vuetify 的 VSystemBar 负责。
describe('AnnouncementBanner wiring', () => {
  it('renders the migration message as a labelled region', () => {
    const { container } = mountBanner()

    const region = container.querySelector('.announcement-banner')
    expect(region?.getAttribute('role')).toBe('region')
    expect(region?.getAttribute('aria-labelledby')).toBe('announcement-banner-title')
    expect(container.querySelector('#announcement-banner-title')?.textContent)
      .toBe('日服《蔚蓝档案》发行商将变更为 NEXON')
    expect(container.querySelector('.banner-summary')?.textContent)
      .toBe('请在 2027 年 1 月中旬维护前完成「账号迁移申请」。')
  })

  it('opens the migration page in a new tab with a safe rel', () => {
    const { container } = mountBanner()
    const migration = findAction(container, '前往账号迁移申请')

    expect(migration?.getAttribute('href')).toBe('https://ba-account-migration.yostar.co.jp/')
    expect(migration?.getAttribute('target')).toBe('_blank')
    expect(migration?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('links the site announcement and reports the action', async () => {
    const { container, events } = mountBanner()

    findAction(container, '阅读站点公告')?.click()
    await nextTick()

    expect(events).toContain('action:news')
    expect(findAction(container, '阅读站点公告')?.getAttribute('href'))
      .toBe('/news/publisher-transfer-2027')
  })

  it('reports the migration action without dismissing the banner', async () => {
    const { container, events } = mountBanner()

    findAction(container, '前往账号迁移申请')?.click()
    await nextTick()

    expect(events).toContain('action:migration')
    expect(events).not.toContain('dismiss')
  })

  it('emits dismiss from the labelled close button', async () => {
    const { container, events } = mountBanner()

    container.querySelector<HTMLAnchorElement>('[aria-label="关闭账号迁移公告"]')?.click()
    await nextTick()

    expect(events).toContain('dismiss')
  })

  it('adds the measured banner height to the anchor offset', () => {
    document.documentElement.style.setProperty('--anchor-offset', '72px')
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight'
    )
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains('banner-inner') ? 68 : 0
      }
    })

    try {
      mountBanner()

      expect(document.documentElement.style.getPropertyValue('--anchor-offset')).toBe('140px')
    } finally {
      if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
      }
    }
  })
})

function mountBanner() {
  const container = document.createElement('div')
  const events: string[] = []
  const root = defineComponent({
    setup() {
      return () =>
        h(AnnouncementBanner, {
          announcement: activeAnnouncements[0],
          onDismiss: () => {
            events.push('dismiss')
          },
          onAction: (target: string) => {
            events.push(`action:${target}`)
          }
        })
    }
  })
  const app = createApp(root)

  app.component('VSystemBar', passthroughComponent)
  app.component('VBtn', actionComponent)
  app.component('VIcon', emptyComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { container, events }
}

const passthroughComponent: Component = {
  props: ['height', 'order'],
  template: '<div><slot /></div>'
}

const actionComponent: Component = {
  props: ['href', 'to', 'target', 'rel', 'icon'],
  emits: ['click'],
  template: `
    <a
      :href="href ?? to"
      :target="target"
      :rel="rel"
      @click="$emit('click')"
    ><slot /></a>
  `
}

const emptyComponent: Component = {
  template: '<span />'
}

function findAction(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLAnchorElement>('a')]
    .find((candidate) => candidate.textContent?.includes(text))
}
