import {
  defaultDescription,
  defaultKeywords,
  siteTitle,
  siteUrl,
  staticRoutes
} from '../src/shared/site-routes.mjs'
import { readNewsEntries } from './news-entries.mjs'

export { siteUrl, staticRoutes }

export async function getSitemapRoutes() {
  const newsRoutes = (await readNewsEntries()).map((article) => ({
    path: `/news/${article.slug}`,
    title: `${article.title} - ${siteTitle}`,
    description: article.summary || `${article.title}，来自 BlueArchive.Cafe 的新闻与公告。`,
    keywords: `${article.category},${defaultKeywords}`,
    type: 'article',
    author: article.author,
    publishedAt: article.publishedAt,
    slug: article.slug,
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: formatLastmod(article.publishedAt)
  }))

  return staticRoutes.map((route) => ({
    ...route,
    description: route.description || defaultDescription
  })).concat(newsRoutes)
}

export function getRouteUrl(routePath) {
  const normalizedPath = routePath === '/' ? '' : routePath.replace(/^\//, '')

  return new URL(normalizedPath, siteUrl).toString()
}

function formatLastmod(value) {
  if (!value) {
    return undefined
  }

  const match = value.match(/^\d{4}-\d{2}-\d{2}/)

  return match?.[0]
}
