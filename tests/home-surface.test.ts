import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const homePageSource = readFileSync(new URL('../src/pages/HomePage.vue', import.meta.url), 'utf-8')
const heroSource = readFileSync(new URL('../src/components/HeroSection.vue', import.meta.url), 'utf-8')
const newsSource = readFileSync(new URL('../src/components/NewsSection.vue', import.meta.url), 'utf-8')
const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')

describe('home surface hierarchy', () => {
  it('uses the global button height without a homepage exception', () => {
    expect(globalStyles).toContain('--button-height: 48px')
    expect(globalStyles).toContain('height: var(--button-height) !important')
    expect(heroSource).not.toContain('height="42"')
  })

  it('uses a shared fill color across the home page modules', () => {
    expect(homePageSource).toContain('--home-module-fill:')
    expect(heroSource).toContain('var(--home-module-fill')
    expect(newsSource).toContain('var(--home-module-fill')
  })
})
