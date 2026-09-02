import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { findNewsArticle } from '../content/news'
import { applySeoToDocument, buildArticleSeo, buildRouteUrl, resolveRouteSeo } from '../shared/seo.mjs'
import {
  defaultDescription,
  notFoundSeo,
  routeNames,
  siteTitle,
  staticRoutes
} from '../shared/site-routes.mjs'

// head 写入序列在 shared/seo.mjs 的 applySeoToDocument 中唯一实现;
// 浏览器端适配器只负责把当前路由解析成 SeoInfo 与文章数据。
export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  const seo = getRouteSeo(route)
  const url = buildRouteUrl(route.path)
  const article = route.name === routeNames.newsArticle ? findNewsArticle(route.params.slug) : undefined

  applySeoToDocument(document, seo, { url, article })
}

function getRouteSeo(route: RouteLocationNormalizedLoaded) {
  if (route.name === routeNames.newsArticle) {
    const article = findNewsArticle(route.params.slug)

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
