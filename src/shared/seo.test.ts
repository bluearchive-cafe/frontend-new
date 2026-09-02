// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import { applySeoToDocument, type ArticleSchemaInput, type SeoInfo } from './seo.mjs'

function baseSeo(): SeoInfo {
  return {
    title: '测试页面',
    description: '测试描述',
    keywords: '测试,关键词',
    robots: 'index, follow',
    type: 'website',
    publishedAt: ''
  }
}

function articleInput(overrides: Partial<ArticleSchemaInput> = {}): ArticleSchemaInput {
  return {
    title: '测试文章',
    author: '作者',
    publishedAt: '2026-01-02',
    slug: 'a',
    ...overrides
  }
}

function getMeta(attribute: 'name' | 'property', key: string) {
  return document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
}

describe('applySeoToDocument', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('writes the full head sequence', () => {
    applySeoToDocument(document, baseSeo(), { url: 'https://bluearchive.cafe/news' })

    expect(document.title).toBe('测试页面')
    expect(getMeta('property', 'og:title')?.getAttribute('content')).toBe('测试页面')
    expect(getMeta('name', 'twitter:card')?.getAttribute('content')).toBe('summary')
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href')).toBe('https://bluearchive.cafe/news')
    expect(getMeta('property', 'article:published_time')).toBeNull()
    expect(document.head.querySelector('script[id="jsonld-article"]')).toBeNull()
  })

  it('removes optional tags and canonical when their values are empty', () => {
    applySeoToDocument(document, { ...baseSeo(), publishedAt: '2026-01-02' }, {
      url: 'https://bluearchive.cafe/news/a',
      article: articleInput()
    })
    expect(getMeta('property', 'article:published_time')).not.toBeNull()
    expect(document.head.querySelector('script[id="jsonld-article"]')).not.toBeNull()

    applySeoToDocument(document, { ...baseSeo(), publishedAt: '2026-01-02' }, {})

    expect(getMeta('property', 'og:url')).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(getMeta('property', 'article:published_time')?.getAttribute('content')).toBe('2026-01-02')
    expect(document.head.querySelector('script[id="jsonld-article"]')).toBeNull()
  })

  it('escapes html-sensitive characters in serialized article json-ld', () => {
    applySeoToDocument(document, { ...baseSeo(), type: 'article' }, {
      url: 'https://bluearchive.cafe/news/unsafe',
      article: articleInput({ title: '</script><script>alert(1)</script>', author: 'A & B', slug: 'unsafe' })
    })

    const jsonLd = document.head.querySelector('script[id="jsonld-article"]')?.textContent ?? ''

    expect(jsonLd).not.toContain('</script><script>')
    expect(jsonLd).toContain('\\u003c/script\\u003e')
    expect(jsonLd).toContain('A \\u0026 B')
  })

  it('appends site-level json-ld only when requested', () => {
    applySeoToDocument(document, baseSeo(), { siteSchemas: true })

    const schemas = [...document.head.querySelectorAll('script[type="application/ld+json"]:not([id])')]
    expect(schemas).toHaveLength(2)

    document.head.innerHTML = ''
    applySeoToDocument(document, baseSeo(), {})
    expect(document.head.querySelectorAll('script[type="application/ld+json"]:not([id])')).toHaveLength(0)
  })
})
