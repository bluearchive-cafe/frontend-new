import { createRouter, createWebHistory } from 'vue-router'

import { staticRoutes } from './shared/site-routes.mjs'
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Public routes are lazy-loaded to keep the initial app bundle focused on shell code.
  routes: [
    ...publicRoutes,
    { path: '/news/:slug(.+)', name: 'news-article', component: () => import('./pages/NewsArticlePage.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue') }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      // Offset in-page anchors below the fixed app bar.
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 72
      }
    }

    // Regular navigation starts at the top of the new page.
    return { top: 0 }
  }
})

router.afterEach((to) => {
  // SEO tags follow the resolved route after each successful navigation.
  applyRouteSeo(to)

  if (to.name === 'not-found') {
    trackNotFound(to.path)
  }
})

export default router
