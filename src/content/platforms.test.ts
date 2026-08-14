import { describe, expect, it } from 'vitest'

import { clientPlatformColorStyle, clientPlatforms } from './platforms'

describe('clientPlatforms', () => {
  it('provides one color-token mapping for every client platform', () => {
    expect(new Set(clientPlatforms.map((platform) => platform.key)).size).toBe(clientPlatforms.length)

    for (const platform of clientPlatforms) {
      expect(clientPlatformColorStyle(platform.colorTokens)).toEqual({
        borderColor: `var(${platform.colorTokens.border})`,
        background: `var(${platform.colorTokens.background})`,
        color: `var(${platform.colorTokens.foreground})`
      })
    }
  })
})
