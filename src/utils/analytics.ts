export interface DownloadClickInput {
  platform: string
  variant: string
  downloadUrl: string
}

type Parameters = Record<string, string>

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, parameters: Parameters) => void
  }
}

export function trackDownloadClick(input: DownloadClickInput) {
  const linkHost = host(input.downloadUrl)
  track('download_click', {
    platform: input.platform,
    variant: input.variant,
    ...(linkHost ? { link_host: linkHost } : {}),
  })
}

export function trackNotFound(pagePath: string, referrer = document.referrer) {
  const referrerHost = host(referrer)
  track('not_found', {
    page_path: pathname(pagePath),
    ...(referrerHost ? { referrer_host: referrerHost } : {}),
  })
}

function track(name: string, parameters: Parameters) {
  window.gtag?.('event', name, parameters)
}

function host(value: string) {
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

function pathname(value: string) {
  try {
    return new URL(value, 'https://bluearchive.cafe').pathname
  } catch {
    return '/'
  }
}
