<template>
  <section class="download-page">
    <v-container max-width="1120">
      <PageHeading
        eyebrow="Download"
        title="下载"
        description="选择你的设备平台，获取客户端入口；首次使用前建议先阅读安装文档和注意事项。"
        max-width="760px"
      />

      <div class="guide-strip" role="note">
        <v-icon icon="$infoOutline" color="info" size="22" aria-hidden="true" />
        <p>不同平台的安装方式和系统权限要求可能不同。遇到签名、权限或网络问题时，请优先查看对应文档。</p>
      </div>

      <div class="platform-grid" aria-label="客户端下载入口">
        <v-card
          v-for="platform in visiblePlatformLinks"
          :key="platform.name"
          :class="['platform-card', { 'platform-card--disabled': platform.disabled }]"
          elevation="1"
        >
          <v-card-text>
            <div class="platform-head">
              <v-avatar :class="['platform-icon', `platform-icon--${platform.tone}`]" rounded="lg">
                <v-icon :icon="platform.icon" size="26" aria-hidden="true" />
              </v-avatar>
              <div>
                <h2>{{ platform.name }}</h2>
              </div>
            </div>

            <p class="platform-description">{{ platform.description }}</p>

            <div class="platform-meta">
              <v-chip
                v-for="tag in platformTags(platform)"
                :key="tag"
                size="small"
                variant="outlined"
                color="primary"
              >
                {{ tag }}
              </v-chip>
            </div>

            <div class="platform-actions">
              <template v-if="platform.disabled">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  disabled
                  prepend-icon="$infoOutline"
                >
                  {{ platform.disabledHint || '暂不可用' }}
                </v-btn>
              </template>
              <template v-else-if="platform.variants.length > 1">
                <v-menu location="bottom start" :offset="8">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      color="primary"
                      variant="flat"
                      prepend-icon="$download"
                      append-icon="$chevronDown"
                    >
                      查看下载选项
                    </v-btn>
                  </template>

                  <v-list class="variant-menu" density="comfortable" lines="two">
                    <v-list-item
                      v-for="variant in platform.variants"
                      :key="variant.name"
                      :title="variant.name"
                      :subtitle="variant.description"
                      @click="openDownloadGuide(platform, variant)"
                    >
                      <template #append>
                        <v-chip
                          v-if="variant.recommended"
                          color="primary"
                          size="x-small"
                          variant="outlined"
                        >
                          推荐
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template v-else>
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="$download"
                  @click="openDownloadGuide(platform, platform.variants[0])"
                >
                  {{ singleVariantButtonText(platform.variants[0]) }}
                </v-btn>
              </template>

              <v-btn
                variant="text"
                :href="platform.docUrl"
                :target="platform.docExternal ? '_blank' : undefined"
                :rel="platform.docExternal ? 'noopener noreferrer' : undefined"
                append-icon="$arrowRight"
              >
                安装文档
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <section class="docs-section" aria-labelledby="docs-title">
        <div class="docs-copy">
          <p>Guide</p>
          <h2 id="docs-title">文档与引导</h2>
          <span>从下载、安装到问题反馈，按顺序完成这些步骤通常能减少大多数配置问题。</span>
        </div>

        <v-list class="docs-list" bg-color="transparent" lines="two">
          <v-list-item
            v-for="doc in documentLinks"
            :key="doc.title"
            :href="doc.href"
            :target="doc.external ? '_blank' : undefined"
            :rel="doc.external ? 'noopener noreferrer' : undefined"
            :title="doc.title"
            :subtitle="doc.description"
          >
            <template #prepend>
              <v-avatar class="doc-icon" rounded="lg">
                <v-icon :icon="doc.icon" size="22" aria-hidden="true" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon :icon="doc.external ? '$openInNew' : '$arrowRight'" color="primary" size="18" aria-hidden="true" />
            </template>
          </v-list-item>
        </v-list>
      </section>
    </v-container>

    <v-dialog v-model="downloadDialog" max-width="520" scrim="rgba(0, 0, 0, 0.62)" aria-labelledby="download-dialog-title">
      <v-card class="download-dialog">
        <v-card-text>
          <div class="dialog-head">
            <v-avatar class="doc-icon" rounded="lg">
              <v-icon icon="$bookOpenOutline" size="24" aria-hidden="true" />
            </v-avatar>
            <div>
              <p>安装前确认</p>
              <h2 id="download-dialog-title">{{ selectedDownloadTitle }}</h2>
            </div>
          </div>

          <p class="dialog-copy">
            下载前建议先查看安装文档，确认系统版本、权限设置和常见问题处理方式。
          </p>

          <v-alert
            v-if="selectedStatusNotice"
            class="client-status-notice"
            :color="selectedStatusNotice.color"
            density="comfortable"
            :icon="selectedStatusNotice.icon"
            :role="selectedStatusNotice.role"
            variant="outlined"
          >
            {{ selectedStatusNotice.message }}
          </v-alert>

          <v-alert
            v-if="downloadAttempted"
            class="download-feedback"
            color="primary"
            density="comfortable"
            role="status"
            variant="outlined"
          >
            如果下载没有开始，请重新点击继续下载，或先查看安装文档确认浏览器与系统权限设置。
          </v-alert>

          <div class="dialog-actions">
            <v-btn variant="text" @click="downloadDialog = false">
              稍后再说
            </v-btn>
            <v-btn
              v-if="selectedPlatform"
              color="primary"
              variant="outlined"
              :href="selectedPlatform.docUrl"
              :target="selectedPlatform.docExternal ? '_blank' : undefined"
              :rel="selectedPlatform.docExternal ? 'noopener noreferrer' : undefined"
              append-icon="$arrowRight"
            >
              查看安装文档
            </v-btn>
            <v-btn
              v-if="selectedVariant"
              color="primary"
              variant="flat"
              :href="selectedVariant.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              prepend-icon="$download"
              @click="markDownloadAttempted"
            >
              继续下载
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import PageHeading from '../components/PageHeading.vue'
import { trackDownloadClick } from '../utils/analytics'
import {
  fetchStatus,
  mapStatusResources,
  type StatusResourceView
} from '../utils/status'
import {
  documentLinks,
  filterVisiblePlatformLinks,
  platformLinks,
  type DownloadVariant,
  type PlatformLink
} from '../content/downloads'

