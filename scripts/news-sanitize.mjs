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
  'task-list-item',
  'task-list-item-checkbox'
]

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

function removeBlankUrlAttribute(attribs, attributeName) {
  if (!attribs[attributeName]?.trim()) {
    const sanitizedAttributes = { ...attribs }
    delete sanitizedAttributes[attributeName]
    return sanitizedAttributes
  }

  return attribs
}
