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

export const articleFallbackDescription = (title) => `${title}，来自 BlueArchive.Cafe 的新闻与公告。`

// 路由 → SEO 元数据;未声明的字段按站点默认值补齐。
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
export function buildArticleSeo(article) {
  return {
    title: `${article.title} - ${siteTitle}`,
    description: article.summary || articleFallbackDescription(article.title),
    keywords: `${article.category},${defaultKeywords}`,
    type: 'article',
    publishedAt: article.publishedAt
  }
}

// 规范化站点内路径为绝对 URL;首页与空路径落到站点根。
export function buildRouteUrl(routePath) {
  const normalizedPath = routePath === '/' ? '' : routePath.replace(/^\//, '').replace(/\/+$/, '')

  return new URL(normalizedPath, siteUrl).toString()
}

// Article JSON-LD 的 headline 使用纯文章标题(不带站点后缀)。
export function buildArticleHeadline(title) {
  const suffix = ` - ${siteTitle}`

  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

// 新闻文章 → Article JSON-LD(与运行时/构建期共用同一份结构)。
// description 优先取 summary,兼容构建脚本传入的 route.description。
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
