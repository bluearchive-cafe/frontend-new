# 移动端默认 App Bar 与抽屉 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留移动端磨砂 App Bar 视觉，将移动端导航与临时抽屉收敛为 Vuetify 默认组件结构和布局。

**Architecture:** `AppHeader.vue` 在 App Bar 内并列渲染一套仅移动端可见的 Vuetify App Bar 子组件，以及现有仅桌面端可见的容器与 Tabs。移动端使用 `v-app-bar-nav-icon` 和 `v-toolbar-title` 的直接子级布局；抽屉继续复用路由数据、关闭与焦点归还逻辑，但删除所有局部外观覆盖，交由 Vuetify 默认 Drawer、Toolbar 与 List 样式处理。磨砂 CSS 保持只作用于 `.app-header`。

**Tech Stack:** Vue 3、TypeScript、Vuetify 3.7.6、Vite、Vitest。

## Global Constraints

- 保留 `c955b8dbe50e112f8707a3761df80144c305f5c7` 的透明表面、`backdrop-filter` 和 App Bar MD2 阴影。
- 仅调整 `src/components/AppHeader.vue` 与其源码契约测试；不更改导航数据、路由、主题令牌、桌面 Tabs 或加载进度条。
- 移动端断点保持 `max-width: 720px`；桌面端继续使用现有 `v-container.header-inner` 与 `v-tabs`。
- 保留抽屉 `temporary`、`location="left"`、`color="surface"`、遮罩色、当前路由状态、Esc 关闭与焦点回归。
- 移动端菜单按钮必须有 `aria-label="打开菜单"`，并通过项目的移动端按钮令牌保持至少 48px 触控目标。
- 不引入 Bottom Navigation、Material 3 Navigation Bar、新依赖或无关重构。

---

### Task 1: 以 Vuetify 默认组件布局替换移动端 App Bar 与抽屉覆盖

**Files:**
- Modify: `tests/md2-components.test.ts:42-80`
- Modify: `src/components/AppHeader.vue:2-84, 151-270`

**Interfaces:**
- Consumes: `navItems`、`drawer`、`menuTrigger`、`closeDrawer()`、`handleGlobalKeydown()` 与 `isToolbarLoading` 的现有行为。
- Produces: 仅移动端可见的 `v-app-bar-nav-icon` 和 `v-toolbar-title`；使用 Vuetify 默认尺寸、间距和表面层级的临时导航抽屉；不影响桌面 `v-container.header-inner`、Tabs 或磨砂 App Bar。

- [ ] **Step 1: 写入失败的源码契约测试**

在 `describe('AppHeader MD2 compatibility contract', ...)` 中，将旧的“抽屉阴影与 48px 列表目标”和“移动端 MD2 尺寸”测试替换为以下两个测试。保留其他 App Bar、Esc、Tabs 与状态反馈测试不变：

```ts
  it('uses Vuetify app bar components for the mobile navigation layout', () => {
    expect(appHeaderSource).toContain('<v-app-bar-nav-icon')
    expect(appHeaderSource).toContain('<v-toolbar-title class="mobile-brand">')
    expect(appHeaderSource).toContain('aria-label="打开菜单"')
    expect(appHeaderSource).not.toContain('<v-btn\n        class="mobile-menu"')
    expect(appHeaderSource).not.toContain('padding-inline: var(--space-1);')
    expect(appHeaderSource).not.toContain('gap: var(--space-5);')
    expect(appHeaderSource).not.toContain('font-size: 20px;')
    expect(appHeaderSource).not.toContain('font-weight: 500;')
  })

  it('leaves temporary drawer layout and appearance to Vuetify defaults', () => {
    expect(appHeaderSource).toContain('temporary')
    expect(appHeaderSource).toContain('location="left"')
    expect(appHeaderSource).not.toContain('width="280"')
    expect(appHeaderSource).not.toContain('class="app-drawer"')
    expect(appHeaderSource).not.toContain('class="drawer-title"')
    expect(appHeaderSource).not.toContain('class="drawer-list"')
    expect(appHeaderSource).not.toContain('box-shadow: var(--md2-elevation-drawer)')
    expect(appHeaderSource).not.toContain('rounded="lg"')
  })
```

