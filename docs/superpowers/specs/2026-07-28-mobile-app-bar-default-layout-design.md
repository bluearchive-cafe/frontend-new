# 移动端 App Bar 默认布局

## 目标

移除移动端 `AppHeader` 内部的自定义横向排版，让 Vuetify 的 `v-app-bar` 默认插槽布局负责菜单触发器与站点标题的位置。

## 范围

- 仅调整 `src/components/AppHeader.vue` 中小于等于 720px 的 App Bar 内部布局规则。
- 保留桌面端的 `v-container`、Tabs、抽屉、加载进度条、主题、阴影和路由行为。
- 保留移动端左侧菜单触发器、56px App Bar 和抽屉导航模式。

## 方案

移动端取消 `.header-inner` 对 flex 间距和水平内边距的覆盖，并移除品牌在该断点下的字号与字重覆盖。移动端菜单按钮不再用定制 `inline-grid` 布局参与排版，改由 Vuetify 默认按钮/App Bar 布局处理；仅保留其可见性与 48px 触控目标。

桌面端继续使用现有 `.header-inner` 和 `.desktop-tabs` 布局，不改变断点及导航信息架构。

## 验证

1. 先添加源码契约测试，证明移动端不再声明自定义容器间距、内边距或品牌字体覆盖；测试应先失败。
2. 实施最小样式修改后运行该测试与完整测试、类型检查、构建。
3. 在 360px 视口确认菜单按钮和品牌由 App Bar 的默认布局显示，桌面 Tabs 在 720px 以上保持可用。

## 非目标

- 不处理抽屉焦点管理问题。
- 不迁移为 Bottom Navigation 或 Material 3 Navigation Bar。
- 不重构导航数据、主题令牌或桌面布局。
