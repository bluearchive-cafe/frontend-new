// @vitest-environment jsdom

import { createApp, defineComponent, h, nextTick, type App as VueApp } from 'vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./components/AppHeader.vue', () => ({ default: defineComponent({ render: () => null }) }))
vi.mock('./components/SiteFooter.vue', () => ({ default: defineComponent({ render: () => null }) }))

import App from './App.vue'

let app: VueApp | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
})

describe('App route transition', () => {
  it('preserves the page instance when only its anchor or query changes', async () => {
    const mountPage = vi.fn()
    const home = defineComponent({
      setup() {
        mountPage()
        return () => h('section', { 'data-page': 'home' })
      }
    })
    const router = await mountApp([{ path: '/', component: home }])
    const originalPage = document.querySelector('[data-page="home"]')

    await router.push('/#news')
    await router.push('/?source=nav#news')
    await nextTick()

    expect(mountPage).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-page="home"]')).toBe(originalPage)
    expect(document.querySelectorAll('[data-page="home"]')).toHaveLength(1)
    expect(originalPage?.hasAttribute('inert')).toBe(false)
  })

  it('creates a new page instance for a different article path', async () => {
    const mountArticle = vi.fn()
    const article = defineComponent({
      setup() {
        mountArticle()
        return () => h('section', { 'data-page': 'article' })
      }
    })
    const router = await mountApp([{ path: '/news/:slug', component: article }], '/news/first')
    const originalPage = document.querySelector('[data-page="article"]')

    await router.push('/news/second')
    await nextTick()

    expect(mountArticle).toHaveBeenCalledTimes(2)
    expect(originalPage?.hasAttribute('inert')).toBe(true)
    await vi.waitFor(() => expect(document.querySelectorAll('[data-page="article"]')).toHaveLength(1))
    expect(document.querySelector('[data-page="article"]')).not.toBe(originalPage)
  })

  it('keeps the current page usable until the async replacement resolves, then disables its exit', async () => {
    const home = defineComponent({ render: () => h('section', { 'data-page': 'home' }) })
    const destination = defineComponent({ render: () => h('section', { 'data-page': 'destination' }) })
    let resolvePage!: (page: typeof destination) => void
    const loadPage = vi.fn(() => new Promise<typeof destination>((resolve) => { resolvePage = resolve }))
    const router = await mountApp([
      { path: '/', component: home },
      { path: '/destination', component: loadPage }
    ])
    const originalPage = document.querySelector('[data-page="home"]')

    const navigation = router.push('/destination')
    await vi.waitFor(() => expect(loadPage).toHaveBeenCalledOnce())
    expect(document.querySelector('[data-page="home"]')).toBe(originalPage)
    expect(originalPage?.hasAttribute('inert')).toBe(false)

    resolvePage(destination)
    await navigation
    await nextTick()

    expect(document.querySelector('[data-page="destination"]')).not.toBeNull()
    expect(originalPage?.hasAttribute('inert')).toBe(true)
    await vi.waitFor(() => expect(document.querySelector('[data-page="home"]')).toBeNull())
    expect(document.querySelector('[data-page="destination"]')?.hasAttribute('inert')).toBe(false)
  })
})

async function mountApp(routes: RouteRecordRaw[], path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const container = document.createElement('div')
  document.body.append(container)
  app = createApp(App)
  for (const [name, tag] of [['VApp', 'div'], ['VMain', 'main']] as const) {
    app.component(name, defineComponent({ setup: (_, { slots }) => () => h(tag, slots.default?.()) }))
  }
  app.use(router).mount(container)
  return router
}
