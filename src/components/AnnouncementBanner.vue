<template>
  <v-system-bar
    class="announcement-banner"
    :height="bannerHeight"
    :order="-1"
    role="region"
    aria-labelledby="announcement-banner-title"
  >
    <div ref="contentRef" class="banner-inner">
      <v-icon
        class="banner-icon"
        icon="$messageAlertOutline"
        size="24"
        color="primary"
        aria-hidden="true"
      />

      <div class="banner-copy">
        <p id="announcement-banner-title" class="banner-title">{{ announcement.title }}</p>
        <p class="banner-summary">{{ announcement.bannerSummary }}</p>
      </div>

      <div class="banner-actions">
        <v-btn variant="text" :to="announcement.newsAction.to" @click="emit('action', 'news')">
          {{ announcement.newsAction.label }}
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          :href="announcement.primaryAction.href"
          target="_blank"
          rel="noopener noreferrer"
          prepend-icon="$openInNew"
          @click="emit('action', 'migration')"
        >
          {{ announcement.primaryAction.label }}
        </v-btn>
      </div>

      <v-btn
        class="banner-close"
        icon
        variant="text"
        aria-label="关闭账号迁移公告"
        @click="emit('dismiss')"
      >
        <v-icon icon="$close" aria-hidden="true" />
      </v-btn>
    </div>
  </v-system-bar>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { SiteAnnouncement } from '../content/announcements'
import type { AnnouncementActionTarget } from '../utils/analytics'
import { readCssPixelToken } from '../utils/css-tokens'

defineProps<{
  announcement: SiteAnnouncement
}>()

const emit = defineEmits<{
  dismiss: []
  action: [target: AnnouncementActionTarget]
}>()

const contentRef = ref<HTMLElement | null>(null)
const bannerHeight = ref(0)
let resizeObserver: ResizeObserver | undefined
let baseAnchorOffset: number | null = null

// VSystemBar 的高度参与 Vuetify 布局计算:AppBar 与 v-main 的顶部偏移
// 都取它的实测高度,因此文案换行或断点变化后无需另外同步常量。
// 锚点偏移也要加上横幅高度,否则跳转目标会藏在固定的横幅与 AppBar 下方。
onMounted(() => {
  baseAnchorOffset = readAnchorOffset()
  measure()

  if (typeof ResizeObserver === 'undefined') {
    return
  }

  resizeObserver = new ResizeObserver(measure)
  if (contentRef.value) {
    resizeObserver.observe(contentRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()

  if (baseAnchorOffset !== null) {
    document.documentElement.style.setProperty('--anchor-offset', `${baseAnchorOffset}px`)
  }
})

function measure() {
  const height = Math.ceil(contentRef.value?.offsetHeight ?? 0)
  bannerHeight.value = height

  if (baseAnchorOffset !== null) {
    document.documentElement.style.setProperty('--anchor-offset', `${baseAnchorOffset + height}px`)
  }
}

function readAnchorOffset() {
  try {
    return readCssPixelToken('--anchor-offset')
  } catch {
    // 测试或样式尚未加载时保持全局 token 不变。
    return null
  }
}
</script>

<style scoped>
/* VSystemBar 默认是 24px 的单行状态栏,这里只借用它的布局注册,
   外观按 MD2 banner 重写。 */
.announcement-banner.v-system-bar {
  padding: 0;
  justify-content: flex-start;
  border-bottom: 1px solid var(--color-primary-border);
  background: var(--color-primary-soft);
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: normal;
  text-align: start;
}

.banner-inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-3) var(--space-4);
  width: 100%;
  max-width: var(--container-page);
  margin-inline: auto;
  padding: var(--space-3) var(--space-5);
}

.banner-icon {
  margin-top: 1px;
  opacity: 1;
}

.banner-copy {
  min-width: 0;
}

.banner-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--md2-type-body2);
  font-weight: 600;
  line-height: 1.5;
}

.banner-summary {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.5;
}

.banner-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  grid-column: 2 / 4;
  grid-row: 2;
}

.banner-actions :deep(.v-btn) {
  padding-inline: var(--space-3) !important;
}

.banner-close {
  grid-column: 3;
  grid-row: 1;
}

@media (min-width: 1024px) {
  .banner-inner {
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
  }

  .banner-actions {
    grid-column: 3;
    grid-row: 1;
    justify-content: flex-end;
  }

  .banner-close {
    grid-column: 4;
  }
}

@media (max-width: 640px) {
  .banner-inner {
    padding-inline: var(--space-4);
  }
}
</style>
