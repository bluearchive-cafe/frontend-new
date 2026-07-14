import { JSDOM } from 'jsdom'

import {
  defaultImage,
  defaultKeywords,
  siteName,
  siteTitle,
  siteUrl
} from '../src/shared/site-routes.mjs'
import { getRouteUrl } from './site-routes.mjs'

export function renderRouteHtml(source, route, { notFound = false } = {}) {
  const dom = new JSDOM(source)
  const { document } = dom.window
  const url = notFound ? '' : getRouteUrl(route.path)
  const type = route.type ?? 'website'

  document.title = route.title
  setMeta(document, 'name', 'description', route.description)
  setMeta(document, 'name', 'keywords', route.keywords ?? defaultKeywords)
  setMeta(document, 'name', 'robots', route.robots ?? (notFound ? 'noindex, follow' : 'index, follow'))
  setMeta(document, 'property', 'og:site_name', siteName)
  setMeta(document, 'property', 'og:locale', 'zh_CN')
  setMeta(document, 'property', 'og:type', type)
  setMeta(document, 'property', 'og:title', route.title)
  setMeta(document, 'property', 'og:description', route.description)
  setOptionalMeta(document, 'property', 'og:url', url)
  setMeta(document, 'property', 'og:image', defaultImage)
  setMeta(document, 'name', 'twitter:card', 'summary')
  setMeta(document, 'name', 'twitter:title', route.title)
  setMeta(document, 'name', 'twitter:description', route.description)
  setMeta(document, 'name', 'twitter:image', defaultImage)
  setOptionalMeta(document, 'property', 'article:published_time', route.publishedAt ?? '')
  setCanonical(document, url)
  setArticleSchema(document, route)

  return dom.serialize()
}

function setMeta(document, attribute, key, content) {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }

  meta.setAttribute('content', content)
}

function setOptionalMeta(document, attribute, key, content) {
  if (!content) {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
    return
  }

  setMeta(document, attribute, key, content)
}

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

function setArticleSchema(document, route) {
  document.head.querySelector('script[id="jsonld-article"]')?.remove()

  if (route.type !== 'article') {
    return
  }

  const script = document.createElement('script')
  script.id = 'jsonld-article'
  script.type = 'application/ld+json'
  script.textContent = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: getArticleHeadline(route.title),
    author: { '@type': 'Person', name: route.author },
    datePublished: route.publishedAt,
    description: route.description,
    url: new URL(`news/${route.slug}`, siteUrl).toString(),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: defaultImage }
    }
  })
  document.head.append(script)
}

function getArticleHeadline(title) {
  const suffix = ` - ${siteTitle}`
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026'
  })[character])
}
