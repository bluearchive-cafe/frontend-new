// animation 简写里混进非法值会让整条声明在计算期失效(IACVT),动画名归零却
// 毫无报错——此前 --ee-rot 的角度就被当成 animation-delay 吃掉了。jsdom 不实现
// 计算期校验,只能静态锁住这条声明。
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// vitest 转译后 import.meta.dirname 不可用,从模块路径自己算。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const globalStyles = readFileSync(path.join(projectRoot, 'src/styles/global.css'), 'utf-8')

const stickerRule = globalStyles.match(/\.easter-egg-sticker\s*\{[^}]*\}/)?.[0] ?? ''
const shorthand = stickerRule.match(/animation:\s*([^;]+);/)?.[1] ?? ''

describe('easter-egg sticker animation', () => {
  it('declares the animation on the class the JS attaches', () => {
    expect(stickerRule).not.toBe('')
    expect(shorthand).not.toBe('')
    expect(shorthand).toContain('easter-egg-sticker')
  })

  it('keeps rotation out of the animation shorthand', () => {
    // --ee-rot 只该出现在 @keyframes 的 rotate() 里;出现在简写里即被解析成 delay。
    expect(shorthand).not.toContain('--ee-rot')
    expect(globalStyles).toContain('@keyframes easter-egg-sticker')
  })
})
