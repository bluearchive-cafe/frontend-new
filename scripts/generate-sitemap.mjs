import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getRouteUrl, getSitemapRoutes } from './site-routes.mjs'

const distDirectory = path.resolve('dist')
const sitemapPath = path.join(distDirectory, 'sitemap.xml')
const routes = await getSitemapRoutes()

await mkdir(distDirectory, { recursive: true })
await writeFile(sitemapPath, renderSitemap(routes))

console.log(`Created dist/sitemap.xml with ${routes.length} URLs.`)

function renderSitemap(routes) {
  const urls = routes.map((route) => {
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

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