type ClientStatusLoadState = 'loading' | 'ready' | 'failed'

interface ClientStatusNotice {
  color: 'info' | 'warning'
  icon: '$infoOutline' | '$alertCircleOutline'
  message: string
  role: 'status' | 'alert'
}

const route = useRoute()

const downloadDialog = ref(false)
const downloadAttempted = ref(false)
const selectedPlatform = ref<PlatformLink | null>(null)
const selectedVariant = ref<DownloadVariant | null>(null)
const statusRequestController = new AbortController()
const clientStatusLoadState = ref<ClientStatusLoadState>('loading')
const clientStatuses = ref<Record<PlatformLink['statusKey'], StatusResourceView> | null>(null)

const showHidden = computed(() => route.query.show_hidden === '1')

const visiblePlatformLinks = computed(() => filterVisiblePlatformLinks(platformLinks, showHidden.value))

const selectedDownloadTitle = computed(() => {
  if (!selectedPlatform.value || !selectedVariant.value) {
    return ''
  }

  return `${selectedPlatform.value.name} · ${selectedVariant.value.name}`
})

const selectedStatusNotice = computed<ClientStatusNotice | null>(() => {
  const platform = selectedPlatform.value

  if (!platform) {
    return null
  }

  if (clientStatusLoadState.value === 'loading') {
    return {
      color: 'info',
      icon: '$infoOutline',
      message: '正在检查客户端状态……',
      role: 'status'
    }
  }

  if (clientStatusLoadState.value === 'failed') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时无法确认该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  return createStatusNotice(clientStatuses.value?.[platform.statusKey])
})

function platformTags(platform: PlatformLink) {
  return platform.tags ?? []
}

function singleVariantButtonText(variant: DownloadVariant) {
  return `下载${variant.name}`
}

function createStatusNotice(statusResource?: StatusResourceView): ClientStatusNotice | null {
  if (!statusResource || statusResource.status.state === 'loading') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '暂时未取得该客户端状态。你仍可继续下载，安装前请留意版本兼容性。',
      role: 'alert'
    }
  }

  if (statusResource.status.state === 'error') {
    return {
      color: 'warning',
      icon: '$alertCircleOutline',
      message: '本地化客户端可能尚未同步到最新官方版本。你仍可继续下载。',
      role: 'alert'
    }
  }

  return null
}

function openDownloadGuide(platform: PlatformLink, variant: DownloadVariant) {
  if (platform.disabled) {
    return
  }

  selectedPlatform.value = platform
  selectedVariant.value = variant
  downloadAttempted.value = false
  downloadDialog.value = true
}

function markDownloadAttempted() {
  if (selectedPlatform.value && selectedVariant.value) {
    trackDownloadClick({
      platform: selectedPlatform.value.name,
      variant: selectedVariant.value.name,
      downloadUrl: selectedVariant.value.downloadUrl
    })
  }

  downloadAttempted.value = true
}

