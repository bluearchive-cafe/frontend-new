// JS 侧读取 CSS token 的函数在缺失时直接抛错(readCss*Token 不提供兜底值),
// 消费点却在组件 setup、路由滚动与全局点击监听三处——任何一个 token 被改名
// 或删掉都会让对应功能在运行时炸掉。这里把"CSS 定义"与"JS 消费"两端锁死。
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// vitest 转译后 import.meta.dirname 不可用,从模块路径自己算。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const globalStyles = readFileSync(path.join(projectRoot, 'src/styles/global.css'), 'utf-8')

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : listSourceFiles(entryPath)
    }

    return /\.(ts|vue)$/.test(entry.name) && !entry.name.includes('.test.') ? [entryPath] : []
  })
}

const definedTokens = new Set(
  [...globalStyles.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((match) => match[1])
)

const consumedTokens = new Set(
  listSourceFiles(path.join(projectRoot, 'src')).flatMap((file) =>
    [...readFileSync(file, 'utf-8').matchAll(/readCss(?:Pixel|Duration)Token\(\s*'(--[\w-]+)'/g)]
      .map((match) => match[1])
  )
)

describe('CSS token contract', () => {
  it('covers every token the JS side reads', () => {
    // 扫描本身失效时不该静默通过。
    expect(consumedTokens.size).toBeGreaterThan(0)

    for (const token of consumedTokens) {
      expect(definedTokens.has(token), `${token} is read by JS but not defined in global.css`).toBe(true)
    }
  })

  it('keeps the four crash-critical tokens defined', () => {
    // 不依赖扫描结果的硬名单:扫描正则一旦失效,这一条仍会守住功能面。
    for (const token of ['--app-bar-height', '--anchor-offset', '--ee-sticker-size', '--ee-sticker-duration']) {
      expect(definedTokens.has(token), `${token} missing from global.css`).toBe(true)
    }
  })

  it('derives every container width from a token', () => {
    // 页宽此前在 8 个模板各写一遍字面量,改一处要动 8 个文件。
    const declaredWidths = listSourceFiles(path.join(projectRoot, 'src')).flatMap((file) =>
      [...readFileSync(file, 'utf-8').matchAll(/<v-container[^>]*max-width="([^"]+)"/g)].map((match) => match[1])
    )

    // 扫描本身失效时不该静默通过:当前仓库至少有 8 个页面级容器。
    expect(declaredWidths.length).toBeGreaterThanOrEqual(8)

    for (const value of declaredWidths) {
      expect(value, `container max-width "${value}" must come from a CSS token`).toMatch(/^var\(--[\w-]+\)$/)
    }

    // 两个宽度都必须是真实定义的 token,否则整条 max-width 会在计算期失效。
    for (const token of ['--container-page', '--container-reading']) {
      expect(definedTokens.has(token), `${token} missing from global.css`).toBe(true)
    }
  })
})
