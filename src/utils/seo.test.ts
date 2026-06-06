// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const article = {
  title: '测试新闻',
  summary: '测试摘要',
  category: '公告',
  publishedAt: '2026-01-02'
}

vi.mock('../content/news', () => ({
  findNewsArticle: vi.fn((slug: string) => (slug === 'known-article' ? article : undefined))
}))

const { applyRouteSeo } = await import('./seo')

function createRoute(name: string, fullPath: string, params: RouteLocationNormalizedLoaded['params'] = {}) {
  return {
    name,
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

    applyRouteSeo(createRoute('download', '/download'))
    expect(getMeta('property', 'article:published_time')).toBeNull()
  })
})
