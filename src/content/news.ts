import { generatedNewsArticles } from './news.generated'

export type { NewsArticle } from './news-types'

export const newsArticles = generatedNewsArticles.sort((left, right) => {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1
  }

  return right.publishedAtTimestamp - left.publishedAtTimestamp
})

// slug 归一化的唯一实现:路由参数可能是 string、string[] 或缺失,
// 浏览器端查找与 SEO 派生都从这里走,尾部斜杠统一剥除。
export function normalizeNewsSlug(param: string | string[] | undefined): string | undefined {
  if (param === undefined) {
    return undefined
  }

  const raw = Array.isArray(param) ? param.join('/') : param

  return raw.replace(/\/+$/, '')
}

export function findNewsArticle(param: string | string[] | undefined) {
  const slug = normalizeNewsSlug(param)

  return slug === undefined ? undefined : newsArticles.find((article) => article.slug === slug)
}

export const newsCategories = Array.from(new Set(newsArticles.map((article) => article.category)))
