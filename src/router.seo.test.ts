// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const { applyRouteSeoMock, trackNotFoundMock } = vi.hoisted(() => ({
  applyRouteSeoMock: vi.fn(),
  trackNotFoundMock: vi.fn()
}))

vi.mock('./utils/seo', () => ({
  applyRouteSeo: applyRouteSeoMock
}))

vi.mock('./utils/analytics', () => ({
  trackNotFound: trackNotFoundMock
}))

window.scrollTo = vi.fn()

import router from './router'

afterEach(async () => {
  // 先回到首页:该导航本身也会触发 afterEach 钩子,随后统一清空计数。
  await router.push('/')
  applyRouteSeoMock.mockReset()
  trackNotFoundMock.mockReset()
})

describe('router afterEach wiring', () => {
  it('applies route SEO after every successful navigation', async () => {
    await router.push('/download')

    expect(applyRouteSeoMock).toHaveBeenCalledOnce()
    const routed = applyRouteSeoMock.mock.calls[0][0] as { path: string }
    expect(routed.path).toBe('/download')
  })

  it('tracks not-found navigations after applying SEO', async () => {
    await router.push('/missing-download')

    expect(applyRouteSeoMock).toHaveBeenCalledOnce()
    expect(trackNotFoundMock).toHaveBeenCalledOnce()
    expect(trackNotFoundMock).toHaveBeenCalledWith('/missing-download')
  })

  it('does not track known routes', async () => {
    await router.push('/status')

    expect(applyRouteSeoMock).toHaveBeenCalledOnce()
    expect(trackNotFoundMock).not.toHaveBeenCalled()
  })
})
