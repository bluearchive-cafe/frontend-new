// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import { defaultImage } from './site-routes.mjs'
import { applySeoToDocument, buildArticleSeo, buildSiteSchemas, type ArticleSchemaInput, type SeoInfo } from './seo.mjs'

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
    publishedAt: '2026-01-02 03:04',
    publishedAtDateTime: '2026-01-02T03:04',
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

// 机器可读的日期必须是 ISO 8601;展示值("2026-01-02 03:04")不能直接上送。
const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/

describe('machine-readable dates', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('publishes the ISO value in article:published_time and JSON-LD datePublished', () => {
    // 与 NewsArticle 同形:同一个对象既喂 SEO 元数据也喂 JSON-LD。
    const article = {
      title: '测试文章',
      author: '作者',
      category: '公告',
      summary: '示例摘要',
      publishedAt: '2026-01-02 03:04',
      publishedAtDateTime: '2026-01-02T03:04',
      slug: 'a'
    }

    applySeoToDocument(document, buildArticleSeo(article), {
      url: 'https://bluearchive.cafe/news/a',
      article
    })

    expect(getMeta('property', 'article:published_time')?.getAttribute('content')).toMatch(ISO_8601)

    const jsonLd = JSON.parse(
      document.head.querySelector('script[id="jsonld-article"]')?.textContent ?? '{}'
    ) as { datePublished?: string }

    expect(jsonLd.datePublished).toBe('2026-01-02T03:04')
  })
})

// defaultImage 的文件存在性由 scripts/site-routes.test.mjs 守卫;
// 这里锁定 head 与站点 JSON-LD 只引用它,不允许再出现硬编码副本。
describe('defaultImage consumers', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('is the only image the head sequence and site schemas advertise', () => {
    applySeoToDocument(document, baseSeo(), { url: 'https://bluearchive.cafe/' })

    expect(getMeta('property', 'og:image')?.getAttribute('content')).toBe(defaultImage)
    expect(getMeta('name', 'twitter:image')?.getAttribute('content')).toBe(defaultImage)

    const [organization] = buildSiteSchemas()

    expect(organization?.logo).toBe(defaultImage)
  })
})
