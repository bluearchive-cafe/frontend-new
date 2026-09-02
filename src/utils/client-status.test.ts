// @vitest-environment jsdom

import { createApp, defineComponent, h, type App, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClientStatus } from './client-status'

const mountedApps: { app: App; container: HTMLElement }[] = []

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
})

describe('useClientStatus', () => {
  it('resolves to ready with mapped resources', async () => {
    const { fetchImplementation, calls } = createControllableFetch()
    const status = mountStatus({ fetchImplementation })
    await flushUpdates()

    calls[0]?.resolve({
      android: {
        official: { version: '1.0', time: '2026-01-01 00:00:00' },
        localized: { version: '1.0', time: '2026-01-01 01:00:00' }
      }
    })
    await flushUpdates()

    expect(status.state.value).toBe('ready')
    expect(status.resources.value?.android.status).toEqual({ label: '已同步', state: 'success' })
    expect(status.resources.value?.ios.status).toEqual({ label: '未获取', state: 'loading' })
  })

  it('marks the state as failed when the request rejects', async () => {
    const { fetchImplementation, calls } = createControllableFetch()
    const status = mountStatus({ fetchImplementation })
    await flushUpdates()

    calls[0]?.reject(new Error('Network failed'))
    await flushUpdates()

    expect(status.state.value).toBe('failed')
    expect(status.resources.value).toBeNull()
  })

  it('retries after a failure through load()', async () => {
    const { fetchImplementation, calls } = createControllableFetch()
    const status = mountStatus({ fetchImplementation })
    await flushUpdates()

    calls[0]?.reject(new Error('Network failed'))
    await flushUpdates()
    expect(status.state.value).toBe('failed')

    void status.load()
    await flushUpdates()
    expect(status.state.value).toBe('loading')

    calls[1]?.resolve({})
    await flushUpdates()
    expect(status.state.value).toBe('ready')
  })

  it('ignores stale resolutions once a newer load started', async () => {
    const { fetchImplementation, calls } = createControllableFetch()
    const status = mountStatus({ fetchImplementation })
    await flushUpdates()

    void status.load()
    await flushUpdates()
    expect(fetchImplementation).toHaveBeenCalledTimes(2)

    calls[0]?.resolve({ ios: {} })
    await flushUpdates()
    expect(status.state.value).toBe('loading')

    calls[1]?.resolve({})
    await flushUpdates()
    expect(status.state.value).toBe('ready')
  })

  it('aborts the active request when the host unmounts', async () => {
    const { fetchImplementation, signals } = createAbortableFetch()
    const { app } = mountStatusApp({ fetchImplementation })
    await flushUpdates()

    app.unmount()
    await flushUpdates()

    expect(signals.at(-1)?.aborted).toBe(true)
  })
})

function mountStatus(options: { fetchImplementation: typeof fetch }) {
  return mountStatusApp(options).status
}

function mountStatusApp(options: { fetchImplementation: typeof fetch }) {
  let status!: ReturnType<typeof useClientStatus>
  const app = createApp(defineComponent({
    setup() {
      status = useClientStatus({ fetchImplementation: options.fetchImplementation })
      return () => h('div')
    }
  }))

  const container = document.createElement('div')
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { app, status }
}

interface ControlledCall {
  signal?: AbortSignal | null
  resolve: (data: Record<string, unknown>) => void
  reject: (reason?: unknown) => void
}

function createControllableFetch() {
  const calls: ControlledCall[] = []

  const fetchImplementation = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
    calls.push({
      signal: init?.signal,
      resolve: (data) => resolve(new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })),
      reject
    })
  }))

  return { calls, fetchImplementation }
}

function createAbortableFetch() {
  const signals: AbortSignal[] = []

  const fetchImplementation = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    signals.push(init?.signal ?? new AbortController().signal)
    init?.signal?.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  }))

  return { signals, fetchImplementation }
}

async function flushUpdates() {
  await nextTick()
  // fetchStatus 内部还有 await response.json() 等多层微任务,逐层排空。
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
  await nextTick()
}
