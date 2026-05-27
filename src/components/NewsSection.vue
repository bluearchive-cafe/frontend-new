<template>
  <section id="news" class="section news-section">
    <v-container max-width="1120">
      <div class="news-overview">
        <h2 class="section-title">最新动态</h2>
        <v-btn class="all-news-link" variant="text" color="primary" append-icon="$chevronRight" to="/news">
          全部公告
        </v-btn>

        <div class="news-grid">
          <v-card
            v-for="item in latestNews"
            :key="item.slug"
            class="news-card"
            elevation="0"
            :to="`/news/${item.slug}`"
          >
            <v-card-text>
              <div class="article-badges">
                <PinnedBadge v-if="item.pinned" />
                <CategoryBadge :category="item.category" />
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <div class="news-date">{{ formatPublishTime(item.publishedAt) }}</div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CategoryBadge from './CategoryBadge.vue'
import PinnedBadge from './PinnedBadge.vue'
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

.news-overview {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-heading);
}

.all-news-link {
  justify-self: end;
}

.news-grid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.news-card {
  min-height: 164px;
  border: 1px solid var(--color-border);
  background: var(--gradient-card-strong);
  transition: border-color 160ms ease, transform 160ms ease;
}

.news-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.news-card :deep(.v-card-text) {
  display: flex;
  flex-direction: column;
  min-height: 164px;
  padding: 18px;
}

.article-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.news-date {
  margin-top: auto;
  padding-top: 18px;
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 700;
}

.news-card h3 {
  margin: 12px 0 8px;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
  transition: color 160ms ease;
}

.news-card:hover h3 {
  color: var(--color-secondary);
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

  .news-overview {
    gap: 18px;
    margin-bottom: 0;
  }

  .section-title {
    grid-column: 1 / -1;
  }

  .all-news-link {
    grid-column: 1 / -1;
    justify-self: end;
    order: 1;
  }

  .news-grid {
    grid-column: 1 / -1;
    order: 0;
  }
}
</style>
