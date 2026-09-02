import { describe, expect, it } from 'vitest'

import {
  clientPlatform,
  clientPlatformKeys,
  statusResourceKeys,
  statusResourcePanels
} from './status-resources'
import { platformLinks } from './downloads'

describe('clientPlatformKeys', () => {
  it('keeps every client platform within the status resource keys', () => {
    for (const key of clientPlatformKeys) {
      expect(statusResourceKeys).toContain(key)
    }
  })
})

describe('statusResourcePanels', () => {
  it('derives one panel per resource key in registry order', () => {
    expect(statusResourcePanels.map((panel) => panel.key)).toEqual([...statusResourceKeys])

    for (const panel of statusResourcePanels) {
      expect(panel.title.length, `panel title for ${panel.key}`).toBeGreaterThan(0)
      expect(panel.description.length, `panel description for ${panel.key}`).toBeGreaterThan(0)
      expect(panel.icon.length, `panel icon for ${panel.key}`).toBeGreaterThan(0)
    }
  })
})

describe('clientPlatform', () => {
  it('provides presentation metadata for every client platform', () => {
    for (const key of clientPlatformKeys) {
      const meta = clientPlatform(key)

      expect(meta.key).toBe(key)
      expect(meta.icon.length).toBeGreaterThan(0)
      expect(meta.colorTokens.border).toMatch(/^--/)
      expect(meta.colorTokens.background).toMatch(/^--/)
      expect(meta.colorTokens.foreground).toMatch(/^--/)
    }
  })
})

describe('platformLinks', () => {
  it('joins every download entry onto a registered client platform', () => {
    for (const link of platformLinks) {
      const meta = clientPlatform(link.statusKey)

      expect(link.icon).toBe(meta.icon)
      expect(link.colorTokens).toEqual(meta.colorTokens)
    }
  })
})
