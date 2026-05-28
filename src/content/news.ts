import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

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
  html: true,
  linkify: true,
  typographer: true
})

const defaultLinkOpenRenderer = markdown.renderer.rules.link_open
const alertMeta: Record<string, { label: string; path: string }> = {
  caution: {
    label: 'Caution',
    path: 'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'
  },
  important: {
    label: 'Important',
    path: 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
  },
  note: {
    label: 'Note',
    path: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'
  },
  tip: {
    label: 'Tip',
    path: 'M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z'
  },
  warning: {
    label: 'Warning',
    path: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
  }
}

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const href = token.attrGet('href')

  if (href?.startsWith('http://') || href?.startsWith('https://')) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }

  return defaultLinkOpenRenderer?.(tokens, index, options, env, self) ?? self.renderToken(tokens, index, options)
}

markdown.core.ruler.after('inline', 'bluearchive_task_lists', (state) => {
  state.tokens.forEach((token, index) => {
    if (token.type !== 'inline' || !token.children?.length) {
      return
    }

    const firstChild = token.children[0]
    const match = firstChild.content.match(/^\[([ xX])]\s+/)

    if (!match) {
      return
    }

    const checkbox = new state.Token('html_inline', '', 0)
    checkbox.content = `<input class="task-list-item-checkbox" type="checkbox" disabled${match[1].toLowerCase() === 'x' ? ' checked' : ''}>`
    firstChild.content = firstChild.content.slice(match[0].length)
    token.content = token.content.replace(/^\[[ xX]]\s+/, '')
    token.children.unshift(checkbox)
    markTaskListItem(state.tokens, index)
  })
})

markdown.core.ruler.after('inline', 'bluearchive_alert_blocks', (state) => {
  state.tokens.forEach((token, index) => {
    if (token.type !== 'blockquote_open') {
      return
    }

    const paragraphOpen = state.tokens[index + 1]
    const inline = state.tokens[index + 2]
    const blockquoteClose = findBlockquoteClose(state.tokens, index)
    const match = inline?.type === 'inline' ? inline.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)](?:\n|$)/) : null

    if (!paragraphOpen || !inline || blockquoteClose === -1 || !match) {
      return
    }

    const type = match[1].toLowerCase()
    const meta = alertMeta[type]
    const title = new state.Token('html_inline', '', 0)
    title.content = `<strong class="markdown-alert-title"><svg data-component="Octicon" class="markdown-alert-icon octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="${meta.path}"></path></svg>${meta.label}</strong>`

    token.tag = 'div'
    token.attrSet('class', `markdown-alert markdown-alert-${type}`)
    state.tokens[blockquoteClose].tag = 'div'
    paragraphOpen.attrJoin('class', 'markdown-alert-content')

    inline.content = inline.content.slice(match[0].length)
    inline.children = inline.children ?? []
    removeAlertMarker(inline.children)
    inline.children.unshift(title)
  })
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

function markTaskListItem(tokens: Token[], inlineIndex: number) {
  for (let index = inlineIndex - 1; index >= 0; index -= 1) {
    const token = tokens[index]

    if (token.type === 'list_item_open') {
      token.attrJoin('class', 'task-list-item')
      return
    }
  }
}

function findBlockquoteClose(tokens: Token[], openIndex: number) {
  let depth = 0

  for (let index = openIndex; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token.type === 'blockquote_open') {
      depth += 1
    }

    if (token.type === 'blockquote_close') {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

function removeAlertMarker(children: Token[]) {
  for (const child of children) {
    if (child.type !== 'text' || !child.content.startsWith('[!')) {
      continue
    }

    child.content = child.content.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)](?:\n|$)/, '')
    return
  }
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
