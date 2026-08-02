# 导航全局样式排除

## 目标

让 `AppHeader` 的菜单图标按钮使用 Vuetify 默认几何样式，同时保留 App Bar 与临时导航抽屉的既有 MD2 表面叠层和磨砂效果。

## 范围

- 仅调整 `src/styles/global.css` 的全局按钮选择器。
- `v-app-bar` 与 `v-navigation-drawer` 保持现有全局 MD2 表面叠层；App Bar 的透明、模糊和阴影样式不变。
- 其他页面按钮、浮层、卡片、对话框和所有 Drawer 保持现有全局样式。

## 方案

全局按钮规则改为排除 Vuetify 的 `.v-app-bar-nav-icon`，使其不再继承项目的统一字号、42px/48px 高度、水平内边距和 MD2 圆角。

该排除只影响移动菜单按钮。App Bar 与抽屉均不加入排除，因此 `c955b8dbe50e112f8707a3761df80144c305f5c7` 的磨砂效果、现有 App Bar 表面层级及抽屉的 MD2 16dp 白色叠层都保持不变。

## 验证

1. 添加失败的源码契约测试：菜单图标排除全局按钮规则，且 App Bar 与 Drawer 的全局 MD2 叠层仍存在。
2. 完成最小选择器修改后运行定向 Vitest、完整测试、类型检查和构建。
3. 在 360px 视口确认菜单图标为 Vuetify 默认样式，磨砂 App Bar 与抽屉 MD2 叠层保持可见；确认抽屉打开、关闭和路由跳转继续正常。

## 非目标

- 不排除或修改 `v-app-bar` 与 `v-navigation-drawer` 的全局样式。
- 不改动桌面 Tabs、导航数据、主题令牌、抽屉路由行为或焦点管理。
- 不调整其他 `v-btn` 或 `v-navigation-drawer` 的项目级样式。
