import { describe, expect, it } from 'vitest'

import { activeAnnouncements } from './announcements'
import { newsArticles } from './news'

describe('activeAnnouncements', () => {
  it('uses unique ids with positive revisions', () => {
    const ids = activeAnnouncements.map((announcement) => announcement.id)

    expect(new Set(ids).size).toBe(ids.length)

    for (const announcement of activeAnnouncements) {
      expect(announcement.revision).toBeGreaterThan(0)
    }
  })

  it('keeps every action URL absolute and secure', () => {
    for (const announcement of activeAnnouncements) {
      for (const action of [announcement.primaryAction, announcement.sourceAction]) {
        expect(new URL(action.href).protocol).toBe('https:')
      }
    }
  })

  it('links to a published article and suppresses the dialog on that path', () => {
    const slugs = new Set(newsArticles.map((article) => article.slug))

    for (const announcement of activeAnnouncements) {
      expect(announcement.newsAction.to).toMatch(/^\/news\/.+/)
      expect(slugs.has(announcement.newsAction.to.replace(/^\/news\//, ''))).toBe(true)
      expect(announcement.suppressPaths).toContain(announcement.newsAction.to)
    }
  })

  it('points the publisher transfer notice at the official application and announcement', () => {
    const announcement = activeAnnouncements.find(
      (candidate) => candidate.id === 'publisher-transfer-2027'
    )

    expect(announcement).toBeDefined()
    expect(new URL(announcement?.primaryAction.href ?? '').hostname)
      .toBe('ba-account-migration.yostar.co.jp')
    expect(new URL(announcement?.sourceAction.href ?? '').hostname)
      .toBe('cmn-jp.nexon.com')
    expect(announcement?.dates.length).toBeGreaterThan(0)
    expect(announcement?.warning).not.toBe('')
    expect(announcement?.note).not.toBe('')
  })
})
