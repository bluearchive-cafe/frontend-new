import { describe, expect, it } from 'vitest'

import { staticRoutes as sharedStaticRoutes } from '../src/shared/site-routes.mjs'
import { staticRoutes as scriptStaticRoutes } from './site-routes.mjs'

describe('site route manifest', () => {
  it('uses the shared static route array in build scripts', () => {
    expect(scriptStaticRoutes).toBe(sharedStaticRoutes)
  })
})
