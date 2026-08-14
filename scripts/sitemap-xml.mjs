import { getRouteUrl } from './site-routes.mjs'

/**
 * @typedef {object} SitemapRoute
 * @property {string} path
 * @property {string} changefreq
 * @property {string} priority
 * @property {string} [lastmod]
 */

/** @param {unknown} routes */
export function renderSitemap(routes) {
  if (!Array.isArray(routes)) {
    throw new TypeError('Sitemap routes must be an array.')
  }

  const sitemapRoutes = /** @type {unknown[]} */ (routes)
  const urls = sitemapRoutes.map((route, index) => {
    assertSitemapRoute(route, index)

    const lastmod = route.lastmod ? `\n    <lastmod>${escapeXml(route.lastmod)}</lastmod>` : ''

    return `  <url>
    <loc>${escapeXml(getRouteUrl(route.path))}</loc>${lastmod}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

/** @param {unknown} value */
export function escapeXml(value) {
  if (typeof value !== 'string') {
    throw new TypeError('XML value must be a string.')
  }

  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/**
 * @param {unknown} route
 * @param {number} index
 * @returns {asserts route is SitemapRoute}
 */
function assertSitemapRoute(route, index) {
  if (!route || typeof route !== 'object' || Array.isArray(route)) {
    throw new TypeError(`Sitemap route at index ${index} must be an object.`)
  }

  const record = /** @type {Record<string, unknown>} */ (route)
  assertStringField(record, index, 'path')
  assertStringField(record, index, 'changefreq')
  assertStringField(record, index, 'priority')

  if (record.lastmod !== undefined && typeof record.lastmod !== 'string') {
    throw new TypeError(`Sitemap route at index ${index} field lastmod must be a string when present.`)
  }
}

/**
 * @param {Record<string, unknown>} route
 * @param {number} index
 * @param {string} fieldName
 */
function assertStringField(route, index, fieldName) {
  if (typeof route[fieldName] !== 'string') {
    throw new TypeError(`Sitemap route at index ${index} field ${fieldName} must be a string.`)
  }
}
