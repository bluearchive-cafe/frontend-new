// 字体走两条路：SCSS 的 @font-face 从 jsdelivr 按精确版本取文件，
// 而字体元数据与 package.json 由 npm 按 ^范围 安装。Dependabot 升依赖不会改
// CDN URL，构建也不报错，结果是元数据与实际下载的文件版本不一致。
// 这里把「CDN 钉住的版本」对齐到「真正装进 node_modules 的版本」。
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// vitest 转译后 import.meta.dirname 不可用,从模块路径自己算。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const fontsScss = readFileSync(path.join(projectRoot, 'src/styles/fonts.scss'), 'utf-8')
const manifest = JSON.parse(
  readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }

const declaredDependencies = { ...manifest.dependencies, ...manifest.devDependencies }

const pinnedFonts = [...fontsScss.matchAll(/cdn\.jsdelivr\.net\/npm\/(@[^/]+\/[^@/]+)@([^/]+)\/files/g)]
  .map((match) => ({ package: match[1], version: match[2] }))

function installedVersion(name: string): string | undefined {
  try {
    return (JSON.parse(
      readFileSync(path.join(projectRoot, 'node_modules', name, 'package.json'), 'utf-8')
    ) as { version?: string }).version
  } catch {
    return undefined
  }
}

describe('font version parity', () => {
  it('finds the CDN-pinned font packages', () => {
    // 扫描失效时不该静默通过。
    expect(pinnedFonts.map((entry) => entry.package).sort()).toEqual([
      '@fontsource-variable/noto-sans-sc',
      '@fontsource/noto-sans'
    ])
  })

  it('declares every CDN-pinned package as a dependency', () => {
    for (const { package: name } of pinnedFonts) {
      expect(declaredDependencies[name], `${name} pinned from CDN but not declared`).toBeTruthy()
    }
  })

  it('pins the same version it installs', () => {
    for (const { package: name, version } of pinnedFonts) {
      const installed = installedVersion(name)

      expect(installed, `${name} is not installed`).toBeDefined()
      expect(installed, `${name}: CDN pins ${version} but node_modules has ${installed}`).toBe(version)
    }
  })
})
