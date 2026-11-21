<template>
  <v-dialog
    v-model="open"
    max-width="560"
    scrollable
    scrim="var(--md2-scrim)"
    z-index="2600"
    aria-labelledby="announcement-dialog-title"
    aria-describedby="announcement-dialog-lead"
    @after-leave="restoreFocus"
  >
    <v-card class="announcement-dialog">
      <v-card-text>
        <p class="announcement-eyebrow">{{ announcement.eyebrow }}</p>
        <h2 id="announcement-dialog-title">{{ announcement.title }}</h2>
        <p id="announcement-dialog-lead" class="announcement-lead">
          {{ announcement.lead }}
        </p>

        <ul class="announcement-dates">
          <li v-for="item in announcement.dates" :key="`${item.date}-${item.detail}`">
            <span class="announcement-date">{{ item.date }}</span>
            <span>{{ item.detail }}</span>
          </li>
        </ul>

        <v-alert
          class="announcement-warning"
          color="warning"
          density="comfortable"
          icon="$alertCircleOutline"
          role="alert"
          variant="outlined"
        >
          {{ announcement.warning }}
        </v-alert>

        <p class="announcement-note">
          {{ announcement.note }}
          <a
            class="announcement-source"
            :href="announcement.sourceAction.href"
            rel="noopener noreferrer"
            target="_blank"
            @click="emit('action', 'official')"
          >
            {{ announcement.sourceAction.label }}
          </a>
        </p>

        <div class="announcement-actions">
          <v-btn variant="text" @click="closeWithAcknowledge">
            我知道了
          </v-btn>
          <v-btn variant="text" @click="openArticle">
            {{ announcement.newsAction.label }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :href="announcement.primaryAction.href"
            target="_blank"
            rel="noopener noreferrer"
            prepend-icon="$openInNew"
            @click="followMigration"
          >
            {{ announcement.primaryAction.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import type { SiteAnnouncement } from '../content/announcements'
import type { AnnouncementActionTarget } from '../utils/analytics'

defineProps<{
  announcement: SiteAnnouncement
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  acknowledge: []
  snooze: []
  action: [target: AnnouncementActionTarget]
}>()

let explicitClose = false
let previousFocus: HTMLElement | null = null

// v-dialog 自己会把遮罩点击/ESC 写成 modelValue=false;只有明确点按钮才持久化已读。
watch(open, (value) => {
  if (value) {
    explicitClose = false
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return
  }

  if (!explicitClose) {
    emit('snooze')
  }
})

function closeWithAcknowledge() {
  explicitClose = true
  emit('acknowledge')
  open.value = false
}

function followMigration() {
  emit('action', 'migration')
  closeWithAcknowledge()
}

function openArticle() {
  emit('action', 'news')
  closeWithAcknowledge()
}

function restoreFocus() {
  explicitClose = false

  if (previousFocus?.isConnected) {
    previousFocus.focus({ preventScroll: true })
  }

  previousFocus = null
}
</script>

<style scoped>
.announcement-dialog {
  border-radius: var(--radius-card);
  background-color: var(--color-surface);
}

.announcement-dialog :deep(.v-card-text) {
  padding: var(--card-padding-large) !important;
}

.announcement-eyebrow {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-overline);
}

.announcement-dialog h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--md2-type-h6);
  font-weight: var(--font-weight-subheading);
  line-height: 1.3;
}

.announcement-lead {
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.announcement-dates {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
}

.announcement-dates li {
  display: grid;
  grid-template-columns: 7.5rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
  color: var(--color-text);
  line-height: 1.6;
}

.announcement-date {
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.announcement-warning {
  margin-top: var(--space-5);
}

.announcement-note {
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  line-height: 1.75;
}

.announcement-source {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.announcement-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--control-gap);
  margin-top: var(--space-6);
}

@media (max-width: 480px) {
  .announcement-dates li {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .announcement-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
