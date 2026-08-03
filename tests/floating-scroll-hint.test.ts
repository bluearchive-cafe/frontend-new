import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const hintSource = readFileSync(new URL('../src/components/FloatingScrollHint.vue', import.meta.url), 'utf-8')
  .replace(/\r\n/g, '\n')
const homePageSource = readFileSync(new URL('../src/pages/HomePage.vue', import.meta.url), 'utf-8')
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf-8')

describe('FloatingScrollHint home scroll hint', () => {
  it('renders the hint only on the home page', () => {
    expect(homePageSource).toContain('<FloatingScrollHint />')
  })

  it('hides once the user scrolls away from the top of the page', () => {
    expect(hintSource).toContain('visible.value = window.scrollY <= 8')
    expect(hintSource).toContain("window.addEventListener('scroll', handleScroll, { passive: true })")
    expect(hintSource).toContain("window.removeEventListener('scroll', handleScroll)")
  })

  it('stays mobile-only and floats above the news section', () => {
    expect(hintSource).toContain('position: fixed')
    expect(hintSource).toContain('@media (min-width: 721px)')
    expect(hintSource).toContain('display: none;')
  })

  it('registers the arrow-down icon alias', () => {
    expect(mainSource).toContain('mdiArrowDown')
    expect(mainSource).toContain('arrowDown: mdiArrowDown')
  })
})
