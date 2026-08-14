// @vitest-environment jsdom

import { createApp, defineComponent, h, inject, nextTick, provide, type App, type InjectionKey } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const newsState = vi.hoisted(() => ({
  articles: [
    {
      title: '站点公告',
      author: '蔚蓝咖啡厅',
      publishedAt: '2026-08-01 12:00',
      publishedAtDateTime: '2026-08-01T12:00',
      publishedAtTimestamp: 1785576000000,
      category: '公告',
      summary: '公告摘要',
      pinned: true,
      draft: false,
      slug: 'announcement',
      html: '<p>公告</p>',
      wordCount: 10
    },
    {
      title: '版本更新',
      author: '蔚蓝咖啡厅',
      publishedAt: '2026-08-02 12:00',
      publishedAtDateTime: '2026-08-02T12:00',
      publishedAtTimestamp: 1785662400000,
      category: '更新',
      summary: '更新摘要',
      pinned: false,
      draft: false,
      slug: 'release',
      html: '<p>更新</p>',
      wordCount: 12
    }
  ],
  categories: ['公告', '更新']
}))

vi.mock('../src/content/news', () => ({
  newsArticles: newsState.articles,
  newsCategories: newsState.categories
}))

import NewsPage from '../src/pages/NewsPage.vue'

let mountedApp: App<Element> | undefined

beforeEach(() => {
  newsState.categories.splice(0, newsState.categories.length, '公告', '更新')
})

afterEach(() => {
  mountedApp?.unmount()
  mountedApp = undefined
  document.body.innerHTML = ''
})

describe('NewsPage category filter', () => {
  it('filters the rendered articles when a category is selected', async () => {
    const container = mountNewsPage()

    expect(articleTitles(container)).toEqual(['站点公告', '版本更新'])

    container.querySelector<HTMLButtonElement>('[data-category="公告"]')!.click()
    await nextTick()

    expect(articleTitles(container)).toEqual(['站点公告'])
    expect(container.textContent).not.toContain('版本更新')
  })

  it('hides the category controls when no categories are available', () => {
    newsState.categories.splice(0)
    const container = mountNewsPage()

    expect(container.querySelector('[aria-label="文章分类筛选"]')).toBeNull()
    expect(articleTitles(container)).toEqual(['站点公告', '版本更新'])
  })
})

function mountNewsPage() {
  const container = document.createElement('div')
  document.body.append(container)
  mountedApp = createApp(NewsPage)
  mountedApp.component('VContainer', passthroughComponent('main'))
  mountedApp.component('VBtnToggle', categoryToggleComponent)
  mountedApp.component('VBtn', categoryButtonComponent)
  mountedApp.component('VCard', passthroughComponent('article'))
  mountedApp.component('VCardText', passthroughComponent('div'))
  mountedApp.component('VIcon', defineComponent({ template: '<span aria-hidden="true" />' }))
  mountedApp.mount(container)
  return container
}

function articleTitles(container: Element) {
  return Array.from(container.querySelectorAll('.article-card h2'), (heading) => heading.textContent)
}

function passthroughComponent(tag: string) {
  return defineComponent({
    template: `<${tag}><slot /></${tag}>`
  })
}

interface CategoryGroup {
  select: (value: string) => void
}

const categoryGroupKey: InjectionKey<CategoryGroup> = Symbol('category-group')

const categoryToggleComponent = defineComponent({
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup(_props, { emit }) {
    provide(categoryGroupKey, {
      select: (value) => emit('update:modelValue', value)
    })
  },
  template: '<div><slot /></div>'
})

const categoryButtonComponent = defineComponent({
  props: {
    value: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    const group = inject(categoryGroupKey)

    return () => h('button', {
      type: 'button',
      'data-category': props.value,
      onClick: () => group?.select(props.value)
    }, slots.default?.())
  }
})
