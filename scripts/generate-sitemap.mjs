import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getSitemapRoutes } from './site-routes.mjs'
import { renderSitemap } from './sitemap-xml.mjs'

const distDirectory = path.resolve('dist')
const sitemapPath = path.join(distDirectory, 'sitemap.xml')
const routes = await getSitemapRoutes()

await mkdir(distDirectory, { recursive: true })
await writeFile(sitemapPath, renderSitemap(routes))

console.log(`Created dist/sitemap.xml with ${routes.length} URLs.`)
