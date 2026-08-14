import { describe, expect, it } from 'vitest'

import { apexHost, buildApexRedirectUrl, shouldRedirectToApex, wwwHost } from './apex-redirect'

describe('apex redirect', () => {
  it('derives both hosts from the shared siteUrl', () => {
    expect(apexHost).toBe('bluearchive.cafe')
    expect(wwwHost).toBe('www.bluearchive.cafe')
  })

  it('redirects only the www host to the apex domain', () => {
    expect(shouldRedirectToApex(wwwHost)).toBe(true)
    expect(shouldRedirectToApex(apexHost)).toBe(false)
    expect(shouldRedirectToApex('localhost')).toBe(false)
    expect(shouldRedirectToApex('')).toBe(false)
  })

  it('preserves path, query and hash when building the redirect target', () => {
    expect(buildApexRedirectUrl({ pathname: '/news/hello', search: '?from=www', hash: '#top' }))
      .toBe('https://bluearchive.cafe/news/hello?from=www#top')
    expect(buildApexRedirectUrl({ pathname: '/', search: '', hash: '' }))
      .toBe('https://bluearchive.cafe/')
  })
})
