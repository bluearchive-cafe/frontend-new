// @vitest-environment jsdom

import { createApp, defineComponent, nextTick, type App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import FloatingScrollHint from '../src/components/FloatingScrollHint.vue'

let mountedApp: App<Element> | undefined

afterEach(() => {
  mountedApp?.unmount()
  mountedApp = undefined
  document.body.innerHTML = ''
  setScrollY(0)
  vi.restoreAllMocks()
})

describe('FloatingScrollHint behavior', () => {
  it('is visible at the top and follows the viewport scroll position', async () => {
    setScrollY(0)
    const container = mountHint()

    expect(container.querySelector('.scroll-hint')).not.toBeNull()

    setScrollY(20)
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    await vi.waitFor(() => {
      expect(container.querySelector('.scroll-hint')).toBeNull()
    })

    setScrollY(0)
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(container.querySelector('.scroll-hint')).not.toBeNull()
  })

  it('removes its scroll listener when unmounted', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    mountHint()

    mountedApp?.unmount()
    mountedApp = undefined

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

function mountHint() {
  const container = document.createElement('div')
  document.body.append(container)
  mountedApp = createApp(FloatingScrollHint)
  mountedApp.component('VIcon', defineComponent({ template: '<span aria-hidden="true" />' }))
  mountedApp.mount(container)
  return container
}

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value
  })
}
