<template>
  <section id="news" class="section news-section">
    <v-container max-width="1120">
      <div class="news-overview">
        <h2 class="section-title">最新动态</h2>
        <v-btn class="all-news-link" variant="text" color="primary" append-icon="$chevronRight" to="/news">
          全部新闻
        </v-btn>

        <div v-if="latestNews.length" class="news-grid">
          <v-card
            v-for="item in latestNews"
            :key="item.slug"
            class="news-card"
            elevation="1"
            :to="`/news/${item.slug}`"
          >
            <v-card-text>
              <div class="article-badges">
                <PinnedBadge v-if="item.pinned" />
                <DraftBadge v-if="item.draft" />
                <CategoryBadge :category="item.category" />
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <div class="news-card-footer">
                <div class="news-date">{{ formatPublishTime(item.publishedAt) }}</div>
                <span class="read-more">
                  查看详情
                  <v-icon icon="$arrowRight" size="16" aria-hidden="true" />
                </span>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-card v-else class="news-empty-card" elevation="1">
          <v-card-text>
            <p class="empty-label">No news</p>
            <h3>暂无新闻</h3>
            <p>当前还没有已发布的新闻内容，后续公告会在这里展示。</p>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CategoryBadge from './CategoryBadge.vue'
import DraftBadge from './DraftBadge.vue'
import PinnedBadge from './PinnedBadge.vue'
import { formatPublishTime, newsArticles } from '../content/news'

const latestNews = computed(() => newsArticles.slice(0, 3))
</script>

<style scoped>
.section {
  padding-block: var(--section-padding-block);
}

.news-section {
  background: var(--home-module-fill, var(--color-bg-deep));
}

.news-overview {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--grid-gap);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  margin-bottom: var(--space-6);
}

.section-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-overline);
}

.all-news-link {
  justify-self: end;
}

.news-grid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--grid-gap);
}

.news-empty-card {
  grid-column: 1 / -1;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  background: var(--gradient-card-strong);
}

.news-empty-card :deep(.v-card-text) {
  padding: var(--space-8);
}

.empty-label {
  margin: 0 0 var(--control-gap);
  color: var(--color-primary);
  font-size: var(--type-meta);
  font-weight: var(--font-weight-heading);
}

.news-empty-card h3 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-heading);
}

.news-empty-card p:not(.empty-label) {
  max-width: 520px;
  margin: var(--control-gap) 0 0;
  color: var(--color-text-muted);
  font-size: var(--type-body);
  line-height: 1.75;
}

.news-card {
  display: flex;
  flex-direction: column;
  min-height: 184px;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  background: var(--gradient-card-strong);
  transition: border-color var(--md2-duration-shorter) var(--md2-easing-standard), box-shadow var(--md2-duration-shorter) var(--md2-easing-standard), transform var(--md2-duration-shorter) var(--md2-easing-standard);
}

.news-card:nth-child(2) {
  animation-delay: 80ms;
}

.news-card:nth-child(3) {
  animation-delay: 160ms;
}

.news-card :deep(.v-card-text) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 184px;
  padding: var(--card-padding);
}

.article-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--inline-gap);
}

.news-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--control-gap) var(--space-4);
  margin-top: auto;
  padding-top: var(--space-5);
}

.news-date {
  color: var(--color-secondary);
  font-size: var(--type-meta);
  font-weight: var(--font-weight-meta);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: var(--inline-gap);
  color: var(--color-primary);
  font-size: var(--type-meta);
  font-weight: var(--font-weight-action);
  white-space: nowrap;
}

.news-card h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: var(--control-gap) 0 var(--inline-gap);
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
  transition: color var(--md2-duration-shortest) var(--md2-easing-standard);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.news-card p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--type-body);
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (hover: hover) and (pointer: fine) {
  .news-card:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-4px);
  }

  .news-card:hover h3 {
    color: var(--color-secondary);
  }
}

@media (max-width: 840px) {
  .news-grid {
    grid-template-columns: 1fr;
  }

  .news-overview {
    gap: var(--space-5);
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

  .news-empty-card {
    order: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-overview,
  .news-card,
  .news-empty-card {
    animation: none;
  }
}
</style>
