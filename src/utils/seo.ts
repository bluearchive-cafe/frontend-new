import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { findNewsArticle } from '../content/news'
import {
  defaultDescription,
  defaultImage,
  defaultKeywords,
  notFoundSeo,
  siteName,
  siteTitle,
  siteUrl,
  staticRoutes
} from '../shared/site-routes.mjs'

type SeoInfo = {
  title: string
  description: string
  keywords?: string
  robots?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  const seo = getRouteSeo(route)
  const url = getRouteUrl(route)

  document.title = seo.title
  setMeta('name', 'description', seo.description)
  setMeta('name', 'keywords', seo.keywords ?? defaultKeywords)
  setMeta('name', 'robots', seo.robots ?? 'index, follow')
  setCanonical(url)

  setMeta('property', 'og:site_name', siteName)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('property', 'og:type', seo.type ?? 'website')
  setMeta('property', 'og:title', seo.title)
  setMeta('property', 'og:description', seo.description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', defaultImage)

  setMeta('name', 'twitter:card', 'summary')
  setMeta('name', 'twitter:title', seo.title)
  setMeta('name', 'twitter:description', seo.description)
  setMeta('name', 'twitter:image', defaultImage)

  if (seo.publishedAt) {
    setMeta('property', 'article:published_time', seo.publishedAt)
  } else {
    removeMeta('property', 'article:published_time')
  }

  if (route.name === 'news-article') {
    const article = findRouteArticle(route)

    if (article) {
      injectArticleSchema(article)
      return
    }
  }

  removeArticleSchema()
}

function getRouteSeo(route: RouteLocationNormalizedLoaded): SeoInfo {
  if (route.name === 'news-article') {
    const article = findRouteArticle(route)

    if (!article) {
      return notFoundSeo
    }

    return {
      title: `${article.title} - ${siteTitle}`,
      description: article.summary || `${article.title}，来自 BlueArchive.Cafe 的新闻与公告。`,
      keywords: `${article.category},${defaultKeywords}`,
      type: 'article',
      publishedAt: article.publishedAt
    }
  }

  if (typeof route.name === 'string') {
    const staticRoute = staticRoutes.find((item) => item.name === route.name)

    if (staticRoute) {
      return staticRoute
    }
  }

  return route.name === 'not-found' ? notFoundSeo : {
    title: siteTitle,
    description: defaultDescription
  }
}

function findRouteArticle(route: RouteLocationNormalizedLoaded) {
  const slugParam = route.params.slug
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam

  return typeof slug === 'string' ? findNewsArticle(slug) : undefined
}

function getRouteUrl(route: RouteLocationNormalizedLoaded) {
  const normalizedPath = route.path === '/' ? '' : route.path.replace(/^\//, '').replace(/\/+$/, '')
  return new URL(normalizedPath, siteUrl).toString()
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  if (!content) {
    removeMeta(attribute, key)
    return
  }

  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.append(meta)
  }

  meta.content = content
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.remove()
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.append(link)
  }

  link.href = href
}

function setJsonLd(id: string, data: Record<string, unknown>) {
  removeJsonLd(id)
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.append(script)
}

function removeJsonLd(id: string) {
  document.head.querySelector(`script[id="${id}"]`)?.remove()
}

function injectArticleSchema(article: { title: string; author: string; publishedAt: string; summary: string; slug: string }) {
  setJsonLd('jsonld-article', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: { '@type': 'Person', name: article.author },
    datePublished: article.publishedAt,
    description: article.summary || `${article.title}，来自 BlueArchive.Cafe 的新闻与公告。`,
    url: new URL(`news/${article.slug}`, siteUrl).toString(),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: defaultImage }
    }
  })
}

function removeArticleSchema() {
  removeJsonLd('jsonld-article')
}
