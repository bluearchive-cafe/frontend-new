export function printConsoleBrand() {
  const badgeStart =
    'background: #29aeea; color: #fff; padding: 5px 8px; border-radius: 3px 0 0 3px; font-weight: 700;'
  const badgeDark = 'background: #242932; color: #fff; padding: 5px 8px; font-weight: 700;'
  const badgeLight = 'background: #e8f6ff; color: #243241; padding: 5px 8px; font-weight: 700;'
  const badgeEnd =
    'background: #8bd8ff; color: #16222e; padding: 5px 8px; border-radius: 0 3px 3px 0; font-weight: 700;'

  console.info(
    '%cBlueArchive.Cafe%c\n提供全面的 Blue Archive 汉化服务。',
    'color: #29aeea; font-size: 18px; font-weight: 800;',
    'color: #8bd8ff; font-size: 13px;'
  )
  console.info('%c version %c %s ', badgeStart, badgeEnd, `v${__APP_INFO__.version}`)
  console.info(
    '%c build %c %s %c commit %c %s ',
    badgeStart,
    badgeLight,
    new Date(__APP_INFO__.buildTime).toLocaleString(),
    badgeDark,
    badgeEnd,
    __APP_INFO__.commitSha
  )
  console.info('%c developer %c %s ', badgeStart, badgeEnd, __APP_INFO__.developer)
}
