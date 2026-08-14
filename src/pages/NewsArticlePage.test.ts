// @vitest-environment jsdom

import { createApp, type App, type Component, nextTick, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { findNewsArticleMock, mediumZoomMock, zoomDetachMock } = vi.hoisted(() => {
  const zoomDetachMock = vi.fn()
  return {
    findNewsArticleMock: vi.fn(),
    mediumZoomMock: vi.fn<(images: NodeListOf<HTMLImageElement>) => { detach: () => void }>(() => ({ detach: zoomDetachMock })),
    zoomDetachMock
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => routeState
}))

vi.mock('../content/news', () => ({
  findNewsArticle: findNewsArticleMock
}))

vi.mock('medium-zoom', () => ({
  default: mediumZoomMock
}))

// 页面本地导入的展示组件用轻量替身隔离,聚焦文章渲染主流程。
vi.mock('../components/PinnedBadge.vue', () => ({
  default: { template: '<span />' }
}))

vi.mock('../components/DraftBadge.vue', () => ({
  default: { template: '<span />' }
}))

vi.mock('../components/CategoryBadge.vue', () => ({
  default: { template: '<span />' }
}))

vi.mock('../components/ArticleMeta.vue', () => ({
  default: {
    props: ['author', 'publishedAt', 'publishedAtDateTime', 'wordCount', 'label'],
    template: '<div class="article-meta-stub" />'
  }
}))

vi.mock('../components/NotFoundState.vue', () => ({
  default: {
    props: ['primaryLabel', 'primaryTo', 'secondaryLabel', 'secondaryTo'],
    template: '<div class="not-found-state-stub">{{ primaryLabel }} {{ secondaryLabel }}</div>'
  }
}))

import NewsArticlePage from './NewsArticlePage.vue'

const routeState = reactive({ params: { slug: 'hello-world' } })

const mountedApps: { app: App; container: HTMLElement }[] = []

beforeEach(() => {
  routeState.params.slug = 'hello-world'
  findNewsArticleMock.mockReset()
  mediumZoomMock.mockClear()
  zoomDetachMock.mockClear()
  findNewsArticleMock.mockImplementation((slug: string) => (slug === 'hello-world' ? articleFixture : undefined))
})

afterEach(() => {
  mountedApps.splice(0).forEach(({ app, container }) => {
    app.unmount()
    container.remove()
  })
})

describe('NewsArticlePage rendering', () => {
  it('renders the article title and sanitized html when the article exists', () => {
    const { container } = mountNewsArticlePage()

    expect(findNewsArticleMock).toHaveBeenCalledWith('hello-world')
    expect(container.textContent).toContain('Hello World')
    expect(container.querySelector('.markdown-body')?.innerHTML).toContain('<p>Article body</p>')
    expect(container.querySelector('.not-found-state-stub')).toBeNull()
  })

  it('renders the not-found state when the article is missing', () => {
    routeState.params.slug = 'missing-article'
    const { container } = mountNewsArticlePage()

    expect(container.querySelector('.not-found-state-stub')).not.toBeNull()
    expect(container.querySelector('.markdown-body')).toBeNull()
    expect(container.textContent).toContain('返回新闻列表')
  })

  it('re-renders when the route slug changes to another article', async () => {
    const { container } = mountNewsArticlePage()

    expect(container.textContent).toContain('Hello World')

    routeState.params.slug = 'second-article'
    findNewsArticleMock.mockImplementation((slug: string) => (slug === 'second-article' ? secondFixture : undefined))
    await flushUpdates()

    expect(container.textContent).toContain('Second Article')
  })
})

describe('NewsArticlePage image zoom', () => {
  it('attaches medium-zoom to article images and detaches on unmount', async () => {
    const { app, container } = mountNewsArticlePage()
    await flushUpdates()

    expect(mediumZoomMock).toHaveBeenCalledOnce()
    const zoomedImages = mediumZoomMock.mock.calls[0][0]
    expect(zoomedImages.length).toBe(1)
    expect(container.querySelector('.markdown-body img')).toBe(zoomedImages[0])

    app.unmount()
    expect(zoomDetachMock).toHaveBeenCalled()
  })
})

function mountNewsArticlePage() {
  const container = document.createElement('div')
  const app = createApp(NewsArticlePage)

  app.component('VContainer', passthroughComponent)
  app.component('VBtn', buttonComponent)
  app.mount(container)
  document.body.append(container)
  mountedApps.push({ app, container })

  return { app, container }
}

const passthroughComponent: Component = {
  template: '<div><slot /></div>'
}

const buttonComponent: Component = {
  inheritAttrs: false,
  template: '<a><slot /></a>'
}

async function flushUpdates() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const articleFixture = {
  title: 'Hello World',
  author: 'Sensei',
  publishedAt: '2026-07-29 03:04',
  publishedAtDateTime: '2026-07-29T03:04',
  publishedAtTimestamp: Date.parse('2026-07-29T03:04'),
  category: '公告',
  summary: 'A summary',
  pinned: false,
  draft: false,
  slug: 'hello-world',
  html: '<p>Article body</p><img src="https://example.com/a.png" alt="a">',
  wordCount: 2
}

const secondFixture = {
  ...articleFixture,
  title: 'Second Article',
  slug: 'second-article',
  html: '<p>Second body</p>'
}
