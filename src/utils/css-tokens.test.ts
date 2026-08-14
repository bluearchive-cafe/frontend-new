// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'

import { readCssDurationToken, readCssPixelToken } from './css-tokens'

afterEach(() => {
  document.documentElement.style.removeProperty('--test-duration')
  document.documentElement.style.removeProperty('--test-size')
})

describe('readCssDurationToken', () => {
  it('normalizes millisecond and second tokens to milliseconds', () => {
    document.documentElement.style.setProperty('--test-duration', '1250ms')
    expect(readCssDurationToken('--test-duration')).toBe(1250)

    document.documentElement.style.setProperty('--test-duration', '1.5s')
    expect(readCssDurationToken('--test-duration')).toBe(1500)
  })

  it('rejects missing or invalid duration tokens', () => {
    expect(() => readCssDurationToken('--test-duration')).toThrow('(empty)')

    document.documentElement.style.setProperty('--test-duration', '100px')

    expect(() => readCssDurationToken('--test-duration')).toThrow('100px')
  })
})

describe('readCssPixelToken', () => {
  it('reads a pixel-valued custom property', () => {
    document.documentElement.style.setProperty('--test-size', '56px')

    expect(readCssPixelToken('--test-size')).toBe(56)
  })

  it('rejects missing or non-pixel values instead of duplicating a fallback', () => {
    expect(() => readCssPixelToken('--test-size')).toThrow('(empty)')

    document.documentElement.style.setProperty('--test-size', '3rem')

    expect(() => readCssPixelToken('--test-size')).toThrow('3rem')
  })
})
