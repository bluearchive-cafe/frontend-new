// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import router from './router'
import { staticRoutes } from './shared/site-routes.mjs'

describe('router route manifest', () => {
  it('registers every shared static route with the exact path', () => {
    const routesByName = new Map(router.getRoutes().map((route) => [route.name, route]))

    staticRoutes.forEach((definition) => {
      expect(routesByName.get(definition.name)?.path).toBe(definition.path)
    })
  })
})
