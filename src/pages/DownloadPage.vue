<template>
  <section class="download-page">
    <v-container max-width="1120">
      <div class="page-heading">
        <p>Download</p>
        <h1>下载</h1>
        <span>选择你的设备平台，获取客户端入口；首次使用前建议先阅读安装文档和注意事项。</span>
      </div>

      <div class="guide-strip" role="note">
        <v-icon icon="$alertCircleOutline" color="warning" size="22" />
        <p>不同平台的安装方式和系统权限要求可能不同。遇到签名、权限或网络问题时，请优先查看对应文档。</p>
      </div>

      <div class="platform-grid" aria-label="客户端下载入口">
        <v-card
          v-for="platform in platformLinks"
          :key="platform.name"
          class="platform-card"
          elevation="0"
        >
          <v-card-text>
            <div class="platform-head">
              <v-avatar :class="['platform-icon', `platform-icon--${platform.tone}`]" rounded="lg">
                <v-icon :icon="platform.icon" size="26" />
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
                variant="tonal"
                color="primary"
              >
                {{ tag }}
              </v-chip>
            </div>

            <div class="platform-actions">
              <template v-if="platform.variants.length > 1">
                <v-menu location="bottom start" :offset="8">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      color="primary"
                      variant="flat"
                      prepend-icon="$download"
                      append-icon="$chevronDown"
                    >
                      选择客户端
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
                          variant="tonal"
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
                  下载客户端
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
                <v-icon :icon="doc.icon" size="22" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon :icon="doc.external ? '$openInNew' : '$arrowRight'" color="primary" size="18" />
            </template>
          </v-list-item>
        </v-list>
      </section>
    </v-container>

    <v-dialog v-model="downloadDialog" max-width="520" scrim="rgba(0, 0, 0, 0.62)">
      <v-card class="download-dialog" elevation="0">
        <v-card-text>
          <div class="dialog-head">
            <v-avatar class="doc-icon" rounded="lg">
              <v-icon icon="$bookOpenOutline" size="24" />
            </v-avatar>
            <div>
              <p>安装前确认</p>
              <h2>{{ selectedDownloadTitle }}</h2>
            </div>
          </div>

          <p class="dialog-copy">
            下载前建议先查看安装文档，确认系统版本、权限设置和常见问题处理方式。
          </p>

          <div class="dialog-actions">
            <v-btn variant="text" @click="downloadDialog = false">
              稍后再说
            </v-btn>
            <v-btn
              v-if="selectedPlatform"
              color="primary"
              variant="tonal"
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
import { computed, ref } from 'vue'

interface PlatformLink {
  name: string
  icon: string
  tone: string
  docUrl: string
  docExternal: boolean
  description: string
  tags?: string[]
  variants: DownloadVariant[]
}

interface DownloadVariant {
  name: string
  description: string
  downloadUrl: string
  recommended?: boolean
}

const baseDocUrl = 'https://bluearchive-cafe.github.io/docs/'

const downloadDialog = ref(false)
const selectedPlatform = ref<PlatformLink | null>(null)
const selectedVariant = ref<DownloadVariant | null>(null)

const platformLinks: PlatformLink[] = [
  {
    name: 'Android 客户端',
    icon: '$android',
    tone: 'android',
    docUrl: baseDocUrl + 'platform/android/',
    docExternal: true,
    description: '适用于手机、平板与安卓模拟器。下载后请根据安装文档确认存储权限和系统兼容性。',
    tags: ['APK', '移动端', '模拟器'],
    variants: [
      {
        name: '共存版',
        description: '可与官方客户端共存安装。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=android&version=latest&file=cafe.YostarJP.BlueArchive.apk',
        recommended: true
      },
      {
        name: '独占版',
        description: '需要卸载官方客户端才可安装，但对模拟器的兼容性更好。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=android&version=latest&file=com.YostarJP.BlueArchive.apk'
      }
    ]
  },
  {
    name: 'Windows 启动器',
    icon: '$microsoftWindows',
    tone: 'windows',
    docUrl: baseDocUrl + 'platform/windows/',
    docExternal: true,
    description: '适用于 Windows 10 / 11。下载后请按文档检查运行库、解压路径与杀毒软件拦截情况。',
    tags: ['Windows 10 / 11', '桌面端'],
    variants: [
      {
        name: '便携版',
        description: '解压后直接运行，适合临时使用或放在自定义目录。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=launcher&version=latest&file=BlueArchive_JP_Gamelauncher.zip'
      }
    ]
  },
  {
    name: 'iOS 客户端',
    icon: '$appleIos',
    tone: 'ios',
    docUrl: baseDocUrl + 'platform/ios/',
    docExternal: true,
    description: '适用于 iPhone 与 iPad。安装前请阅读签名、测试渠道和系统版本相关说明。',
    tags: ['iPhone', 'iPad'],
    variants: [
      {
        name: '自签版',
        description: '建议使用 Impactor、AltStore 或 SideStore 等工具进行自签，或使用免签版客户端。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=ios&version=latest&file=com.YostarJP.BlueArchive.ipa',
        recommended: true
      },
      {
        name: '免签版',
        description: '免签版客户端签名所用的证书可能随时被吊销，且签名改变后无法覆盖安装，建议优先通过自签侧载。',
        downloadUrl: 'https://api.bluearchive.cafe/download/itms?version=latest'
      },
    ]
  },
  {
    name: 'macOS 客户端',
    icon: '$apple',
    tone: 'macos',
    docUrl: baseDocUrl + 'platform/macos/',
    docExternal: true,
    description: '适用于 Apple Silicon Mac。首次打开时可能需要在系统设置中确认安全权限。',
    tags: ['Apple Silicon', '桌面端'],
    variants: [
      {
        name: '应用包',
        description: '适用于搭载 Apple Silicon 芯片的 Mac。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=ios&version=latest&file=com.YostarJP.BlueArchive.ipa'
      }
    ]
  }
]

