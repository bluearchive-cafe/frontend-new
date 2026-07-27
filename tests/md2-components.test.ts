import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const appHeaderSource = readFileSync(new URL('../src/components/AppHeader.vue', import.meta.url), 'utf-8')
const headingSource = readFileSync(new URL('../src/components/PageHeading.vue', import.meta.url), 'utf-8')
const categorySource = readFileSync(new URL('../src/components/CategoryBadge.vue', import.meta.url), 'utf-8')
const newsSource = readFileSync(new URL('../src/components/NewsSection.vue', import.meta.url), 'utf-8')
const heroSource = readFileSync(new URL('../src/components/HeroSection.vue', import.meta.url), 'utf-8')
const notFoundSource = readFileSync(new URL('../src/components/NotFoundState.vue', import.meta.url), 'utf-8')
const newsPageSource = readFileSync(new URL('../src/pages/NewsPage.vue', import.meta.url), 'utf-8')
const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')

describe('shared MD2 content primitives', () => {
  it('uses fixed Material 2 heading and overline styles', () => {
    expect(headingSource).toContain('font-size: var(--type-overline)')
    expect(headingSource).toContain('font-size: var(--font-size-page-title)')
  })

  it('uses compact Material 2 badges and elevated news cards', () => {
    expect(categorySource).toContain('border-radius: var(--md2-radius-button)')
    expect(newsSource).not.toContain('elevation="0"')
  })

  it('uses a compact desktop button token and restores mobile target size', () => {
    expect(globalStyles).toContain('.v-btn:not(.v-tab)')
    expect(globalStyles).toContain('--button-height: 42px')
    expect(globalStyles).toContain('@media (max-width: 640px)')
    expect(globalStyles).toContain('--button-height: 48px')
    expect(globalStyles).toContain('--button-padding-inline: 16px')
    expect(globalStyles).toContain('height: var(--button-height) !important')
    expect(globalStyles).toContain('padding-inline: var(--button-padding-inline) !important')
    expect(heroSource).not.toContain('height="42"')
    expect(heroSource).not.toContain('size="large"')
    expect(heroSource).not.toContain('min-height: 42px')
    expect(notFoundSource).not.toContain('size="large"')
    expect(newsPageSource).not.toContain('height="42"')
  })
})

describe('AppHeader MD2 compatibility contract', () => {
  it('keeps the existing top-level tabs while adding keyboard drawer dismissal', () => {
    expect(appHeaderSource).toContain('<v-tabs')
    expect(appHeaderSource).toContain('height="56"')
    expect(appHeaderSource).toContain('@keydown.esc="closeDrawer"')
    expect(appHeaderSource).toContain('function closeDrawer()')
  })

  it('uses Material 2 app bar and drawer elevation with 48px list targets', () => {
    expect(appHeaderSource).toContain('box-shadow: var(--md2-elevation-app-bar)')
    expect(appHeaderSource).toContain('box-shadow: var(--md2-elevation-drawer)')
    expect(appHeaderSource).toContain('min-height: 48px')
  })
})
