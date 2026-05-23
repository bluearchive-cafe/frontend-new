<template>
  <section id="news" class="section news-section">
    <v-container max-width="1120">
      <div class="section-heading">
        <h2>最新动态</h2>
        <v-btn variant="text" color="primary" append-icon="mdi-chevron-right" to="/news">全部公告</v-btn>
      </div>

      <div class="news-grid">
        <v-card
          v-for="item in latestNews"
          :key="item.slug"
          class="news-card"
          elevation="0"
          :to="`/news/${item.slug}`"
        >
          <v-card-text>
            <div class="news-date">{{ formatPublishTime(item.publishedAt) }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { formatPublishTime, newsArticles } from '../content/news'

const latestNews = computed(() => newsArticles.slice(0, 3))
</script>

<style scoped>
.section {
  padding: 72px 0;
}

.news-section {
  background: var(--color-bg-deep);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-heading h2 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 850;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.news-card {
  min-height: 190px;
  border: 1px solid var(--color-border);
  background: var(--gradient-card-strong);
  transition: border-color 160ms ease, transform 160ms ease;
}

.news-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.news-date {
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 700;
}

.news-card h3 {
  margin: 14px 0 10px;
  color: var(--color-text);
  font-size: 20px;
  line-height: 1.35;
}

.news-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 840px) {
  .news-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
