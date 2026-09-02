import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

import type { StatusResourceKey } from '../content/status-resources'
import { fetchStatus, mapStatusResources, type StatusResourceView } from './status'

export type ClientStatusState = 'loading' | 'ready' | 'failed'

export interface ClientStatus {
  state: Ref<ClientStatusState>
  resources: Ref<Record<StatusResourceKey, StatusResourceView> | null>
  load: () => Promise<void>
  stop: () => void
}

/**
 * 客户端状态请求生命周期:loading / ready / failed 状态、请求中止、
 * 过期请求防护与卸载清理。下载页与状态页共用,abort 语义只在这里定义一次。
 * fetchStatus 保持依赖注入 seam,测试直接注入 fetch 实现。
 */
export function useClientStatus({ fetchImplementation }: { fetchImplementation?: typeof fetch } = {}): ClientStatus {
  const state = ref<ClientStatusState>('loading')
  const resources = ref<Record<StatusResourceKey, StatusResourceView> | null>(null)
  let activeController: AbortController | null = null

  async function load() {
    activeController?.abort()
    const requestController = new AbortController()
    activeController = requestController
    state.value = 'loading'

    try {
      const statusData = await fetchStatus(requestController.signal, fetchImplementation)

      if (activeController === requestController) {
        resources.value = mapStatusResources(statusData)
        state.value = 'ready'
      }
    } catch (error) {
      if (activeController === requestController && !isAbortError(error)) {
        state.value = 'failed'
      }
    } finally {
      if (activeController === requestController) {
        activeController = null
      }
    }
  }

  function stop() {
    activeController?.abort()
    activeController = null
  }

  onMounted(() => {
    void load()
  })

  onBeforeUnmount(() => {
    stop()
  })

  return { state, resources, load, stop }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}
