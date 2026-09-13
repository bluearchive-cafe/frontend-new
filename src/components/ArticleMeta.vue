<template>
  <dl class="article-meta" :aria-label="label">
    <div class="meta-item">
      <dt class="sr-only">作者</dt>
      <dd>
        <v-icon icon="$accountOutline" size="20" aria-hidden="true" />
        <span>{{ author }}</span>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">发布时间</dt>
      <dd>
        <v-icon icon="$calendarClockOutline" size="20" aria-hidden="true" />
        <time :datetime="publishedAtDateTime">{{ publishedAt }}</time>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">字数</dt>
      <dd>
        <v-icon icon="$textBoxOutline" size="20" aria-hidden="true" />
        <span>{{ wordCount }} 字</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    author: string
    publishedAt: string
    publishedAtDateTime: string
    wordCount: number
    /** dl 的可访问名称;调用方不传时使用默认值,避免各页面措辞漂移。 */
    label?: string
  }>(),
  {
    label: '新闻元信息'
  }
)
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
