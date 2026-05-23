<template>
  <dl class="article-meta" :aria-label="label">
    <div class="meta-item">
      <dt class="sr-only">作者</dt>
      <dd>
        <v-icon icon="mdi-account-outline" size="18" aria-hidden="true" />
        <span>{{ author }}</span>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">发布时间</dt>
      <dd>
        <v-icon icon="mdi-calendar-clock-outline" size="18" aria-hidden="true" />
        <time :datetime="dateTimeValue">{{ publishedAt }}</time>
      </dd>
    </div>

    <div class="meta-item">
      <dt class="sr-only">字数</dt>
      <dd>
        <v-icon icon="mdi-text-box-outline" size="18" aria-hidden="true" />
        <span>{{ wordCount }} 字</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  author: string
  publishedAt: string
  wordCount: number
  label?: string
}>()

const dateTimeValue = computed(() => props.publishedAt.replace(' ', 'T'))
</script>

<style scoped>
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 0;
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 700;
}

.meta-item {
  display: inline-flex;
}

.meta-item dd {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  min-height: 22px;
}

.meta-item :deep(.v-icon) {
  flex: 0 0 auto;
  opacity: 0.95;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
