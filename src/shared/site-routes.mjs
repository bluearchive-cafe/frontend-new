export const siteTitle = '蔚蓝咖啡厅'
export const siteName = 'BlueArchive.Cafe'
export const siteUrl = 'https://bluearchive.cafe/'
export const defaultImage = `${siteUrl}favicon.jpg`
export const defaultDescription = 'BlueArchive.Cafe 蔚蓝咖啡厅，提供蔚蓝档案汉化服务、安装教程、公告资讯与客户端下载入口。'
export const defaultKeywords = '蔚蓝档案,蔚蓝档案汉化,Blue Archive,BlueArchive.Cafe,蔚蓝咖啡厅,汉化教程,客户端下载'

/**
 * @typedef {object} StaticRouteDefinition
 * @property {string} name
 * @property {string} label
 * @property {string} path
 * @property {readonly string[]} alias
 * @property {string} title
 * @property {string} description
 * @property {string} changefreq
 * @property {string} priority
 */

// 动态路由名:router 与 SEO 层共用,避免跨文件字符串漂移。
/** @type {{ readonly newsArticle: 'news-article', readonly notFound: 'not-found' }} */
export const routeNames = {
  newsArticle: 'news-article',
  notFound: 'not-found'
}

// 静态路由是 path/SEO/导航标签的单一数据源:router、AppHeader、
// SiteFooter 与构建脚本都从这里派生,新增路由只改这一处 + 页面组件。
/** @type {readonly StaticRouteDefinition[]} */
export const staticRoutes = [
  {
    name: 'home',
    label: '首页',
    path: '/',
    alias: [],
    title: siteTitle,
    description: defaultDescription,
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    name: 'news',
    label: '新闻',
    path: '/news',
    alias: ['/news/'],
    title: `新闻 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 的汉化更新、使用说明、站点公告与重要资讯。',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    name: 'download',
    label: '下载',
    path: '/download',
    alias: [],
    title: `下载 - ${siteTitle}`,
    description: '获取 BlueArchive.Cafe Android、iOS、macOS 与 Windows 客户端下载入口，并查看安装文档。',
    changefreq: 'weekly',
    priority: '0.9'
  },
  {
    name: 'status',
    label: '状态',
    path: '/status',
    alias: [],
    title: `状态 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 汉化资源、客户端与资源包的同步状态。',
    changefreq: 'daily',
    priority: '0.7'
  },
  {
    name: 'about',
    label: '关于',
    path: '/about',
    alias: [],
    title: `关于 - ${siteTitle}`,
    description: '了解 BlueArchive.Cafe 蔚蓝咖啡厅项目、维护团队、社交媒体与友情链接。',
    changefreq: 'monthly',
    priority: '0.6'
  }
]

/** @type {{ readonly name: 'not-found', readonly title: string, readonly description: string, readonly robots: 'noindex, follow' }} */
export const notFoundSeo = {
  name: routeNames.notFound,
  title: `页面不存在 - ${siteTitle}`,
  description: '页面可能已移动、删除，或暂时不可用。',
  robots: 'noindex, follow'
}
