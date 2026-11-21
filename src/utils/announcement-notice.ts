import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { activeAnnouncements, type SiteAnnouncement } from '../content/announcements'
import { trackAnnouncementClick, type AnnouncementActionTarget } from './analytics'

export type AnnouncementStorage = Pick<Storage, 'getItem' | 'setItem'>

/** 公告的已读 key 同时包含 id 与 revision:改文案时递增 revision 即可重新提示。 */
export function announcementStorageKey(announcement: Pick<SiteAnnouncement, 'id' | 'revision'>) {
  return `ba-cafe:notice:dismissed:${announcement.id}:r${announcement.revision}`
}

export function isAnnouncementDismissed(
  announcement: Pick<SiteAnnouncement, 'id' | 'revision'>,
  storage: AnnouncementStorage | null
) {
  if (!storage) {
    return false
  }

  try {
    return storage.getItem(announcementStorageKey(announcement)) !== null
  } catch {
    // 隐私模式或 storage 被禁用时无法读取,按未读处理。
    return false
  }
}

export function dismissAnnouncement(
  announcement: Pick<SiteAnnouncement, 'id' | 'revision'>,
  storage: AnnouncementStorage | null
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(announcementStorageKey(announcement), new Date().toISOString())
  } catch {
    // 写不进去就退化为每次访问都提示,不影响页面功能。
  }
}

/** 取第一条既未被抑制路径排除、也未读过的公告。 */
export function findPendingAnnouncement(
  announcements: readonly SiteAnnouncement[],
  path: string,
  storage: AnnouncementStorage | null = browserStorage()
): SiteAnnouncement | null {
  const normalizedPath = normalizePath(path)

  return (
    announcements.find(
      (announcement) =>
        !announcement.suppressPaths.some(
          (suppressed) => normalizePath(suppressed) === normalizedPath
        ) && !isAnnouncementDismissed(announcement, storage)
    ) ?? null
  )
}

/** 页面级接线:首屏解析待读公告,明确关闭才持久化,遮罩/ESC 只关闭本次浏览。 */
export function useAnnouncementNotice(
  announcements: readonly SiteAnnouncement[] = activeAnnouncements,
  storage: AnnouncementStorage | null = browserStorage()
) {
  const route = useRoute()
  const router = useRouter()
  const announcement = ref<SiteAnnouncement | null>(null)
  const isOpen = ref(false)

  onMounted(async () => {
    // 深链首次加载时 setup 读到的仍是 START_LOCATION,
    // 必须等初始导航完成,否则 suppressPaths 会失效。
    await router.isReady()
    announcement.value = findPendingAnnouncement(announcements, route.path, storage)

    if (!announcement.value) {
      return
    }

    await nextTick()
    isOpen.value = true
  })

  function acknowledge() {
    if (!announcement.value) {
      return
    }

    dismissAnnouncement(announcement.value, storage)
    isOpen.value = false
  }

  function snooze() {
    isOpen.value = false
  }

  function handleAction(target: AnnouncementActionTarget) {
    if (!announcement.value) {
      return
    }

    trackAnnouncementClick({ id: announcement.value.id, target })

    if (target === 'news') {
      void router.push(announcement.value.newsAction.to)
    }
  }

  return { announcement, isOpen, acknowledge, snooze, handleAction }
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

function browserStorage(): AnnouncementStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
