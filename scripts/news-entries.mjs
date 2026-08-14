import path from 'node:path'

import { readNewsArticles } from './news-content.mjs'

/**
 * @typedef {object} NewsEntry
 * @property {string} slug
 * @property {string} title
 * @property {string} author
 * @property {string} publishedAt
 * @property {string} category
 * @property {string} summary
 */

/**
 * @param {string} [newsDirectory]
 * @returns {Promise<NewsEntry[]>}
 */
export async function readNewsEntries(newsDirectory = path.resolve('src/content/news')) {
  const { articles } = await readNewsArticles({
    newsDirectory,
    includeDrafts: false
  })

  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    author: article.author,
    publishedAt: article.publishedAt,
    category: article.category,
    summary: article.summary
  }))
}
