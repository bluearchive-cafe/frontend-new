import { describe, expect, it } from 'vitest'

import appSource from './App.vue?raw'

describe('App route transition', () => {
  it('does not unmount the current route before an async replacement resolves', () => {
    expect(appSource).not.toContain('mode="out-in"')
  })
})
