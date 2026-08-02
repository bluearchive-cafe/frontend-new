import { describe, expect, it } from 'vitest'

import { filterVisiblePlatformLinks, platformLinks, type PlatformLink } from './downloads'

const links: PlatformLink[] = [
  {
    name: 'Visible',
    statusKey: 'android',
    icon: '$download',
    tone: 'test',
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
    tone: 'test',
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
  it('maps every client platform to its status resource', () => {
    expect(platformLinks.map(({ name, statusKey }) => ({ name, statusKey }))).toEqual([
      { name: 'Android 客户端', statusKey: 'android' },
      { name: 'iOS 客户端', statusKey: 'ios' },
      { name: 'Windows 启动器', statusKey: 'windows' },
      { name: 'macOS 客户端', statusKey: 'macos' }
    ])
  })
})
