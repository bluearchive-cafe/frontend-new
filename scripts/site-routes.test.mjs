import { existsSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  defaultImage,
  siteUrl,
  staticRoutes as sharedStaticRoutes
} from '../src/shared/site-routes.mjs'
import { getSitemapRoutes, staticRoutes as scriptStaticRoutes } from './site-routes.mjs'

// 站点图片一旦指向不存在的文件,边缘节点的 SPA 回退会返回 200 HTML,
// 分享预览静默失效,状态码监控看不出来,所以在这里锁死文件存在性。
describe('defaultImage', () => {
  it('points at a file served from public/', () => {
    expect(defaultImage.startsWith(siteUrl)).toBe(true)

    const assetPath = new URL(`../public/${defaultImage.slice(siteUrl.length)}`, import.meta.url)

    expect(existsSync(assetPath)).toBe(true)
  })
})

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
        publishedAtDateTime: '2026-01-02T03:04',
        category: '公告',
        summary: '示例摘要'
      }
    ])

    const articleRoute = routes.find((route) => route.path === '/news/example-article')

    expect(articleRoute).toMatchObject({
      slug: 'example-article',
      type: 'article',
      // 机器可读字段用 ISO,不是展示串。
      publishedAt: '2026-01-02T03:04',
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
