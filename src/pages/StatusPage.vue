<template>
  <section class="status-page">
    <v-container max-width="1120">
      <PageHeading
        eyebrow="Status"
        title="资源状态"
        description="汉化资源会因官方版本更新而暂时失效，可以在此处检查各项资源的维护状态。"
        max-width="760px"
      />

      <p class="sr-only" role="status" aria-live="polite">
        {{ statusAnnouncement }}
      </p>

      <v-alert
        v-if="hasStatusError"
        class="status-error"
        color="error"
        icon="$alertCircleOutline"
        variant="outlined"
      >
        资源状态获取失败，请检查网络连接后重新获取。
        <template #append>
          <v-btn
            color="error"
            :disabled="isStatusLoading"
            :loading="isStatusLoading"
            prepend-icon="$refresh"
            variant="text"
            @click="retryStatus"
          >
            重新获取
          </v-btn>
        </template>
      </v-alert>

      <div
        class="status-panels"
        :aria-busy="isStatusLoading"
      >
        <details
          v-for="(panel, index) in statusPanels"
          :key="panel.key"
          class="status-panel"
          :open="index === 0"
        >
          <summary>
            <div class="status-panel-leading">
              <v-avatar
                :class="['status-symbol', panel.tone ? `status-symbol--${panel.tone}` : undefined]"
                :style="panel.colorTokens ? clientPlatformColorStyle(panel.colorTokens) : undefined"
                rounded="lg"
              >
                <v-icon :icon="panel.icon" size="24" aria-hidden="true" />
              </v-avatar>
              <span class="status-panel-copy">
                <span class="status-panel-title">{{ panel.title }}</span>
                <span class="status-panel-desc">{{ panel.description }}</span>
              </span>
            </div>
            <div class="status-panel-meta">
              <span class="status-chip" :data-status-state="statusResources[panel.key].status.state">
                {{ statusResources[panel.key].status.label }}
              </span>
              <v-icon class="status-panel-expand" icon="$chevronDown" size="22" aria-hidden="true" />
            </div>
          </summary>

          <div class="status-panel-body">
            <table class="status-table">
              <thead>
                <tr>
                  <th scope="col">来源</th>
                  <th scope="col">版本</th>
                  <th scope="col">更新时间</th>
                </tr>
              </thead>
              <tbody>
                <tr class="official">
                  <td class="label" data-label="来源">官方</td>
                  <td class="value" data-label="版本">{{ statusResources[panel.key].official.version }}</td>
                  <td class="value" data-label="更新时间">{{ statusResources[panel.key].official.time }}</td>
                </tr>
                <tr class="localized">
                  <td class="label" data-label="来源">汉化</td>
                  <td class="value" data-label="版本">{{ statusResources[panel.key].localized.version }}</td>
                  <td class="value" data-label="更新时间">{{ statusResources[panel.key].localized.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import PageHeading from '../components/PageHeading.vue'
import {
  clientPlatformColorStyle,
  clientPlatforms,
  type ClientPlatformColorTokens,
  type ClientPlatformKey
} from '../content/platforms'
import {
  createStatusResources,
  fetchStatus,
  mapStatusResources,
  type StatusResourceKey
} from '../utils/status'
import { setToolbarLoading } from '../utils/toolbar-loader'

interface StatusPanel {
  key: StatusResourceKey
  title: string
  description: string
  icon: string
  tone?: string
  colorTokens?: ClientPlatformColorTokens
}

const isStatusLoading = ref(true)
const hasStatusError = ref(false)
const statusAnnouncement = ref('正在获取资源状态')
const toolbarLoadingDelayMs = 400
let toolbarLoadingDelayId: number | undefined

// 客户端平台面板的 icon/颜色 token 从 platforms.ts 单一派生;
// 状态页特有的标题与描述仍保留在本页。
const clientPanelCopy: Record<ClientPlatformKey, { title: string; description: string }> = {
  android: { title: '安装包', description: 'Android 专用客户端安装包' },
  ios: { title: '应用包', description: 'iOS 专用客户端应用包' },
  windows: { title: '资源包', description: 'Windows 专用启动器资源包' },
  macos: { title: '资源包', description: 'macOS 专用客户端资源包' }
}

const statusPanels: StatusPanel[] = [
  ...clientPlatforms.map((platform) => ({
    key: platform.key,
    ...clientPanelCopy[platform.key],
    icon: platform.icon,
    colorTokens: platform.colorTokens
  })),
  {
    key: 'notice',
    title: '公告包',
    description: '游戏内公告资源同步状态',
    icon: '$calendarClockOutline',
    tone: 'notice'
  },
  {
    key: 'text',
    title: '文本包',
    description: '游戏内文本资源同步状态',
    icon: '$textBoxOutline',
    tone: 'text'
  },
  {
    key: 'voice',
    title: '语音包',
    description: '游戏内主线语音资源同步状态',
    icon: '$volumeHighOutline',
    tone: 'voice'
  },
  {
    key: 'media',
    title: '图像包',
    description: '游戏内图像视频资源同步状态',
    icon: '$imageOutline',
    tone: 'media'
  }
]

const statusResources = ref(createStatusResources('正在获取', {
  label: '获取中',
  state: 'loading'
}))

onMounted(async () => {
  await nextTick()
  await fillStatus()
})

onBeforeUnmount(() => {
  abortStatusFetch()
  stopToolbarLoading()
})

let abortController: AbortController | null = null

function abortStatusFetch() {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

async function fillStatus() {
  abortStatusFetch()
  isStatusLoading.value = true
  statusResources.value = createStatusResources('正在获取', {
    label: '获取中',
    state: 'loading'
  })
  scheduleToolbarLoading()
  statusAnnouncement.value = '正在获取资源状态'
  const requestController = new AbortController()
  abortController = requestController

  try {
    const statusData = await fetchStatus(requestController.signal)

    statusResources.value = mapStatusResources(statusData)
    hasStatusError.value = false
    statusAnnouncement.value = '资源状态已更新'
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    statusResources.value = createStatusResources('获取失败', {
      label: '获取失败',
      state: 'error'
    })
    hasStatusError.value = true
    statusAnnouncement.value = '资源状态获取失败'
  } finally {
    if (abortController === requestController) {
      abortController = null
      isStatusLoading.value = false
      stopToolbarLoading()
    }
  }
}

async function retryStatus() {
  await fillStatus()
}

function scheduleToolbarLoading() {
  stopToolbarLoading()
  toolbarLoadingDelayId = window.setTimeout(() => {
    toolbarLoadingDelayId = undefined

    if (isStatusLoading.value) {
      setToolbarLoading(true)
    }
  }, toolbarLoadingDelayMs)
}

function stopToolbarLoading() {
  if (toolbarLoadingDelayId !== undefined) {
    window.clearTimeout(toolbarLoadingDelayId)
    toolbarLoadingDelayId = undefined
  }

  setToolbarLoading(false)
}

</script>

<style scoped>
.status-page {
  min-height: var(--page-min-height);
  padding-block: var(--page-padding-block);
  background: var(--page-background-fill);
}

.status-error {
  margin-bottom: var(--space-5);
}

.status-panels {
  display: grid;
  gap: var(--space-4);
}

.status-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  background: var(--gradient-card);
  overflow: hidden;
}

.status-panel:nth-child(2) {
  animation-delay: 60ms;
}

.status-panel:nth-child(3) {
  animation-delay: 120ms;
}

.status-panel:nth-child(4) {
  animation-delay: 180ms;
}

.status-panel summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  min-height: 82px;
  padding: var(--space-5);
  cursor: pointer;
  list-style: none;
}

.status-panel summary::-webkit-details-marker {
  display: none;
}

.status-panel-leading,
.status-panel-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.status-panel-copy {
  display: grid;
  gap: var(--space-1);
}

.status-panel-title {
  color: var(--color-text);
  font-size: var(--md2-type-subtitle1);
  font-weight: var(--font-weight-subheading);
}

.status-panel-desc {
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.5;
}

.status-symbol {
  border: 1px solid var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-secondary);
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 28px;
  padding: var(--pill-padding);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  white-space: nowrap;
}

