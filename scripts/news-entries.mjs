import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const booleanTrueValues = new Set(['true', '1', 'yes', 'y'])

export async function readNewsEntries(newsDirectory = path.resolve('src/content/news')) {
  const markdownFiles = await findMarkdownFiles(newsDirectory)
  const entries = await Promise.all(
    markdownFiles.map(async (filePath) => {
      const source = await readFile(filePath, 'utf-8')
      const { meta } = parseFrontmatter(source, filePath)

      return {
        slug: getSlugFromPath(newsDirectory, filePath),
        publishedAt: meta.publishedAt ?? '',
        draft: parseBoolean(meta.draft)
      }
    })
  )

  return entries.filter((entry) => !entry.draft)
}

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

function getSlugFromPath(newsDirectory, filePath) {
  const relativePath = path.relative(newsDirectory, filePath).replaceAll(path.sep, '/')
  const normalizedPath = relativePath.replace(/\.md$/, '')

  return normalizedPath.endsWith('/index') ? normalizedPath.slice(0, -'/index'.length) : normalizedPath
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    throw new Error(`${filePath} requires frontmatter.`)
  }

  const meta = match[1].split(/\r?\n/).reduce((result, line) => {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      return result
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    result[key] = value

    return result
  }, {})

  return { meta }
}

function parseBoolean(value) {
  return booleanTrueValues.has(value?.trim().toLowerCase() ?? '')
}
