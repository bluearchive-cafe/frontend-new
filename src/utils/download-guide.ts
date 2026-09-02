import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter
} from 'vue'

import { trackDownloadClick } from './analytics'
import { clientStatusNotice, type ClientStatusNotice } from './client-status-notice'
import { useClientStatus } from './client-status'
import {
  filterVisiblePlatformLinks,
  platformLinks,
  type DownloadVariant,
  type PlatformLink
} from '../content/downloads'

/**
 * 下载页引导状态：平台可见性（show_hidden 查询参数）、下载确认对话框
 * 状态机、客户端状态提示与下载分析埋包。页面只保留模板接线。
 *
 * query 以 getter 传入而不是读取 vue-router，测试可直接用普通对象驱动。
 */
export function useDownloadGuide(query: MaybeRefOrGetter<Record<string, unknown>>) {
  const downloadDialog = ref(false)
  const downloadAttempted = ref(false)
  const selectedPlatform = ref<PlatformLink | null>(null)
  const selectedVariant = ref<DownloadVariant | null>(null)

  const showHidden = computed(() => toValue(query).show_hidden === '1')
  const visiblePlatformLinks = computed(() => filterVisiblePlatformLinks(platformLinks, showHidden.value))

  const clientStatus = useClientStatus()

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

    return clientStatusNotice(
      clientStatus.state.value,
      clientStatus.resources.value?.[platform.statusKey]
    )
  })

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

  return {
    visiblePlatformLinks,
    downloadDialog,
    downloadAttempted,
    selectedPlatform,
    selectedVariant,
    selectedDownloadTitle,
    selectedStatusNotice,
    openDownloadGuide,
    markDownloadAttempted
  }
}
