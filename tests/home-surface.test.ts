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

  it('keeps the hero anchored to the base dark surface while news uses the module fill', () => {
    expect(homePageSource).toContain('--home-module-fill:')
    expect(heroSource).toContain('--hero-background: #191d24')
    expect(heroSource).toContain('--hero-background-deep: #15181f')
    expect(heroSource).toContain('var(--hero-background);')
    expect(heroSource).toContain('var(--hero-background-deep) 100%')
    expect(heroSource).toContain('border-bottom: 1px solid rgba(255, 255, 255, 0.12)')
    expect(heroSource).not.toContain('box-shadow: 0 12px 17px rgba(0, 0, 0, 0.36)')
    expect(heroSource).not.toContain('var(--home-module-fill')
    expect(newsSource).toContain('var(--home-module-fill')
  })
})
