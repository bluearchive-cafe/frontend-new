# 移动端 App Bar 默认布局

## 目标

移动端保留 `c955b8dbe50e112f8707a3761df80144c305f5c7` 引入的磨砂 App Bar 视觉效果，同时以 Vuetify 的默认 App Bar 与 Navigation Drawer 组件结构、布局和间距承载导航。

## 范围

- 调整 `src/components/AppHeader.vue` 的移动端 App Bar 与临时导航抽屉。
- 保留桌面端的 `v-container`、Tabs、加载进度条、主题、路由行为，以及 `c955b8d` 的 `.app-header` 磨砂样式。
- 保留移动端的菜单触发器、56px App Bar、抽屉导航、当前路由高亮、Esc 关闭和关闭后焦点回归。

## 方案

在小于等于 720px 时，不再以 `.header-inner` 的自定义 flex、间距和水平内边距排列菜单与品牌；改用 `v-app-bar-nav-icon` 作为前导菜单触发器，并以 `v-toolbar-title` 承载站点标题。移动端仅保留 Tabs 隐藏规则；按钮位置、App Bar 内部间距和标题排版由 Vuetify 默认组件处理。菜单触发器保留清晰的 accessible name 和不小于 48px 的可触控区域。

抽屉继续使用 `temporary` 与既有导航数据，但回归 Vuetify 的默认 Drawer、Toolbar 与 List 外观：移除自定义宽度、阴影、层级、标题文字样式、列表内边距、列表密度、最小项高度与圆角覆盖。保留主题 `surface`、路由目标、当前项语义、遮罩色、Esc 关闭与焦点回归。

桌面端继续使用现有 `.header-inner` 和 `.desktop-tabs` 布局，不改变断点及导航信息架构。`.app-header` 的透明表面、模糊和 MD2 App Bar 阴影保持不变，因此磨砂视觉不会扩散到抽屉。

## 验证

1. 先添加源码契约测试，证明移动端使用 `v-app-bar-nav-icon` 与 `v-toolbar-title`，并且不再声明自定义 App Bar 项目布局或抽屉外观覆盖；测试应先失败。
2. 实施最小组件与样式修改后运行该测试与完整测试、类型检查、构建。
3. 在 360px 视口确认：磨砂 App Bar 保持可见；菜单按钮和标题使用默认位置；Tabs 隐藏；菜单打开后显示默认样式的左侧模态抽屉、五个目的地、当前项状态；选择目的地后抽屉关闭且焦点回到触发器。确认桌面 Tabs 在 720px 以上保持可用。

## 非目标

- 不迁移为 Bottom Navigation 或 Material 3 Navigation Bar。
- 不重构导航数据、主题令牌或桌面布局。
