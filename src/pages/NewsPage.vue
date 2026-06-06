<template>
  <section class="news-page">
    <v-container max-width="1120">
      <PageHeading
        eyebrow="News"
        title="新闻"
        description="查看汉化更新、使用说明与站点公告，快速找到最近发布的重要信息。"
      />

      <v-btn-toggle
        v-model="selectedCategory"
        class="category-filter"
        mandatory
        aria-label="文章分类筛选"
      >
        <v-btn
          v-for="category in categoryOptions"
          :key="category"
          :value="category"
          :aria-pressed="selectedCategory === category"
          :color="selectedCategory === category ? 'primary' : undefined"
          height="42"
          :variant="selectedCategory === category ? 'flat' : 'outlined'"
        >
          {{ category }}<span class="category-count">{{ getCategoryCount(category) }}</span>
        </v-btn>
      </v-btn-toggle>

      <div v-if="filteredArticles.length" class="article-list">
        <v-card
          v-for="article in filteredArticles"
          :key="article.slug"
          class="article-card"
          elevation="0"
          :to="`/news/${article.slug}`"
        >
          <v-card-text>
            <div class="article-badges">
              <PinnedBadge v-if="article.pinned" />
              <DraftBadge v-if="article.draft" />
              <CategoryBadge :category="article.category" />
            </div>
            <h2>{{ article.title }}</h2>
            <p>{{ article.summary }}</p>
            <div class="article-footer">
              <ArticleMeta
                class="article-meta"
                :author="article.author"
                :published-at="formatPublishTime(article.publishedAt)"
                :published-at-date-time="article.publishedAtDateTime"
                :word-count="article.wordCount"
                label="新闻元信息"
              />
              <span class="read-more">阅读全文</span>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <v-card v-else class="empty-card" elevation="0">
        <v-card-text class="empty-content">
          <p class="empty-label">{{ emptyLabel }}</p>
          <h2>{{ emptyTitle }}</h2>
          <p>{{ emptyDescription }}</p>
          <v-btn v-if="newsArticles.length" color="primary" variant="flat" @click="selectedCategory = allCategoryLabel">
            查看全部新闻
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import ArticleMeta from '../components/ArticleMeta.vue'
import CategoryBadge from '../components/CategoryBadge.vue'
import DraftBadge from '../components/DraftBadge.vue'
import PageHeading from '../components/PageHeading.vue'
import PinnedBadge from '../components/PinnedBadge.vue'
import { formatPublishTime, newsArticles, newsCategories } from '../content/news'

const allCategoryLabel = '全部'
const selectedCategory = ref(allCategoryLabel)
const categoryOptions = computed(() => [allCategoryLabel, ...newsCategories])

function getCategoryCount(category: string) {
  if (category === allCategoryLabel) {
    return newsArticles.length
  }

  return newsArticles.filter((article) => article.category === category).length
}

const filteredArticles = computed(() => {
  if (selectedCategory.value === allCategoryLabel) {
    return newsArticles
  }

  return newsArticles.filter((article) => article.category === selectedCategory.value)
})

const emptyLabel = computed(() => newsArticles.length ? 'No articles' : 'No news')
const emptyTitle = computed(() => newsArticles.length ? '这个分类暂时没有文章' : '暂无新闻')
const emptyDescription = computed(() =>
  newsArticles.length
    ? '换一个分类看看，或者返回全部新闻浏览当前已发布的内容。'
    : '当前还没有已发布的新闻内容，后续公告会在这里展示。'
)
</script>

<style scoped>
.news-page {
  min-height: 72vh;
  padding-block: var(--page-padding-block);
  background:
    radial-gradient(circle at 84% 12%, var(--color-primary-soft), transparent 30%),
    var(--color-bg-deep);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--control-gap);
  animation: fade-slide-up 520ms ease 80ms both;
  margin-bottom: var(--space-6);
  border: 0 !important;
  box-shadow: none !important;
  background: transparent;
}

.category-filter :deep(.v-btn) {
  border-radius: var(--radius-card);
  color: inherit;
}

.category-filter :deep(.v-btn--variant-flat) {
  color: rgb(var(--v-theme-on-primary));
}

.category-filter :deep(.v-btn--variant-outlined) {
  border: thin solid currentColor;
}

.category-count {
  margin-left: var(--inline-gap);
  opacity: 0.72;
  font-size: 12px;
}

.article-list {
  display: grid;
  gap: var(--grid-gap);
}

.article-card {
  border: 1px solid var(--color-border);
  animation: fade-slide-up 520ms ease both;
  background: var(--gradient-card);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.article-card:nth-child(2) {
  animation-delay: 80ms;
}

.article-card:nth-child(3) {
  animation-delay: 160ms;
}

.article-card:nth-child(4) {
  animation-delay: 240ms;
}

.article-card :deep(.v-card-text) {
  display: flex;
  flex-direction: column;
  padding: var(--card-padding);
}

.article-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--inline-gap);
}

.article-card h2 {
  margin: var(--control-gap) 0 var(--inline-gap);
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
  transition: color 160ms ease;
}

.article-card p {
  max-width: 760px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--control-gap) var(--space-4);
  margin-top: auto;
  padding-top: var(--space-5);
}

.read-more {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid var(--color-primary-border);
  border-radius: 999px;
  background: var(--color-primary-softer);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.empty-card {
  border: 1px solid var(--color-border);
  animation: fade-slide-up 520ms ease both;
  background: var(--gradient-card);
}

.empty-content {
  padding: clamp(22px, 4vw, 34px) !important;
}

.empty-label {
  margin: 0 0 var(--control-gap);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: var(--font-weight-heading);
}

.empty-content h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-heading);
}

.empty-content p:not(.empty-label) {
  max-width: 520px;
  margin: var(--control-gap) 0 var(--space-6);
  color: var(--color-text-muted);
  line-height: 1.75;
}

@media (hover: hover) and (pointer: fine) {
  .article-card:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-4px);
  }

  .article-card:hover h2 {
    color: var(--color-secondary);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-filter,
  .article-card,
  .empty-card {
    animation: none;
  }
}
</style>
