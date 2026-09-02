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
    const article = findNewsArticle('hello-world')

    expect(article?.slug).toBe('hello-world')
    expect(findNewsArticle('hello-world/')?.slug).toBe('hello-world')
  })

  it('returns undefined for missing or absent slugs', () => {
    expect(findNewsArticle('definitely-missing-slug')).toBeUndefined()
    expect(findNewsArticle(undefined)).toBeUndefined()
  })
})

describe('newsArticles', () => {
  it('sorts pinned articles first and newest within each group', () => {
    expect(newsArticles.length).toBeGreaterThan(0)

    const firstUnpinnedIndex = newsArticles.findIndex((article) => !article.pinned)

    if (firstUnpinnedIndex === -1) {
      return
    }

    for (const article of newsArticles.slice(firstUnpinnedIndex)) {
      expect(article.pinned).toBe(false)
    }

    for (let index = firstUnpinnedIndex + 1; index < newsArticles.length; index++) {
      expect(newsArticles[index]?.publishedAtTimestamp)
        .toBeLessThanOrEqual(newsArticles[index - 1]?.publishedAtTimestamp ?? Number.POSITIVE_INFINITY)
    }
  })
})

describe('newsCategories', () => {
  it('lists each generated category exactly once', () => {
    expect(newsCategories).toEqual([...new Set(newsCategories)])
    expect(newsCategories).toEqual([...new Set(newsArticles.map((article) => article.category))])
  })
})
