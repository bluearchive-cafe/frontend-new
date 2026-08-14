// 静态站点内容单一来源:AboutSection 与 SiteFooter 从这里取数据,
// 与 src/content/downloads.ts 的内容数据策略保持一致。
export interface SiteContentItem {
  icon: string
  title: string
  description: string
}

export interface SocialLink {
  label: string
  href: string
  icon: string
  tone: string
  description: string
}

export interface FriendLink {
  label: string
  href: string
}

export const aboutItems: SiteContentItem[] = [
  {
    icon: '$infoOutline',
    title: '非官方项目',
    description: '“蔚蓝咖啡厅”是由爱好者创立并维护的民间项目，与游戏“ブルーアーカイブ（中文名‘蔚蓝档案’）”及相关公司并无官方关联。'
  },
  {
    icon: '$fileDocumentEditOutline',
    title: '内容维护',
    description: '站点会整理汉化说明、安装文档、资源状态和公告信息，帮助玩家更快确认当前可用内容。'
  },
  {
    icon: '$messageAlertOutline',
    title: '反馈渠道',
    description: '如发现客户端、页面、内容或其他问题，可以通过邮件、QQ 群组提交反馈。'
  }
]

export const socialLinks: SocialLink[] = [
  {
    label: '哔哩哔哩',
    href: 'https://space.bilibili.com/3706947316484682',
    icon: '$videoOutline',
    tone: 'bilibili',
    description: '发布站点更新、公告同步和阶段性内容预览。'
  },
  {
    label: 'QQ 群组',
    href: 'https://qm.qq.com/q/YPU4KjGVmA',
    icon: '$accountGroupOutline',
    tone: 'qq',
    description: '加入社区交流，反馈页面问题、内容错误或使用建议。'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/bluearchive-cafe',
    icon: '$github',
    tone: 'github',
    description: '查看源码、跟踪开发进度，或通过 issue 参与改进。'
  }
]

export const friendLinks: FriendLink[] = [
  {
    label: 'ブルーアーカイブ',
    href: 'https://bluearchive.jp/'
  },
  {
    label: 'Yostar JP',
    href: 'https://www.yostar.co.jp/'
  },
  {
    label: 'Shittim Canvas',
    href: 'https://sc.japerz.com/'
  }
]
