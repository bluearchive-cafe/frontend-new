import { readNewsEntries } from './news-entries.mjs'

export const siteUrl = 'https://bluearchive.cafe/'

export const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/download', changefreq: 'weekly', priority: '0.9' },
  { path: '/news', changefreq: 'weekly', priority: '0.8' },
  { path: '/status', changefreq: 'daily', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' }
]

export async function getSitemapRoutes() {
  const newsRoutes = (await readNewsEntries()).map((article) => ({
    path: `/news/${article.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: formatLastmod(article.publishedAt)
  }))

  return [...staticRoutes, ...newsRoutes]
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

  if (!match) {
    return undefined
  }

  return match[0]
}
