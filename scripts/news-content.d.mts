export interface NewsGenerationOptions {
  newsDirectory?: string
  outputFile?: string
  includeDrafts?: boolean
}

export interface GeneratedNewsResult {
  articles: Array<Record<string, unknown>>
  assets: Array<Record<string, unknown>>
  output: string
}

export function generateNewsModule(options?: NewsGenerationOptions): Promise<GeneratedNewsResult>

export function sanitizeRenderedHtml(html: string): string
