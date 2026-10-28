// 构建期校验产物里引用的每个本地 URL 都真的存在，且每条路由都已静态化。
// ESA 边缘对缺失路径的处理已被实测证实与文档不符（见 CODEBASE_AUDIT.md
// AUD-OPS-001）：无论 Sec-Fetch-Mode 为何都返回 200 + HTML 并按 30 天缓存，
// 所以断链在浏览器里是破图、在抓取器与监控里是正常页面，只能在下构建前拦住。
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { getSitemapRoutes } from './site-routes.mjs'
import { readNewsEntries } from './news-entries.mjs'

const distDirectory = path.resolve('dist')
const scannedExtensions = new Set(['.html', '.css', '.js'])

/**
 * @param {string} directory
 * @returns {string[]}
 */
function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
  })
}

/**
 * 抽出一个文件里所有可能的引用写法：
 * - src/href 属性（HTML，以及打包进 JS 的文章 HTML 字符串）
 * - CSS url()
 * - 以 / 开头的独立字符串字面量（JS 里拼接前直接写死的资源路径）
 * @param {string} file
 * @returns {string[]}
 */
function collectReferences(file) {
  const source = readFileSync(file, 'utf-8')
  /** @type {(string | undefined)[]} */
  const groups = [
    ...[...source.matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]),
    ...[...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((match) => match[1]),
    ...[...source.matchAll(/["'`](\/[A-Za-z0-9._\-/]*[A-Za-z0-9])["'`]/g)].map((match) => match[1])
  ]

  return groups.filter((value) => typeof value === 'string')
}

/**
 * 把引用写法归一化成本地路径；外部、协议相对、锚点与根路径返回 null。
 * @param {string} raw
 */
function toLocalTarget(raw) {
  const value = raw.trim()

  if (!value || value.startsWith('#') || value.startsWith('//')) {
    return null
  }

  // http:、https:、data:、mailto: 等一律带 scheme，不属于本地产物。
  if (/^[a-z][a-z0-9+\-.]*:/i.test(value)) {
    return null
  }

  const withoutQuery = value.split(/[?#]/)[0]

  // 只校验根绝对路径：vite base 是 '/'，产物里的本地引用一律这种写法。
  if (withoutQuery === '/' || !withoutQuery.startsWith('/')) {
    return null
  }

  return withoutQuery
}

/** @param {string} target */
function existsAsArtifact(target) {
  const absolute = path.resolve(distDirectory, `.${target}`)

  // 归一化后越出 dist/ 的引用不算产物内路径。
  if (absolute !== distDirectory && !absolute.startsWith(distDirectory + path.sep)) {
    return true
  }

  return isFile(absolute) || isFile(path.join(absolute, 'index.html'))
}

/** @param {string} target */
function isFile(target) {
  try {
    return statSync(target).isFile()
  } catch {
    return false
  }
}

const missing = new Set()
let scannedFiles = 0

for (const file of listFiles(distDirectory)) {
  if (!scannedExtensions.has(path.extname(file))) {
    continue
  }

  scannedFiles += 1

  for (const raw of collectReferences(file)) {
    const target = toLocalTarget(raw)

    if (target === null || existsAsArtifact(target)) {
      continue
    }

    missing.add(`${path.relative(distDirectory, file)} -> ${target}`)
  }
}

if (missing.size > 0) {
  throw new Error(
    `Built pages reference ${missing.size} missing local asset(s); each is served as 200 HTML by the edge fallback:\n` +
      [...missing].sort().map((entry) => `  - ${entry}`).join('\n')
  )
}

// esa.jsonc 的 notFoundStrategy=404Page 只有在"每条路由都已静态化"的前提下才安全：
// 少了这个前提，未 materialize 的正常页面会从"客户端接管"变成真的 404 页面。
// dist/404.html 是 404Page 策略本身的依赖，缺了它边缘只能回落到 404 空响应。
const routeFiles = (await getSitemapRoutes(await readNewsEntries())).map((route) =>
  route.path === '/' ? 'index.html' : path.join(route.path.replace(/^\//, ''), 'index.html')
)
const missingRouteFiles = [...routeFiles, '404.html'].filter((relative) => !isFile(path.join(distDirectory, relative)))

if (missingRouteFiles.length > 0) {
  throw new Error(
    `Sitemap routes without a static file in dist (404Page would 404 them for real):\n` +
      missingRouteFiles.map((relative) => `  - ${relative}`).join('\n')
  )
}

console.log(
  `Verified local asset references across ${scannedFiles} built files and ${routeFiles.length + 1} static route files.`
)
