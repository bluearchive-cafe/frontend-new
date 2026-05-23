<template>
  <section class="article-page">
    <v-container max-width="860">
      <v-btn class="back-link" variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/news">
        返回新闻
      </v-btn>

      <article v-if="article" class="article-shell">
        <header>
          <CategoryBadge :category="article.category" />
          <h1>{{ article.title }}</h1>
          <ArticleMeta
            class="article-meta"
            :author="article.author"
            :published-at="formatPublishTime(article.publishedAt)"
            :word-count="article.wordCount"
            label="当前新闻元信息"
          />
        </header>

        <div class="markdown-body" v-html="article.html" />
      </article>

      <v-card v-else class="missing-card" elevation="0">
        <v-card-text>
          <h1>新闻不存在</h1>
          <p>这篇新闻可能已移动或尚未发布。</p>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ArticleMeta from '../components/ArticleMeta.vue'
import CategoryBadge from '../components/CategoryBadge.vue'
import { findNewsArticle, formatPublishTime } from '../content/news'

const route = useRoute()

const article = computed(() => findNewsArticle(String(route.params.slug)))
</script>

<style scoped>
.article-page {
  min-height: 72vh;
  padding: 88px 0;
  background: var(--color-bg-deep);
}

.back-link {
  margin-bottom: 22px;
}

.article-shell {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: clamp(26px, 5vw, 54px);
  background: linear-gradient(180deg, rgba(48, 55, 70, 0.78), rgba(25, 29, 36, 0.86));
}

header {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 30px;
}

h1 {
  margin: 16px 0 0;
  color: var(--color-text);
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 900;
  line-height: 1.12;
}

.article-meta {
  margin-top: 26px;
  font-size: 14px;
}

.markdown-body {
  color: var(--color-text-soft);
  font-size: 16px;
  line-height: 1.9;
}

.markdown-body :deep(p) {
  margin: 0 0 18px;
}

.markdown-body :deep(ul) {
  margin: 0 0 20px;
  padding-left: 22px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

.markdown-body :deep(a) {
  color: var(--color-secondary);
}

.missing-card {
  border: 1px solid var(--color-border);
  background: var(--color-card);
}

.missing-card p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}
</style>
