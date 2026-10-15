import { siteTagline } from '../shared/site-routes.mjs'
import { blueArchiveDarkTheme } from '../theme'

/**
 * 把 vite.config.ts 注入的 UTC ISO 构建时间换算到读者所在时区,并保留显式
 * 偏移(+08:00 之类),让控制台显示读者自己的钟点而不必心算 UTC。解析失败时
 * 原样返回,避免控制台出现 NaN。
 */
export function formatLocalBuildTime(iso: string): string {
  const buildTime = new Date(iso)

  if (Number.isNaN(buildTime.getTime())) {
    return iso
  }

  const pad = (value: number) => String(value).padStart(2, '0')
  const offsetMinutes = -buildTime.getTimezoneOffset()
  const date = `${buildTime.getFullYear()}-${pad(buildTime.getMonth() + 1)}-${pad(buildTime.getDate())}`
  const time = `${pad(buildTime.getHours())}:${pad(buildTime.getMinutes())}:${pad(buildTime.getSeconds())}`
  const offset = `${offsetMinutes < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(
    Math.abs(offsetMinutes) % 60
  )}`

  return `${date}T${time}${offset}`
}

export function printConsoleBrand() {
  // 控制台配色就地声明,不做主题化:标题用主题主色,环境徽标用主题语义色
  // success/warning;构建/提交/署名徽标取自 Material 2 调色板(blue-200
  // #90caf9、blue-700 #1976d2、blue-grey-500 #607d8b);标签底 #555 与标语
  // #8bd8ff 是控制台专属色,调色板与主题中都没有等值项。不写进 theme.ts:
  // 那里只承载 Vuetify 主题 token,未知键会生成多余的 CSS 变量。
  const primary = blueArchiveDarkTheme.colors.primary
  const taglineColor = '#8bd8ff'
  const badgeBase = 'padding: 3px 6px; font: 400 11px/1.35 system-ui, sans-serif;'
  const badgeLabel = `${badgeBase} background: #555; color: #fff;`
  const badgeBuild = `${badgeBase} background: #90caf9; color: #102a43;`
  const badgeCommit = `${badgeBase} background: #1976d2; color: #fff;`
  const badgeDeveloper = `${badgeBase} background: #607d8b; color: #fff;`
  // 生产构建标绿、开发服务器标琥珀色,排查时一眼分清线上部署与本地工作区。
  const isProduction = import.meta.env.PROD
  const badgeEnvironment = `${badgeBase} background: ${
    isProduction ? blueArchiveDarkTheme.colors.success : blueArchiveDarkTheme.colors.warning
  }; color: #102a43;`
  const reset = ''

  console.info(
    '%cBlueArchive.Cafe%c\n' + `${siteTagline.lead}${siteTagline.emphasis}${siteTagline.subject}。`,
    `color: ${primary}; font-size: 18px; font-weight: 800;`,
    `color: ${taglineColor}; font-size: 13px;`
  )
  console.info(
    '%cbuild%c%s%c %ccommit%c%s',
    badgeLabel,
    badgeBuild,
    ` ${formatLocalBuildTime(__APP_INFO__.buildTime)} `,
    reset,
    badgeLabel,
    badgeCommit,
    ` ${__APP_INFO__.commitSha} `
  )
  console.info('%cenv%c%s', badgeLabel, badgeEnvironment, ` ${isProduction ? 'production' : 'development'} `)
  console.info('%cdeveloper%c%s', badgeLabel, badgeDeveloper, ` ${__APP_INFO__.developer} `)
}
