<template>
  <section class="article-page">
    <v-container max-width="860">
      <v-btn class="back-link" variant="text" color="primary" prepend-icon="$arrowLeft" to="/news">
        返回新闻
      </v-btn>

      <article v-if="article" class="article-shell">
        <header>
          <div class="article-badges">
            <PinnedBadge v-if="article.pinned" />
            <CategoryBadge :category="article.category" />
          </div>
          <h1>{{ article.title }}</h1>
          <ArticleMeta
            class="article-meta"
            :author="article.author"
            :published-at="formatPublishTime(article.publishedAt)"
            :word-count="article.wordCount"
            label="当前新闻元信息"
          />
        </header>

        <div ref="markdownBodyRef" class="markdown-body" v-html="article.html" />
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
import mediumZoom from 'medium-zoom'
import type { Zoom } from 'medium-zoom'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ArticleMeta from '../components/ArticleMeta.vue'
import CategoryBadge from '../components/CategoryBadge.vue'
import NotFoundState from '../components/NotFoundState.vue'
import PinnedBadge from '../components/PinnedBadge.vue'
import { findNewsArticle, formatPublishTime } from '../content/news'

const route = useRoute()
const markdownBodyRef = ref<HTMLElement | null>(null)
let imageZoom: Zoom | null = null

const article = computed(() => findNewsArticle(String(route.params.slug)))

function setupImageZoom() {
  imageZoom?.detach()
  imageZoom = null

  const images = markdownBodyRef.value?.querySelectorAll<HTMLImageElement>('img')

  if (!images?.length) {
    return
  }

  imageZoom = mediumZoom(images, {
    background: 'rgba(13, 17, 23, 0.92)',
    margin: 24,
    scrollOffset: 40
  })
}

watch(
  article,
  async () => {
    await nextTick()
    setupImageZoom()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  imageZoom?.detach()
})
</script>

<style scoped>
.article-page {
  min-height: 72vh;
  padding: 88px 0;
  background: var(--color-bg-deep);
}

.back-link {
  animation: fade-slide-up 420ms ease both;
  margin-bottom: 22px;
}

.article-shell {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: clamp(26px, 5vw, 50px);
  animation: fade-slide-up 520ms ease 80ms both;
  background: linear-gradient(180deg, rgba(48, 55, 70, 0.78), rgba(25, 29, 36, 0.86));
}

header {
  max-width: 740px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--color-border);
  margin: 0 auto 34px;
}

.article-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
  --markdown-border: rgba(139, 148, 158, 0.28);
  --markdown-border-muted: rgba(139, 148, 158, 0.18);
  --markdown-code-bg: rgba(110, 118, 129, 0.22);
  --markdown-pre-bg: rgba(13, 17, 23, 0.58);
  --markdown-table-alt: rgba(110, 118, 129, 0.08);
  --markdown-alert-note: #2f81f7;
  --markdown-alert-tip: #3fb950;
  --markdown-alert-important: #a371f7;
  --markdown-alert-warning: #d29922;
  --markdown-alert-caution: #f85149;
  max-width: 740px;
  margin: 0 auto;
  color: var(--color-text-soft);
  font-size: 16px;
  line-height: 1.65;
}

.markdown-body > :deep(*) {
  animation: fade-slide-up 420ms ease both;
}

.markdown-body > :deep(:nth-child(2)) {
  animation-delay: 40ms;
}

.markdown-body > :deep(:nth-child(3)) {
  animation-delay: 80ms;
}

.markdown-body > :deep(:nth-child(4)) {
  animation-delay: 120ms;
}

.markdown-body :deep(p) {
  margin: 0 0 16px;
}

.markdown-body :deep(h1) {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--markdown-border-muted);
  margin: 32px 0 16px;
  color: var(--color-text);
  font-size: 2em;
  font-weight: var(--font-weight-heading);
  line-height: 1.25;
}

.markdown-body :deep(h2) {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--markdown-border-muted);
  margin: 32px 0 16px;
  color: var(--color-text);
  font-size: 1.5em;
  font-weight: var(--font-weight-heading);
  line-height: 1.25;
}

.markdown-body :deep(h3) {
  margin: 24px 0 16px;
  color: var(--color-text);
  font-size: 1.25em;
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
}

.markdown-body :deep(h4) {
  margin: 24px 0 16px;
  color: var(--color-text);
  font-size: 1em;
  font-weight: var(--font-weight-subheading);
  line-height: 1.4;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 16px;
  padding-left: 2em;
}

