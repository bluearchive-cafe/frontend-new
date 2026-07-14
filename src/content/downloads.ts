export interface PlatformLink {
  name: string
  icon: string
  tone: string
  docUrl: string
  docExternal: boolean
  description: string
  tags?: string[]
  variants: DownloadVariant[]
  hidden?: boolean
}

export interface DownloadVariant {
  name: string
  description: string
  downloadUrl: string
  recommended?: boolean
  hidden?: boolean
}

const baseDocUrl = 'https://docs.bluearchive.cafe/'

export const platformLinks: PlatformLink[] = [
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
        name: '共存版（弃用）',
        description: '可与官方客户端共存安装。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=android&version=latest&file=cafe.YostarJP.BlueArchive.apk',
        recommended: true,
        hidden: true
      },
      {
        name: '安装包',
        description: '需要卸载官方客户端才可安装，但对模拟器的兼容性更好。',
        downloadUrl: 'https://download.bluearchive.cafe/android/latest'
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
        name: '应用包',
        description: '建议使用 Impactor、AltStore 或 SideStore 等工具进行自签，或使用免签版客户端。',
        downloadUrl: 'https://download.bluearchive.cafe/ios/latest',
        recommended: true
      },
      {
        name: '免签版（弃用）',
        description: '免签版客户端签名所用的证书可能随时被吊销，且签名改变后无法覆盖安装，建议优先通过自签侧载。',
        downloadUrl: 'https://api.bluearchive.cafe/download/itms?version=latest',
        hidden: true
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
        downloadUrl: 'https://download.bluearchive.cafe/launcher/latest'
      },
      {
        name: 'Cafe Launcher（测试）',
        description: '我们开发的第三方 Blue Archive 启动器，相比原版启动器提供了更多功能。',
        downloadUrl: 'https://github.com/bluearchive-cafe/Cafe.Launcher.Avalonia_Release/releases'
      }
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
        name: '通过 PlayCover 安装',
        description: '适用于搭载 Apple Silicon 芯片的 Mac。',
        downloadUrl: 'https://download.bluearchive.cafe/playcover/latest'
      },
      {
        name: '直接下载应用包',
        description: '适用于搭载 Apple Silicon 芯片的 Mac。',
        downloadUrl: 'https://download.bluearchive.cafe/macos/latest'
      }
    ]
  }
]

export const documentLinks = [
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

export function filterVisiblePlatformLinks(links: PlatformLink[], showHidden: boolean) {
  return links
    .filter((platform) => showHidden || !platform.hidden)
    .map((platform) => ({
      ...platform,
      variants: showHidden
        ? platform.variants
        : platform.variants.filter((variant) => !variant.hidden)
    }))
    .filter((platform) => platform.variants.length > 0)
}