- [ ] **Step 2: 运行定向测试，确认它因旧实现而失败**

Run:

```powershell
npm test -- tests/md2-components.test.ts
```

Expected: FAIL；新增测试应报告当前缺少 `v-app-bar-nav-icon` / `v-toolbar-title`，并仍存在自定义移动端布局和抽屉外观声明。失败不得来自测试语法、生成新闻内容或环境错误。

- [ ] **Step 3: 实施最小组件与样式修改**

在 `v-app-bar` 内、现有桌面 `v-container.header-inner` 之前，添加仅移动端显示的 Vuetify 直接子组件：

```vue
    <v-app-bar-nav-icon
      class="mobile-menu"
      aria-label="打开菜单"
      ref="menuTrigger"
      @click="drawer = true"
    />

    <v-toolbar-title class="mobile-brand">
      <RouterLink class="brand" to="/" aria-label="BlueArchive.Cafe 首页">
        <span>蔚蓝咖啡厅</span>
      </RouterLink>
    </v-toolbar-title>
```

将现有菜单 `v-btn` 删除。桌面 `.header-inner` 内保留现有品牌与 Tabs，并在窄屏媒体查询隐藏 `.header-inner`；在宽屏默认样式隐藏 `.mobile-menu` 与 `.mobile-brand`，而在 `@media (max-width: 720px)` 仅显示它们并隐藏 `.desktop-tabs`。不要在该媒体查询中添加任何定位、尺寸、间距、字号或字重声明。

将 `v-navigation-drawer` 保留为：

```vue
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="left"
    color="surface"
    scrim="rgba(0, 0, 0, 0.46)"
    @keydown.esc="closeDrawer"
  >
```

从抽屉、Toolbar、List 与 List Item 删除 `app-drawer`、`drawer-title`、`drawer-list`、`width`、`density`、`nav`、`rounded` 与局部列表高度/阴影/z-index CSS。保留 `title`、`:to`、`:active`、`color="primary"` 和 `@click="closeDrawer"`。删除已无调用点的 `.app-drawer`、`.v-navigation-drawer__scrim`、`.drawer-title` 与 `.drawer-list` 样式。不得修改 `.app-header` 的磨砂属性或 `AppHeader.test.ts` 的磨砂断言。

- [ ] **Step 4: 运行定向测试，确认实现通过**

Run:

```powershell
npm test -- tests/md2-components.test.ts src/components/AppHeader.test.ts
```

Expected: PASS；新增组件与默认外观契约通过，既有磨砂、Esc、前导抽屉、Tabs 与状态层断言也保持通过。

- [ ] **Step 5: 运行完整自动化验证**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Expected: 三条命令全部以 exit code 0 完成；构建生成站点与既有新闻内容流程不报错。

- [ ] **Step 6: 执行浏览器响应式验证**

启动开发服务器后，在 `http://127.0.0.1:<Vite 端口>/` 进行以下流程：

1. 在 360px 宽视口确认 App Bar 仍为透明模糊表面，左侧菜单按钮与标题可见，Tabs 不可见。
2. 点击菜单按钮，确认左侧临时抽屉以 Vuetify 默认宽度、Toolbar 与 List 间距出现，含五个目的地且当前页处于选中状态。
3. 选择“新闻”，确认路由变为 `/news`、抽屉关闭且焦点回到菜单触发器。
4. 在至少 721px 宽视口确认桌面品牌和 Tabs 可见，移动端菜单按钮与标题不可见。

记录无相关控制台错误、无 Vite 错误覆盖层，并保存移动端截图作为变更证据。

- [ ] **Step 7: 提交实现**

```powershell
git add tests/md2-components.test.ts src/components/AppHeader.vue
git commit -m "fix(header): 使用 Vuetify 默认移动端导航布局"
```
