// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const article = {
  title: '测试新闻',
  summary: '测试摘要',
  category: '公告',
  publishedAt: '2026-01-02',
  author: '测试作者',
  slug: 'known-article'
}

vi.mock('../content/news', () => ({
  findNewsArticle: vi.fn((slug: string) => (slug === 'known-article' ? article : undefined))
}))

const { applyRouteSeo } = await import('./seo')

function createRoute(
  name: string,
  path: string,
  params: RouteLocationNormalizedLoaded['params'] = {},
  fullPath = path
) {
  return {
    name,
    path,
    fullPath,
    params
  } as RouteLocationNormalizedLoaded
}

function getMeta(attribute: 'name' | 'property', key: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
}

describe('applyRouteSeo', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('sets seo tags for a regular route', () => {
    applyRouteSeo(createRoute('download', '/download'))

    expect(document.title).toBe('下载 - 蔚蓝咖啡厅')
    expect(getMeta('name', 'description')?.content).toBe(
      '获取 BlueArchive.Cafe Android、iOS、macOS 与 Windows 客户端下载入口，并查看安装文档。'
    )
    expect(getMeta('property', 'og:title')?.content).toBe('下载 - 蔚蓝咖啡厅')
    expect(getMeta('name', 'twitter:card')?.content).toBe('summary')
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://bluearchive.cafe/download'
    )
  })

  it('removes article published time when the next route is not an article', () => {
    applyRouteSeo(createRoute('news-article', '/news/known-article', { slug: 'known-article' }))
    expect(getMeta('property', 'article:published_time')?.content).toBe('2026-01-02')
    expect(getMeta('name', 'robots')?.content).toBe('index, follow')

    applyRouteSeo(createRoute('download', '/download'))
    expect(getMeta('property', 'article:published_time')).toBeNull()
  })

  it('excludes query and hash values from the canonical url', () => {
    applyRouteSeo(createRoute('download', '/download', {}, '/download?show_hidden=1#options'))

    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://bluearchive.cafe/download'
    )
  })

  it('marks missing routes and missing articles as noindex', () => {
    applyRouteSeo(createRoute('not-found', '/missing'))
    expect(getMeta('name', 'robots')?.content).toBe('noindex, follow')

    applyRouteSeo(createRoute('news-article', '/news/missing', { slug: 'missing' }))
    expect(getMeta('name', 'robots')?.content).toBe('noindex, follow')
    expect(document.head.querySelector('script[id="jsonld-article"]')).toBeNull()
  })

  it('adds and removes article json-ld across navigation', () => {
    applyRouteSeo(createRoute('news-article', '/news/known-article', { slug: 'known-article' }))
    const schema = JSON.parse(document.head.querySelector('script[id="jsonld-article"]')?.textContent ?? '{}') as {
      headline: string
      author: { name: string }
    }

    expect(schema.headline).toBe('测试新闻')
    expect(schema.author.name).toBe('测试作者')

    applyRouteSeo(createRoute('news', '/news'))
    expect(document.head.querySelector('script[id="jsonld-article"]')).toBeNull()
  })
})
