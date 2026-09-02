import { readFile } from 'node:fs/promises'
import path from 'node:path'

/** @typedef {import('./news-content.mjs').NewsEntry} NewsEntry */

// 读取 generateNewsModule 产出的轻量条目清单:构建脚本(sitemap、静态
// 回退页)不再重新读取并渲染 Markdown,新闻管线每次构建只跑一次。
/**
 * @param {string} [entriesFile]
 * @returns {Promise<NewsEntry[]>}
 */
export async function readNewsEntries(entriesFile = path.resolve('src/content/news-entries.generated.json')) {
  let raw

  try {
    raw = await readFile(entriesFile, 'utf-8')
  } catch (error) {
    const errorCode = error instanceof Error && 'code' in error ? error.code : undefined

    if (errorCode === 'ENOENT') {
      throw new Error(`News entries artifact not found at ${entriesFile}. Run "npm run generate:news:prod" first.`, { cause: error })
    }

    throw error
  }

  return JSON.parse(raw)
}
