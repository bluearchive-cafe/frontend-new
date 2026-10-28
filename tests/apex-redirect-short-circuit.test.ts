// www → apex 的重定向跑在 ES Module 的 import 求值之后，语义只是"应用代码第一行"。
// 短路全靠文件末尾那个 if (!redirectingToApex) 包裹，一旦有人把它拆回顶层，
// 跳转途中的 www 流量会白跑一遍 Vuetify 创建与应用挂载。这里锁住那个形状。
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mainSource = readFileSync(path.join(projectRoot, 'src/main.ts'), 'utf-8')

const bootstrapBlock = /if \(!redirectingToApex\) \{([\s\S]*?)\n\}/.exec(mainSource)?.[1]

describe('www 重定向的短路形状', () => {
  it('发起跳转的判断位于模块体第一条语句', () => {
    const redirectCheckIndex = mainSource.indexOf('shouldRedirectToApex(window.location.hostname)')
    const firstImportIndex = mainSource.search(/^import /m)

    expect(redirectCheckIndex).toBeGreaterThanOrEqual(0)
    expect(redirectCheckIndex).toBeLessThan(firstImportIndex)
  })

  it('把创建 Vuetify 与挂载一起关进守卫分支', () => {
    expect(bootstrapBlock, 'main.ts 里找不到 if (!redirectingToApex) { … } 守卫块').toContain('createVuetify(')
    expect(bootstrapBlock).toContain(".mount('#app')")
    expect(bootstrapBlock).toContain('printConsoleBrand()')
  })

  it('顶层不再有第二处挂载或 Vuetify 创建', () => {
    expect([...mainSource.matchAll(/^createApp\(/gm)]).toHaveLength(0)
    expect([...mainSource.matchAll(/^const vuetify = createVuetify\(/gm)]).toHaveLength(0)
  })
})
