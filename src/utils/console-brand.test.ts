import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatLocalBuildTime, printConsoleBrand } from './console-brand'

const buildTime = '2026-10-15T12:26:00.000Z'

// Node 在 TZ 变化时会重置日期缓存,因此同一进程内可以逐个时区断言。
function inTimeZone(timeZone: string, run: () => void) {
  vi.stubEnv('TZ', timeZone)

  try {
    run()
  } finally {
    vi.unstubAllEnvs()
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('formatLocalBuildTime', () => {
  it('renders the injected instant in the reader time zone with an explicit offset', () => {
    inTimeZone('Asia/Shanghai', () => {
      expect(formatLocalBuildTime(buildTime)).toBe('2026-10-15T20:26:00+08:00')
    })
    inTimeZone('UTC', () => {
      expect(formatLocalBuildTime(buildTime)).toBe('2026-10-15T12:26:00+00:00')
    })
    inTimeZone('America/New_York', () => {
      expect(formatLocalBuildTime(buildTime)).toBe('2026-10-15T08:26:00-04:00')
    })
    inTimeZone('Asia/Kathmandu', () => {
      expect(formatLocalBuildTime(buildTime)).toBe('2026-10-15T18:11:00+05:45')
    })
    inTimeZone('Pacific/Chatham', () => {
      expect(formatLocalBuildTime(buildTime)).toBe('2026-10-16T02:11:00+13:45')
    })
  })

  it('keeps the instant intact across the conversion', () => {
    expect(new Date(formatLocalBuildTime(buildTime)).getTime()).toBe(Date.parse(buildTime))
  })

  it('passes input it cannot parse through unchanged', () => {
    expect(formatLocalBuildTime('not a date')).toBe('not a date')
  })
})

describe('printConsoleBrand', () => {
  it('prints four lines whose format specifiers match their arguments', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    printConsoleBrand()

    const calls = info.mock.calls as [string, ...unknown[]][]
    expect(calls).toHaveLength(4)

    for (const [format, ...args] of calls) {
      expect((format.match(/%[a-z]/g) ?? []).length).toBe(args.length)
    }

    expect(calls[1].join(' ')).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/)
  })
})
