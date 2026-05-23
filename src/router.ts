import { createRouter, createWebHistory } from 'vue-router'

import AboutPage from './pages/AboutPage.vue'
import HomePage from './pages/HomePage.vue'
import NewsArticlePage from './pages/NewsArticlePage.vue'
import NewsPage from './pages/NewsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/news', name: 'news', component: NewsPage },
    { path: '/news/:slug', name: 'news-article', component: NewsArticlePage },
    { path: '/about', name: 'about', component: AboutPage }
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
