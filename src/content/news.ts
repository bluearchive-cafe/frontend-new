import { generatedNewsArticles } from './news.generated'

export type { NewsArticle } from './news-types'

export const newsArticles = generatedNewsArticles.sort((left, right) => {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.publishedAtTimestamp - left.publishedAtTimestamp
})

export function findNewsArticle(slug: string) {
  const normalizedSlug = slug.replace(/\/+$/, '')

  return newsArticles.find((article) => article.slug === normalizedSlug)
}

export const newsCategories = Array.from(new Set(newsArticles.map((article) => article.category)))
