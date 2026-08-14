// @vitest-environment jsdom

import { createApp, defineComponent, nextTick, type App, type Component } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
})

describe('AppHeader navigation behavior', () => {
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

function mountHeader() {
  const container = document.createElement('div')
  document.body.append(container)
  mountedApp = createApp(AppHeader)

  mountedApp.component('VAppBar', passthroughComponent('header'))
  mountedApp.component('VToolbarTitle', passthroughComponent('div'))
  mountedApp.component('VContainer', passthroughComponent('div'))
  mountedApp.component('VTabs', passthroughComponent('nav'))
  mountedApp.component('VTab', destinationComponent)
  mountedApp.component('VProgressLinear', emptyComponent)
  mountedApp.component('VAppBarNavIcon', menuButtonComponent)
  mountedApp.component('VNavigationDrawer', drawerComponent)
  mountedApp.component('VList', passthroughComponent('div'))
  mountedApp.component('VListItem', destinationComponent)
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
