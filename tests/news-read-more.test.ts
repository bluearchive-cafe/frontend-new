import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const newsSectionPath = new URL('../src/components/NewsSection.vue', import.meta.url)
const newsPagePath = new URL('../src/pages/NewsPage.vue', import.meta.url)

describe('news read-more affordances', () => {
  it('renders a right arrow after the home and news page labels without pill styling', () => {
    const newsSection = readFileSync(newsSectionPath, 'utf8')
    const newsPage = readFileSync(newsPagePath, 'utf8')

    expect(newsSection).toMatch(/<span class="read-more">\s*查看详情\s*<v-icon icon="\$arrowRight" size="16" aria-hidden="true" \/>\s*<\/span>/)
    expect(newsPage).toMatch(/<span class="read-more">\s*阅读全文\s*<v-icon icon="\$arrowRight" size="16" aria-hidden="true" \/>\s*<\/span>/)
    expect(newsSection).not.toMatch(/\.read-more \{[\s\S]*border-radius/)
    expect(newsPage).not.toMatch(/\.read-more \{[\s\S]*border-radius/)
  })

  it('clamps home news titles and summaries to preserve card hierarchy', () => {
    const newsSection = readFileSync(newsSectionPath, 'utf8')

    expect(newsSection).toMatch(/\.news-card h3 \{[\s\S]*-webkit-line-clamp: 1/)
    expect(newsSection).toMatch(/\.news-card p \{[\s\S]*-webkit-line-clamp: 2/)
  })

  it('stretches card content so every footer aligns to the card bottom', () => {
    const newsSection = readFileSync(newsSectionPath, 'utf8')

    expect(newsSection).toMatch(/\.news-card \{[^}]*display: flex/)
    expect(newsSection).toMatch(/\.news-card :deep\(\.v-card-text\) \{[^}]*flex: 1/)
  })
})
