import { blueArchiveDarkTheme } from '../theme'

export function printConsoleBrand() {
  // 品牌色从主题单一来源派生,避免与 theme.ts / global.css 的重复维护。
  const primary = blueArchiveDarkTheme.colors.primary
  const badgeBase = 'padding: 3px 6px; font: 400 11px/1.35 system-ui, sans-serif;'
  const badgeLabel = `${badgeBase} background: #555; color: #fff;`
  const badgeVersion = `${badgeBase} background: ${primary}; color: #fff;`
  const badgeBuild = `${badgeBase} background: #90caf9; color: #102a43;`
  const badgeCommit = `${badgeBase} background: #1976d2; color: #fff;`
  const badgeDeveloper = `${badgeBase} background: #607d8b; color: #fff;`
  const reset = ''

  console.info(
    '%cBlueArchive.Cafe%c\n提供全面的 Blue Archive 汉化服务。',
    `color: ${primary}; font-size: 18px; font-weight: 800;`,
    'color: #8bd8ff; font-size: 13px;'
  )
  console.info('%cversion%c%s', badgeLabel, badgeVersion, ` v${__APP_INFO__.version} `)
  console.info(
    '%cbuild%c%s%c %ccommit%c%s',
    badgeLabel,
    badgeBuild,
    ` ${new Date(__APP_INFO__.buildTime).toISOString()} `,
    reset,
    badgeLabel,
    badgeCommit,
    ` ${__APP_INFO__.commitSha} `
  )
  console.info('%cdeveloper%c%s', badgeLabel, badgeDeveloper, ` ${__APP_INFO__.developer} `)
}
