import { describe, expect, it } from 'vitest'

import { filterVisiblePlatformLinks, platformLinks, type PlatformLink } from './downloads'

const testColorTokens = {
  border: '--color-primary-border',
  background: '--color-primary-soft',
  foreground: '--color-primary'
}

const links: PlatformLink[] = [
  {
    name: 'Visible',
    statusKey: 'android',
    icon: '$download',
    colorTokens: testColorTokens,
    docUrl: '/docs',
    docExternal: false,
    description: 'Visible platform',
    variants: [
      { name: 'Visible variant', description: 'Visible', downloadUrl: '/visible' },
      { name: 'Hidden variant', description: 'Hidden', downloadUrl: '/hidden', hidden: true }
    ]
  },
  {
    name: 'Hidden',
    statusKey: 'ios',
    icon: '$download',
    colorTokens: testColorTokens,
    docUrl: '/docs',
    docExternal: false,
    description: 'Hidden platform',
    hidden: true,
    variants: [
      { name: 'Hidden variant', description: 'Hidden', downloadUrl: '/hidden' }
    ]
  }
]

describe('filterVisiblePlatformLinks', () => {
  it('removes hidden platforms and variants by default without mutating the source', () => {
    const result = filterVisiblePlatformLinks(links, false)

    expect(result).toHaveLength(1)
    expect(result[0].variants.map((variant) => variant.name)).toEqual(['Visible variant'])
    expect(links[0].variants).toHaveLength(2)
  })

  it('includes hidden platforms and variants when enabled', () => {
    const result = filterVisiblePlatformLinks(links, true)

    expect(result).toHaveLength(2)
    expect(result[0].variants).toHaveLength(2)
  })
})

describe('platformLinks', () => {
  it('exposes one entry per client platform', () => {
    expect(platformLinks.map((link) => link.statusKey)).toEqual([
      'android',
      'ios',
      'windows',
      'macos'
    ])
  })
})
