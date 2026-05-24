<template>
  <section class="article-page">
    <v-container max-width="860">
      <v-btn class="back-link" variant="text" color="primary" prepend-icon="$arrowLeft" to="/news">
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

      <NotFoundState
        v-else
        title="新闻不存在"
        description="这篇新闻可能已移动、删除，或者暂时还没有发布。你可以返回新闻列表查找最新公告，也可以回到首页重新开始。"
        primary-label="返回新闻列表"
        primary-to="/news"
        primary-prepend-icon="$arrowLeft"
        secondary-label="回到首页"
        secondary-to="/"
        secondary-append-icon="$arrowRight"
      />
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ArticleMeta from '../components/ArticleMeta.vue'
import CategoryBadge from '../components/CategoryBadge.vue'
import NotFoundState from '../components/NotFoundState.vue'
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
  padding: clamp(26px, 5vw, 50px);
  background: linear-gradient(180deg, rgba(48, 55, 70, 0.78), rgba(25, 29, 36, 0.86));
}

header {
  max-width: 740px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--color-border);
  margin: 0 auto 34px;
}

h1 {
  margin: 16px 0 0;
  color: var(--color-text);
  font-size: var(--font-size-article-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.18;
}

.article-meta {
  margin-top: 26px;
  font-size: 14px;
}

.markdown-body {
  max-width: 740px;
  margin: 0 auto;
  color: var(--color-text-soft);
  font-size: 16px;
  line-height: 1.9;
}

.markdown-body :deep(p) {
  margin: 0 0 18px;
}

.markdown-body :deep(h2) {
  margin: 34px 0 14px;
  color: var(--color-text);
  font-size: clamp(24px, 3vw, 30px);
  font-weight: var(--font-weight-heading);
  line-height: 1.25;
}

.markdown-body :deep(h3) {
  margin: 28px 0 12px;
  color: var(--color-text);
  font-size: 20px;
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
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

.markdown-body :deep(blockquote) {
  margin: 24px 0;
  padding: 2px 0 2px 18px;
  border-left: 3px solid var(--color-primary);
  color: var(--color-text-muted);
}

.markdown-body :deep(code) {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 5px;
  background: rgba(0, 0, 0, 0.26);
  color: var(--color-secondary);
  font-size: 0.92em;
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: rgba(0, 0, 0, 0.3);
}

.markdown-body :deep(pre code) {
  border: 0;
  padding: 0;
  background: transparent;
}

.markdown-body :deep(hr) {
  height: 1px;
  border: 0;
  margin: 30px 0;
  background: var(--color-border);
}

.markdown-body :deep(img) {
  display: block;
  max-width: 100%;
  border-radius: var(--radius-card);
  margin: 24px 0;
}

</style>
