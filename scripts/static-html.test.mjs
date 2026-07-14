import { describe, expect, it } from 'vitest'

import { notFoundSeo, staticRoutes } from '../src/shared/site-routes.mjs'
import { renderRouteHtml } from './static-html.mjs'

const source = '<!doctype html><html><head><title>Base</title><meta name="robots" content="index, follow"><link rel="canonical" href="https://bluearchive.cafe/"></head><body><div id="app"></div></body></html>'

describe('renderRouteHtml', () => {
  it('renders route-specific metadata before client execution', () => {
    const newsRoute = staticRoutes.find((route) => route.name === 'news')
    const output = renderRouteHtml(source, newsRoute)

    expect(output).toContain('<title>新闻 - 蔚蓝咖啡厅</title>')
    expect(output).toContain('content="查看 BlueArchive.Cafe 的汉化更新、使用说明、站点公告与重要资讯。"')
    expect(output).toContain('href="https://bluearchive.cafe/news"')
  })

  it('renders article metadata and json-ld', () => {
    const output = renderRouteHtml(source, {
      path: '/news/test',
      title: '测试文章 - 蔚蓝咖啡厅',
      description: '测试摘要',
      type: 'article',
      author: '测试作者',
      publishedAt: '2026-01-02',
      slug: 'test'
    })

    expect(output).toContain('property="article:published_time" content="2026-01-02"')
    expect(output).toContain('id="jsonld-article"')
    expect(output).toContain('"headline":"测试文章"')
  })

  it('escapes html-sensitive characters in serialized article json-ld', () => {
    const output = renderRouteHtml(source, {
      path: '/news/unsafe',
      title: '</script><script>alert(1)</script> - 蔚蓝咖啡厅',
      description: 'A & B',
      type: 'article',
      author: '<img src=x onerror=alert(1)>',
      publishedAt: '2026-01-02',
      slug: 'unsafe'
    })
    const jsonLd = output.match(/<script id="jsonld-article"[^>]*>(.*?)<\/script>/s)?.[1] ?? ''

    expect(jsonLd).not.toContain('</script><script>alert(1)</script>')
    expect(jsonLd).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)')
    expect(jsonLd).toContain('A \\u0026 B')
  })

  it('marks 404 html as noindex and removes canonical metadata', () => {
    const output = renderRouteHtml(source, notFoundSeo, { notFound: true })

    expect(output).toContain('content="noindex, follow"')
    expect(output).not.toContain('rel="canonical"')
    expect(output).not.toContain('property="og:url"')
  })
})
