import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const appHeaderSource = readFileSync(new URL('../src/components/AppHeader.vue', import.meta.url), 'utf-8')
  .replace(/\r\n/g, '\n')
const headingSource = readFileSync(new URL('../src/components/PageHeading.vue', import.meta.url), 'utf-8')
const categorySource = readFileSync(new URL('../src/components/CategoryBadge.vue', import.meta.url), 'utf-8')
const newsSource = readFileSync(new URL('../src/components/NewsSection.vue', import.meta.url), 'utf-8')
const heroSource = readFileSync(new URL('../src/components/HeroSection.vue', import.meta.url), 'utf-8')
const notFoundSource = readFileSync(new URL('../src/components/NotFoundState.vue', import.meta.url), 'utf-8')
const newsPageSource = readFileSync(new URL('../src/pages/NewsPage.vue', import.meta.url), 'utf-8')
const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')
  .replace(/\r\n/g, '\n')
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf-8').replace(/\r\n/g, '\n')

describe('shared MD2 content primitives', () => {
  it('uses fixed Material 2 heading and overline styles', () => {
    expect(headingSource).toContain('font-size: var(--type-overline)')
    expect(headingSource).toContain('font-size: var(--font-size-page-title)')
    expect(globalStyles).toContain('--type-overline: var(--md2-type-overline)')
  })

  it('uses compact Material 2 badges and elevated news cards', () => {
    expect(categorySource).toContain('border-radius: var(--md2-radius-button)')
    expect(newsSource).not.toContain('elevation="0"')
  })

  it('uses a compact desktop button token and restores mobile target size', () => {
    expect(globalStyles).toContain('.v-btn:not(.v-tab):not(.v-app-bar-nav-icon)')
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
  it('keeps the app bar navigation icon circular despite shared button defaults', () => {
    expect(mainSource).toContain("VAppBarNavIcon: {\n      rounded: 'circle'\n    }")
  })

  it('renders drawer destinations without a drawer header', () => {
    expect(appHeaderSource).not.toContain('站点导航')
    expect(appHeaderSource).not.toContain('<v-divider />')
  })

  it('keeps the existing top-level tabs while adding keyboard drawer dismissal', () => {
    expect(appHeaderSource).toContain('<v-tabs')
    expect(appHeaderSource).toContain('height="56"')
    expect(appHeaderSource).toContain('@keydown.esc="closeDrawer"')
    expect(appHeaderSource).toContain('function closeDrawer()')
  })

  it('keeps Material 2 app bar elevation while leaving drawer appearance to Vuetify defaults', () => {
    expect(appHeaderSource).toContain('.app-header.v-app-bar.v-toolbar {')
    expect(appHeaderSource).toContain('box-shadow: var(--md2-elevation-app-bar)')
    expect(appHeaderSource).toContain(
      '-webkit-backdrop-filter: blur(10px);\n  backdrop-filter: blur(10px);'
    )
    expect(appHeaderSource).toContain('temporary')
    expect(appHeaderSource).not.toContain('width="280"')
    expect(appHeaderSource).not.toContain('class="app-drawer"')
    expect(appHeaderSource).not.toContain('class="drawer-title"')
    expect(appHeaderSource).not.toContain('class="drawer-list"')
    expect(appHeaderSource).not.toContain('box-shadow: var(--md2-elevation-drawer)')
    expect(appHeaderSource).not.toContain('rounded="lg"')
  })

  it('uses a leading drawer and closes it from the global Escape key', () => {
    expect(appHeaderSource).toContain('location="left"')
    expect(appHeaderSource).toContain("window.addEventListener('keydown', handleGlobalKeydown)")
    expect(appHeaderSource).toContain("window.removeEventListener('keydown', handleGlobalKeydown)")
    expect(appHeaderSource).toContain("if (event.key === 'Escape' && drawer.value)")
  })

  it('moves focus into the drawer on open and back to the trigger on close', () => {
    expect(appHeaderSource).toContain("watch(drawer, (open) => {")
    expect(appHeaderSource).toContain("getElementById('app-drawer')")
    expect(appHeaderSource).toContain("querySelector<HTMLElement>('.v-list-item--active')?.focus()")
    expect(appHeaderSource).toContain("menuTrigger.value?.$el?.focus()")
    expect(appHeaderSource).toContain('retain-focus')
    expect(appHeaderSource).not.toContain('@after-leave')
  })

  it('keeps focus on the new page after choosing a drawer destination', () => {
    expect(appHeaderSource).toContain('closeDrawerFromDestination')
    expect(appHeaderSource).toContain("closeByRouteChange = to !== route.path")
  })

  it('announces drawer state from the hamburger button', () => {
    expect(appHeaderSource).toContain(':aria-expanded="drawer ? \'true\' : \'false\'"')
    expect(appHeaderSource).toContain('aria-controls="app-drawer"')
    expect(appHeaderSource).toContain('id="app-drawer"')
  })

  it('keeps the mobile drawer trigger on the leading edge', () => {
    expect(appHeaderSource).not.toMatch(/\.mobile-menu\s*\{[\s\S]*?margin-left:\s*auto;/)
    expect(appHeaderSource.indexOf('class="mobile-menu"')).toBeLessThan(
      appHeaderSource.indexOf('<v-toolbar-title class="mobile-brand">')
    )
  })

  it('uses Vuetify app bar components for the mobile navigation layout', () => {
    expect(appHeaderSource).toContain('<v-app-bar-nav-icon')
    expect(appHeaderSource).toContain('<v-toolbar-title class="mobile-brand">')
    expect(appHeaderSource).toContain('aria-label="打开菜单"')
    expect(appHeaderSource).not.toContain('<v-btn\n        class="mobile-menu"')
    expect(appHeaderSource).not.toContain('padding-inline: var(--space-1);')
    expect(appHeaderSource).not.toContain('gap: var(--space-5);')
    expect(appHeaderSource).not.toContain('font-size: 20px;')
    expect(appHeaderSource).not.toContain('font-weight: 500;')
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
    expect(globalStyles).toContain('.v-app-bar {')
    expect(globalStyles).toContain('background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;')
  })

  it('keeps the Vuetify 4 menu shadow on one surface layer', () => {
    expect(globalStyles).toContain('.v-menu > .v-overlay__content {\n  box-shadow: none;\n}')
    expect(globalStyles).toContain('.v-menu > .v-overlay__content > .v-list {')
    expect(globalStyles).toContain('background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;')
    expect(globalStyles).toContain('box-shadow: var(--md2-elevation-menu);')
    expect(globalStyles).not.toContain('.v-menu > .v-overlay__content,\n.v-menu .v-list')
  })

  it('uses the shared dialog elevation rather than a page-specific shadow', () => {
    const downloadSource = readFileSync(new URL('../src/pages/DownloadPage.vue', import.meta.url), 'utf-8')

    expect(downloadSource).not.toContain('box-shadow: 0 24px 72px rgba(0, 0, 0, 0.42)')
    expect(globalStyles).toContain('.v-dialog .v-card')
    expect(globalStyles).toContain('box-shadow: var(--md2-elevation-dialog) !important;')
  })
})
