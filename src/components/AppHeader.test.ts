// @vitest-environment jsdom

import { createApp, defineComponent, nextTick, type App, type Component } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { VTab, VTabs } from 'vuetify/components/VTabs'

const routeState = vi.hoisted(() => ({ path: '/' }))

vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  },
  useRoute: () => routeState
}))

import AppHeader from './AppHeader.vue'

let mountedApp: App<Element> | undefined

beforeEach(() => {
  routeState.path = '/'
  document.documentElement.style.setProperty('--app-bar-height', '56px')
})

afterEach(() => {
  mountedApp?.unmount()
  mountedApp = undefined
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('--app-bar-height')
  vi.unstubAllGlobals()
})

describe('AppHeader navigation behavior', () => {
  it.each([
    ['/', '首页'],
    ['/news', '新闻'],
    ['/news/2026-07-30/1', '新闻'],
    ['/download', '下载'],
    ['/status', '状态'],
    ['/about', '关于'],
    ['/newsletter', undefined]
  ])('selects the correct Vuetify desktop tab for %s', async (path, expectedLabel) => {
    routeState.path = path
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    })
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })))

    const container = mountHeader(true)
    await nextTick()
    await nextTick()

    const selectedTabs = container.querySelectorAll<HTMLElement>('[role="tab"][aria-selected="true"]')
    expect(selectedTabs).toHaveLength(expectedLabel ? 1 : 0)
    expect(selectedTabs[0]?.textContent?.trim()).toBe(expectedLabel)

    if (expectedLabel) {
      selectedTabs[0]?.click()
      await nextTick()
      expect(selectedTabs[0]?.getAttribute('aria-selected')).toBe('true')
    }
  })

  it('renders navigation from the shared route manifest', () => {
    const container = mountHeader()
    const destinations = Array.from(container.querySelectorAll('[data-destination]'))
      .map((element) => element.textContent)

    expect(destinations).toEqual(['首页', '新闻', '下载', '状态', '关于'])
  })

  it('moves focus into the drawer and restores it after Escape', async () => {
    const container = mountHeader()
    const trigger = container.querySelector<HTMLButtonElement>('[aria-label="打开菜单"]')!

    trigger.click()
    await nextTick()
    await nextTick()

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement?.textContent).toBe('首页')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('does not return focus to the menu trigger when navigation changes route', async () => {
    const container = mountHeader()
    const trigger = container.querySelector<HTMLButtonElement>('[aria-label="打开菜单"]')!

    trigger.click()
    await nextTick()
    await nextTick()

    container.querySelector<HTMLAnchorElement>('#app-drawer [data-destination="/news"]')!.click()
    await nextTick()
    await nextTick()

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('removes its global keyboard listener when unmounted', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    mountHeader()

    mountedApp?.unmount()
    mountedApp = undefined

    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeEventListener.mockRestore()
  })
})

function mountHeader(realTabs = false) {
  const container = document.createElement('div')
  document.body.append(container)
  mountedApp = createApp(AppHeader)

  const headerComponents = {
    VAppBar: passthroughComponent('header'),
    VToolbarTitle: passthroughComponent('div'),
    VContainer: passthroughComponent('div'),
    VTabs: realTabs ? VTabs : passthroughComponent('nav'),
    VTab: realTabs ? VTab : destinationComponent,
    VProgressLinear: emptyComponent,
    VAppBarNavIcon: menuButtonComponent,
    VNavigationDrawer: drawerComponent,
    VList: passthroughComponent('div'),
    VListItem: destinationComponent
  }
  if (realTabs) {
    mountedApp.use(createVuetify({ components: headerComponents }))
  } else {
    for (const [name, component] of Object.entries(headerComponents)) {
      mountedApp.component(name, component)
    }
  }
  mountedApp.mount(container)

  return container
}

function passthroughComponent(tag: string): Component {
  return defineComponent({
    template: `<${tag}><slot /></${tag}>`
  })
}

const emptyComponent: Component = defineComponent({
  template: '<div />'
})

const menuButtonComponent: Component = defineComponent({
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
})

const drawerComponent: Component = defineComponent({
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  template: '<aside v-if="modelValue"><slot /></aside>'
})

const destinationComponent: Component = defineComponent({
  props: {
    active: Boolean,
    title: String,
    to: String
  },
  emits: ['click'],
  template: `
    <a
      :href="to"
      :class="{ 'v-list-item--active': active }"
      :data-destination="to"
      tabindex="0"
      @click.prevent="$emit('click')"
    >
      {{ title }}<slot />
    </a>
  `
})
