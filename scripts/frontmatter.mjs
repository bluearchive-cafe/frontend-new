const booleanTrueValues = new Set(['true', '1', 'yes', 'y'])

/**
 * Parses a boolean-like frontmatter value.
 * Accepts "true", "1", "yes", "y" (case-insensitive).
 * @param {string | undefined | null} value
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
 * The build-time news module and sitemap entry reader rely on this shared
 * parser so that the frontmatter format is defined in a single place.
 * @param {string} source
 * @returns {{ meta: Record<string, string>, body: string }}
 */
export function parseFrontmatterRaw(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!match) {
    throw new Error('Markdown content requires frontmatter.')
  }

  /** @type {Record<string, string>} */
  const meta = match[1].split(/\r?\n/).reduce((result, line) => {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      return result
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    result[key] = value

    return result
  }, /** @type {Record<string, string>} */ ({}))

  return { meta, body: match[2].trim() }
}
