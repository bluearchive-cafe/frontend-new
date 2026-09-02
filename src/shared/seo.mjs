// 共享 SEO 数据源:浏览器端(src/utils/seo.ts)与构建脚本
// (scripts/static-html.mjs、scripts/site-routes.mjs、scripts/sitemap-xml.mjs)
// 从这里取路由 SEO 元数据、Article JSON-LD 与站点级 JSON-LD,
// 保证客户端 meta、静态回退页与 sitemap 永不漂移。
import {
  defaultDescription,
  defaultImage,
  defaultKeywords,
  siteName,
  siteTitle,
  siteUrl
} from './site-routes.mjs'

/**
 * @typedef {object} SeoRouteInput
 * @property {string} title
 * @property {string} [description]
 * @property {string} [keywords]
 * @property {string} [robots]
 * @property {'website' | 'article'} [type]
 * @property {string} [publishedAt]
 *
 * @typedef {object} SeoInfo
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} robots
 * @property {'website' | 'article'} type
 * @property {string} publishedAt
 *
 * @typedef {object} ArticleSeoInput
 * @property {string} title
 * @property {string} summary
 * @property {string} category
 * @property {string} publishedAt
 *
 * @typedef {object} ArticleSchemaInput
 * @property {string} title
 * @property {string} author
 * @property {string} publishedAt
 * @property {string} [summary]
 * @property {string} [description]
 * @property {string} slug
 */

/** @type {(title: string) => string} */
export const articleFallbackDescription = (title) => `${title}，来自 BlueArchive.Cafe 的新闻与公告。`

// 路由 → SEO 元数据;未声明的字段按站点默认值补齐。
/**
 * @param {SeoRouteInput} route
 * @param {{ notFound?: boolean }} [options]
 * @returns {SeoInfo}
 */
export function resolveRouteSeo(route, { notFound = false } = {}) {
  return {
    title: route.title,
    description: route.description || defaultDescription,
    keywords: route.keywords ?? defaultKeywords,
    robots: route.robots ?? (notFound ? 'noindex, follow' : 'index, follow'),
    type: route.type ?? 'website',
    publishedAt: route.publishedAt ?? ''
  }
}

// 新闻文章 → 路由级 SEO 元数据(标题带站点后缀,描述回退到统一文案)。
/**
 * @param {ArticleSeoInput} article
 * @returns {SeoInfo}
 */
export function buildArticleSeo(article) {
  return {
    title: `${article.title} - ${siteTitle}`,
    description: article.summary || articleFallbackDescription(article.title),
    keywords: `${article.category},${defaultKeywords}`,
    robots: 'index, follow',
    type: 'article',
    publishedAt: article.publishedAt
  }
}

// 规范化站点内路径为绝对 URL;首页与空路径落到站点根。
/** @param {string} routePath */
export function buildRouteUrl(routePath) {
  const normalizedPath = routePath === '/' ? '' : routePath.replace(/^\//, '').replace(/\/+$/, '')

  return new URL(normalizedPath, siteUrl).toString()
}

// Article JSON-LD 的 headline 使用纯文章标题(不带站点后缀)。
/** @param {string} title */
export function buildArticleHeadline(title) {
  const suffix = ` - ${siteTitle}`

  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

// 新闻文章 → Article JSON-LD(与运行时/构建期共用同一份结构)。
// description 优先取 summary,兼容构建脚本传入的 route.description。
/**
 * @param {ArticleSchemaInput} article
 * @returns {Record<string, unknown>}
 */
export function buildArticleSchema(article) {
  const description = article.summary || article.description || articleFallbackDescription(article.title)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: buildArticleHeadline(article.title),
    author: { '@type': 'Person', name: article.author },
    datePublished: article.publishedAt,
    description,
    url: new URL(`news/${article.slug}`, siteUrl).toString(),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: defaultImage }
    }
  }
}

