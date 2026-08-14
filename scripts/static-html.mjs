import { JSDOM } from 'jsdom'

import { defaultImage, siteName } from '../src/shared/site-routes.mjs'
import {
  buildArticleSchema,
  buildRouteUrl,
  buildSiteSchemas,
  resolveRouteSeo
} from '../src/shared/seo.mjs'

/**
 * @typedef {Omit<import('../src/shared/seo.mjs').SeoRouteInput, 'type'> & { path?: string, type?: 'website' }} WebsiteRoute
 * @typedef {import('../src/shared/seo.mjs').ArticleSchemaInput & import('../src/shared/seo.mjs').SeoRouteInput & { path: string, type: 'article' }} ArticleRoute
 * @typedef {WebsiteRoute | ArticleRoute} RenderRoute
 */

// 静态回退页的 SEO 元数据与 JSON-LD 与浏览器端 src/utils/seo.ts
// 共用 src/shared/seo.mjs 的派生逻辑,保证两者永不漂移。
/**
 * @param {string} source
 * @param {RenderRoute} route
 * @param {{ notFound?: boolean }} [options]
 */
export function renderRouteHtml(source, route, { notFound = false } = {}) {
  const dom = new JSDOM(source)
  const { document } = dom.window
  const seo = resolveRouteSeo(route, { notFound })
  const url = notFound ? '' : buildRouteUrl(route.path ?? '/')

  document.title = seo.title
  setMeta(document, 'name', 'description', seo.description)
  setMeta(document, 'name', 'keywords', seo.keywords)
  setMeta(document, 'name', 'robots', seo.robots)
  setMeta(document, 'property', 'og:site_name', siteName)
  setMeta(document, 'property', 'og:locale', 'zh_CN')
  setMeta(document, 'property', 'og:type', seo.type)
  setMeta(document, 'property', 'og:title', seo.title)
  setMeta(document, 'property', 'og:description', seo.description)
  setOptionalMeta(document, 'property', 'og:url', url)
  setMeta(document, 'property', 'og:image', defaultImage)
  setMeta(document, 'name', 'twitter:card', 'summary')
  setMeta(document, 'name', 'twitter:title', seo.title)
  setMeta(document, 'name', 'twitter:description', seo.description)
  setMeta(document, 'name', 'twitter:image', defaultImage)
  setOptionalMeta(document, 'property', 'article:published_time', seo.publishedAt)
  setCanonical(document, url)
  setArticleSchema(document, route)
  setSiteSchemas(document)

  return dom.serialize()
}

/**
 * @param {Document} document
 * @param {'name' | 'property'} attribute
 * @param {string} key
 * @param {string} content
 */
function setMeta(document, attribute, key, content) {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * @param {Document} document
 * @param {'name' | 'property'} attribute
 * @param {string} key
 * @param {string} content
 */
function setOptionalMeta(document, attribute, key, content) {
  if (!content) {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
    return
  }

  setMeta(document, attribute, key, content)
}

/**
 * @param {Document} document
 * @param {string} href
 */
function setCanonical(document, href) {
  let link = document.head.querySelector('link[rel="canonical"]')

  if (!href) {
    link?.remove()
    return
  }

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.append(link)
  }

  link.setAttribute('href', href)
}

/**
 * @param {Document} document
 * @param {RenderRoute} route
 */
function setArticleSchema(document, route) {
  document.head.querySelector('script[id="jsonld-article"]')?.remove()

  if (route.type !== 'article') {
    return
  }

  appendJsonLd(document, 'jsonld-article', buildArticleSchema(route))
}

/** @param {Document} document */
function setSiteSchemas(document) {
  for (const schema of buildSiteSchemas()) {
    appendJsonLd(document, '', schema)
  }
}

/**
 * @param {Document} document
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
function appendJsonLd(document, id, data) {
  const script = document.createElement('script')

  if (id) {
    script.id = id
  }

  script.type = 'application/ld+json'
  script.textContent = serializeJsonLd(data)
  document.head.append(script)
}

/** @param {Record<string, unknown>} data */
function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026'
  })[character] ?? character)
}
