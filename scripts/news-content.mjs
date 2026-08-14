// 新闻内容生成:读取 src/content/news 的 Markdown + frontmatter,
// 渲染为经白名单清理的 HTML,并生成 src/content/news.generated.ts。
// Markdown 渲染规则见 news-markdown.mjs,HTML 清理白名单见 news-sanitize.mjs。
import { accessSync, realpathSync, statSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { createMarkdownRenderer, splitAssetReference } from './news-markdown.mjs'
import { sanitizeRenderedHtml } from './news-sanitize.mjs'
import { parseBoolean, parseFrontmatterRaw } from './frontmatter.mjs'

/**
 * @typedef {import('../src/content/news-types').NewsArticle} NewsArticle
 * @typedef {object} NewsGenerationOptions
 * @property {string} [newsDirectory]
 * @property {string} [outputFile]
 * @property {boolean} [includeDrafts]
 *
 * @typedef {object} NewsAsset
 * @property {string} filePath
 * @property {string} importName
 * @property {string} placeholder
 *
 * @typedef {Omit<NewsArticle, 'html'> & { body: string }} ParsedNewsArticle
 * @typedef {NewsArticle & { body: string }} NewsArticleData
 * @typedef {{ articles: NewsArticleData[], assets: NewsAsset[] }} NewsContentResult
 * @typedef {{ articles: NewsArticleData[], assets: NewsAsset[], output: string }} GeneratedNewsResult
 */

export { sanitizeRenderedHtml } from './news-sanitize.mjs'

/**
 * @param {{ newsDirectory?: string, includeDrafts?: boolean }} [options]
 * @returns {Promise<NewsContentResult>}
 */
export async function readNewsArticles({
  newsDirectory = path.resolve('src/content/news'),
  includeDrafts = false
} = {}) {
  const markdownFiles = await findMarkdownFiles(newsDirectory)
  /** @type {Map<string, NewsAsset>} */
  const assetRegistry = new Map()
  const slugs = new Set()
  /** @type {NewsArticleData[]} */
  const articles = []

  for (const filePath of markdownFiles) {
    const source = await readFile(filePath, 'utf-8')
    const article = parseNewsArticle(source, filePath, newsDirectory)

    if (!includeDrafts && article.draft) {
      continue
    }

    if (slugs.has(article.slug)) {
      throw new Error(`Duplicate news slug: ${article.slug}`)
    }

    slugs.add(article.slug)

    const markdown = createMarkdownRenderer()
    const renderedHtml = markdown.render(article.body, {
      resolveAsset: (/** @type {string} */ src) => registerNewsAsset(src, filePath, newsDirectory, assetRegistry)
    })

    articles.push({
      ...article,
      html: sanitizeRenderedHtml(renderedHtml)
    })
  }

  return {
    articles,
    assets: Array.from(assetRegistry.values())
  }
}

/**
 * @param {NewsGenerationOptions} [options]
 * @returns {Promise<GeneratedNewsResult>}
 */
export async function generateNewsModule({
  newsDirectory = path.resolve('src/content/news'),
  outputFile = path.resolve('src/content/news.generated.ts'),
  includeDrafts = false
} = {}) {
  const { articles, assets } = await readNewsArticles({ newsDirectory, includeDrafts })
  const output = renderGeneratedModule(articles, assets, outputFile)

  await writeFile(outputFile, output)

  return { articles, assets, output }
}

/**
 * @param {string} source
 * @param {string} filePath
 * @param {string} newsDirectory
 * @returns {ParsedNewsArticle}
 */
function parseNewsArticle(source, filePath, newsDirectory) {
  const { meta, body } = parseFrontmatterRaw(source)
  const publishedAt = parsePublishedAt(meta.publishedAt ?? '', filePath)

  return {
    title: meta.title ?? '未命名新闻',
    author: meta.author ?? 'BlueArchive.Cafe',
    ...publishedAt,
    category: meta.category ?? '未分类',
    summary: meta.summary ?? '',
    pinned: parseBoolean(meta.pinned),
    draft: parseBoolean(meta.draft),
    slug: getSlugFromPath(newsDirectory, filePath),
    body,
    wordCount: countWords(body)
  }
}

/**
 * @param {string} value
 * @param {string} filePath
 */
function parsePublishedAt(value, filePath) {
  const publishedAt = value.trim()

  if (!publishedAt) {
    throw new Error(`${filePath} requires publishedAt frontmatter.`)
  }

  const publishedAtDateTime = publishedAt.replace(' ', 'T')
  const publishedAtTimestamp = Date.parse(publishedAtDateTime)

  if (Number.isNaN(publishedAtTimestamp)) {
    throw new Error(`${filePath} has invalid publishedAt frontmatter: ${publishedAt}`)
  }

  return { publishedAt, publishedAtDateTime, publishedAtTimestamp }
}

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function findMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return findMarkdownFiles(entryPath)
      }

      return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
    })
  )

  return nestedFiles.flat().sort()
}

