import { describe, expect, it } from 'vitest'

import { findNewsArticle, newsArticles, newsCategories, normalizeNewsSlug } from './news'

describe('normalizeNewsSlug', () => {
  it('accepts string, array and missing params', () => {
    expect(normalizeNewsSlug('example-article')).toBe('example-article')
    expect(normalizeNewsSlug(['2026-07-29', '1'])).toBe('2026-07-29/1')
    expect(normalizeNewsSlug(undefined)).toBeUndefined()
  })

  it('strips trailing slashes', () => {
    expect(normalizeNewsSlug('example-article/')).toBe('example-article')
    expect(normalizeNewsSlug(['2026-07-29', '1', ''])).toBe('2026-07-29/1')
  })
})

describe('findNewsArticle', () => {
  it('resolves slugs with and without trailing slashes', () => {
    // 不写死具体 slug:示例文章是草稿,正式生成时会被排除。
    const [sample] = newsArticles

    expect(sample).toBeDefined()
    expect(findNewsArticle(sample?.slug)?.slug).toBe(sample?.slug)
    expect(findNewsArticle(`${sample?.slug}/`)?.slug).toBe(sample?.slug)
  })

  it('returns undefined for missing or absent slugs', () => {
    expect(findNewsArticle('definitely-missing-slug')).toBeUndefined()
    expect(findNewsArticle(undefined)).toBeUndefined()
  })
})

describe('newsArticles', () => {
  it('sorts pinned articles first and newest within each group', () => {
    expect(newsArticles.length).toBeGreaterThan(0)

    const pinnedCount = newsArticles.filter((article) => article.pinned).length

    // 置顶区必须恰好占据开头:全置顶、全不置顶都是合法状态,不依赖具体内容集。
    expect(newsArticles.slice(0, pinnedCount).every((article) => article.pinned)).toBe(true)
    expect(newsArticles.slice(pinnedCount).every((article) => !article.pinned)).toBe(true)

    // 两个分组各自按发布时间倒序。
    for (const group of [newsArticles.slice(0, pinnedCount), newsArticles.slice(pinnedCount)]) {
      for (let index = 1; index < group.length; index++) {
        expect(group[index]?.publishedAtTimestamp)
          .toBeLessThanOrEqual(group[index - 1]?.publishedAtTimestamp ?? Number.POSITIVE_INFINITY)
      }
    }
  })
})

describe('newsCategories', () => {
  it('lists each generated category exactly once', () => {
    expect(newsCategories).toEqual([...new Set(newsCategories)])
    expect(newsCategories).toEqual([...new Set(newsArticles.map((article) => article.category))])
  })
})
