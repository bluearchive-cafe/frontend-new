import { createRouter, createWebHistory } from 'vue-router'

import { routeNames, staticRoutes } from './shared/site-routes.mjs'
import { trackNotFound } from './utils/analytics'
import { applyRouteSeo } from './utils/seo'

const routeComponents = {
  home: () => import('./pages/HomePage.vue'),
  news: () => import('./pages/NewsPage.vue'),
  download: () => import('./pages/DownloadPage.vue'),
  status: () => import('./pages/StatusPage.vue'),
  about: () => import('./pages/AboutPage.vue')
}

const publicRoutes = staticRoutes.map((route) => ({
  path: route.path,
  alias: [...route.alias],
  name: route.name,
  component: routeComponents[route.name]
}))

// 锚点偏移与 global.css 的 --anchor-offset 单一来源:固定应用栏高度 +
// 16px 呼吸间距,由样式表 token 驱动,JS 侧仅在无法读取时回退到 72。
function readAnchorOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--anchor-offset').trim()
  const value = Number.parseFloat(raw)

  return Number.isFinite(value) ? value : 72
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Public routes are lazy-loaded to keep the initial app bundle focused on shell code.
  routes: [
    ...publicRoutes,
    { path: '/news/:slug(.+)', name: routeNames.newsArticle, component: () => import('./pages/NewsArticlePage.vue') },
    { path: '/:pathMatch(.*)*', name: routeNames.notFound, component: () => import('./pages/NotFoundPage.vue') }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      // Offset in-page anchors below the fixed app bar.
      return {
        el: to.hash,
        behavior: 'smooth',
        top: readAnchorOffset()
      }
    }

    // Regular navigation starts at the top of the new page.
    return { top: 0 }
  }
})

router.afterEach((to) => {
  // SEO tags follow the resolved route after each successful navigation.
  applyRouteSeo(to)

  if (to.name === routeNames.notFound) {
    trackNotFound(to.path)
  }
})

export default router
