// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import router from './router'

type ScrollBehaviorArgs = Parameters<NonNullable<typeof router.options.scrollBehavior>>

beforeEach(() => {
  document.documentElement.style.setProperty('--anchor-offset', '72px')
})

afterEach(() => {
  document.documentElement.style.removeProperty('--anchor-offset')
})

function resolved(path: string) {
  // router.resolve 返回带 href 的 RouteLocationResolved,scrollBehavior
  // 参数类型要求已归一化的位置;这里仅按类型契约收窄,运行时字段一致。
  return router.resolve(path) as unknown as ScrollBehaviorArgs[0]
}

describe('router scroll behavior', () => {
  it('returns to the top for plain navigation', () => {
    const result = router.options.scrollBehavior?.(resolved('/news/hello-world'), resolved('/'), null)

    expect(result).toEqual({ top: 0 })
  })

  it('offsets in-page anchors by the shared --anchor-offset token', () => {
    const result = router.options.scrollBehavior?.(resolved('/news/hello-world#news'), resolved('/'), null)

    expect(result).toEqual({ el: '#news', behavior: 'smooth', top: 72 })
  })

  it('honors a --anchor-offset override and returns to the configured token', () => {
    document.documentElement.style.setProperty('--anchor-offset', '88px')

    const overridden = router.options.scrollBehavior?.(resolved('/news/hello-world#news'), resolved('/'), null)
    expect(overridden).toEqual({ el: '#news', behavior: 'smooth', top: 88 })

    document.documentElement.style.setProperty('--anchor-offset', '72px')

    const configured = router.options.scrollBehavior?.(resolved('/news/hello-world#news'), resolved('/'), null)
    expect(configured).toEqual({ el: '#news', behavior: 'smooth', top: 72 })
  })
})
