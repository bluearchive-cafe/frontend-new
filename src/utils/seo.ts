import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { findNewsArticle } from '../content/news'
import {
  buildArticleSchema,
  buildArticleSeo,
  buildRouteUrl,
  resolveRouteSeo
} from '../shared/seo.mjs'
import {
  defaultDescription,
  defaultImage,
  notFoundSeo,
  routeNames,
  siteName,
  siteTitle,
  staticRoutes
} from '../shared/site-routes.mjs'

export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  const seo = getRouteSeo(route)
  const url = buildRouteUrl(route.path)

  document.title = seo.title
  setMeta('name', 'description', seo.description)
  setMeta('name', 'keywords', seo.keywords)
  setMeta('name', 'robots', seo.robots)
  setCanonical(url)

  setMeta('property', 'og:site_name', siteName)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('property', 'og:type', seo.type)
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

  if (route.name === routeNames.newsArticle) {
    const article = findRouteArticle(route)

    if (article) {
      setJsonLd('jsonld-article', buildArticleSchema(article))
      return
    }
  }

  removeArticleSchema()
}

function getRouteSeo(route: RouteLocationNormalizedLoaded) {
  if (route.name === routeNames.newsArticle) {
    const article = findRouteArticle(route)

    if (!article) {
      return resolveRouteSeo(notFoundSeo)
    }

    return buildArticleSeo(article)
  }

  if (typeof route.name === 'string') {
    const staticRoute = staticRoutes.find((item) => item.name === route.name)

    if (staticRoute) {
      return resolveRouteSeo(staticRoute)
    }
  }

  return route.name === routeNames.notFound
    ? resolveRouteSeo(notFoundSeo)
    : resolveRouteSeo({ title: siteTitle, description: defaultDescription })
}

function findRouteArticle(route: RouteLocationNormalizedLoaded) {
  const slugParam = route.params.slug
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam

  return typeof slug === 'string' ? findNewsArticle(slug) : undefined
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

function removeArticleSchema() {
  removeJsonLd('jsonld-article')
}
