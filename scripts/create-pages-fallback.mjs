import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { notFoundSeo } from '../src/shared/site-routes.mjs'
import { getSitemapRoutes } from './site-routes.mjs'
import { readNewsEntries } from './news-entries.mjs'
import { renderRouteHtml } from './static-html.mjs'

const distDirectory = resolve('dist')
const indexFile = resolve(distDirectory, 'index.html')
const source = await readFile(indexFile, 'utf-8')
const routes = await getSitemapRoutes(await readNewsEntries())

for (const route of routes) {
  const routeHtml = renderRouteHtml(source, route)

  if (route.path === '/') {
    await writeFile(indexFile, routeHtml)
    continue
  }

  const routeDirectory = resolve(distDirectory, route.path.replace(/^\//, ''))
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(resolve(routeDirectory, 'index.html'), routeHtml)
}

await writeFile(
  resolve(distDirectory, '404.html'),
  renderRouteHtml(source, notFoundSeo, { notFound: true })
)

console.log(`Created route-specific HTML for ${routes.length} routes and dist/404.html.`)
