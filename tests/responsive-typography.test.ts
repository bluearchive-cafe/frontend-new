import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const globalStyles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf-8')
const headingSource = readFileSync(new URL('../src/components/PageHeading.vue', import.meta.url), 'utf-8')
const metaSource = readFileSync(new URL('../src/components/ArticleMeta.vue', import.meta.url), 'utf-8')
const headerSource = readFileSync(new URL('../src/components/AppHeader.vue', import.meta.url), 'utf-8')

describe('responsive typography', () => {
  it('uses a compact desktop scale while retaining the mobile readability floor', () => {
    expect(globalStyles).toContain('--type-body: 17px')
    expect(globalStyles).toContain('--type-meta: 14px')
    expect(globalStyles).toContain('--type-action: 15px')
    expect(globalStyles).toContain('--font-size-display: 48px')
    expect(globalStyles).toContain('@media (max-width: 1023px)')
    expect(globalStyles).toContain('--type-body: 16px')
    expect(globalStyles).toContain('--font-size-display: 40px')
    expect(globalStyles).toContain('@media (max-width: 640px)')
    expect(globalStyles).toContain('--type-body: 16px')
    expect(globalStyles).toContain('--font-size-display: 34px')
  })

  it('uses semantic tokens for page headings and article metadata', () => {
    expect(headingSource).toContain('font-size: var(--font-size-page-title)')
    expect(metaSource).toContain('font-size: var(--type-meta)')
  })

  it('defines a global hierarchy for reading, titles, metadata, and actions', () => {
    expect(globalStyles).toContain('--font-weight-body: 400')
    expect(globalStyles).toContain('--font-weight-heading: 500')
    expect(globalStyles).toContain('--font-weight-meta: 500')
    expect(globalStyles).toContain('--font-weight-action: 600')
    expect(globalStyles).toContain('font-weight: var(--font-weight-body)')
    expect(headerSource).toContain('font-weight: var(--font-weight-action)')
    expect(metaSource).toContain('font-weight: var(--font-weight-meta)')
  })

  it('forces every Vuetify button size to use the same action text token', () => {
    expect(globalStyles).toContain('font-size: var(--type-action) !important')
  })
})
