import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
    { path: '/news', name: 'news', component: () => import('./pages/NewsPage.vue') },
    { path: '/news/:slug(.*)', name: 'news-article', component: () => import('./pages/NewsArticlePage.vue') },
    { path: '/download', name: 'download', component: () => import('./pages/DownloadPage.vue') },
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

export default router
