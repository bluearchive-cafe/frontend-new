// 新闻文章类型:生成产物(news.generated.ts)与消费方(news.ts)
// 共同依赖这里,避免生成器反向依赖消费方造成的类型级循环。
export interface NewsArticle {
  title: string
  author: string
  publishedAt: string
  publishedAtDateTime: string
  publishedAtTimestamp: number
  category: string
  summary: string
  pinned: boolean
  draft: boolean
  slug: string
  html: string
  wordCount: number
}