// 站点级 JSON-LD:Organization 与 WebSite,构建期注入每个静态页面。
/** @returns {Array<Record<string, unknown>>} */
export function buildSiteSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteTitle,
      alternateName: siteName,
      url: siteUrl,
      logo: `${siteUrl}favicon.jpg`,
      description: defaultDescription,
      email: 'feedback@bluearchive.cafe',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'feedback@bluearchive.cafe',
        contactType: 'customer support',
        availableLanguage: ['Chinese', 'English']
      },
      sameAs: [
        'https://space.bilibili.com/3706947316484682',
        'https://github.com/bluearchive-cafe'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteTitle,
      url: siteUrl,
      description: defaultDescription,
      inLanguage: 'zh-CN'
    }
  ]
}

// SEO head 写入序列的唯一实现:浏览器端与构建脚本各传自己的 Document
// (真实 document / JSDOM document),保证两侧 meta、canonical 与 JSON-LD
// 永不漂移。空值语义:meta 与 canonical 内容为空时移除该元素。
/**
 * @param {Document} doc
 * @param {SeoInfo} seo
 * @param {{ url?: string, article?: ArticleSchemaInput | null, siteSchemas?: boolean }} [options]
 */
export function applySeoToDocument(doc, seo, { url = '', article = null, siteSchemas = false } = {}) {
  doc.title = seo.title
  setMeta(doc, 'name', 'description', seo.description)
  setMeta(doc, 'name', 'keywords', seo.keywords)
  setMeta(doc, 'name', 'robots', seo.robots)
  setMeta(doc, 'property', 'og:site_name', siteName)
  setMeta(doc, 'property', 'og:locale', 'zh_CN')
  setMeta(doc, 'property', 'og:type', seo.type)
  setMeta(doc, 'property', 'og:title', seo.title)
  setMeta(doc, 'property', 'og:description', seo.description)
  setMeta(doc, 'property', 'og:url', url)
  setMeta(doc, 'property', 'og:image', defaultImage)
  setMeta(doc, 'name', 'twitter:card', 'summary')
  setMeta(doc, 'name', 'twitter:title', seo.title)
  setMeta(doc, 'name', 'twitter:description', seo.description)
  setMeta(doc, 'name', 'twitter:image', defaultImage)
  setMeta(doc, 'property', 'article:published_time', seo.publishedAt)
  setCanonical(doc, url)
  setArticleSchema(doc, article)
  setSiteSchemas(doc, siteSchemas)
}

/**
 * @param {Document} doc
 * @param {'name' | 'property'} attribute
 * @param {string} key
 * @param {string} content
 */
function setMeta(doc, attribute, key, content) {
  if (!content) {
    doc.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
    return
  }

  let meta = doc.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = doc.createElement('meta')
    meta.setAttribute(attribute, key)
    doc.head.append(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * @param {Document} doc
 * @param {string} href
 */
function setCanonical(doc, href) {
  let link = doc.head.querySelector('link[rel="canonical"]')

  if (!href) {
    link?.remove()
    return
  }

  if (!link) {
    link = doc.createElement('link')
    link.setAttribute('rel', 'canonical')
    doc.head.append(link)
  }

  link.setAttribute('href', href)
}

/**
 * @param {Document} doc
 * @param {ArticleSchemaInput | null} article
 */
function setArticleSchema(doc, article) {
  doc.head.querySelector('script[id="jsonld-article"]')?.remove()

  if (article) {
    appendJsonLd(doc, 'jsonld-article', buildArticleSchema(article))
  }
}

/**
 * @param {Document} doc
 * @param {boolean} enabled
 */
function setSiteSchemas(doc, enabled) {
  if (!enabled) {
    return
  }

  for (const schema of buildSiteSchemas()) {
    appendJsonLd(doc, '', schema)
  }
}

/**
 * @param {Document} doc
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
function appendJsonLd(doc, id, data) {
  const script = doc.createElement('script')

  if (id) {
    script.id = id
  }

  script.type = 'application/ld+json'
  script.textContent = serializeJsonLd(data)
  doc.head.append(script)
}

// 转义 <>& 防止序列化后的 JSON-LD 提前闭合 script 标签。
/** @param {Record<string, unknown>} data */
function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026'
  })[character] ?? character)
}
