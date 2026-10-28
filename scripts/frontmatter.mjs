const booleanTrueValues = new Set(['true', '1', 'yes', 'y'])
const booleanFalseValues = new Set(['false', '0', 'no', 'n'])

/**
 * Reads a boolean frontmatter flag, refusing to guess.
 * An unrecognised value (a `Draft:` typo, `true # 待补`, `是`) used to fall
 * through as `false`, which for `draft` means publishing a private article.
 * @param {string | undefined} value
 * @param {string} key
 * @param {string} filePath
 */
export function parseBooleanFlag(value, key, filePath) {
  if (value === undefined || value === '') {
    return false
  }

  const normalized = value.trim().toLowerCase()

  if (!booleanTrueValues.has(normalized) && !booleanFalseValues.has(normalized)) {
    throw new Error(`${filePath} has invalid ${key} frontmatter: ${value} (use true/false)`)
  }

  return booleanTrueValues.has(normalized)
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

    // 注释行(# pinned: true)整行忽略,不进入 meta,因此也不会被当成未知键。
    if (key.startsWith('#')) {
      return result
    }

    const value = line.slice(separatorIndex + 1).trim()
    result[key] = value

    return result
  }, /** @type {Record<string, string>} */ ({}))

  return { meta, body: match[2].trim() }
}
