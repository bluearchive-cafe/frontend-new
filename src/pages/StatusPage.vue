<template>
  <section class="status-page">
    <v-container max-width="1120">
      <div class="page-heading">
        <p>Status</p>
        <h1>资源状态</h1>
        <span>汉化资源会因官方版本更新而暂时失效，可以在此处检查各项资源的维护状态。</span>
      </div>

      <div class="status-panels" ref="statusRootRef">
        <details
          v-for="(panel, index) in statusPanels"
          :key="panel.key"
          class="status-panel"
          :open="index === 0"
        >
          <summary>
            <div class="status-panel-leading">
              <v-avatar :class="['status-symbol', `status-symbol--${panel.tone}`]" rounded="lg">
                <v-icon :icon="panel.icon" size="24" />
              </v-avatar>
              <span class="status-panel-copy">
                <span class="status-panel-title">{{ panel.title }}</span>
                <span class="status-panel-desc">{{ panel.description }}</span>
              </span>
            </div>
            <div class="status-panel-meta">
              <span class="status-chip" :data-key="`${panel.key}/status`" data-status-state="loading">
                获取中
              </span>
              <v-icon class="status-panel-expand" icon="$chevronDown" size="22" />
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
                  <td class="label">官方</td>
                  <td class="value" :data-key="`${panel.key}/official/version`">正在获取</td>
                  <td class="value" :data-key="`${panel.key}/official/time`">正在获取</td>
                </tr>
                <tr class="localized">
                  <td class="label">汉化</td>
                  <td class="value" :data-key="`${panel.key}/localized/version`">正在获取</td>
                  <td class="value" :data-key="`${panel.key}/localized/time`">正在获取</td>
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
import { nextTick, onMounted, ref } from 'vue'

type StatusState = 'success' | 'error' | 'loading'
type StatusData = Record<string, unknown>

interface StatusPanel {
  key: string
  title: string
  description: string
  icon: string
  tone: string
}

const statusRootRef = ref<HTMLElement | null>(null)

const statusPanels: StatusPanel[] = [
  {
    key: 'android',
    title: '安装包',
    description: 'Android 专用客户端安装包',
    icon: '$android',
    tone: 'android'
  },
  {
    key: 'ios',
    title: '应用包',
    description: 'iOS / macOS 专用客户端应用包',
    icon: '$appleIos',
    tone: 'ios'
  },
  {
    key: 'launcher',
    title: '启动器',
    description: 'Windows 专用启动器压缩包',
    icon: '$microsoftWindows',
    tone: 'windows'
  },
  {
    key: 'windows',
    title: '资源包',
    description: 'Windows 专用启动器资源包',
    icon: '$download',
    tone: 'asset'
  },
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

onMounted(async () => {
  await nextTick()
  await fillStatus()
})

async function fillStatus() {
  try {
    const res = await fetch('https://api.bluearchive.cafe/status/list')

    if (!res.ok) {
      throw new Error(`Status request failed: ${res.status}`)
    }

    const statusData = await res.json() as StatusData
    const elements = statusRootRef.value?.querySelectorAll<HTMLElement>('[data-key]') ?? []

    elements.forEach((element) => fillStatusElement(element, statusData))
  } catch {
    setAllStatusFailed()
  }
}

function fillStatusElement(element: HTMLElement, statusData: StatusData) {
  const key = element.dataset.key

  if (!key) {
    return
  }

  if (key.endsWith('/status')) {
    fillStatusChip(element, statusData, key)
    return
  }

  element.textContent = readStatusValue(statusData, key) ?? '未获取'
}

function fillStatusChip(element: HTMLElement, statusData: StatusData, key: string) {
  const resourceKey = key.replace(/\/status$/, '')
  const officialVersion = readStatusValue(statusData, `${resourceKey}/official/version`)
  const localizedVersion = readStatusValue(statusData, `${resourceKey}/localized/version`)

  if (!officialVersion || !localizedVersion) {
    setStatusChip(element, '未获取', 'loading')
    return
  }

  if (officialVersion === localizedVersion) {
    setStatusChip(element, '已同步', 'success')
    return
  }

  setStatusChip(element, '未同步', 'error')
}

function readStatusValue(statusData: StatusData, key: string) {
  const value = key.split('/').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment]
    }

    return undefined
  }, statusData)

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function setStatusChip(element: HTMLElement, label: string, state: StatusState) {
  element.textContent = label
  element.dataset.statusState = state
}

function setAllStatusFailed() {
  const elements = statusRootRef.value?.querySelectorAll<HTMLElement>('[data-key]') ?? []

  elements.forEach((element) => {
    const key = element.dataset.key ?? ''

    if (key.endsWith('/status')) {
      setStatusChip(element, '未获取', 'loading')
      return
    }

    element.textContent = '获取失败'
  })
}
</script>

<style scoped>
.status-page {
  min-height: 72vh;
  padding: 96px 0 88px;
  background:
    radial-gradient(circle at 84% 12%, var(--color-primary-soft), transparent 30%),
    var(--color-bg-deep);
}

.page-heading {
  max-width: 760px;
  margin-bottom: 34px;
  animation: fade-slide-up 520ms ease both;
}

.page-heading p {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.page-heading span {
  display: block;
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}

.status-panels {
  display: grid;
  gap: 14px;
}

.status-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  animation: fade-slide-up 520ms ease both;
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
  gap: 18px;
  min-height: 82px;
  padding: 18px 20px;
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
  gap: 14px;
}

.status-panel-copy {
  display: grid;
  gap: 4px;
}

.status-panel-title {
  color: var(--color-text);
  font-size: 18px;
  font-weight: var(--font-weight-subheading);
}

.status-panel-desc {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.status-symbol {
  border: 1px solid rgba(41, 174, 234, 0.32);
  background: rgba(41, 174, 234, 0.1);
  color: var(--color-secondary);
}

.status-symbol--android {
  border-color: rgba(120, 214, 163, 0.38);
  background: rgba(120, 214, 163, 0.12);
  color: #78d6a3;
}

.status-symbol--ios {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.status-symbol--windows,
.status-symbol--asset {
  border-color: rgba(41, 174, 234, 0.42);
  background: rgba(41, 174, 234, 0.14);
  color: #69d8ff;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 28px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
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
  border-color: rgba(120, 214, 163, 0.34);
  background: rgba(120, 214, 163, 0.12);
  color: #78d6a3;
}

.status-chip[data-status-state="error"] {
  border-color: rgba(255, 107, 137, 0.36);
  background: rgba(255, 107, 137, 0.12);
  color: #ff8aa2;
}

.status-chip[data-status-state="loading"] {
  border-color: rgba(255, 215, 106, 0.34);
  background: rgba(255, 215, 106, 0.1);
  color: #ffd76a;
}

.status-panel-expand {
  color: var(--color-text-subtle);
  transition: transform 160ms ease;
}

.status-panel[open] .status-panel-expand {
  transform: rotate(180deg);
}

.status-panel-body {
  padding: 0 20px 20px;
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
  padding: 13px 14px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.status-table tr:last-child td {
  border-bottom: 0;
}

.status-table th {
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 800;
}

.status-table td {
  color: var(--color-text-muted);
  font-size: 14px;
}

.status-table .label {
  width: 120px;
  color: var(--color-text);
  font-weight: 760;
}

@media (max-width: 640px) {
  .status-panel summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .status-panel-meta {
    justify-content: space-between;
    width: 100%;
  }

  .status-panel-body {
    overflow-x: auto;
  }

  .status-table {
    min-width: 560px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-heading,
  .status-panel {
    animation: none;
  }
}
</style>
