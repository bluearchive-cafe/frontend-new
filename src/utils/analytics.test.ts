// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackAnnouncementClick, trackDownloadClick, trackNotFound } from './analytics'

describe('analytics events', () => {
  beforeEach(() => {
    window.gtag = undefined
  })

  it('sends download intent without its full url', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    trackDownloadClick({
      platform: 'Android',
      variant: '国际服 APK',
      downloadUrl: 'https://download.bluearchive.cafe/android/latest?token=hidden',
    })

    expect(gtag).toHaveBeenCalledWith('event', 'download_click', {
      platform: 'Android',
      variant: '国际服 APK',
      link_host: 'download.bluearchive.cafe',
    })
  })

  it('sends the announcement id and the clicked target', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    trackAnnouncementClick({ id: 'publisher-transfer-2027', target: 'migration' })

    expect(gtag).toHaveBeenCalledWith('event', 'announcement_click', {
      announcement_id: 'publisher-transfer-2027',
      target: 'migration',
    })
  })

  it('sends only path and referrer host for unknown routes', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    trackNotFound('/old-download', 'https://example.com/link?campaign=private')

    expect(gtag).toHaveBeenCalledWith('event', 'not_found', {
      page_path: '/old-download',
      referrer_host: 'example.com',
    })
  })

  it('normalizes unknown-route input to its pathname', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    trackNotFound('https://bluearchive.cafe/old-download?campaign=private#section')

    expect(gtag).toHaveBeenCalledWith('event', 'not_found', {
      page_path: '/old-download',
    })
  })

  it('handles invalid referrers and unavailable gtag', () => {
    expect(() => trackNotFound('/missing', 'not a url')).not.toThrow()
  })
})
