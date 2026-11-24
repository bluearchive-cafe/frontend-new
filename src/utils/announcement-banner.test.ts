import { describe, expect, it } from 'vitest'

import type { SiteAnnouncement } from '../content/announcements'
import {
  bannerStorageKey,
  dismissBanner,
  findBanner,
  isBannerDismissed,
  type BannerStorage
} from './announcement-banner'

function createBanner(overrides: Partial<SiteAnnouncement> = {}): SiteAnnouncement {
  return {
    id: 'publisher-transfer-2027',
    revision: 1,
    eyebrow: '官方公告 · 账号迁移',
    title: '日服《蔚蓝档案》发行商将变更为 NEXON',
    bannerSummary: '请在 2027 年 1 月中旬维护前完成「账号迁移申请」。',
    lead: '示例正文',
    dates: [],
    warning: '示例提醒',
    note: '示例说明',
    primaryAction: {
      label: '前往账号迁移申请',
      href: 'https://example.com/apply'
    },
    newsAction: {
      label: '阅读站点公告',
      to: '/news/publisher-transfer-2027'
    },
    sourceAction: {
      label: '官方原文',
      href: 'https://example.com/source'
    },
    suppressPaths: ['/news/publisher-transfer-2027'],
    ...overrides
  }
}

function memoryStorage(): BannerStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()

  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    }
  }
}

describe('bannerStorageKey', () => {
  it('keeps the banner dismissal separate from the dialog notice', () => {
    expect(bannerStorageKey({ id: 'publisher-transfer-2027', revision: 2 }))
      .toBe('ba-cafe:banner:dismissed:publisher-transfer-2027:r2')
  })
})

describe('findBanner', () => {
  it('returns the first announcement that has not been dismissed', () => {
    const storage = memoryStorage()
    const first = createBanner({ id: 'first' })
    const second = createBanner({ id: 'second' })

    expect(findBanner([first, second], storage)).toBe(first)

    dismissBanner(first, storage)

    expect(findBanner([first, second], storage)).toBe(second)
  })

  it('shows a revised banner again without touching the previous key', () => {
    const storage = memoryStorage()
    const original = createBanner({ revision: 1 })
    const revised = createBanner({ revision: 2 })

    dismissBanner(original, storage)

    expect(findBanner([revised], storage)).toBe(revised)
    expect(storage.values.size).toBe(1)
  })

  it('treats unreadable storage as not dismissed', () => {
    const storage: BannerStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => undefined
    }

    expect(isBannerDismissed(createBanner(), storage)).toBe(false)
    expect(findBanner([createBanner()], storage)).not.toBeNull()
  })

  it('keeps dismissal best-effort when storage writes are blocked', () => {
    const storage: BannerStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked')
      }
    }
    const banner = createBanner()

    expect(() => dismissBanner(banner, storage)).not.toThrow()
    expect(isBannerDismissed(banner, storage)).toBe(false)
  })
})
