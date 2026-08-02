import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../src/pages/NewsPage.vue', import.meta.url), 'utf-8').replaceAll('\r\n', '\n')

describe('NewsPage category filter', () => {
  it('hides the filter when no article categories are available', () => {
    expect(source).toContain('v-if="hasCategoryFilter"')
    expect(source).toContain('const hasCategoryFilter = computed(() => newsCategories.length > 0)')
  })

  it('keeps spacing and restores complete outlines for unselected category buttons', () => {
    expect(source).toContain('class="category-filter"')
    expect(source).toContain('.category-filter {\n  gap: var(--control-gap);\n  margin-bottom: var(--control-gap);\n}')
    expect(source).toContain('.category-filter :deep(.v-btn--variant-outlined) {\n  border: thin solid currentColor;\n}')
    expect(source).toContain('.category-filter :deep(.v-btn) {\n  transition-property: box-shadow, transform, opacity;\n}')
  })
})
