export type StaticRouteName = 'home' | 'download' | 'news' | 'status' | 'about'

export interface StaticRouteDefinition {
  name: StaticRouteName
  path: string
  alias: readonly string[]
  title: string
  description: string
  changefreq: string
  priority: string
}

export const siteTitle: string
export const siteName: string
export const siteUrl: string
export const defaultImage: string
export const defaultDescription: string
export const defaultKeywords: string
export const staticRoutes: readonly StaticRouteDefinition[]
export const notFoundSeo: {
  readonly name: 'not-found'
  readonly title: string
  readonly description: string
  readonly robots: 'noindex, follow'
}
