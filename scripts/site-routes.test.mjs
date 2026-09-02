import { describe, expect, it } from 'vitest'

import { staticRoutes as sharedStaticRoutes } from '../src/shared/site-routes.mjs'
import { getSitemapRoutes, staticRoutes as scriptStaticRoutes } from './site-routes.mjs'

describe('site route manifest', () => {
  it('uses the shared static route array in build scripts', () => {
    expect(scriptStaticRoutes).toBe(sharedStaticRoutes)
  })
})

describe('getSitemapRoutes', () => {
  it('derives article routes from injected news entries', async () => {
    const routes = await getSitemapRoutes([
      {
        slug: 'example-article',
        title: '示例文章',
        author: '测试作者',
        publishedAt: '2026-01-02 03:04',
        category: '公告',
        summary: '示例摘要'
      }
    ])

    const articleRoute = routes.find((route) => route.path === '/news/example-article')

    expect(articleRoute).toMatchObject({
      slug: 'example-article',
      type: 'article',
      author: '测试作者',
      summary: '示例摘要',
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: '2026-01-02'
    })
    expect(articleRoute?.title).toContain('示例文章')

    const staticRoutePaths = scriptStaticRoutes.map((route) => route.path)
    for (const route of routes) {
      if (route.path !== '/news/example-article') {
        expect(staticRoutePaths).toContain(route.path)
      }
    }
  })
})
