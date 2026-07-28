import { createTheme } from 'vuetify/lib/composables/theme.mjs'
import { expect, it } from 'vitest'

import { blueArchiveDarkTheme } from './theme'

it('uses an accessible dark foreground for primary controls', () => {
  const theme = createTheme({
    themes: {
      blueArchiveDark: blueArchiveDarkTheme
    }
  })

  expect(theme.computedThemes.value.blueArchiveDark.colors['on-primary']).toBe('#001e2d')
  expect(theme.computedThemes.value.blueArchiveDark.colors.secondary).toBe('#65d8c4')
  expect(theme.computedThemes.value.blueArchiveDark.colors.secondaryVariant).toBe('#2f9b8a')
  expect(theme.computedThemes.value.blueArchiveDark.colors.accent).toBe('#65d8c4')
})
