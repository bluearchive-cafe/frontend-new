# 路由切换与依赖审计修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除异步路由切换的主内容空档，并使 npm 高危依赖审计恢复通过。

**Architecture:** 保持路由组件懒加载和既有 180ms 淡入淡出样式，只移除 `Transition` 的 `out-in` 卸载顺序，使新旧视图在异步组件解析期间保持连续。依赖处理只更新现有锁文件与 `sharp` 的开发依赖版本；图片优化脚本继续是唯一的运行时使用方。

**Tech Stack:** Vue 3、Vue Router、TypeScript、Vitest、Vite、npm、sharp。

## Global Constraints

- Node.js 版本必须在 `>=22.18.0 <23`。
- 不修改状态接口、页面结构、文案或视觉令牌。
- 保留页面淡入淡出和 `prefers-reduced-motion` 行为。
- 不新增依赖；只更新现有依赖与锁文件以清除审计告警。

---

### Task 1: 防止路由切换先清空主内容

**Files:**

- Create: `src/App.test.ts`
- Modify: `src/App.vue:8-12`
- Test: `src/App.test.ts`

**Interfaces:**

- Consumes: `src/App.vue` 中 `<RouterView>` 的现有过渡结构。
- Produces: 一个不使用 `out-in` 的路由过渡壳层；异步页面加载时旧视图不会被提前卸载。

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment node

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appPath = fileURLToPath(new URL('./App.vue', import.meta.url))

describe('App route transition', () => {
  it('does not unmount the current route before an async replacement resolves', async () => {
    const source = await readFile(appPath, 'utf-8')

    expect(source).not.toContain('mode="out-in"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.ts`

Expected: FAIL because `App.vue` still contains `mode="out-in"`.

- [ ] **Step 3: Write minimal implementation**

```vue
<Transition name="page">
  <component :is="Component" :key="route.fullPath" />
</Transition>
```

Remove only `mode="out-in"`; do not alter the transition name, key, CSS, or router lazy imports.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.vue src/App.test.ts
git commit -m "fix: 避免路由切换内容空档"
```

### Task 2: 更新受影响依赖并验证图片构建链

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Verify: `scripts/optimize-hero-images.mjs`

**Interfaces:**

- Consumes: `sharp` 作为 `scripts/optimize-hero-images.mjs` 的开发依赖。
- Produces: 无 high 级别告警的 npm 依赖图，以及可运行的英雄图优化脚本。

- [ ] **Step 1: Inspect the planned lockfile changes without writing**

Run: `npm audit fix --package-lock-only --dry-run --json`

Expected: 输出仅包含现有依赖的安全升级建议；若需要新增依赖或移除项目依赖，停止并复核。

- [ ] **Step 2: Apply the minimal security updates**

Run: `npm audit fix --package-lock-only && npm install --save-dev sharp@^0.35.3 --package-lock-only`

Expected: `package.json` 将 `sharp` 更新为 `^0.35.3`，锁文件更新其传递依赖；不增加新的顶级包。

- [ ] **Step 3: Verify security and image optimization**

Run: `npm audit --audit-level=moderate && npm run optimize:hero`

Expected: 审计退出码为 0，脚本输出 `Optimized 8 hero images`。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix(deps): 修复高危依赖告警"
```

### Task 3: 完整回归与浏览器验证

**Files:**

- Verify only: `src/App.vue`, `src/App.test.ts`, `package.json`, `package-lock.json`

**Interfaces:**

- Consumes: 任务 1 的连续路由过渡与任务 2 的安全依赖图。
- Produces: 可发布的完整验证证据。

- [ ] **Step 1: Run automated verification**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: 所有测试、类型检查、生产构建和空白字符检查通过。

- [ ] **Step 2: Verify the real route flow in browser**

Run: `npm run dev`

Then navigate `http://127.0.0.1:5173/` → `/download` and verify the main region remains populated during the route transition; open `下载安装包` and verify the confirmation dialog exposes one `继续下载` link.

- [ ] **Step 3: Commit verification documentation only if it changed**

Do not create a report artifact. If the prior tasks produced no uncommitted changes, leave the worktree clean.
