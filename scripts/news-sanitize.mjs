// 新闻 HTML 清理管线:构建期唯一出口,白名单在此维护。
import sanitizeHtmlPackage from 'sanitize-html'

export const allowedTags = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'input',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'path',
  'pre',
  's',
  'span',
  'strong',
  'svg',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul'
]

export const allowedClassNames = [
  'markdown-alert',
  'markdown-alert-caution',
  'markdown-alert-content',
  'markdown-alert-icon',
  'markdown-alert-important',
  'markdown-alert-note',
  'markdown-alert-title',
  'markdown-alert-tip',
  'markdown-alert-warning',
  'octicon',
  // 下面三个由 markdown-it 的任务列表渲染自己注入,不是作者手写语法;
  // 少一个就会让每个带勾选框的文章都触发"写法被丢弃"告警。
  'contains-task-list',
  'task-list-item',
  'task-list-item-checkbox'
]

/** @param {string} html */
export function sanitizeRenderedHtml(html) {
  return sanitizeHtmlPackage(html, {
    allowedTags,
    allowedAttributes: {
      '*': ['aria-hidden', 'class', 'title'],
      a: ['href', 'rel', 'target', 'title'],
      img: ['alt', 'decoding', 'height', 'loading', 'src', 'title', 'width'],
      input: ['checked', 'class', 'disabled', 'type'],
      path: ['d'],
      svg: ['aria-hidden', 'class', 'height', 'viewbox', 'width']
    },
    allowedClasses: {
      '*': allowedClassNames
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https']
    },
    allowProtocolRelative: false,
    exclusiveFilter(frame) {
      return frame.tag === 'input' && frame.attribs.type !== 'checkbox'
    },
    transformTags: {
      a(tagName, attribs) {
        const sanitizedAttributes = removeBlankUrlAttribute(attribs, 'href')

        if (sanitizedAttributes.target === '_blank') {
          return {
            tagName,
            attribs: {
              ...sanitizedAttributes,
              rel: 'noopener noreferrer'
            }
          }
        }

        return { tagName, attribs: sanitizedAttributes }
      },
      img(tagName, attribs) {
        return {
          tagName,
          attribs: removeBlankUrlAttribute(attribs, 'src')
        }
      },
      input(tagName, attribs) {
        return {
          tagName,
          attribs: {
            ...attribs,
            disabled: ''
          }
        }
      }
    }
  })
}

/**
 * @param {import('sanitize-html').Attributes} attribs
 * @param {string} attributeName
 */
function removeBlankUrlAttribute(attribs, attributeName) {
  if (!attribs[attributeName]?.trim()) {
    const sanitizedAttributes = { ...attribs }
    delete sanitizedAttributes[attributeName]
    return sanitizedAttributes
  }

  return attribs
}

/**
 * 扫描开标签,统计标签名、标签上的属性名与 class 词元的出现次数。
 * 只服务构建期告警,不追求 HTML 解析完备:输入是 markdown-it 的渲染产物,
 * 代码块内的 `<` 已被转义,因此按开标签扫描不会误伤正文。
 * @param {string} html
 */
function collectStructure(html) {
  /** @type {Map<string, number>} */
  const tags = new Map()
  /** @type {Map<string, number>} */
  const attributes = new Map()
  /** @type {Map<string, number>} */
  const classes = new Map()

  for (const [, rawTagName, rawAttributes] of html.matchAll(/<([a-zA-Z][\w:-]*)\b([^>]*)>/g)) {
    const tagName = rawTagName.toLowerCase()
    tags.set(tagName, (tags.get(tagName) ?? 0) + 1)

    for (const [, rawName, doubleQuoted, singleQuoted, bare] of rawAttributes.matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      // 属性名统一小写:sanitize-html 会把 viewBox 规范成 viewbox,不该当成丢弃。
      const attributeName = rawName.toLowerCase()
      if (!attributeName) continue
      const attributeKey = `${tagName}|${attributeName}`
      attributes.set(attributeKey, (attributes.get(attributeKey) ?? 0) + 1)

      if (attributeName === 'class') {
        const value = doubleQuoted ?? singleQuoted ?? bare ?? ''
        for (const className of value.split(/\s+/).filter(Boolean)) {
          classes.set(className, (classes.get(className) ?? 0) + 1)
        }
      }
    }
  }

  return { tags, attributes, classes }
}

/**
 * 对比清洗前后的结构,列出被白名单丢掉的写法。
 * 清洗的丢弃行为本身是对的(安全侧),这里只负责让"作者写了却不生效"可见。
 * @param {string} renderedHtml
 * @param {string} sanitizedHtml
 * @returns {string[]} 人类可读的丢弃清单;为空表示没有写法被吃掉。
 */
export function describeDroppedStructures(renderedHtml, sanitizedHtml) {
  const before = collectStructure(renderedHtml)
  const after = collectStructure(sanitizedHtml)
  /** @type {string[]} */
  const dropped = []

  for (const [tagName, count] of before.tags) {
    const lost = count - (after.tags.get(tagName) ?? 0)
    if (lost > 0) dropped.push(`<${tagName}> 标签 ×${lost}`)
  }

  for (const [attributeKey, count] of before.attributes) {
    const lost = count - (after.attributes.get(attributeKey) ?? 0)
    if (lost > 0) {
      const [tagName, attributeName] = attributeKey.split('|')
      dropped.push(`${tagName} 的 ${attributeName} 属性 ×${lost}`)
    }
  }

  for (const [className, count] of before.classes) {
    const lost = count - (after.classes.get(className) ?? 0)
    if (lost > 0) dropped.push(`"${className}" 类名 ×${lost}`)
  }

  return dropped
}