onMounted(async () => {
  try {
    const statusData = await fetchStatus(statusRequestController.signal)
    clientStatuses.value = mapStatusResources(statusData)
    clientStatusLoadState.value = 'ready'
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    clientStatusLoadState.value = 'failed'
  }
})

onBeforeUnmount(() => {
  statusRequestController.abort()
})
</script>

<style scoped>
.download-page {
  min-height: 72vh;
  padding-block: var(--page-padding-block);
  background: var(--page-background-fill);
}

.docs-copy p {
  margin: 0 0 var(--inline-gap);
  color: var(--color-primary);
  font-size: var(--md2-type-button);
  font-weight: var(--font-weight-overline);
  text-transform: uppercase;
}

.docs-copy h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.docs-copy span {
  display: block;
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body1);
  line-height: 1.8;
}

.guide-strip {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: var(--control-gap);
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-info-border);
  border-radius: var(--radius-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 60ms both;
  background: var(--color-info-soft);
}

.guide-strip :deep(.v-icon) {
  align-self: center;
}

.guide-strip p {
  margin: 0;
  color: var(--color-info);
  line-height: 1.7;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--grid-gap);
}

.platform-card {
  border: 1px solid var(--color-border);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  background: var(--gradient-card);
  transition: border-color var(--md2-duration-shorter) var(--md2-easing-standard), box-shadow var(--md2-duration-shorter) var(--md2-easing-standard), transform var(--md2-duration-shorter) var(--md2-easing-standard);
}

.platform-card:nth-child(2) {
  animation-delay: 80ms;
}

.platform-card:nth-child(3) {
  animation-delay: 160ms;
}

.platform-card:nth-child(4) {
  animation-delay: 240ms;
}

.platform-card :deep(.v-card-text) {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: var(--card-padding-large) !important;
}

.platform-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.platform-head h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-subheading);
  line-height: 1.28;
}

.platform-icon,
.doc-icon {
  border: 1px solid var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-secondary);
}

.platform-icon--android {
  border-color: var(--color-success-border-strong);
  background: var(--color-success-soft);
  color: var(--color-success);
}

.platform-icon--ios,
.platform-icon--macos {
  border-color: rgba(255, 255, 255, 0.22);
  background: var(--color-neutral-soft);
  color: var(--color-text);
}

.platform-icon--windows {
  border-color: var(--color-primary-border-strong);
  background: var(--color-primary-soft);
  color: var(--color-info);
}

.platform-description {
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body2);
  line-height: 1.75;
}

.platform-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--inline-gap);
  margin-top: var(--space-5);
}

.variant-menu {
  min-width: min(320px, calc(100vw - 32px));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background-color: var(--color-surface) !important;
}

.variant-menu :deep(.v-list-item) {
  min-height: 68px;
}

.variant-menu :deep(.v-list-item-title) {
  color: var(--color-text);
  font-weight: var(--font-weight-subheading);
}

.variant-menu :deep(.v-list-item-subtitle) {
  color: var(--color-text-muted);
  line-height: 1.55;
  opacity: 1;
}

.platform-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--control-gap);
  margin-top: auto;
  padding-top: var(--space-6);
}

.docs-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1fr);
  gap: var(--space-12);
  align-items: start;
  margin-top: var(--content-section-gap);
  padding-top: var(--content-divider-padding);
  border-top: 1px solid var(--color-border);
}

.docs-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-card-soft) !important;
}

.docs-list :deep(.v-list-item) {
  min-height: 76px;
}

.download-dialog {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background-color: var(--color-surface);
}

.download-dialog :deep(.v-card-text) {
  padding: var(--card-padding-large) !important;
}

.dialog-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.dialog-head p {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-overline);
}

.dialog-head h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--md2-type-h6);
  font-weight: var(--font-weight-subheading);
  line-height: 1.3;
}

.dialog-copy {
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.client-status-notice,
.download-feedback {
  margin-top: var(--space-5);
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--control-gap);
  margin-top: var(--space-6);
}

@media (hover: hover) and (pointer: fine) {
  .platform-card:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--md2-elevation-card);
  }
}

@media (max-width: 840px) {
  .platform-grid,
  .docs-section {
    grid-template-columns: 1fr;
  }

  .docs-section {
    gap: var(--space-7);
    margin-top: var(--space-9);
    padding-top: var(--space-7);
  }
}

@media (max-width: 480px) {
  .download-page {
    padding-top: 82px;
  }

  .platform-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .dialog-actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide-strip,
  .platform-card {
    animation: none;
  }
}

.platform-card--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.platform-card--disabled .platform-actions {
  pointer-events: auto;
}
</style>
