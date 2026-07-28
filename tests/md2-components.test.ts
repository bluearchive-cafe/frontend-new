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
    expect(globalStyles).toContain('--type-overline: 14px')
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

  it('uses a leading drawer and closes it from the global Escape key', () => {
    expect(appHeaderSource).toContain('location="left"')
    expect(appHeaderSource).toContain("window.addEventListener('keydown', handleGlobalKeydown)")
    expect(appHeaderSource).toContain("window.removeEventListener('keydown', handleGlobalKeydown)")
    expect(appHeaderSource).toContain("if (event.key === 'Escape' && drawer.value)")
  })

  it('keeps the mobile drawer trigger on the leading edge', () => {
    expect(appHeaderSource).not.toMatch(/\.mobile-menu\s*\{[\s\S]*?margin-left:\s*auto;/)
    expect(appHeaderSource.indexOf('class="mobile-menu"')).toBeLessThan(appHeaderSource.indexOf('<RouterLink class="brand"'))
  })

  it('uses the small MD2 app bar measurements on mobile', () => {
    expect(appHeaderSource).toContain('padding-inline: var(--space-1);')
    expect(appHeaderSource).toContain('gap: var(--space-5);')
    expect(appHeaderSource).toContain('font-size: 20px;')
    expect(appHeaderSource).toContain('font-weight: 500;')
    expect(appHeaderSource).toContain('height: 48px !important;')
  })

  it('keeps full Material state feedback for navigation tabs', () => {
    expect(appHeaderSource).not.toContain(':ripple="false"')
    expect(appHeaderSource).not.toContain('.nav-tab :deep(.v-btn__overlay) {\n  opacity: 0;')
  })
})

describe('dark-surface elevation contracts', () => {
  it('keeps shared card elevation overrideable by page-level interaction states', () => {
    expect(globalStyles).toContain('.v-card {')
    expect(globalStyles).not.toContain('box-shadow: var(--md2-elevation-card) !important;')
    expect(globalStyles).not.toContain('border: 0 !important;')
  })

  it('forces the app bar overlay to remain visible over Vuetify surface styles', () => {
    expect(globalStyles).toContain('.v-app-bar,')
    expect(globalStyles).toContain('background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;')
  })

  it('uses the shared dialog elevation rather than a page-specific shadow', () => {
    const downloadSource = readFileSync(new URL('../src/pages/DownloadPage.vue', import.meta.url), 'utf-8')

    expect(downloadSource).not.toContain('box-shadow: 0 24px 72px rgba(0, 0, 0, 0.42)')
    expect(globalStyles).toContain('.v-dialog .v-card')
    expect(globalStyles).toContain('box-shadow: var(--md2-elevation-dialog) !important;')
  })
})
