<template>
  <section class="status-page">
    <v-container max-width="var(--container-page)">
      <PageHeading
        title="资源状态"
        description="汉化资源会因官方版本更新而暂时失效，可以在此处检查各项资源的维护状态。"
        max-width="760px"
      />

      <p class="sr-only" role="status" aria-live="polite">
        {{ statusAnnouncement }}
      </p>

      <div class="status-content" :aria-busy="isStatusLoading">
        <v-card class="status-overview" elevation="1">
          <v-card-text class="status-overview-body">
            <div class="status-overview-copy">
              <h2 class="status-overview-title">{{ overviewTitle }}</h2>
              <p class="status-overview-desc">{{ overviewDescription }}</p>
            </div>

            <dl class="status-tally">
              <div
                v-for="item in statusTally"
                :key="item.key"
                class="status-tally-item"
                :data-status-state="item.state"
              >
                <dt class="status-tally-label">{{ item.label }}</dt>
                <dd class="status-tally-value">{{ item.value }}</dd>
              </div>
            </dl>
          </v-card-text>
        </v-card>

        <v-alert
          v-if="hasStatusError"
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

        <section
          v-for="group in statusGroups"
          :key="group.key"
          class="status-group"
          :aria-labelledby="`status-group-${group.key}`"
        >
          <div class="status-group-head">
            <h2 :id="`status-group-${group.key}`" class="status-group-title">
              {{ group.title }}
              <span class="status-group-count">{{ group.panels.length }}</span>
            </h2>
            <p class="status-group-desc">{{ group.description }}</p>
          </div>

          <div class="status-panels">
            <details
              v-for="panel in group.panels"
              :key="panel.key"
              class="status-panel"
              :open="panel.key === openPanelKey"
            >
              <summary>
                <span class="status-panel-leading">
                  <v-avatar
                    class="status-symbol"
                    :class="panel.tone ? `status-symbol--${panel.tone}` : undefined"
                    :style="panel.colorTokens ? clientPlatformColorStyle(panel.colorTokens) : undefined"
                    rounded="lg"
                    tag="span"
                  >
                    <v-icon :icon="panel.icon" size="24" aria-hidden="true" />
                  </v-avatar>
                  <span class="status-panel-copy">
                    <span class="status-panel-title">{{ panel.title }}</span>
                    <span class="status-panel-desc">{{ panel.description }}</span>
                  </span>
                </span>
                <span class="status-panel-meta">
                  <span class="status-chip" :data-status-state="statusResources[panel.key].status.state">
                    {{ statusResources[panel.key].status.label }}
                  </span>
                  <v-icon class="status-panel-expand" icon="$chevronDown" size="24" aria-hidden="true" />
                </span>
              </summary>

              <div class="status-panel-body">
                <table class="status-table">
                  <thead>
                    <tr>
                      <th v-for="(label, column) in statusTableColumns" :key="column" scope="col">{{ label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="official">
                      <td class="label" :data-label="statusTableColumns.source">官方</td>
                      <td class="value" :data-label="statusTableColumns.version">{{ statusResources[panel.key].official.version }}</td>
                      <td class="value value--time" :data-label="statusTableColumns.updatedAt">{{ statusResources[panel.key].official.time }}</td>
                    </tr>
                    <tr class="localized">
                      <td class="label" :data-label="statusTableColumns.source">汉化</td>
                      <td class="value" :data-label="statusTableColumns.version">{{ statusResources[panel.key].localized.version }}</td>
                      <td class="value value--time" :data-label="statusTableColumns.updatedAt">{{ statusResources[panel.key].localized.time }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import PageHeading from '../components/PageHeading.vue'
import {
  clientPlatformColorStyle,
  statusResourceGroups,
  statusResourcePanels,
  type StatusResourceKey
} from '../content/status-resources'
import {
  createStatusResources,
  summarizeStatusResources,
  type StatusResourceView
} from '../utils/status'
import { useClientStatus } from '../utils/client-status'
import { setToolbarLoading } from '../utils/toolbar-loader'

// 面板顺序、标题、icon 与颜色 token 全部由 content/status-resources.ts
// 的 registry 派生;本页只负责请求状态到占位文案与公告文案的映射。
const clientStatus = useClientStatus()

// 表头与移动端 td 的 data-label 共用同一组列名:data-label 会被
// 响应式 CSS 的 attr() 读取,必须与表头逐字一致。
const statusTableColumns = {
  source: '来源',
  version: '版本',
  updatedAt: '更新时间'
} as const

// 分组只决定阅读顺序,组内面板仍按 statusResourceKeys 的注册顺序排列。
const statusGroups = statusResourceGroups.map((group) => ({
  ...group,
  panels: statusResourcePanels.filter((panel) => panel.group === group.key)
}))

// 首屏展开第一个面板,让折叠列表有一个可发现的示例。
const openPanelKey: StatusResourceKey = statusResourcePanels[0].key

const isStatusLoading = computed(() => clientStatus.state.value === 'loading')

// 错误提示的清零与置位由下方统一的请求状态 watch 驱动。
const hasStatusError = ref(false)

const statusAnnouncement = computed(() => {
  if (clientStatus.state.value === 'ready') {
    return '资源状态已更新'
  }

  if (clientStatus.state.value === 'failed') {
    return '资源状态获取失败'
  }

  return '正在获取资源状态'
})

const statusResources = computed<Record<StatusResourceKey, StatusResourceView>>(() => {
  if (clientStatus.state.value === 'ready' && clientStatus.resources.value) {
    return clientStatus.resources.value
  }

  if (clientStatus.state.value === 'failed') {
    return createStatusResources('获取失败', {
      label: '获取失败',
      state: 'error'
    })
  }

  return createStatusResources('正在获取', {
    label: '获取中',
    state: 'loading'
  })
})

const statusSummary = computed(() => summarizeStatusResources(statusResources.value))

// 取数失败时占位视图把所有资源标成 error,直接聚合会误报"8 项未同步";
// 这种情况改为展示破折号,由总览标题说明失败原因。
const showSummaryCounts = computed(() => clientStatus.state.value !== 'failed')

const statusTally = computed(() => [
  {
    key: 'total',
    label: '资源总数',
    value: statusResourcePanels.length,
    state: 'neutral'
  },
  {
    key: 'synced',
    label: '已同步',
    value: showSummaryCounts.value ? statusSummary.value.synced : '—',
    state: 'success'
  },
  {
    key: 'outOfSync',
    label: '未同步',
    value: showSummaryCounts.value ? statusSummary.value.outOfSync : '—',
    state: 'error'
  },
  {
    key: 'pending',
    label: '未获取',
    value: showSummaryCounts.value ? statusSummary.value.pending : '—',
    state: 'loading'
  }
])

const overviewTitle = computed(() => {
  if (clientStatus.state.value === 'failed') {
    return '资源状态获取失败'
  }

  if (clientStatus.state.value === 'loading') {
    return '正在获取资源状态'
  }

  const { outOfSync, pending, synced, total } = statusSummary.value

  if (synced === total) {
    return '全部资源已同步'
  }

  if (outOfSync > 0) {
    return `${outOfSync} 项资源待更新`
  }

  return `${pending} 项资源待获取`
})

const overviewDescription = computed(() => {
  if (clientStatus.state.value === 'failed') {
    return '请检查网络连接后重新获取，下方显示的是占位信息。'
  }

  if (clientStatus.state.value === 'loading') {
    return '正在从状态接口读取各资源的官方版本与汉化版本。'
  }

  const { outOfSync, pending, synced, total } = statusSummary.value

  if (synced === total) {
    return '官方版本与汉化版本一致，暂时无需更新。'
  }

  if (outOfSync > 0) {
    return '官方版本已更新，对应的汉化资源正在跟进。展开下方分组可以查看具体版本。'
  }

  return `${pending} 项资源尚未返回版本信息，展开下方分组可以查看明细。`
})

const toolbarLoadingDelayMs = 400
let toolbarLoadingDelayId: number | undefined

// 请求状态同时驱动错误横幅与工具栏加载指示:错误提示在重试加载期间保持
// 可见(按钮转为禁用),仅在成功后清除;工具栏指示延迟出现,避免闪烁。
watch(clientStatus.state, (state) => {
  if (state === 'ready') {
    hasStatusError.value = false
  }

  if (state === 'failed') {
    hasStatusError.value = true
  }

  if (state === 'loading') {
    scheduleToolbarLoading()
  } else {
    stopToolbarLoading()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  stopToolbarLoading()
})

function retryStatus() {
  void clientStatus.load()
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

/* 总览把"是否全部同步"的答案放在首屏,避免逐项展开面板才能确认。 */
.status-content {
  display: grid;
  gap: var(--space-8);
}

.status-overview {
  border-radius: var(--radius-card);
  background: var(--gradient-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
}

.status-overview-body {
  display: grid;
  gap: var(--space-6);
  padding: var(--card-padding-large) !important;
}

.status-overview-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.25;
}

.status-overview-desc {
  margin: var(--space-3) 0 0;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.7;
}

.status-tally {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--control-gap);
  margin: 0;
}

.status-tally-item {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--md2-radius-button);
  background: var(--color-neutral-soft);
}

.status-tally-label {
  color: var(--color-text-subtle);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1.4;
}

.status-tally-value {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.status-tally-item[data-status-state="success"] .status-tally-value {
  color: var(--color-success);
}

.status-tally-item[data-status-state="error"] .status-tally-value {
  color: var(--color-error);
}

.status-tally-item[data-status-state="loading"] .status-tally-value {
  color: var(--color-accent);
}

.status-group-head {
  margin-bottom: var(--space-4);
}

.status-group-title {
  display: flex;
  align-items: center;
  gap: var(--inline-gap);
  margin: 0;
  color: var(--color-text);
  font-size: var(--md2-type-h6);
  font-weight: var(--font-weight-subheading);
  line-height: 1.35;
}

.status-group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  min-height: 20px;
  padding: 0 var(--inline-gap);
  border-radius: var(--md2-radius-button);
  background: var(--color-neutral-soft);
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.status-group-desc {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.6;
}

.status-panels {
  display: grid;
  gap: var(--space-3);
}

/* M2 展开面板:8dp 圆角 + 1dp 阴影,条目之间用阴影而不是描边分层。 */
.status-panel {
  border-radius: var(--radius-card);
  background: var(--gradient-card);
  box-shadow: var(--md2-elevation-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
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
  min-height: 80px;
  padding: var(--space-4) var(--space-6);
  cursor: pointer;
  list-style: none;
  transition: background-color var(--md2-duration-shortest) var(--md2-easing-standard);
}

.status-panel summary::-webkit-details-marker {
  display: none;
}

/* M2 状态层:hover 4%,pressed 8%;叠加在卡片表面上。 */
.status-panel summary:hover {
  background: color-mix(in srgb, var(--color-text) 4%, transparent);
}

.status-panel summary:active {
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}

/* 面板 overflow:hidden 会裁掉全局焦点环,展开标题改用内缩轮廓。 */
.status-panel summary:focus-visible {
  outline-offset: -3px;
}

.status-panel[open] summary {
  border-bottom: var(--border-decorative) solid var(--color-border);
}

.status-panel-leading,
.status-panel-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.status-panel-leading {
  min-width: 0;
}

.status-panel-meta {
  flex: 0 0 auto;
}

.status-panel-copy {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.status-panel-title {
  color: var(--color-text);
  font-size: var(--md2-type-subtitle1);
  font-weight: var(--font-weight-subheading);
  line-height: 1.4;
}

.status-panel-desc {
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.5;
}

.status-symbol {
  border: var(--border-decorative) solid var(--color-primary-border);
  border-radius: var(--radius-card);
  background: var(--color-primary-soft);
  color: var(--color-secondary);
}

.status-symbol--notice {
  border-color: var(--color-warning-border);
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.status-symbol--text {
  border-color: var(--color-info-border);
  background: var(--color-info-soft);
  color: var(--color-info);
}

.status-symbol--voice {
  border-color: var(--color-accent-border);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.status-symbol--media {
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
  color: var(--color-success);
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: var(--badge-height);
  padding: var(--pill-padding);
  border: var(--border-decorative) solid var(--color-neutral-border);
  border-radius: var(--md2-radius-button);
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1;
  white-space: nowrap;
}

.status-chip::before {
  width: 6px;
  height: 6px;
  margin-right: var(--compact-gap);
  border-radius: 999px;
  background: currentColor;
  content: "";
  flex: 0 0 auto;
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
  padding: 0 0 var(--space-4);
}

.status-table {
  width: 100%;
  border-collapse: collapse;
}

.status-table th,
.status-table td {
  padding: var(--space-3) var(--space-6);
  border-bottom: var(--border-decorative) solid var(--color-border);
  text-align: left;
}

.status-table thead th {
  background: var(--color-neutral-softer);
  color: var(--color-text-subtle);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1.4;
}

.status-table tbody tr:last-child td {
  border-bottom: 0;
}

.status-table tbody tr {
  transition: background-color var(--md2-duration-shortest) var(--md2-easing-standard);
}

.status-table tbody tr:hover {
  background: color-mix(in srgb, var(--color-text) 3%, transparent);
}

.status-table td {
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.5;
}

.status-table .label {
  width: 132px;
  color: var(--color-text);
  font-weight: var(--font-weight-subheading);
  white-space: nowrap;
}

/* 来源圆点区分两行:官方保持中性,汉化跟随品牌主色。 */
.status-table .label::before {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: var(--compact-gap);
  border-radius: 999px;
  background: var(--color-text-subtle);
  content: "";
  vertical-align: middle;
}

.status-table .localized .label::before {
  background: var(--color-primary);
}

.status-table .value--time {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .status-overview-body {
    padding: var(--card-padding) !important;
  }

  .status-tally {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .status-panel summary {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .status-panel-meta {
    justify-content: space-between;
    width: 100%;
  }

  .status-panel-body {
    padding: 0 0 var(--space-1);
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

  .status-table tbody {
    display: grid;
    gap: var(--control-gap);
    padding: var(--space-4);
  }

  .status-table tbody tr {
    border: var(--border-decorative) solid var(--color-border);
    border-radius: var(--md2-radius-button);
    overflow: hidden;
  }

  .status-table th,
  .status-table td {
    padding: var(--space-3) var(--space-4);
  }

  .status-table td {
    display: grid;
    grid-template-columns: minmax(72px, 0.36fr) minmax(0, 1fr);
    gap: var(--control-gap);
    align-items: start;
    border-bottom: var(--border-decorative) solid var(--color-border);
    overflow-wrap: anywhere;
  }

  /* 桌面端"最后一行无分隔线"在卡片布局里会吃掉块内分隔线,这里重新加回。 */
  .status-table tbody tr:last-child td {
    border-bottom: var(--border-decorative) solid var(--color-border);
  }

  .status-table tbody tr:last-child td:last-child {
    border-bottom: 0;
  }

  .status-table .label {
    display: flex;
    align-items: center;
    gap: var(--compact-gap);
    width: auto;
    background: var(--color-neutral-softer);
    white-space: normal;
  }

  .status-table .label::before {
    margin-right: 0;
  }

  .status-table .label::after {
    margin-left: auto;
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
  .status-overview,
  .status-panel {
    animation: none;
  }
}
</style>
