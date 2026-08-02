# 导航菜单按钮全局样式排除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让移动端 `v-app-bar-nav-icon` 不继承项目全局按钮几何样式，同时保留所有其他全局 MD2 样式。

**Architecture:** 在全局按钮选择器上增加一个 Vuetify 组件类排除条件。该规则不修改 `v-app-bar` 或 `v-navigation-drawer` 选择器，因此磨砂 App Bar、MD2 App Bar 叠层和 Drawer 16dp 叠层维持现状。

**Tech Stack:** Vue 3、Vuetify 3.7.6、CSS、Vitest。

## Global Constraints

- 仅修改 `src/styles/global.css` 和 `tests/md2-components.test.ts`。
- 全局按钮规则必须继续覆盖非 Tab、非 App Bar 导航图标的按钮。
- 保留 `v-app-bar` 与 `v-navigation-drawer` 的现有全局 MD2 表面叠层。
- 不改变 `AppHeader.vue`、导航交互、主题令牌或任何其他组件样式。

---

### Task 1: 排除 App Bar 菜单图标的全局按钮几何

**Files:**
- Modify: `tests/md2-components.test.ts:18-38`
- Modify: `src/styles/global.css:189-201`

**Interfaces:**
- Consumes: Vuetify 在 `v-app-bar-nav-icon` 根元素上提供的 `.v-app-bar-nav-icon` 类，以及项目现有 `.v-btn:not(.v-tab)` 全局规则。
- Produces: `.v-btn:not(.v-tab):not(.v-app-bar-nav-icon)`，使菜单图标使用 Vuetify 默认高度、内边距和圆角；其他按钮继续使用项目全局令牌。

- [ ] **Step 1: 写入失败的契约测试**

在 `uses a compact desktop button token and restores mobile target size` 中，将下列断言替换为：

```ts
    expect(globalStyles).toContain('.v-btn:not(.v-tab):not(.v-app-bar-nav-icon)')
```

并保留同一测试中 `--button-height`、移动端 48px、`height` 与 `padding-inline` 的断言。该测试捕获的回归是：菜单图标再次被项目按钮几何覆盖，或项目普通按钮不再使用统一令牌。

- [ ] **Step 2: 运行定向测试，确认失败**

Run:

```powershell
npm test -- tests/md2-components.test.ts
```

Expected: FAIL；缺少 `.v-btn:not(.v-tab):not(.v-app-bar-nav-icon)` 选择器。失败不得来自测试语法或新闻内容生成。

- [ ] **Step 3: 实施最小 CSS 修改**

将两个全局按钮选择器都改为：

```css
.v-btn:not(.v-tab):not(.v-app-bar-nav-icon) {
  /* 保留现有声明 */
}

.v-btn:not(.v-tab):not(.v-app-bar-nav-icon).v-btn--variant-elevated,
.v-btn:not(.v-tab):not(.v-app-bar-nav-icon).v-btn--variant-flat {
  /* 保留现有 box-shadow 声明 */
}
```

不得修改其中已有声明，且不得调整 `.v-app-bar` 或 `.v-navigation-drawer` 规则。

- [ ] **Step 4: 运行定向测试，确认通过**

Run:

```powershell
npm test -- tests/md2-components.test.ts
```

Expected: PASS；全局普通按钮令牌、菜单图标排除及 App Bar 叠层契约均通过。

- [ ] **Step 5: 完成自动化与渲染验证**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

在 360px 视口确认菜单图标采用 Vuetify 默认按钮几何；磨砂 App Bar 与抽屉 MD2 表面叠层仍可见；打开抽屉后选择“新闻”能跳转并关闭抽屉。

- [ ] **Step 6: 提交实现**

```powershell
git add src/styles/global.css tests/md2-components.test.ts docs/superpowers/plans/2026-07-28-navigation-button-style-exclusion.md
git commit -m "fix(header): 排除导航菜单全局按钮样式"
```
