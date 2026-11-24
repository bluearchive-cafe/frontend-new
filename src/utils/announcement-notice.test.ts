import { describe, expect, it } from 'vitest'

import type { SiteAnnouncement } from '../content/announcements'
import {
  announcementStorageKey,
  dismissAnnouncement,
  findPendingAnnouncement,
  isAnnouncementDismissed,
  type AnnouncementStorage
} from './announcement-notice'

function createAnnouncement(overrides: Partial<SiteAnnouncement> = {}): SiteAnnouncement {
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
    suppressPaths: ['/news/sample-notice'],
    ...overrides
  }
}

function memoryStorage(): AnnouncementStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()

  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    }
  }
}

describe('announcementStorageKey', () => {
  it('combines the announcement id with its revision', () => {
    expect(announcementStorageKey({ id: 'publisher-transfer-2027', revision: 2 }))
      .toBe('ba-cafe:notice:dismissed:publisher-transfer-2027:r2')
  })
})

describe('findPendingAnnouncement', () => {
  it('returns the first announcement that is not dismissed', () => {
    const storage = memoryStorage()
    const first = createAnnouncement({ id: 'first' })
    const second = createAnnouncement({ id: 'second' })

    expect(findPendingAnnouncement([first, second], '/', storage)).toBe(first)

    dismissAnnouncement(first, storage)

    expect(findPendingAnnouncement([first, second], '/', storage)).toBe(second)
  })

  it('skips announcements suppressed on the current path', () => {
    const storage = memoryStorage()
    const announcement = createAnnouncement()

    expect(findPendingAnnouncement([announcement], '/news/sample-notice/', storage)).toBeNull()
    expect(isAnnouncementDismissed(announcement, storage)).toBe(false)
  })

  it('shows a revised announcement again without touching the previous key', () => {
    const storage = memoryStorage()
    const original = createAnnouncement({ revision: 1 })
    const revised = createAnnouncement({ revision: 2 })

    dismissAnnouncement(original, storage)

    expect(findPendingAnnouncement([revised], '/', storage)).toBe(revised)
    expect(storage.values.size).toBe(1)
  })

  it('treats unreadable storage as not dismissed', () => {
    const storage: AnnouncementStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => undefined
    }

    expect(findPendingAnnouncement([createAnnouncement()], '/', storage)).not.toBeNull()
  })

  it('keeps dismissal best-effort when storage writes are blocked', () => {
    const storage: AnnouncementStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked')
      }
    }
    const announcement = createAnnouncement()

    expect(() => dismissAnnouncement(announcement, storage)).not.toThrow()
    expect(isAnnouncementDismissed(announcement, storage)).toBe(false)
  })
})
