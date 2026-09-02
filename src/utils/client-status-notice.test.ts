import { describe, expect, it } from 'vitest'

import { clientStatusNotice } from './client-status-notice'
import type { StatusResourceView } from './status'

function resourceView(state: 'success' | 'error' | 'loading'): StatusResourceView {
  return {
    status: { label: '标签', state },
    official: { version: '1.0', time: '2026-07-29 11:35:05' },
    localized: { version: '1.0', time: '2026-07-29 12:30:57' }
  }
}

describe('clientStatusNotice', () => {
  it('reports a non-blocking status while the request is pending', () => {
    const notice = clientStatusNotice('loading', resourceView('success'))

    expect(notice).toMatchObject({ color: 'info', icon: '$infoOutline', role: 'status' })
    expect(notice?.message).toContain('正在检查客户端状态')
  })

  it('warns without blocking when the request fails', () => {
    const notice = clientStatusNotice('failed')

    expect(notice).toMatchObject({ color: 'warning', icon: '$alertCircleOutline', role: 'alert' })
    expect(notice?.message).toContain('暂时无法确认该客户端状态')
  })

  it.each([
    { resource: undefined, message: '暂时未取得该客户端状态' },
    { resource: resourceView('loading'), message: '暂时未取得该客户端状态' },
    { resource: resourceView('error'), message: '本地化客户端可能尚未同步' }
  ])('warns when ready but not synchronized: $message', ({ resource, message }) => {
    const notice = clientStatusNotice('ready', resource)

    expect(notice).toMatchObject({ color: 'warning', icon: '$alertCircleOutline', role: 'alert' })
    expect(notice?.message).toContain(message)
  })

  it('stays silent when the selected client is synchronized', () => {
    expect(clientStatusNotice('ready', resourceView('success'))).toBeNull()
  })
})
