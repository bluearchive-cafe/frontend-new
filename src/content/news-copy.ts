// 新闻卡片与新闻空状态的展示文案单一来源:首页新闻区块(NewsSection)
// 与新闻列表页(NewsPage)共用,同一状态的两份文案必须逐字一致。
export const articleCardCtaLabel = '阅读全文'

/** 站点尚无任何已发布新闻时的空状态文案。 */
export const newsEmptyState = {
  label: 'No news',
  title: '暂无新闻',
  description: '当前还没有已发布的新闻内容，后续公告会在这里展示。'
} as const
