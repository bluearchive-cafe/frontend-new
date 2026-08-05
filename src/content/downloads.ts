import type { StatusResourceKey } from '../utils/status'

export type ClientStatusResourceKey = Extract<
  StatusResourceKey,
  'android' | 'ios' | 'windows' | 'macos'
>

export interface PlatformLink {
  name: string
  statusKey: ClientStatusResourceKey
  icon: string
  tone: string
  docUrl: string
  docExternal: boolean
  description: string
  tags?: string[]
  variants: DownloadVariant[]
  hidden?: boolean
  disabled?: boolean
  disabledHint?: string
}

export interface DownloadVariant {
  name: string
  description: string
  downloadUrl: string
  recommended?: boolean
  /** 安装前注意事项，展示在下载确认对话框的下载源说明中。 */
  notice?: string
  hidden?: boolean
}

const baseDocUrl = 'https://docs.bluearchive.cafe/'

export const platformLinks: PlatformLink[] = [
  {
    name: 'Android 客户端',
    statusKey: 'android',
    icon: '$android',
    tone: 'android',
    docUrl: baseDocUrl + 'platform/android/',
    docExternal: true,
    description: '适用于手机、平板与安卓模拟器。下载后请根据安装文档确认存储权限和系统兼容性。',
    tags: ['APK', '移动端', '模拟器'],
    variants: [
      {
        name: 'APKS 安装包',
        description: '需要通过支持 APKS 的安装器安装，使用系统自带安装器可能无法正常安装。',
        downloadUrl: 'https://download.bluearchive.cafe/android/latest',
        recommended: true,
        notice: '需要通过支持 APKS 的安装器安装（例如 MT 管理器 和 InstallerX Revived、SAI），使用系统自带安装器可能无法正常安装。'
      },
      {
        name: 'Android 安装器（测试）',
        description: '我们开发的 APKS 安装器，集成游戏下载 / 安装、汉化管理等功能。',
        downloadUrl: 'https://github.com/bluearchive-cafe/Cafe.Launcher.Android/releases',
        notice: '测试版本可能存在不稳定或功能未完善的情况；请在 GitHub Releases 中选择适合你系统的安装包。'
      },
      {
        name: '共存版（弃用）',
        description: '可与官方客户端共存安装。',
        downloadUrl: 'https://api.bluearchive.cafe/download/file?platform=android&version=latest&file=cafe.YostarJP.BlueArchive.apk',
        hidden: true,
        notice: '该版本已弃用，仅在需要与官方客户端共存时使用；请按 Android 文档确认签名与安装方式。'
      },
      {
        name: '独占版（弃用）',
        description: '需要卸载官方客户端才可安装，但对模拟器的兼容性更好。',
        downloadUrl: 'https://download.bluearchive.cafe/android/latest',
        hidden: true,
        notice: '该版本已弃用，安装前需要卸载官方客户端，请提前备份游戏数据与引继码。'
      },
      {
        name: '替换文件（弃用）',
        description: '在 GitHub 中查看完整内容',
        downloadUrl: 'https://github.com/bluearchive-cafe/bluearchive-cafe/releases/latest',
        hidden: true,
        notice: '该版本已弃用，仅保留资源替换说明；请在 GitHub Releases 中查看完整内容后手动替换。'
      }
    ]
  },
  {
    name: 'iOS 客户端',
    statusKey: 'ios',
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
        recommended: true,
        notice: '自签证书到期后需要重新签名安装，请留意证书有效期与设备上限；使用免签版时签名证书可能随时被吊销。'
      },
      {
        name: '免签版（弃用）',
        description: '免签版客户端签名所用的证书可能随时被吊销，且签名改变后无法覆盖安装，建议优先通过自签侧载。',
        downloadUrl: 'https://api.bluearchive.cafe/download/itms?version=latest',
        hidden: true,
        notice: '免签版签名证书可能随时被吊销，且签名改变后无法覆盖安装，建议优先通过自签侧载。'
      }
    ]
  },
  {
    name: 'Windows 启动器',
    statusKey: 'windows',
    icon: '$microsoftWindows',
    tone: 'windows',
    docUrl: baseDocUrl + 'platform/windows/',
    docExternal: true,
    description: '适用于 Windows 10 / 11。下载后请按文档检查运行库、解压路径与杀毒软件拦截情况。',
    tags: ['Windows 10 / 11', '桌面端'],
    variants: [
      {
        name: '便携版（旧）',
        description: '解压后直接运行，适合临时使用或放在自定义目录。',
        downloadUrl: 'https://download.bluearchive.cafe/launcher/latest',
        notice: '请先解压到本地再运行，避免在压缩包内直接执行；如被杀毒软件拦截，请按文档添加信任或白名单。'
      },
      {
        name: 'Cafe Launcher（测试）',
        description: '我们开发的第三方 Blue Archive 启动器，相比原版启动器提供了更多功能。',
        downloadUrl: 'https://github.com/bluearchive-cafe/Cafe.Launcher.Avalonia_Release/releases',
        notice: '测试版本可能存在不稳定或功能未完善的情况；请在 GitHub Releases 中选择适合你系统的安装包。'
      }
    ]
  },
  {
    name: 'macOS 客户端',
    statusKey: 'macos',
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
        downloadUrl: 'https://download.bluearchive.cafe/playcover/latest',
        notice: '首次打开应用时，若提示「无法打开，因为无法验证开发者」，请前往系统设置 → 隐私与安全性中允许运行。'
      },
      {
        name: '直接下载应用包',
        description: '适用于搭载 Apple Silicon 芯片的 Mac。',
        downloadUrl: 'https://download.bluearchive.cafe/macos/latest',
        notice: '若提示「无法打开，因为无法验证开发者」，请前往系统设置 → 隐私与安全性中允许运行。'
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
