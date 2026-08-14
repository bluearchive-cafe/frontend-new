<template>
  <dl class="article-meta" :aria-label="label">
    <div class="meta-item">
      <dt class="sr-only">作者</dt>
      <dd>
        <v-icon icon="$accountOutline" size="18" aria-hidden="true" />
        <span>{{ author }}</span>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">发布时间</dt>
      <dd>
        <v-icon icon="$calendarClockOutline" size="18" aria-hidden="true" />
        <time :datetime="publishedAtDateTime">{{ publishedAt }}</time>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">字数</dt>
      <dd>
        <v-icon icon="$textBoxOutline" size="18" aria-hidden="true" />
        <span>{{ wordCount }} 字</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
defineProps<{
  author: string
  publishedAt: string
  publishedAtDateTime: string
  wordCount: number
  label?: string
}>()
</script>

<style scoped>
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--inline-gap) var(--space-4);
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--type-meta);
  font-weight: var(--font-weight-meta);
}

.meta-item {
  display: inline-flex;
}

.meta-item dd {
  display: inline-flex;
  align-items: center;
  gap: var(--compact-gap);
  margin: 0;
  min-height: 22px;
}

.meta-item :deep(.v-icon) {
  flex: 0 0 auto;
  opacity: 0.95;
}
</style>
