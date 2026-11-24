import { statusResourceKeys, type StatusResourceKey } from '../content/status-resources'

export const statusRequestTimeoutMs = 10_000
export const statusEndpoint = 'https://api.bluearchive.cafe/status/list'

export type StatusState = 'success' | 'error' | 'loading'

export interface StatusSourceData {
  version?: unknown
  time?: unknown
}

export interface StatusResourceData {
  official?: StatusSourceData
  localized?: StatusSourceData
}

export type StatusData = Partial<Record<StatusResourceKey, StatusResourceData>> & Record<string, unknown>

export interface StatusChipView {
  label: string
  state: StatusState
}

export interface StatusSourceView {
  version: string
  time: string
}

export interface StatusSummary {
  total: number
  synced: number
  outOfSync: number
  pending: number
}

export interface StatusResourceView {
  status: StatusChipView
  official: StatusSourceView
  localized: StatusSourceView
}

export class StatusRequestTimeoutError extends Error {
  constructor() {
    super(`Status request timed out after ${statusRequestTimeoutMs} ms.`)
    this.name = 'StatusRequestTimeoutError'
  }
}

export async function fetchStatus(
  signal?: AbortSignal,
  fetchImplementation: typeof fetch = fetch
): Promise<StatusData> {
  const requestController = new AbortController()
  let didTimeout = false
  const abortRequest = () => requestController.abort(signal?.reason)

  if (signal?.aborted) {
    abortRequest()
  }

  const timeoutId = globalThis.setTimeout(() => {
    didTimeout = true
    requestController.abort()
  }, statusRequestTimeoutMs)

  signal?.addEventListener('abort', abortRequest, { once: true })

  try {
    const response = await fetchImplementation(statusEndpoint, {
      signal: requestController.signal
    })

    if (!response.ok) {
      throw new Error(`Status request failed: ${response.status}`)
    }

    const data: unknown = await response.json()

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('Status response must be an object.')
    }

    return data as StatusData
  } catch (error) {
    if (didTimeout) {
      throw new StatusRequestTimeoutError()
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortRequest)
  }
}

export function createStatusResources(valueLabel: string, status: StatusChipView) {
  return statusResourceKeys.reduce<Record<StatusResourceKey, StatusResourceView>>((resources, key) => {
    resources[key] = {
      status: { ...status },
      official: {
        version: valueLabel,
        time: valueLabel
      },
      localized: {
        version: valueLabel,
        time: valueLabel
      }
    }

    return resources
  }, {} as Record<StatusResourceKey, StatusResourceView>)
}

/**
 * 聚合各资源的同步状态,供状态页总览使用。总数始终等于 statusResourceKeys
 * 的长度,三种状态互斥且相加等于总数。
 */
export function summarizeStatusResources(
  resources: Record<StatusResourceKey, StatusResourceView>
): StatusSummary {
  const summary: StatusSummary = {
    total: 0,
    synced: 0,
    outOfSync: 0,
    pending: 0
  }

  for (const key of statusResourceKeys) {
    summary.total += 1

    const state = resources[key].status.state

    if (state === 'success') {
      summary.synced += 1
    } else if (state === 'error') {
      summary.outOfSync += 1
    } else {
      summary.pending += 1
    }
  }

  return summary
}

export function mapStatusResources(statusData: StatusData) {
  return statusResourceKeys.reduce<Record<StatusResourceKey, StatusResourceView>>((resources, key) => {
    resources[key] = createStatusResource(statusData, key)
    return resources
  }, {} as Record<StatusResourceKey, StatusResourceView>)
}

function createStatusResource(statusData: StatusData, resourceKey: StatusResourceKey): StatusResourceView {
  const resource = statusData[resourceKey]
  const officialVersion = readStatusValue(resource?.official?.version)
  const officialTime = readStatusValue(resource?.official?.time)
  const localizedVersion = readStatusValue(resource?.localized?.version)
  const localizedTime = readStatusValue(resource?.localized?.time)

  return {
    status: createStatusChip(officialVersion, localizedVersion),
    official: {
      version: officialVersion ?? '未获取',
      time: officialTime ?? '未获取'
    },
    localized: {
      version: localizedVersion ?? '未获取',
      time: localizedTime ?? '未获取'
    }
  }
}

function createStatusChip(officialVersion: string | null, localizedVersion: string | null): StatusChipView {
  if (!officialVersion || !localizedVersion) {
    return {
      label: '未获取',
      state: 'loading'
    }
  }

  if (officialVersion === localizedVersion) {
    return {
      label: '已同步',
      state: 'success'
    }
  }

  return {
    label: '未同步',
    state: 'error'
  }
}

function readStatusValue(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return null
  }

  return String(value)
}
