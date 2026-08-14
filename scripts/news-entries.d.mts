export interface NewsEntry {
  slug: string
  title: string
  author: string
  publishedAt: string
  category: string
  summary: string
}

export function readNewsEntries(newsDirectory?: string): Promise<NewsEntry[]>
