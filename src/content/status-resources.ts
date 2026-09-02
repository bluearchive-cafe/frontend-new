// 状态资源身份与展示元数据的单一来源:资源 key、客户端平台子集、
// 状态页面板、下载入口的 icon 与颜色 token 都从这里派生。新增平台或
// 资源只改这一处;utils/status.ts 只保留请求与视图映射的传输逻辑。
export const statusResourceKeys = [
  'android',
  'ios',
  'windows',
  'macos',
  'notice',
  'text',
  'voice',
  'media'
] as const

export type StatusResourceKey = typeof statusResourceKeys[number]

export const clientPlatformKeys = ['android', 'ios', 'windows', 'macos'] as const

export type ClientPlatformKey = typeof clientPlatformKeys[number]

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

const clientPlatformPresentation: Record<ClientPlatformKey, Omit<ClientPlatformMeta, 'key'>> = {
  android: {
    icon: '$android',
    colorTokens: {
      border: '--color-success-border-strong',
      background: '--color-success-soft',
      foreground: '--color-success'
    }
  },
  ios: {
    icon: '$appleIos',
    colorTokens: {
      border: '--color-neutral-border',
      background: '--color-neutral-soft',
      foreground: '--color-text'
    }
  },
  windows: {
    icon: '$microsoftWindows',
    colorTokens: {
      border: '--color-primary-border-strong',
      background: '--color-primary-soft',
      foreground: '--color-info'
    }
  },
  macos: {
    icon: '$apple',
    colorTokens: {
      border: '--color-neutral-border',
      background: '--color-neutral-soft',
      foreground: '--color-text'
    }
  }
}

/** Record 以 ClientPlatformKey 为键,缺失平台的元数据会在编译期报错。 */
export function clientPlatform(key: ClientPlatformKey): ClientPlatformMeta {
  return { key, ...clientPlatformPresentation[key] }
}

export function clientPlatformColorStyle(tokens: ClientPlatformColorTokens) {
  return {
    borderColor: `var(${tokens.border})`,
    background: `var(${tokens.background})`,
    color: `var(${tokens.foreground})`
  }
}

export interface StatusResourcePanel {
  key: StatusResourceKey
  title: string
  description: string
  icon: string
  tone?: string
  colorTokens?: ClientPlatformColorTokens
}

const statusResourcePanelMeta: Record<StatusResourceKey, Omit<StatusResourcePanel, 'key'>> = {
  android: {
    title: '安装包',
    description: 'Android 专用客户端安装包',
    icon: clientPlatformPresentation.android.icon,
    colorTokens: clientPlatformPresentation.android.colorTokens
  },
  ios: {
    title: '应用包',
    description: 'iOS 专用客户端应用包',
    icon: clientPlatformPresentation.ios.icon,
    colorTokens: clientPlatformPresentation.ios.colorTokens
  },
  windows: {
    title: '资源包',
    description: 'Windows 专用启动器资源包',
    icon: clientPlatformPresentation.windows.icon,
    colorTokens: clientPlatformPresentation.windows.colorTokens
  },
  macos: {
    title: '资源包',
    description: 'macOS 专用客户端资源包',
    icon: clientPlatformPresentation.macos.icon,
    colorTokens: clientPlatformPresentation.macos.colorTokens
  },
  notice: {
    title: '公告包',
    description: '游戏内公告资源同步状态',
    icon: '$calendarClockOutline',
    tone: 'notice'
  },
  text: {
    title: '文本包',
    description: '游戏内文本资源同步状态',
    icon: '$textBoxOutline',
    tone: 'text'
  },
  voice: {
    title: '语音包',
    description: '游戏内主线语音资源同步状态',
    icon: '$volumeHighOutline',
    tone: 'voice'
  },
  media: {
    title: '图像包',
    description: '游戏内图像视频资源同步状态',
    icon: '$imageOutline',
    tone: 'media'
  }
}

// 面板顺序跟随 statusResourceKeys;Record 以 StatusResourceKey 为键,
// 新增资源缺少面板文案时会在编译期报错。
export const statusResourcePanels: StatusResourcePanel[] = statusResourceKeys.map((key) => ({
  key,
  ...statusResourcePanelMeta[key]
}))
