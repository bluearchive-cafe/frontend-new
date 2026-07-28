# 移动端 App Bar 默认布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除移动端 App Bar 的自定义内部横向布局，让 Vuetify 默认布局管理菜单按钮和站点标题。

**Architecture:** 保持 `v-app-bar`、抽屉和桌面 Tabs 的结构不变，只删除 `AppHeader.vue` 的移动端局部样式覆盖。用现有的源码契约测试防止这些移动端覆盖重新出现，再以浏览器在 360px 视口检查实际结果。

**Tech Stack:** Vue 3、TypeScript、Vuetify 3、Vite、Vitest。

## Global Constraints

- 仅调整 `src/components/AppHeader.vue` 中小于等于 720px 的 App Bar 内部布局规则。
- 保留桌面端的 `v-container`、Tabs、抽屉、加载进度条、主题、阴影和路由行为。
- 保留移动端左侧菜单触发器、56px App Bar 和抽屉导航模式。
- 不处理抽屉焦点管理，不引入 Bottom Navigation 或 Material 3 Navigation Bar。

---

### Task 1: 移除移动端自定义 App Bar 内部布局

**Files:**
- Modify: `tests/md2-components.test.ts:68-74`
- Modify: `src/components/AppHeader.vue:255-278`

**Interfaces:**
- Consumes: `AppHeader.vue` 的 `.header-inner`、`.brand`、`.mobile-menu` 与 `@media (max-width: 720px)` 样式。
- Produces: 移动端只通过 `.desktop-tabs { display: none; }` 和 `.mobile-menu` 的可见性及 48px 触控目标覆盖默认 App Bar 布局。

- [ ] **Step 1: Write the failing test**

在 `uses the small MD2 app bar measurements on mobile` 后新增测试：

```ts
  it('leaves mobile app bar item placement to Vuetify defaults', () => {
    expect(appHeaderSource).not.toContain('gap: var(--space-5);')
    expect(appHeaderSource).not.toContain('padding-inline: var(--space-1);')
    expect(appHeaderSource).not.toContain('font-size: 20px;')
    expect(appHeaderSource).not.toContain('font-weight: 500;')
    expect(appHeaderSource).not.toContain('display: inline-grid;')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/md2-components.test.ts`

Expected: FAIL in `leaves mobile app bar item placement to Vuetify defaults`, because the current mobile media query contains all five custom declarations.

- [ ] **Step 3: Write minimal implementation**

在 `@media (max-width: 720px)` 中仅保留：

```css
  .desktop-tabs {
    display: none;
  }

  .mobile-menu {
    display: initial;
    height: 48px !important;
    min-height: 48px;
  }
```

删除该媒体查询内 `.header-inner` 和 `.brand` 块，以及 `.mobile-menu` 的 `display: inline-grid;`。不修改媒体查询以外的桌面布局样式。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/md2-components.test.ts`

Expected: PASS；现有移动端触控目标与新增默认布局契约均通过。

- [ ] **Step 5: Validate rendered behavior and full checks**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Then run the local Vite site and inspect at a 360px-wide viewport:

- 菜单图标在 App Bar 前导侧可见，且可点击。
- `蔚蓝咖啡厅` 保持可见，未由项目的移动端字号或间距规则定位。
- 顶部 Tabs 不可见；打开菜单后左侧模态抽屉仍显示五个目的地。

- [ ] **Step 6: Commit**

```bash
git add tests/md2-components.test.ts src/components/AppHeader.vue
git commit -m "fix(ui): 使用 Vuetify 默认移动端 App Bar 布局"
```
