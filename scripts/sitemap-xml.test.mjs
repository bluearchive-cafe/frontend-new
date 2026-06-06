import { describe, expect, it } from 'vitest'

import { escapeXml, renderSitemap } from './sitemap-xml.mjs'

describe('escapeXml', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`https://example.com/?q=<tag>&name="Sensei"&mark='x'`)).toBe(
      'https://example.com/?q=&lt;tag&gt;&amp;name=&quot;Sensei&quot;&amp;mark=&apos;x&apos;'
    )
  })

  it('rejects non-string values', () => {
    expect(() => escapeXml(undefined)).toThrow(TypeError)
    expect(() => escapeXml({})).toThrow(TypeError)
  })
})

describe('renderSitemap', () => {
  it('rejects a non-array route list', () => {
    expect(() => renderSitemap(null)).toThrow(TypeError)
  })

  it('rejects routes with invalid field types', () => {
    expect(() => renderSitemap([{ path: '/news', changefreq: 'weekly', priority: 1 }])).toThrow(TypeError)
    expect(() => renderSitemap([{ path: '/news', changefreq: 'weekly', priority: '0.8', lastmod: 20260101 }])).toThrow(
      TypeError
    )
  })

  it('renders a sitemap document for valid routes', () => {
    const sitemap = renderSitemap([
      {
        path: '/news/alpha',
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: '2026-01-02'
      }
    ])

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(sitemap).toContain('<loc>https://bluearchive.cafe/news/alpha</loc>')
    expect(sitemap).toContain('<lastmod>2026-01-02</lastmod>')
  })
})
