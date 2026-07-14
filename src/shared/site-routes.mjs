export const siteTitle = '蔚蓝咖啡厅'
export const siteName = 'BlueArchive.Cafe'
export const siteUrl = 'https://bluearchive.cafe/'
export const defaultImage = `${siteUrl}favicon.jpg`
export const defaultDescription = 'BlueArchive.Cafe 蔚蓝咖啡厅，提供蔚蓝档案汉化服务、安装教程、公告资讯与客户端下载入口。'
export const defaultKeywords = '蔚蓝档案,蔚蓝档案汉化,Blue Archive,BlueArchive.Cafe,蔚蓝咖啡厅,汉化教程,客户端下载'

export const staticRoutes = [
  {
    name: 'home',
    path: '/',
    alias: [],
    title: siteTitle,
    description: defaultDescription,
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    name: 'download',
    path: '/download',
    alias: [],
    title: `下载 - ${siteTitle}`,
    description: '获取 BlueArchive.Cafe Android、iOS、macOS 与 Windows 客户端下载入口，并查看安装文档。',
    changefreq: 'weekly',
    priority: '0.9'
  },
  {
    name: 'news',
    path: '/news',
    alias: ['/news/'],
    title: `新闻 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 的汉化更新、使用说明、站点公告与重要资讯。',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    name: 'status',
    path: '/status',
    alias: [],
    title: `状态 - ${siteTitle}`,
    description: '查看 BlueArchive.Cafe 汉化资源、客户端与资源包的同步状态。',
    changefreq: 'daily',
    priority: '0.7'
  },
  {
    name: 'about',
    path: '/about',
    alias: [],
    title: `关于 - ${siteTitle}`,
    description: '了解 BlueArchive.Cafe 蔚蓝咖啡厅项目、维护团队、社交媒体与友情链接。',
    changefreq: 'monthly',
    priority: '0.6'
  }
]

export const notFoundSeo = {
  name: 'not-found',
  title: `页面不存在 - ${siteTitle}`,
  description: '页面可能已移动、删除，或暂时不可用。',
  robots: 'noindex, follow'
}
