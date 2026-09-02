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
  return JSON.parse(await readFile(entriesFile, 'utf-8'))
}
