# Vuetify 4 视觉兼容修复设计

## 目标

在保留现有 Material Design 2 深色视觉体系的前提下，修复 Vuetify 4 改变组件内部样式落点后产生的菜单阴影与 App Bar 层级漂移。修复必须精准，不恢复整套 Vuetify 3 样式，也不改变已确认的品牌磨砂效果。

## 根因

Vuetify 4 将菜单表面的背景与阴影应用到 `.v-menu > .v-overlay__content > .v-list`。项目仍同时给浮层容器和列表设置阴影，因此渲染树中存在两个承载阴影的嵌套层。

App Bar 的项目样式只使用 `.app-header`，而 Vuetify 4 对 App Bar 与 Toolbar 组合使用更具体的选择器。项目应以组件语义明确的选择器声明自有 MD2 阴影。

## 修改范围

### 菜单表面

在 `src/styles/global.css` 中：

- 保留 App Bar 的 4dp 深色表面叠层。
- 移除菜单浮层容器自身的阴影。
- 将菜单的 4dp 表面叠层和 MD2 菜单阴影只应用到直接子 `.v-list`。
- 使用与 Vuetify 4 DOM 结构一致的直接子选择器，避免影响嵌套列表或其他 Overlay。

### App Bar

在 `src/components/AppHeader.vue` 中：

- 将 `.app-header` 收紧为 `.app-header.v-app-bar.v-toolbar`。
- 保留透明背景、10px 模糊、现有 MD2 App Bar 阴影和无底边框视觉。
- 不修改移动端布局、Drawer、Tabs、路由或加载进度条。

## 非目标

- 不添加全局 `h1`、`h2`、`p` 或列表 reset。
- 不修改主题颜色、按钮尺寸、卡片样式或对话框样式。
- 不迁移到 Material Design 3。
- 不处理与此次依赖升级无关的页面重构或动画调整。

## 测试

先在 `tests/md2-components.test.ts` 增加失败契约，要求：

- App Bar 使用 Vuetify 4 组件语义选择器。
- 菜单浮层容器显式无阴影。
- 菜单直接子列表承载 MD2 叠层和菜单阴影。
- 不再存在把同一菜单阴影同时应用到容器和列表的旧组合选择器。

随后运行定向测试，确认先红后绿。

## 渲染验证

使用生产构建与浏览器验证：

- 桌面下载页打开“查看下载选项”，菜单只有一层清晰阴影。
- App Bar 保持磨砂背景与稳定的 MD2 层级。
- 360px 移动视口中菜单按钮保持圆形反馈，Drawer 正常打开和关闭。
- 页面无框架错误浮层，控制台无相关错误或警告。
- 运行完整测试、类型检查、生产构建和 `git diff --check`。
