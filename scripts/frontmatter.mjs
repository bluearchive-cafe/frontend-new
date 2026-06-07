const booleanTrueValues = new Set(['true', '1', 'yes', 'y'])

/**
 * Parses a boolean-like frontmatter value.
 * Accepts "true", "1", "yes", "y" (case-insensitive).
 */
export function parseBoolean(value) {
  return booleanTrueValues.has(value?.trim().toLowerCase() ?? '')
}

/**
 * Extracts `---`-delimited YAML-like frontmatter and body from Markdown source.
 *
 * Returns `{ meta: Record<string, string>, body: string }`.
 * Throws when the source does not contain a frontmatter block.
 *
 * Both the Vite-based news pipeline (src/content/news.ts) and the Node.js build
 * scripts (scripts/news-entries.mjs) rely on this shared parser so that the
 * frontmatter format is defined in a single place.
 */
export function parseFrontmatterRaw(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    throw new Error('Markdown content requires frontmatter.')
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

  return { meta, body: match[2].trim() }
}
