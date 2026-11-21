// 站内公告的单一来源:AnnouncementDialog 只负责展示,是否已读由
// src/utils/announcement-notice.ts 决定。id 用于统计,revision 用于让
// 内容更新后的公告对已读用户重新出现;两者共同组成 storage key。
export interface AnnouncementAction {
  label: string
  href: string
}

export interface AnnouncementDate {
  date: string
  detail: string
}

export interface SiteAnnouncement {
  id: string
  revision: number
  eyebrow: string
  title: string
  lead: string
  dates: AnnouncementDate[]
  warning: string
  note: string
  primaryAction: AnnouncementAction
  newsAction: {
    label: string
    to: string
  }
  sourceAction: AnnouncementAction
  suppressPaths: string[]
}

export const activeAnnouncements: SiteAnnouncement[] = [
  {
    id: 'publisher-transfer-2027',
    revision: 1,
    eyebrow: '官方公告 · 账号迁移',
    title: '日服《蔚蓝档案》发行商将变更为 NEXON',
    lead: '2027 年 1 月起，日服《蔚蓝档案》（ブルーアーカイブ）的发行商将由 Yostar 变更为 NEXON。若要继续使用当前游戏账号，请在预计于 1 月中旬开始的发行商变更维护前完成「账号迁移申请」。',
    dates: [
      {
        date: '2026-10-25',
        detail: '官方发布发行商变更公告'
      },
      {
        date: '2026-11',
        detail: '账号迁移申请页面开放'
      },
      {
        date: '2027-01 中旬',
        detail: '发行商变更维护（申请截止）'
      }
    ],
    warning:
      '未与 Yostar ID 绑定的游客账号无法迁移，请先在游戏内完成绑定。申请时请用推荐浏览器直接打开页面：iOS / iPadOS 用 Safari，Android 用 Chrome，Windows / macOS 用 Chrome、Edge 或 Firefox，并尽量在 Wi-Fi 环境下办理；从 X 等应用内浏览器进入可能报错。',
    note: '本站为非官方项目，内容整理自 NEXON 官方公告；具体安排与补偿以官方公告为准。',
    primaryAction: {
      label: '前往账号迁移申请',
      href: 'https://ba-account-migration.yostar.co.jp/'
    },
    newsAction: {
      label: '阅读站点公告',
      to: '/news/publisher-transfer-2027'
    },
    sourceAction: {
      label: '官方公告原文',
      href: 'https://cmn-jp.nexon.com/transfer/bluearchive'
    },
    suppressPaths: ['/news/publisher-transfer-2027']
  }
]
