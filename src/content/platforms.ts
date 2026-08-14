import type { StatusResourceKey } from '../utils/status'

// 客户端平台的 icon 与颜色 token 单一来源:下载页(downloads.ts)与
// 状态页(StatusPage.vue)从这里派生,新增平台只改这一处。
export type ClientPlatformKey = Extract<StatusResourceKey, 'android' | 'ios' | 'windows' | 'macos'>

export interface ClientPlatformColorTokens {
  border: string
  background: string
  foreground: string
}

export interface ClientPlatformMeta {
  key: ClientPlatformKey
  icon: string
  colorTokens: ClientPlatformColorTokens
}

export function clientPlatformColorStyle(tokens: ClientPlatformColorTokens) {
  return {
    borderColor: `var(${tokens.border})`,
    background: `var(${tokens.background})`,
    color: `var(${tokens.foreground})`
  }
}

export const clientPlatforms: ClientPlatformMeta[] = [
  {
    key: 'android',
    icon: '$android',
    colorTokens: {
      border: '--color-success-border-strong',
      background: '--color-success-soft',
      foreground: '--color-success'
    }
  },
  {
    key: 'ios',
    icon: '$appleIos',
    colorTokens: {
      border: '--color-neutral-border',
      background: '--color-neutral-soft',
      foreground: '--color-text'
    }
  },
  {
    key: 'windows',
    icon: '$microsoftWindows',
    colorTokens: {
      border: '--color-primary-border-strong',
      background: '--color-primary-soft',
      foreground: '--color-info'
    }
  },
  {
    key: 'macos',
    icon: '$apple',
    colorTokens: {
      border: '--color-neutral-border',
      background: '--color-neutral-soft',
      foreground: '--color-text'
    }
  }
]