.markdown-body :deep(ul ul),
.markdown-body :deep(ol ol),
.markdown-body :deep(ul ol),
.markdown-body :deep(ol ul) {
  margin: 8px 0 0;
}

.markdown-body :deep(li) {
  margin: 0.25em 0;
}

.markdown-body :deep(li > p) {
  margin: 16px 0;
}

.markdown-body :deep(a) {
  color: var(--color-secondary);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.markdown-body :deep(blockquote) {
  margin: 0 0 16px;
  padding: 0 1em;
  border-left: 0.25em solid var(--markdown-border);
  color: var(--color-text-muted);
}

.markdown-body :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.markdown-alert) {
  margin: 16px 0;
  padding: 0.5em 1em;
  border: 0;
  border-left: 0.25em solid var(--alert-color, var(--markdown-alert-note));
  border-radius: 0;
  background: transparent;
  color: var(--color-text-soft);
}

.markdown-body :deep(.markdown-alert-note) {
  --alert-color: var(--markdown-alert-note);
}

.markdown-body :deep(.markdown-alert-tip) {
  --alert-color: var(--markdown-alert-tip);
}

.markdown-body :deep(.markdown-alert-important) {
  --alert-color: var(--markdown-alert-important);
}

.markdown-body :deep(.markdown-alert-warning) {
  --alert-color: var(--markdown-alert-warning);
}

.markdown-body :deep(.markdown-alert-caution) {
  --alert-color: var(--markdown-alert-caution);
}

.markdown-body :deep(.markdown-alert-content) {
  margin: 0;
}

.markdown-body :deep(.markdown-alert-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--alert-color, var(--markdown-alert-note));
  font-weight: var(--font-weight-subheading);
  line-height: 1.4;
}

.markdown-body :deep(.markdown-alert-icon) {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: currentColor;
}

.markdown-body :deep(.markdown-alert > :last-child),
.markdown-body :deep(.markdown-alert-content > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.task-list-item) {
  list-style: none;
}

.markdown-body :deep(.task-list-item-checkbox) {
  width: 16px;
  height: 16px;
  margin: 0 0.4em 0 -1.4em;
  vertical-align: -2px;
  accent-color: var(--color-primary);
}

.markdown-body :deep(code) {
  border: 0;
  border-radius: 6px;
  padding: 0.2em 0.4em;
  background: var(--markdown-code-bg);
  color: var(--color-text);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  margin: 0 0 16px;
  padding: 16px;
  border: 0;
  border-radius: 6px;
  background: var(--markdown-pre-bg);
  line-height: 1.45;
}

.markdown-body :deep(pre code) {
  border: 0;
  padding: 0;
  background: transparent;
}

.markdown-body :deep(table) {
  display: block;
  overflow-x: auto;
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 16px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--markdown-border);
  padding: 6px 13px;
  text-align: left;
  vertical-align: top;
}

.markdown-body :deep(th) {
  background: transparent;
  color: var(--color-text);
  font-weight: var(--font-weight-subheading);
}

.markdown-body :deep(tr:nth-child(even) td) {
  background: var(--markdown-table-alt);
}

.markdown-body :deep(hr) {
  height: 0.25em;
  border: 0;
  margin: 24px 0;
  background: var(--markdown-border-muted);
}

.markdown-body :deep(img) {
  display: block;
  max-width: 100%;
  border-radius: 6px;
  cursor: zoom-in;
  margin: 0 0 16px;
}

.markdown-body :deep(img.medium-zoom-image--opened) {
  cursor: zoom-out;
}

.markdown-body :deep(kbd) {
  border: 1px solid var(--markdown-border);
  border-bottom-color: rgba(139, 148, 158, 0.42);
  border-radius: 5px;
  padding: 3px 5px;
  background: rgba(110, 118, 129, 0.16);
  color: var(--color-text);
  box-shadow: inset 0 -1px 0 rgba(139, 148, 158, 0.24);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

.markdown-body :deep(mark) {
  border-radius: 4px;
  padding: 1px 4px;
  background: rgba(255, 215, 106, 0.24);
  color: var(--color-text);
}

@media (prefers-reduced-motion: reduce) {
  .back-link,
  .article-shell,
  .markdown-body > :deep(*) {
    animation: none;
  }
}

</style>
