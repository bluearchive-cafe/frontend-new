import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { blueArchiveDarkTheme } from '../src/theme'

const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')

describe('blueArchiveDarkTheme', () => {
  it('exposes the Material 2 palette roles required by the compatibility layer', () => {
    expect(blueArchiveDarkTheme.colors).toMatchObject({
      primary: expect.any(String),
      primaryVariant: expect.any(String),
      secondary: expect.any(String),
      secondaryVariant: expect.any(String),
      background: expect.any(String),
      surface: expect.any(String),
      error: expect.any(String),
      onPrimary: expect.any(String),
      onSecondary: expect.any(String),
      onSurface: expect.any(String),
      onBackground: expect.any(String),
      onError: expect.any(String)
    })
  })

  it('defines Material 2 elevation and fixed typography tokens', () => {
    expect(globalStyles).toContain('--md2-elevation-card:')
    expect(globalStyles).toContain('--md2-elevation-app-bar:')
    expect(globalStyles).toContain('--md2-type-h1: 96px')
    expect(globalStyles).toContain('--md2-radius-button: 4px')
  })
})
