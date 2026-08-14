export interface NewsGenerationOptions {
  newsDirectory?: string
  outputFile?: string
  includeDrafts?: boolean
}

export interface NewsAsset {
  filePath: string
  importName: string
  placeholder: string
}

// 生成产物(news.generated.ts)中的文章形状,与 src/content/news-types.ts 一致。
export interface GeneratedNewsArticle {
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

// 读取阶段多带原始 Markdown 正文。
export interface NewsArticleData extends GeneratedNewsArticle {
  body: string
}

export interface NewsContentResult {
  articles: NewsArticleData[]
  assets: NewsAsset[]
}

export interface GeneratedNewsResult {
  articles: GeneratedNewsArticle[]
  assets: NewsAsset[]
  output: string
}

export function readNewsArticles(options?: {
  newsDirectory?: string
  includeDrafts?: boolean
}): Promise<NewsContentResult>

export function generateNewsModule(options?: NewsGenerationOptions): Promise<GeneratedNewsResult>

export function sanitizeRenderedHtml(html: string): string
