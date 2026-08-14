import { describe, expect, it } from 'vitest'

import appHeaderSource from './AppHeader.vue?raw'
import siteFooterSource from './SiteFooter.vue?raw'

describe('AppHeader navigation', () => {
  it('leaves tab selection uncontrolled so a route click is not reset before navigation', () => {
    expect(appHeaderSource).not.toContain(':model-value="activeNavValue"')
  })

  it('derives header and footer navigation directly from the shared route order', () => {
    expect(appHeaderSource).toContain('const navItems = staticRoutes.map')
    expect(appHeaderSource).not.toContain('headerNavOrder')
    expect(siteFooterSource).toContain('const footerNavLinks = staticRoutes')
    expect(siteFooterSource).not.toContain('footerNavOrder')
  })

  it('reads the app bar height from the shared CSS token', () => {
    expect(appHeaderSource).toContain("readCssPixelToken('--app-bar-height')")
    expect(appHeaderSource).not.toContain('height="56"')
  })

  it('uses a translucent, blurred surface so scrolling content retains visual separation', () => {
    expect(appHeaderSource).toContain('background-color: rgba(var(--v-theme-surface), 0.82) !important;')
    expect(appHeaderSource).toContain('backdrop-filter: blur(10px);')
    expect(appHeaderSource).toContain('-webkit-backdrop-filter: blur(10px);')
  })
})
