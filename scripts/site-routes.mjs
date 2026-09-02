import {
  defaultDescription,
  staticRoutes
} from '../src/shared/site-routes.mjs'
import { buildArticleSeo } from '../src/shared/seo.mjs'
import { readNewsEntries } from './news-entries.mjs'

export { staticRoutes }

// 路径 → 绝对 URL:与浏览器端 src/utils/seo.ts 共用同一实现。
export { buildRouteUrl as getRouteUrl } from '../src/shared/seo.mjs'

/**
 * @param {import('./news-entries.mjs').NewsEntry[]} [newsEntries]
 */
export async function getSitemapRoutes(newsEntries) {
  const resolvedEntries = newsEntries ?? await readNewsEntries()
  const newsRoutes = resolvedEntries.map((article) => {
    const seo = buildArticleSeo(article)

    return {
      path: `/news/${article.slug}`,
      ...seo,
      author: article.author,
      slug: article.slug,
      summary: article.summary,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: formatLastmod(article.publishedAt)
    }
  })

  const staticSitemapRoutes = staticRoutes.map((route) => ({
    ...route,
    description: route.description || defaultDescription
  }))

  return [...staticSitemapRoutes, ...newsRoutes]
}

/**
 * @param {string} value
 * @returns {string | undefined}
 */
function formatLastmod(value) {
  if (!value) {
    return undefined
  }

  const match = value.match(/^\d{4}-\d{2}-\d{2}/)

  return match?.[0]
}
