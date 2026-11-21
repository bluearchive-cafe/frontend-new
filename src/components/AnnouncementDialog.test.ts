// @vitest-environment jsdom

import { createApp, defineComponent, h, nextTick, type App, type Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { activeAnnouncements } from '../content/announcements'
import AnnouncementDialog from './AnnouncementDialog.vue'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
})

// 只验证模板接线:文案、外链、明确关闭与会话内关闭的事件;存储行为由
// useAnnouncementNotice 的单测覆盖。
describe('AnnouncementDialog wiring', () => {
  it('renders the announcement copy and timeline', () => {
    const { container } = mountDialog()

    expect(container.querySelector('#announcement-dialog-title')?.textContent)
      .toBe('日服《蔚蓝档案》发行商将变更为 NEXON')
    expect(container.querySelector('.announcement-lead')?.textContent)
      .toContain('2027 年 1 月起')
    expect(container.querySelectorAll('.announcement-dates li')).toHaveLength(3)
    expect(container.querySelector('.announcement-warning')?.textContent)
      .toContain('游客账号无法迁移')
    expect(container.querySelector('.announcement-note')?.textContent)
      .toContain('非官方项目')
  })

  it('exposes the migration page and the official announcement', () => {
    const { container } = mountDialog()

    const migration = findAction(container, '前往账号迁移申请')
    expect(migration?.getAttribute('href')).toBe('https://ba-account-migration.yostar.co.jp/')
    expect(migration?.getAttribute('target')).toBe('_blank')
    expect(migration?.getAttribute('rel')).toBe('noopener noreferrer')

    const source = container.querySelector<HTMLAnchorElement>('.announcement-source')
    expect(source?.getAttribute('href')).toBe('https://cmn-jp.nexon.com/transfer/bluearchive')
    expect(source?.getAttribute('target')).toBe('_blank')
  })

  it('acknowledges when the close button is used', async () => {
    const { container, events } = mountDialog()

    findAction(container, '我知道了')?.click()
    await nextTick()

    expect(events).toContain('acknowledge')
    expect(events).toContain('update:false')
    expect(events).not.toContain('snooze')
  })

  it('acknowledges and reports the article action', async () => {
    const { container, events } = mountDialog()

    findAction(container, '阅读站点公告')?.click()
    await nextTick()

    expect(events).toContain('action:news')
    expect(events).toContain('acknowledge')
  })

  it('reports the official link without closing', async () => {
    const { container, events } = mountDialog()
    const source = container.querySelector<HTMLAnchorElement>('.announcement-source')

    source?.addEventListener('click', (event) => event.preventDefault())
    source?.click()
    await nextTick()

    expect(events).toContain('action:official')
    expect(events).not.toContain('acknowledge')
  })
})

function mountDialog() {
  const container = document.createElement('div')
  const events: string[] = []
  const root = defineComponent({
    setup() {
      return () =>
        h(AnnouncementDialog, {
          announcement: activeAnnouncements[0],
          modelValue: true,
          'onUpdate:modelValue': (value: boolean) => {
            events.push(`update:${value}`)
          },
          onAcknowledge: () => {
            events.push('acknowledge')
          },
          onSnooze: () => {
            events.push('snooze')
          },
          onAction: (target: string) => {
            events.push(`action:${target}`)
          }
        })
    }
  })
  const app = createApp(root)

  app.component('VDialog', passthroughComponent)
  app.component('VCard', passthroughComponent)
  app.component('VCardText', passthroughComponent)
  app.component('VAlert', passthroughComponent)
  app.component('VBtn', actionComponent)
  app.component('VIcon', emptyComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { container, events }
}

const passthroughComponent: Component = {
  template: '<div><slot /></div>'
}

const actionComponent: Component = {
  inheritAttrs: false,
  props: ['href', 'target', 'rel'],
  emits: ['click'],
  template: '<a :href="href" :target="target" :rel="rel" @click="$emit(\'click\')"><slot /></a>'
}

const emptyComponent: Component = {
  template: '<span />'
}

function findAction(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLAnchorElement>('a')]
    .find((candidate) => candidate.textContent?.includes(text))
}
