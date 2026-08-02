import { describe, expect, it } from 'vitest'

import appHeaderSource from './AppHeader.vue?raw'

describe('AppHeader navigation', () => {
  it('leaves tab selection uncontrolled so a route click is not reset before navigation', () => {
    expect(appHeaderSource).not.toContain(':model-value="activeNavValue"')
  })

  it('uses a translucent, blurred surface so scrolling content retains visual separation', () => {
    expect(appHeaderSource).toContain('background-color: rgba(var(--v-theme-surface), 0.82) !important;')
    expect(appHeaderSource).toContain('backdrop-filter: blur(10px);')
    expect(appHeaderSource).toContain('-webkit-backdrop-filter: blur(10px);')
  })
})
