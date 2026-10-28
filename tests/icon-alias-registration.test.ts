// Vuetify 对未注册的 icon alias 只渲染空图标，不抛错也不告警——漏注册在构建
// 日志里完全 invisible。main.ts 的注释约定「只注册应用引用到的图标」，这里把
// 引用面与注册面双向锁死：漏注册与死注册都会红。
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// vitest 转译后 import.meta.dirname 不可用,从模块路径自己算。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : listSourceFiles(entryPath)
    }

    return /\.(ts|vue)$/.test(entry.name) && !entry.name.includes('.test.') ? [entryPath] : []
  })
}

// 只认整个字符串就是一个 alias（"$download"、icon="$arrowRight"），
// 这样 $event、?.$el 这类运行时对象属性不会被误判成图标引用。
const referencedAliases = new Set(
  listSourceFiles(path.join(projectRoot, 'src')).flatMap((file) =>
    [...readFileSync(file, 'utf-8').matchAll(/["']\$([a-z][A-Za-z0-9]*)["']/g)].map((match) => match[1])
  )
)

const aliasesBlock = readFileSync(path.join(projectRoot, 'src/main.ts'), 'utf-8')
  .match(/aliases:\s*\{([\s\S]*?)\n\s*\},/)?.[1] ?? ''

const registeredAliases = new Set(
  [...aliasesBlock.matchAll(/^\s*([a-z][A-Za-z0-9]*):/gm)].map((match) => match[1])
)

describe('icon alias registration', () => {
  it('registers every alias the app references', () => {
    // 扫描本身失效时不该静默通过。
    expect(referencedAliases.size).toBeGreaterThan(0)
    expect(registeredAliases.size).toBeGreaterThan(0)

    for (const alias of referencedAliases) {
      expect(registeredAliases.has(alias), `$${alias} is referenced but not registered in main.ts`).toBe(true)
    }
  })

  it('registers no alias the app never references', () => {
    // menu 由 VAppBarNavIcon 的默认图标间接引用，源码里搜不到字面量 "$menu"。
    const usedByVuetifyInternals = new Set(['menu'])

    for (const alias of registeredAliases) {
      if (usedByVuetifyInternals.has(alias)) {
        continue
      }

      expect(referencedAliases.has(alias), `$${alias} is registered but never used`).toBe(true)
    }
  })
})
