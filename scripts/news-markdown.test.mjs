import { describe, expect, it, vi } from 'vitest'

import { createMarkdownRenderer, splitAssetReference } from './news-markdown.mjs'

function render(markdownSource, resolveAsset = vi.fn((src) => `/assets/${src}`)) {
  return {
    html: createMarkdownRenderer().render(markdownSource, { resolveAsset }),
    resolveAsset
  }
}

describe('createMarkdownRenderer', () => {
  it.each([
    ['NOTE', 'note', 'Note'],
    ['TIP', 'tip', 'Tip'],
    ['IMPORTANT', 'important', 'Important'],
    ['WARNING', 'warning', 'Warning'],
    ['CAUTION', 'caution', 'Caution']
  ])('renders %s alert blocks with their semantic classes', (marker, className, label) => {
    const { html } = render(`> [!${marker}]\n> alert body`)

    expect(html).toContain(`class="markdown-alert markdown-alert-${className}"`)
    expect(html).toContain(`class="markdown-alert-content"`)
    expect(html).toContain(`>${label}</strong>`)
    expect(html).toContain('alert body')
    expect(html).not.toContain(`[!${marker}]`)
  })

  it('keeps malformed alert markers as ordinary blockquotes', () => {
    const { html } = render('> [!UNKNOWN]\n> body')

    expect(html).toContain('<blockquote>')
    expect(html).toContain('[!UNKNOWN]')
    expect(html).not.toContain('markdown-alert')
  })

  it('renders checked and unchecked task-list items as disabled checkboxes', () => {
    const { html } = render('- [ ] todo\n- [x] done')

    expect(html).toContain('<li class="task-list-item"><input class="task-list-item-checkbox" type="checkbox" disabled>todo</li>')
    expect(html).toContain('<li class="task-list-item"><input class="task-list-item-checkbox" type="checkbox" disabled checked>done</li>')
  })

  it('secures external links while leaving internal links in the same browsing context', () => {
    const { html } = render('[external](https://example.com) [internal](/news)')

    expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a>')
    expect(html).toContain('<a href="/news">internal</a>')
  })

  it('resolves relative images and preserves their query and hash suffix', () => {
    const resolveAsset = vi.fn((src) => `/resolved/${src}`)
    const { html } = render('![image](./image.png?width=2#preview)', resolveAsset)

    expect(resolveAsset).toHaveBeenCalledWith('./image.png?width=2#preview')
    expect(html).toContain('src="/resolved/./image.png?width=2#preview"')
  })
})

describe('splitAssetReference', () => {
  it('separates filesystem paths from query and hash suffixes', () => {
    expect(splitAssetReference('./image.png?width=2#preview')).toEqual({
      pathname: './image.png',
      suffix: '?width=2#preview'
    })
    expect(splitAssetReference('./image.png')).toEqual({
      pathname: './image.png',
      suffix: ''
    })
  })
})
