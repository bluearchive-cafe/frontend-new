import { describe, expect, it } from 'vitest'

import {
  clientPlatform,
  clientPlatformKeys,
  statusResourceGroupKeys,
  statusResourceGroups,
  statusResourceKeys,
  statusResourcePanels
} from './status-resources'

describe('clientPlatformKeys', () => {
  it('provides presentation metadata even for platforms without a status resource', () => {
    for (const key of clientPlatformKeys) {
      expect(clientPlatform(key).key).toBe(key)
    }
    expect(clientPlatformKeys).toContain('linux')
    expect(statusResourceKeys).not.toContain('linux')
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

describe('statusResourceGroups', () => {
  it('groups every panel under a described group in registry order', () => {
    expect(statusResourceGroups.map((group) => group.key)).toEqual([...statusResourceGroupKeys])

    for (const group of statusResourceGroups) {
      expect(group.title.length, `group title for ${group.key}`).toBeGreaterThan(0)
      expect(group.description.length, `group description for ${group.key}`).toBeGreaterThan(0)
      expect(
        statusResourcePanels.filter((panel) => panel.group === group.key).length,
        `panels in ${group.key}`
      ).toBeGreaterThan(0)
    }

    // 每个面板都必须落在一个已声明的分组里,新增资源漏写 group 时不会静默丢失。
    for (const panel of statusResourcePanels) {
      expect(statusResourceGroupKeys, `group ${panel.group} for ${panel.key}`).toContain(panel.group)
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
