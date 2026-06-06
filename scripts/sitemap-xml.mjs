import { getRouteUrl } from './site-routes.mjs'

export function renderSitemap(routes) {
  if (!Array.isArray(routes)) {
    throw new TypeError('Sitemap routes must be an array.')
  }

  const urls = routes.map((route, index) => {
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

function assertSitemapRoute(route, index) {
  if (!route || typeof route !== 'object' || Array.isArray(route)) {
    throw new TypeError(`Sitemap route at index ${index} must be an object.`)
  }

  assertStringField(route, index, 'path')
  assertStringField(route, index, 'changefreq')
  assertStringField(route, index, 'priority')

  if (route.lastmod !== undefined && typeof route.lastmod !== 'string') {
    throw new TypeError(`Sitemap route at index ${index} field lastmod must be a string when present.`)
  }
}

function assertStringField(route, index, fieldName) {
  if (typeof route[fieldName] !== 'string') {
    throw new TypeError(`Sitemap route at index ${index} field ${fieldName} must be a string.`)
  }
}
