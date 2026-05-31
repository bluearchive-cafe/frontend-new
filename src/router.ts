import { createRouter, createWebHashHistory } from 'vue-router'

import { applyRouteSeo } from './utils/seo'

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

router.afterEach((to) => {
  applyRouteSeo(to)
})

export default router
