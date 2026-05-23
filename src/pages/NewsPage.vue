<template>
  <section class="news-page">
    <v-container max-width="1120">
      <div class="page-heading">
        <p>News</p>
        <h1>新闻</h1>
        <span>使用 Markdown 编写和维护公告内容，自动展示作者、发布时间与字数统计。</span>
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
          {{ category }}
        </v-btn>
      </div>

      <div class="article-list">
        <v-card
          v-for="article in filteredArticles"
          :key="article.slug"
          class="article-card"
          elevation="0"
          :to="`/news/${article.slug}`"
        >
          <v-card-text>
            <CategoryBadge :category="article.category" />
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
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import ArticleMeta from '../components/ArticleMeta.vue'
import CategoryBadge from '../components/CategoryBadge.vue'
import { formatPublishTime, newsArticles, newsCategories } from '../content/news'

const allCategoryLabel = '全部'
const selectedCategory = ref(allCategoryLabel)
const categoryOptions = computed(() => [allCategoryLabel, ...newsCategories])

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
  font-size: clamp(40px, 6vw, 64px);
  /* font-weight: 900; */
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

.article-card h2 {
  margin: 14px 0 10px;
  color: var(--color-text);
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.35;
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
</style>
