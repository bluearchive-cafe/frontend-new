import { describe, expect, it } from 'vitest'

import { filterVisiblePlatformLinks, platformLinks, type PlatformLink } from './downloads'
import { clientPlatform, clientPlatformKeys } from './status-resources'
import { staticRoutes } from '../shared/site-routes.mjs'

const testColorTokens = {
  border: '--color-primary-border',
  background: '--color-primary-soft',
  foreground: '--color-primary'
}

const links: PlatformLink[] = [
  {
    key: 'android',
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
    key: 'ios',
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
  it('covers every registered client platform in registry order', () => {
    expect(platformLinks.map((link) => link.key)).toEqual([...clientPlatformKeys])
  })

  it('joins every download entry onto a registered client platform', () => {
    for (const link of platformLinks) {
      const meta = clientPlatform(link.key)

      expect(link.icon).toBe(meta.icon)
      expect(link.colorTokens).toEqual(meta.colorTokens)
    }
  })

  it('lists exactly the visible platforms in the download route description', () => {
    // 下载页 description 是手抄在 site-routes.mjs 里的平台清单，与 platformLinks
    // 没有任何代码关联：加一个平台忘了改不会报错，SEO 文案就少说一个端。
    // 锚点是这句文案的形状，改写文案时同步这里的正则。
    const description = staticRoutes.find((route) => route.name === 'download')?.description ?? ''
    const platformRun = /BlueArchive\.Cafe\s+(.+?)\s+客户端/.exec(description)?.[1] ?? ''

    expect(platformRun).not.toBe('')

    expect(new Set(platformRun.split(/[、,，与和\s]+/).filter(Boolean))).toEqual(
      new Set(
        platformLinks
          .filter((link) => !link.hidden)
          .map((link) => link.name.replace(/ 平台$/, ''))
      )
    )
  })
})