.status-chip::before {
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 999px;
  background: currentColor;
  content: "";
}

.status-chip[data-status-state="success"] {
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
  color: var(--color-success);
}

.status-chip[data-status-state="error"] {
  border-color: var(--color-error-border);
  background: var(--color-error-soft);
  color: var(--color-error);
}

.status-chip[data-status-state="loading"] {
  border-color: var(--color-accent-border);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.status-panel-expand {
  color: var(--color-text-subtle);
  transition: transform var(--md2-duration-shortest) var(--md2-easing-standard);
}

.status-panel[open] .status-panel-expand {
  transform: rotate(180deg);
}

.status-panel-body {
  padding: 0 var(--space-5) var(--space-5);
}

.status-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.status-table th,
.status-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.status-table tr:last-child td {
  border-bottom: 0;
}

.status-table th {
  background: var(--color-neutral-softer);
  color: var(--color-text-soft);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
}

.status-table td {
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
}

.status-table .label {
  width: 120px;
  color: var(--color-text);
  font-weight: var(--font-weight-subheading);
}

@media (max-width: 640px) {
  .status-panel summary {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .status-panel-meta {
    justify-content: space-between;
    width: 100%;
  }

  .status-panel-body {
    padding: 0 var(--space-4) var(--space-4);
  }

  .status-panel-leading {
    align-items: flex-start;
  }

  .status-symbol {
    flex: 0 0 auto;
  }

  .status-table,
  .status-table thead,
  .status-table tbody,
  .status-table tr,
  .status-table th,
  .status-table td {
    display: block;
  }

  .status-table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .status-table {
    border: 0;
    background: transparent;
  }

  .status-table tbody {
    display: grid;
    gap: var(--control-gap);
  }

  .status-table tr {
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    background: var(--color-card);
  }

  .status-table td {
    display: grid;
    grid-template-columns: minmax(72px, 0.36fr) minmax(0, 1fr);
    gap: var(--control-gap);
    align-items: start;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    overflow-wrap: anywhere;
  }

  .status-table td:last-child {
    border-bottom: 0;
  }

  .status-table .label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-neutral-softer);
    color: var(--color-text);
    font-size: var(--md2-type-body2);
  }

  .status-table .label::after {
    color: var(--color-text-subtle);
    content: attr(data-label);
    font-size: var(--md2-type-caption);
    font-weight: var(--font-weight-meta);
  }

  .status-table .value::before {
    color: var(--color-text-subtle);
    content: attr(data-label);
    font-size: var(--md2-type-caption);
    font-weight: var(--font-weight-meta);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-panel {
    animation: none;
  }
}
</style>
