import { createTheme } from 'vuetify/lib/composables/theme.mjs'
import { describe, expect, it } from 'vitest'

import { blueArchiveDarkTheme, blueArchiveLightTheme } from './theme'

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

describe.each([
  ['dark', blueArchiveDarkTheme],
  ['light', blueArchiveLightTheme]
] as const)('%s theme contrast', (_name, theme) => {
  it('keeps primary actions and body text readable', () => {
    const colors = theme.colors

    expect(contrast(colors['on-primary'], colors.primary)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors['on-secondary'], colors.secondary)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors['on-surface'], colors.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors['on-background'], colors.background)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps status text readable on its tinted surface', () => {
    for (const role of ['info', 'success', 'error', 'warning'] as const) {
      const foreground = rgb(theme.colors[role])
      const background = rgb(theme.colors.surface)
        .map((channel, index) => channel * 0.88 + foreground[index] * 0.12)

      expect(contrastRatio(foreground, background), role).toBeGreaterThanOrEqual(4.5)
    }
  })
})

function rgb(hex: string) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
}

function luminance(channels: number[]) {
  return channels
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
}

function contrastRatio(foreground: number[], background: number[]) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

function contrast(foreground: string, background: string) {
  return contrastRatio(rgb(foreground), rgb(background))
}