/**
 * @param {string} newsDirectory
 * @param {string} filePath
 */
function getSlugFromPath(newsDirectory, filePath) {
  const relativePath = path.relative(newsDirectory, filePath).replaceAll(path.sep, '/')
  const normalizedPath = relativePath.replace(/\.md$/, '')

  return normalizedPath.endsWith('/index') ? normalizedPath.slice(0, -'/index'.length) : normalizedPath
}

/**
 * @param {string} src
 * @param {string} sourcePath
 * @param {string} newsDirectory
 * @param {Map<string, NewsAsset>} assetRegistry
 */
function registerNewsAsset(src, sourcePath, newsDirectory, assetRegistry) {
  const { pathname, suffix } = splitAssetReference(src)
  const assetPath = path.resolve(path.dirname(sourcePath), pathname)
  const relativePath = path.relative(newsDirectory, assetPath)

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`${sourcePath} references an asset outside the news directory: ${src}`)
  }

  accessSync(assetPath)

  if (!statSync(assetPath).isFile()) {
    throw new Error(`${sourcePath} references a news asset that is not a file: ${src}`)
  }

  const realNewsDirectory = realpathSync(newsDirectory)
  const realAssetPath = realpathSync(assetPath)
  const realRelativePath = path.relative(realNewsDirectory, realAssetPath)

  if (!realRelativePath || realRelativePath.startsWith('..') || path.isAbsolute(realRelativePath)) {
    throw new Error(`${sourcePath} references an asset outside the news directory: ${src}`)
  }

  const registryKey = assetPath
  let asset = assetRegistry.get(registryKey)

  if (!asset) {
    const index = assetRegistry.size
    asset = {
      filePath: assetPath,
      importName: `newsAsset${index}`,
      placeholder: `__NEWS_ASSET_${index}__`
    }
    assetRegistry.set(registryKey, asset)
  }

  return `${asset.placeholder}${suffix}`
}

/**
 * @param {NewsArticleData[]} articles
 * @param {NewsAsset[]} assets
 * @param {string} outputFile
 */
function renderGeneratedModule(articles, assets, outputFile) {
  const importLines = assets.map((asset) => {
    const relativePath = toImportPath(path.relative(path.dirname(outputFile), asset.filePath))
    return `import ${asset.importName} from ${JSON.stringify(`${relativePath}?url`)}`
  })
  const articleLines = articles.map((article) => {
    const htmlExpression = renderHtmlExpression(article.html, assets)

    return `  {
    title: ${JSON.stringify(article.title)},
    author: ${JSON.stringify(article.author)},
    publishedAt: ${JSON.stringify(article.publishedAt)},
    publishedAtDateTime: ${JSON.stringify(article.publishedAtDateTime)},
    publishedAtTimestamp: ${article.publishedAtTimestamp},
    category: ${JSON.stringify(article.category)},
    summary: ${JSON.stringify(article.summary)},
    pinned: ${article.pinned},
    draft: ${article.draft},
    slug: ${JSON.stringify(article.slug)},
    html: ${htmlExpression},
    wordCount: ${article.wordCount}
  }`
  })

  return `${importLines.join('\n')}${importLines.length ? '\n\n' : ''}import type { NewsArticle } from './news-types'

export const generatedNewsArticles: NewsArticle[] = [
${articleLines.join(',\n')}
]
`
}

/**
 * @param {string} html
 * @param {NewsAsset[]} assets
 */
function renderHtmlExpression(html, assets) {
  const assetByPlaceholder = new Map(assets.map((asset) => [asset.placeholder, asset.importName]))
  const pattern = /__NEWS_ASSET_\d+__/g
  const parts = []
  let lastIndex = 0

  for (const match of html.matchAll(pattern)) {
    const placeholder = match[0]
    const importName = assetByPlaceholder.get(placeholder)

    if (!importName || match.index === undefined) {
      throw new Error(`Generated HTML contains an unknown asset placeholder: ${placeholder}`)
    }

    parts.push(JSON.stringify(html.slice(lastIndex, match.index)))
    parts.push(importName)
    lastIndex = match.index + placeholder.length
  }

  parts.push(JSON.stringify(html.slice(lastIndex)))

  return parts.length === 1 ? parts[0] : `[${parts.join(', ')}].join('')`
}

/** @param {string} value */
function toImportPath(value) {
  const normalized = value.replaceAll(path.sep, '/')
  return normalized.startsWith('.') ? normalized : `./${normalized}`
}

/** @param {string} markdownBody */
function countWords(markdownBody) {
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
