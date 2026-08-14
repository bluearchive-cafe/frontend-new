import { siteUrl } from '../shared/site-routes.mjs'

// 站点域名单一来源:www 重定向与 analytics 的 URL 兜底都从 siteUrl 派生。
export const apexHost = new URL(siteUrl).hostname
export const wwwHost = `www.${apexHost}`

export function shouldRedirectToApex(hostname: string) {
  return hostname === wwwHost
}

export function buildApexRedirectUrl(location: { pathname: string; search: string; hash: string }) {
  return `https://${apexHost}${location.pathname}${location.search}${location.hash}`
}
