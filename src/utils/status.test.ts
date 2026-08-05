// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchStatus,
  mapStatusResources,
  statusEndpoint,
  statusRequestTimeoutMs,
  StatusRequestTimeoutError
} from './status'

const statusData = {
  android: {
    official: { version: '1.0', time: '2026-01-01 00:00:00' },
    localized: { version: '1.0', time: '2026-01-01 01:00:00' }
  },
  ios: {
    official: { version: '2.0', time: '2026-01-01 00:00:00' },
    localized: { version: '1.9', time: '2026-01-01 01:00:00' }
  },
  launcher: {
    official: { version: '3.0', time: '2026-01-01 00:00:00' },
    localized: { version: '3.0', time: '2026-01-01 01:00:00' }
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('mapStatusResources', () => {
  it('maps synchronized, unsynchronized, and missing resources', () => {
    const resources = mapStatusResources(statusData)

    expect(resources.android.status).toEqual({ label: '已同步', state: 'success' })
    expect(resources.ios.status).toEqual({ label: '未同步', state: 'error' })
    expect(resources.windows.status).toEqual({ label: '未获取', state: 'loading' })
    expect(resources.windows.official.version).toBe('未获取')
    expect(Object.keys(resources)).not.toContain('launcher')
  })
})

describe('fetchStatus', () => {
  it('returns an object response from the exact status endpoint', async () => {
    const fetchImplementation = vi.fn(() => Promise.resolve(new Response(JSON.stringify(statusData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })))

    await expect(fetchStatus(undefined, fetchImplementation)).resolves.toEqual(statusData)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() returns unknown by design in Vitest matchers
    expect(fetchImplementation).toHaveBeenCalledWith(statusEndpoint, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('rejects http errors and non-object responses', async () => {
    const failedFetch = vi.fn(() => Promise.resolve(new Response('', { status: 503 })))
    await expect(fetchStatus(undefined, failedFetch)).rejects.toThrow('Status request failed: 503')

    const invalidFetch = vi.fn(() => Promise.resolve(new Response('[]', { status: 200 })))
    await expect(fetchStatus(undefined, invalidFetch)).rejects.toThrow('Status response must be an object')
  })

  it('times out after 10000 ms', async () => {
    vi.useFakeTimers()
    const fetchImplementation = createAbortableFetch()
    const request = fetchStatus(undefined, fetchImplementation)
    const rejection = expect(request).rejects.toBeInstanceOf(StatusRequestTimeoutError)

    await vi.advanceTimersByTimeAsync(statusRequestTimeoutMs)
    await rejection
  })

  it('preserves an external abort as an AbortError', async () => {
    const controller = new AbortController()
    const fetchImplementation = createAbortableFetch()
    const request = fetchStatus(controller.signal, fetchImplementation)

    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('passes an already-aborted external signal to the request', async () => {
    const controller = new AbortController()
    const fetchImplementation = createAbortableFetch()

    controller.abort()

    await expect(fetchStatus(controller.signal, fetchImplementation)).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchImplementation).toHaveBeenCalledOnce()
    expect(fetchImplementation.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
  })
})

function createAbortableFetch() {
  return vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    if (init?.signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    init?.signal?.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  }))
}
