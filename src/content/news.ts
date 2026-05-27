import MarkdownIt from 'markdown-it'

type NewsMeta = {
  title: string
  author: string
  publishedAt: string
  category: string
  summary: string
  pinned: boolean
  draft: boolean
}

export type NewsArticle = NewsMeta & {
  slug: string
  body: string
  html: string
  wordCount: number
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const articleModules = import.meta.glob<string>('./news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const rawArticles = Object.entries(articleModules).map(([path, source]) => {
  const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? ''

  return { slug, source }
})

function parseFrontmatter(source: string): { meta: NewsMeta; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    throw new Error('News markdown requires frontmatter.')
  }

  const meta = match[1].split(/\r?\n/).reduce<Record<string, string>>((result, line) => {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      return result
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    result[key] = value

    return result
  }, {})

  return {
    meta: {
      title: meta.title ?? '未命名新闻',
      author: meta.author ?? 'BlueArchive.Cafe',
      publishedAt: meta.publishedAt ?? '',
      category: meta.category ?? '未分类',
      summary: meta.summary ?? '',
      pinned: parseBoolean(meta.pinned),
      draft: parseBoolean(meta.draft)
    },
    body: match[2].trim()
  }
}

function parseBoolean(value: string | undefined) {
  return ['true', '1', 'yes', 'y'].includes(value?.trim().toLowerCase() ?? '')
}

function countWords(markdownBody: string) {
  const plainText = markdownBody
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const cjkCount = (plainText.match(/[\u4e00-\u9fff]/g) ?? []).length
  const latinWordCount = (plainText.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? []).length

  return cjkCount + latinWordCount
}

export const newsArticles: NewsArticle[] = rawArticles
  .map(({ slug, source }) => {
    const { meta, body } = parseFrontmatter(source)

    return {
      ...meta,
      slug,
      body,
      html: markdown.render(body),
      wordCount: countWords(body)
    }
  })
  .filter((article) => !article.draft)
  .sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  })

export function findNewsArticle(slug: string) {
  return newsArticles.find((article) => article.slug === slug)
}

export const newsCategories = Array.from(new Set(newsArticles.map((article) => article.category)))

export function formatPublishTime(value: string) {
  if (!value) {
    return '未设置发布时间'
  }

  return value
}
