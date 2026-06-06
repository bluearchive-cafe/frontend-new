// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from './sanitize-html'

describe('sanitizeHtml', () => {
  it('removes event attributes and attributes outside the allowlist', () => {
    expect(sanitizeHtml('<p onclick="alert(1)" data-id="x" class="markdown-alert unknown">Hello</p>')).toBe(
      '<p class="markdown-alert">Hello</p>'
    )
  })

  it('removes unsafe link urls', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">bad</a>')).toBe('<a>bad</a>')
    expect(sanitizeHtml('<a href="//example.com/path">bad</a>')).toBe('<a>bad</a>')
    expect(sanitizeHtml('<a href=" ">bad</a>')).toBe('<a>bad</a>')
  })

  it('allows href protocols and relative urls that are explicitly supported', () => {
    expect(sanitizeHtml('<a href="https://example.com">https</a>')).toBe('<a href="https://example.com">https</a>')
    expect(sanitizeHtml('<a href="http://example.com">http</a>')).toBe('<a href="http://example.com">http</a>')
    expect(sanitizeHtml('<a href="mailto:test@example.com">mail</a>')).toBe('<a href="mailto:test@example.com">mail</a>')
    expect(sanitizeHtml('<a href="/news">relative</a>')).toBe('<a href="/news">relative</a>')
  })

  it('allows only http and https src urls', () => {
    expect(sanitizeHtml('<img src="https://example.com/a.png" alt="a">')).toBe(
      '<img src="https://example.com/a.png" alt="a">'
    )
    expect(sanitizeHtml('<img src="http://example.com/a.png" alt="a">')).toBe(
      '<img src="http://example.com/a.png" alt="a">'
    )
    expect(sanitizeHtml('<img src="mailto:test@example.com" alt="a">')).toBe('<img alt="a">')
  })

  it('adds noopener noreferrer to blank links', () => {
    expect(sanitizeHtml('<a href="https://example.com" target="_blank">external</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a>'
    )
  })
})
