import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { findNewsArticle } from '../content/news'

const siteTitle = '蔚蓝咖啡厅'
const siteName = 'BlueArchive.Cafe'
const siteUrl = 'https://bluearchive-cafe.github.io/frontend-new/'
const defaultImage = `${siteUrl}favicon.jpg`
const defaultDescription = 'BlueArchive.Cafe 蔚蓝咖啡厅，提供蔚蓝档案汉化服务、安装教程、公告资讯与客户端下载入口。'
const defaultKeywords = '蔚蓝档案,蔚蓝档案汉化,Blue Archive,BlueArchive.Cafe,蔚蓝咖啡厅,汉化教程,客户端下载'

type SeoInfo = {
  title: string
  description: string
  keywords?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

const routeSeo: Record<string, SeoInfo> = {
  home: {
    title: siteTitle,
    description: defaultDescription
  },
  news: {
    title: `新闻 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 的汉化更新、使用说明、站点公告与重要资讯。'
  },
  download: {
    title: `下载 - ${siteTitle}`,
    description: '获取 BlueArchive.Cafe Android、iOS、macOS 与 Windows 客户端下载入口，并查看安装文档。'
  },
  status: {
    title: `状态 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 汉化资源、客户端与资源包的同步状态。'
  },
  about: {
    title: `关于 - ${siteTitle}`,
    description: '了解 BlueArchive.Cafe 蔚蓝咖啡厅项目、维护团队、社交媒体与友情链接。'
  },
  'not-found': {
    title: `页面不存在 - ${siteTitle}`,
    description: '页面可能已移动、删除，或暂时不可用。'
  }
}

export function applyRouteSeo(route: RouteLocationNormalizedLoaded) {
  const seo = getRouteSeo(route)
  const url = getRouteUrl(route)

  document.title = seo.title
  setMeta('name', 'description', seo.description)
  setMeta('name', 'keywords', seo.keywords ?? defaultKeywords)
  setMeta('name', 'robots', 'index, follow')
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
}

function getRouteSeo(route: RouteLocationNormalizedLoaded): SeoInfo {
  if (route.name === 'news-article') {
    const slugParam = route.params.slug
    const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam
    const article = typeof slug === 'string' ? findNewsArticle(slug) : null

    if (!article) {
      return routeSeo['not-found']
    }

    return {
      title: `${article.title} - ${siteTitle}`,
      description: article.summary || `${article.title}，来自 BlueArchive.Cafe 的新闻与公告。`,
      keywords: `${article.category},${defaultKeywords}`,
      type: 'article',
      publishedAt: article.publishedAt
    }
  }

  return typeof route.name === 'string' ? routeSeo[route.name] ?? routeSeo['not-found'] : routeSeo.home
}

function getRouteUrl(route: RouteLocationNormalizedLoaded) {
  const path = route.fullPath === '/' ? '/' : route.fullPath
  return `${siteUrl}#${path}`
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
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
