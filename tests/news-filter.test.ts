import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../src/pages/NewsPage.vue', import.meta.url), 'utf-8')

describe('NewsPage category filter', () => {
  it('hides the filter when no article categories are available', () => {
    expect(source).toContain('v-if="hasCategoryFilter"')
    expect(source).toContain('const hasCategoryFilter = computed(() => newsCategories.length > 0)')
  })
})
