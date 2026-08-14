import type { NewsArticle } from '../src/content/news-types'

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

// 生成产物与浏览器消费方共用 NewsArticle,字段只在 news-types.ts 定义。
export type GeneratedNewsArticle = NewsArticle

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
