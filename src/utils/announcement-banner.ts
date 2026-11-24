import { ref } from 'vue'

import { activeAnnouncements, type SiteAnnouncement } from '../content/announcements'
import { trackAnnouncementClick, type AnnouncementActionTarget } from './analytics'

export type BannerStorage = Pick<Storage, 'getItem' | 'setItem'>

/**
 * 横幅的关闭状态独立于公告弹窗:横幅常驻在页面顶部,弹窗只提示一次。
 * key 同样带 revision,文案更新后递增 revision 即可让横幅重新出现。
 */
export function bannerStorageKey(banner: Pick<SiteAnnouncement, 'id' | 'revision'>) {
  return `ba-cafe:banner:dismissed:${banner.id}:r${banner.revision}`
}

export function isBannerDismissed(
  banner: Pick<SiteAnnouncement, 'id' | 'revision'>,
  storage: BannerStorage | null
) {
  if (!storage) {
    return false
  }

  try {
    return storage.getItem(bannerStorageKey(banner)) !== null
  } catch {
    // 隐私模式或 storage 被禁用时无法读取,按未关闭处理。
    return false
  }
}

export function dismissBanner(
  banner: Pick<SiteAnnouncement, 'id' | 'revision'>,
  storage: BannerStorage | null
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(bannerStorageKey(banner), new Date().toISOString())
  } catch {
    // 写不进去就退化为本次会话内隐藏,不影响页面功能。
  }
}

/** 取第一条尚未被关闭的公告作为顶部横幅。 */
export function findBanner(
  announcements: readonly SiteAnnouncement[],
  storage: BannerStorage | null = browserStorage()
): SiteAnnouncement | null {
  return announcements.find((announcement) => !isBannerDismissed(announcement, storage)) ?? null
}

/** 页面级接线:首屏按已读状态决定是否展示,关闭后立即从 DOM 移除。 */
export function useAnnouncementBanner(
  announcements: readonly SiteAnnouncement[] = activeAnnouncements,
  storage: BannerStorage | null = browserStorage()
) {
  const banner = ref<SiteAnnouncement | null>(findBanner(announcements, storage))

  function dismiss() {
    if (!banner.value) {
      return
    }

    dismissBanner(banner.value, storage)
    banner.value = null
  }

  // 站内跳转由 v-btn 的 :to 完成,这里只上报点击目标。
  function trackAction(target: AnnouncementActionTarget) {
    if (!banner.value) {
      return
    }

    trackAnnouncementClick({ id: banner.value.id, target })
  }

  return { banner, dismiss, trackAction }
}

function browserStorage(): BannerStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
