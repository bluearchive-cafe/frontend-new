import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const sources = [
  '../src/pages/DownloadPage.vue',
  '../src/pages/NewsPage.vue',
  '../src/pages/StatusPage.vue',
  '../src/pages/NewsArticlePage.vue',
  '../src/pages/NotFoundPage.vue',
  '../src/components/AboutSection.vue'
].map((file) => readFileSync(new URL(file, import.meta.url), 'utf-8'))

const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')

describe('route-level MD2 component contract', () => {
  it('does not use tonal variants', () => {
    for (const source of sources) {
      expect(source).not.toContain('variant="tonal"')
    }
  })

  it('does not flatten cards and dialogs with zero elevation', () => {
    for (const source of sources) {
      expect(source).not.toContain('elevation="0"')
    }
  })

  it('restores the shared page background fill for every route surface', () => {
    expect(globalStyles).toContain('--page-background-fill:')

    for (const source of sources) {
      expect(source).toContain('background: var(--page-background-fill)')
    }
  })
})
