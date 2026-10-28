// 首页每次加载从名单里随机取一张 hero。名单里多写一个名字、或源文件被改名，
// optimize-hero-images.mjs 只会静默少产出对应 webp，线上表现为随机破图，
// 构建全程绿灯。这里把名单与素材目录对齐。
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const heroDirectory = path.join(projectRoot, 'public/assets/img/hero')
const heroImageNames = JSON.parse(
  readFileSync(path.join(projectRoot, 'src/content/hero-images.json'), 'utf-8')
)

// 与 optimize-hero-images.mjs 保持一致的识别规则。
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp']

const basenames = readdirSync(heroDirectory)
  .filter((file) => supportedExtensions.includes(path.extname(file).toLowerCase()))
  .map((file) => path.basename(file, path.extname(file)))

describe('hero image manifest', () => {
  it('lists images without duplicates', () => {
    expect(heroImageNames.length).toBeGreaterThan(0)
    expect(new Set(heroImageNames).size).toBe(heroImageNames.length)
  })

  it('has exactly one source file per listed image', () => {
    for (const name of heroImageNames) {
      const matches = basenames.filter((basename) => basename === name)

      expect(matches.length, `hero "${name}" has no source file in public/assets/img/hero`).toBe(1)
    }
  })
})
