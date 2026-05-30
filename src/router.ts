import { createRouter, createWebHashHistory } from 'vue-router'

import { findNewsArticle } from './content/news'

const siteTitle = '蔚蓝咖啡厅'
const routeTitles = {
  home: '',
  news: '新闻',
  download: '下载',
  status: '状态',
  about: '关于',
  'not-found': '页面不存在'
} as const

function formatDocumentTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} - ${siteTitle}` : siteTitle
}

function getRouteTitle(routeName: unknown, params: Record<string, unknown>) {
  if (routeName === 'news-article') {
    const slugParam = params.slug
    const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam
    const article = typeof slug === 'string' ? findNewsArticle(slug) : null

    return article?.title ?? '新闻不存在'
  }

  return typeof routeName === 'string' ? routeTitles[routeName as keyof typeof routeTitles] : undefined
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/news', name: 'news', component: () => import('./pages/NewsPage.vue') },
    { path: '/news/:slug(.*)', name: 'news-article', component: () => import('./pages/NewsArticlePage.vue') },
    { path: '/download', name: 'download', component: () => import('./pages/DownloadPage.vue') },
    { path: '/status', name: 'status', component: () => import('./pages/StatusPage.vue') },
    { path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue') }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 72
      }
    }

    return { top: 0 }
  }
})

router.beforeEach((to) => {
  document.title = formatDocumentTitle(getRouteTitle(to.name, to.params))
})

export default router
