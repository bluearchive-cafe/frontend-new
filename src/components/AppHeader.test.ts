import { describe, expect, it } from 'vitest'

import appHeaderSource from './AppHeader.vue?raw'

describe('AppHeader navigation', () => {
  it('leaves tab selection uncontrolled so a route click is not reset before navigation', () => {
    expect(appHeaderSource).not.toContain(':model-value="activeNavValue"')
  })
})
