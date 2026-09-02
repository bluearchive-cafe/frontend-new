import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getSitemapRoutes } from './site-routes.mjs'
import { readNewsEntries } from './news-entries.mjs'
import { renderSitemap } from './sitemap-xml.mjs'

const distDirectory = path.resolve('dist')
const sitemapPath = path.join(distDirectory, 'sitemap.xml')
// 路由里的新闻条目读自 generate:news:* 产出的 news-entries.generated.json:
// 单独运行本脚本前需先跑 generate:news:prod,否则会沿用 generate:news:dev
// 写入的含草稿清单(npm run build 已按此顺序执行)。
const routes = await getSitemapRoutes(await readNewsEntries())

await mkdir(distDirectory, { recursive: true })
await writeFile(sitemapPath, renderSitemap(routes))

console.log(`Created dist/sitemap.xml with ${routes.length} URLs.`)