const selectedDownloadTitle = computed(() => {
  if (!selectedPlatform.value || !selectedVariant.value) {
    return ''
  }

  return `${selectedPlatform.value.name} · ${selectedVariant.value.name}`
})

function platformTags(platform: PlatformLink) {
  return platform.tags ?? []
}

function openDownloadGuide(platform: PlatformLink, variant: DownloadVariant) {
  selectedPlatform.value = platform
  selectedVariant.value = variant
  downloadDialog.value = true
}

const documentLinks = [
  {
    title: '安装与更新说明',
    description: '查看不同平台的安装流程、更新建议和常见配置项。',
    href: baseDocUrl + 'guide/',
    external: true,
    icon: '$bookOpenOutline'
  },
  {
    title: '常见问题排查',
    description: '遇到无法安装、无法启动或资源加载失败时，先从这里开始排查。',
    href: baseDocUrl + 'guide/qa/',
    external: true,
    icon: '$helpCircleOutline'
  },
  {
    title: '问题反馈',
    description: '如果文档没有覆盖你的问题，请附带设备型号、系统版本和错误截图反馈。',
    href: 'mailto:feedback@bluearchive.cafe',
    external: false,
    icon: '$linkVariant'
  }
]
</script>

<style scoped>
.download-page {
  min-height: 72vh;
  padding: 96px 0 88px;
  background:
    radial-gradient(circle at 84% 12%, var(--color-primary-soft), transparent 30%),
    var(--color-bg-deep);
}

.page-heading {
  max-width: 760px;
  margin-bottom: 28px;
  animation: fade-slide-up 520ms ease both;
}

.page-heading p,
.docs-copy p {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

.page-heading h1,
.docs-copy h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.docs-copy h2 {
  font-size: var(--font-size-section-title);
}

.page-heading span,
.docs-copy span {
  display: block;
  margin-top: 16px;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}

.guide-strip {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 215, 106, 0.28);
  border-radius: var(--radius-card);
  animation: fade-slide-up 520ms ease 60ms both;
  background: rgba(255, 215, 106, 0.08);
}

.guide-strip :deep(.v-icon) {
  align-self: center;
}

.guide-strip p {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.platform-card {
  border: 1px solid var(--color-border);
  animation: fade-slide-up 520ms ease both;
  background: var(--gradient-card);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
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

.platform-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.platform-card :deep(.v-card-text) {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 22px !important;
}

.platform-head {
  display: flex;
  align-items: center;
  gap: 14px;
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
  border: 1px solid rgba(41, 174, 234, 0.32);
  background: rgba(41, 174, 234, 0.1);
  color: var(--color-secondary);
}

.platform-icon--android {
  border-color: rgba(120, 214, 163, 0.38);
  background: rgba(120, 214, 163, 0.12);
  color: #78d6a3;
}

.platform-icon--ios,
.platform-icon--macos {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.platform-icon--windows {
  border-color: rgba(41, 174, 234, 0.42);
  background: rgba(41, 174, 234, 0.14);
  color: #69d8ff;
}

.platform-description {
  margin: 18px 0 0;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.75;
}

.platform-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.variant-menu {
  min-width: min(320px, calc(100vw - 32px));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface) !important;
}

.variant-menu :deep(.v-list-item) {
  min-height: 68px;
}

.variant-menu :deep(.v-list-item-title) {
  color: var(--color-text);
  font-weight: 760;
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
  gap: 10px;
  margin-top: auto;
  padding-top: 24px;
}

.docs-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1fr);
  gap: 48px;
  align-items: start;
  margin-top: 44px;
  padding-top: 34px;
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
  background:
    linear-gradient(180deg, rgba(48, 55, 70, 0.98), rgba(36, 41, 50, 0.98)),
    var(--color-surface);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.42);
}

.download-dialog :deep(.v-card-text) {
  padding: 24px !important;
}

.dialog-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dialog-head p {
  margin: 0 0 4px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
}

.dialog-head h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  font-weight: var(--font-weight-subheading);
  line-height: 1.3;
}

.dialog-copy {
  margin: 18px 0 0;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

@media (max-width: 840px) {
  .platform-grid,
  .docs-section {
    grid-template-columns: 1fr;
  }

  .docs-section {
    gap: 28px;
    margin-top: 36px;
    padding-top: 28px;
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
  .page-heading,
  .guide-strip,
  .platform-card {
    animation: none;
  }
}
</style>
