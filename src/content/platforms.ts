import type { StatusResourceKey } from '../utils/status'

// 客户端平台的 icon 与视觉 tone 单一来源:下载页(downloads.ts)与
// 状态页(StatusPage.vue)从这里派生,新增平台只改这一处。
export type ClientPlatformKey = Extract<StatusResourceKey, 'android' | 'ios' | 'windows' | 'macos'>

export interface ClientPlatformMeta {
  key: ClientPlatformKey
  icon: string
  downloadTone: string
  statusTone: string
}

export const clientPlatforms: ClientPlatformMeta[] = [
  {
    key: 'android',
    icon: '$android',
    downloadTone: 'android',
    statusTone: 'android'
  },
  {
    key: 'ios',
    icon: '$appleIos',
    downloadTone: 'ios',
    statusTone: 'ios'
  },
  {
    key: 'windows',
    icon: '$microsoftWindows',
    downloadTone: 'windows',
    statusTone: 'asset'
  },
  {
    key: 'macos',
    icon: '$apple',
    downloadTone: 'macos',
    statusTone: 'ios'
  }
]
