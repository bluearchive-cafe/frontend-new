import { JSDOM } from 'jsdom'

import { applySeoToDocument, buildRouteUrl, resolveRouteSeo } from '../src/shared/seo.mjs'

/**
 * @typedef {Omit<import('../src/shared/seo.mjs').SeoRouteInput, 'type'> & { path?: string, type?: 'website' }} WebsiteRoute
 * @typedef {import('../src/shared/seo.mjs').ArticleSchemaInput & import('../src/shared/seo.mjs').SeoRouteInput & { path: string, type: 'article' }} ArticleRoute
 * @typedef {WebsiteRoute | ArticleRoute} RenderRoute
 */

// 静态回退页的 SEO head 写入序列与浏览器端 src/utils/seo.ts 共用
// shared/seo.mjs 的 applySeoToDocument;本模块只负责构造 JSDOM Document
// 并按构建期需求(404、站点级 JSON-LD)传入选项。
/**
 * @param {string} source
 * @param {RenderRoute} route
 * @param {{ notFound?: boolean }} [options]
 */
export function renderRouteHtml(source, route, { notFound = false } = {}) {
  const dom = new JSDOM(source)

  applySeoToDocument(dom.window.document, resolveRouteSeo(route, { notFound }), {
    url: notFound ? '' : buildRouteUrl(route.path ?? '/'),
    article: route.type === 'article' ? route : null,
    siteSchemas: true
  })

  return dom.serialize()
}
