import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { getSitemapRoutes } from './site-routes.mjs'

const distDir = resolve('dist')
const indexFile = resolve(distDir, 'index.html')
const fallbackFile = resolve(distDir, '404.html')

if (!existsSync(indexFile)) {
  throw new Error('dist/index.html was not found. Run the production build first.')
}

copyFileSync(indexFile, fallbackFile)

const routes = await getSitemapRoutes()

routes
  .filter((route) => route.path !== '/')
  .forEach((route) => {
    const routeDirectory = resolve(distDir, route.path.replace(/^\//, ''))
    mkdirSync(routeDirectory, { recursive: true })
    copyFileSync(indexFile, resolve(routeDirectory, 'index.html'))
  })

console.log(`Created dist/404.html and ${routes.length - 1} route fallback pages for static hosting.`)
