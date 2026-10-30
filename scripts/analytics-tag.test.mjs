import { readFileSync } from 'node:fs'

import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

function loadAnalytics(url) {
  const dom = new JSDOM(source, { url, runScripts: 'outside-only' })
  for (const script of dom.window.document.querySelectorAll('script:not([src])')) {
    if (!script.type || script.type === 'text/javascript') {
      dom.window.eval(script.textContent)
    }
  }
  return dom
}

describe('site analytics tag routing', () => {
  it.each([
    ['https://bluearchive.cafe/', 'G-L9C6BQBHSG'],
    ['https://bluearchive.cafe/download/', 'G-L9C6BQBHSG'],
    ['https://bluearchive-cafe.github.io/frontend-new/', 'GT-MK5ZZ9QP'],
    ['https://bluearchive-cafe.github.io/frontend-new/download/', 'GT-MK5ZZ9QP']
  ])('initializes only the matching stream on %s', (url, tagId) => {
    const dom = loadAnalytics(url)
    try {
      const { window } = dom
      const tags = window.document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
      expect(tags).toHaveLength(1)
      expect(new URL(tags[0].src).searchParams.get('id')).toBe(tagId)
      const commands = window.dataLayer.filter((item) => item[0] === 'config')
      expect(commands.map((item) => Array.from(item))).toEqual([['config', tagId]])
      expect(typeof window.gtag).toBe('function')
    } finally {
      dom.window.close()
    }
  })

  it.each([
    'http://localhost:5173/',
    'http://127.0.0.1:5173/',
    'https://www.bluearchive.cafe/',
    'https://example.com/'
  ])('does not initialize production analytics on %s', (url) => {
    const dom = loadAnalytics(url)
    try {
      expect(dom.window.document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')).toHaveLength(0)
      expect(dom.window.gtag).toBeUndefined()
      expect(dom.window.dataLayer).toBeUndefined()
    } finally {
      dom.window.close()
    }
  })
})
