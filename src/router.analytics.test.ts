// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const { trackNotFoundMock } = vi.hoisted(() => ({
  trackNotFoundMock: vi.fn()
}))

vi.mock('./utils/analytics', () => ({
  trackNotFound: trackNotFoundMock
}))

window.scrollTo = vi.fn()

import router from './router'

afterEach(async () => {
  trackNotFoundMock.mockReset()
  await router.push('/')
})

describe('router analytics wiring', () => {
  it('tracks a navigation to an unknown path', async () => {
    await router.push('/missing-download')

    expect(trackNotFoundMock).toHaveBeenCalledOnce()
    expect(trackNotFoundMock).toHaveBeenCalledWith('/missing-download')
  })

  it('does not track a navigation to a known path', async () => {
    await router.push('/download')

    expect(trackNotFoundMock).not.toHaveBeenCalled()
  })
})
