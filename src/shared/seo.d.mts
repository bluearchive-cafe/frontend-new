export interface SeoRouteInput {
  title: string
  description?: string
  keywords?: string
  robots?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

export interface SeoInfo {
  title: string
  description: string
  keywords: string
  robots: string
  type: 'website' | 'article'
  publishedAt: string
}

export interface ArticleSeoInput {
  title: string
  summary: string
  category: string
  publishedAt: string
}

export interface ArticleSchemaInput {
  title: string
  author: string
  publishedAt: string
  summary?: string
  description?: string
  slug: string
}

export const articleFallbackDescription: (title: string) => string
export function resolveRouteSeo(route: SeoRouteInput, options?: { notFound?: boolean }): SeoInfo
export function buildArticleSeo(article: ArticleSeoInput): SeoInfo
export function buildRouteUrl(routePath: string): string
export function buildArticleHeadline(title: string): string
export function buildArticleSchema(article: ArticleSchemaInput): Record<string, unknown>
export function buildSiteSchemas(): Array<Record<string, unknown>>
