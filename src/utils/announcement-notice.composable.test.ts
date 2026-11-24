// @vitest-environment jsdom

import { createApp, defineComponent, nextTick, watchEffect, type App } from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'

import type { SiteAnnouncement } from '../content/announcements'
import { useAnnouncementNotice, type AnnouncementStorage } from './announcement-notice'

let app: App | undefined
let router: Router | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  router = undefined
  window.history.replaceState({}, '', '/')
  document.body.innerHTML = ''
})

describe('useAnnouncementNotice', () => {
  it('waits for the initial deep link before applying suppressed paths', async () => {
    const state = await mountNotice('/news/sample-notice')

    expect(state.announcement).toBeNull()
    expect(state.isOpen).toBe(false)
  })

  it('opens the notice once the initial route is ready', async () => {
    const state = await mountNotice('/')

    expect(state.announcement?.id).toBe('sample-notice')
    expect(state.isOpen).toBe(true)
  })
})

async function mountNotice(initialPath: string) {
  window.history.replaceState({}, '', initialPath)

  const state: { announcement: SiteAnnouncement | null; isOpen: boolean } = {
    announcement: null,
    isOpen: false
  }
  const announcement = createAnnouncement()
  const storage = memoryStorage()
  const harness = defineComponent({
    setup() {
      const notice = useAnnouncementNotice([announcement], storage)

      watchEffect(() => {
        state.announcement = notice.announcement.value
        state.isOpen = notice.isOpen.value
      })

      return () => null
    }
  })

  router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { render: () => null } },
      { path: '/news/:slug(.+)', component: { render: () => null } }
    ]
  })
  app = createApp(harness)
  app.use(router)
  app.mount(document.createElement('div'))

  await router.isReady()
  await nextTick()
  await nextTick()

  return state
}

function createAnnouncement(): SiteAnnouncement {
  return {
    id: 'sample-notice',
    revision: 1,
    eyebrow: '公告',
    title: '示例公告',
    bannerSummary: '示例横幅',
    lead: '示例正文',
    dates: [],
    warning: '示例提醒',
    note: '示例说明',
    primaryAction: {
      label: '前往',
      href: 'https://example.com/apply'
    },
    newsAction: {
      label: '阅读公告',
      to: '/news/sample-notice'
    },
    sourceAction: {
      label: '官方原文',
      href: 'https://example.com/source'
    },
    suppressPaths: ['/news/sample-notice']
  }
}

function memoryStorage(): AnnouncementStorage {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    }
  }
}
