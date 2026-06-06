const allowedTags = new Set([
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
])

const globalAttributes = new Set(['aria-hidden', 'class', 'title'])

const allowedAttributesByTag: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target', 'title']),
  img: new Set(['alt', 'decoding', 'height', 'loading', 'src', 'title', 'width']),
  input: new Set(['checked', 'class', 'disabled', 'type']),
  path: new Set(['d']),
  svg: new Set(['aria-hidden', 'class', 'height', 'viewbox', 'width'])
}

const allowedClassNames = new Set([
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
])

export function sanitizeHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html')

  sanitizeChildren(document.body)

  return document.body.innerHTML
}

function sanitizeChildren(parent: Node) {
  Array.from(parent.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child as Element)
      return
    }

    if (child.nodeType !== Node.TEXT_NODE) {
      child.remove()
    }
  })
}

function sanitizeElement(element: Element) {
  const tagName = element.tagName.toLowerCase()

  if (!allowedTags.has(tagName)) {
    element.replaceWith(...Array.from(element.childNodes))
    return
  }

  sanitizeAttributes(element, tagName)
  sanitizeChildren(element)
}

function sanitizeAttributes(element: Element, tagName: string) {
  Array.from(element.attributes).forEach((attribute) => {
    const attributeName = attribute.name
    const normalizedName = attributeName.toLowerCase()
    const allowedAttributes = allowedAttributesByTag[tagName]
    const isAllowed = globalAttributes.has(normalizedName) || allowedAttributes?.has(normalizedName)

    if (!isAllowed || normalizedName.startsWith('on')) {
      element.removeAttribute(attributeName)
      return
    }

    if (normalizedName === 'class') {
      sanitizeClassAttribute(element)
      return
    }

    if ((normalizedName === 'href' || normalizedName === 'src') && !isSafeUrl(attribute.value, normalizedName)) {
      element.removeAttribute(attributeName)
      return
    }

    if (tagName === 'input') {
      sanitizeInputAttribute(element, normalizedName)
    }
  })

  if (tagName === 'a' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer')
  }
}

function sanitizeClassAttribute(element: Element) {
  const classNames = (element.getAttribute('class') ?? '')
    .split(/\s+/)
    .filter((className) => allowedClassNames.has(className))

  if (classNames.length) {
    element.setAttribute('class', classNames.join(' '))
    return
  }

  element.removeAttribute('class')
}

function sanitizeInputAttribute(element: Element, attributeName: string) {
  if (attributeName === 'type' && element.getAttribute('type') !== 'checkbox') {
    element.remove()
    return
  }

  element.setAttribute('disabled', '')
}

function isSafeUrl(value: string, attributeName: 'href' | 'src') {
  const trimmedValue = value.trim()

  if (!hasUrlValue(trimmedValue)) {
    return false
  }

  if (isProtocolRelativeUrl(trimmedValue)) {
    return false
  }

  if (isRelativeUrl(trimmedValue)) {
    return true
  }

  try {
    const url = new URL(trimmedValue, window.location.origin)

    return isAllowedProtocol(url.protocol, attributeName)
  } catch {
    return false
  }
}

function hasUrlValue(value: string) {
  return value.length > 0
}

function isRelativeUrl(value: string) {
  return /^(?:#|\/(?!\/)|\.{0,2}\/)/.test(value)
}

function isProtocolRelativeUrl(value: string) {
  return value.startsWith('//')
}

function isAllowedProtocol(protocol: string, attributeName: 'href' | 'src') {
  const allowedProtocols = attributeName === 'href' ? ['http:', 'https:', 'mailto:'] : ['http:', 'https:']

  return allowedProtocols.includes(protocol)
}
