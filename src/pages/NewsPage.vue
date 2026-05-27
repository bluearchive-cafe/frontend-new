<template>
  <section class="news-page">
    <v-container max-width="1120">
      <div class="page-heading">
        <p>News</p>
        <h1>新闻</h1>
        <span>查看汉化更新、使用说明与站点公告，快速找到最近发布的重要信息。</span>
      </div>

      <div class="category-filter" role="group" aria-label="文章分类筛选">
        <v-btn
          v-for="category in categoryOptions"
          :key="category"
          :aria-pressed="selectedCategory === category"
          :color="selectedCategory === category ? 'primary' : undefined"
          :variant="selectedCategory === category ? 'flat' : 'outlined'"
          @click="selectedCategory = category"
        >
          {{ category }}<span class="category-count">{{ getCategoryCount(category) }}</span>
        </v-btn>
      </div>

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
              <CategoryBadge :category="article.category" />
            </div>
            <h2>{{ article.title }}</h2>
            <p>{{ article.summary }}</p>
            <ArticleMeta
              class="article-meta"
              :author="article.author"
              :published-at="formatPublishTime(article.publishedAt)"
              :word-count="article.wordCount"
              label="新闻元信息"
            />
          </v-card-text>
        </v-card>
      </div>

      <v-card v-else class="empty-card" elevation="0">
        <v-card-text class="empty-content">
          <p class="empty-label">No articles</p>
          <h2>这个分类暂时没有文章</h2>
          <p>换一个分类看看，或者返回全部新闻浏览当前已发布的内容。</p>
          <v-btn color="primary" variant="flat" @click="selectedCategory = allCategoryLabel">
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
</script>

<style scoped>
.news-page {
  min-height: 72vh;
  padding: 96px 0 88px;
  background:
    radial-gradient(circle at 84% 12%, var(--color-primary-soft), transparent 30%),
    var(--color-bg-deep);
}

.page-heading {
  max-width: 720px;
  margin-bottom: 34px;
}

.page-heading p {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.page-heading span {
  display: block;
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.category-count {
  margin-left: 8px;
  opacity: 0.72;
  font-size: 12px;
}

.article-list {
  display: grid;
  gap: 16px;
}

.article-card {
  border: 1px solid var(--color-border);
  background: var(--gradient-card);
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.article-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.article-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.article-card h2 {
  margin: 14px 0 10px;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
  transition: color 160ms ease;
}

.article-card:hover h2 {
  color: var(--color-secondary);
}

.article-card p {
  max-width: 760px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.75;
}

.article-meta {
  margin-top: 18px;
}

.empty-card {
  border: 1px solid var(--color-border);
  background: var(--gradient-card);
}

.empty-content {
  padding: clamp(26px, 5vw, 44px) !important;
}

.empty-label {
  margin: 0 0 10px;
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
  margin: 12px 0 22px;
  color: var(--color-text-muted);
  line-height: 1.75;
}
</style>
