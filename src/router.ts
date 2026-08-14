import { createRouter, createWebHistory } from 'vue-router'

import { routeNames, staticRoutes } from './shared/site-routes.mjs'
import { trackNotFound } from './utils/analytics'
import { readCssPixelToken } from './utils/css-tokens'
import { applyRouteSeo } from './utils/seo'

const routeComponents = {
  home: () => import('./pages/HomePage.vue'),
  news: () => import('./pages/NewsPage.vue'),
  download: () => import('./pages/DownloadPage.vue'),
  status: () => import('./pages/StatusPage.vue'),
  about: () => import('./pages/AboutPage.vue')
}

type RouteComponentName = keyof typeof routeComponents

function hasRouteComponent(name: string): name is RouteComponentName {
  return Object.hasOwn(routeComponents, name)
}

const publicRoutes = staticRoutes.map((route) => {
  if (!hasRouteComponent(route.name)) {
    throw new Error(`Missing page component for static route: ${route.name}`)
  }

  return {
    path: route.path,
    alias: [...route.alias],
    name: route.name,
    component: routeComponents[route.name]
  }
})

// 锚点偏移与 global.css 的 --anchor-offset 单一来源:固定应用栏高度 +
// 16px 呼吸间距,由样式表 token 驱动。
function readAnchorOffset() {
  return readCssPixelToken('--anchor-offset')
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
