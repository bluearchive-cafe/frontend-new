# 下载与 404 分析事件设计

## 目标

让 BlueArchive.Cafe 能可靠衡量用户发起下载的意图，并记录未知路由的路径与来源，以便基于证据修复真实的坏链接。

## 范围

- 在下载弹窗的“继续下载”操作发送 `download_click`。
- 在 Vue Router 命中 `not-found` 路由时发送 `not_found`。
- 将 `download_click` 配置为 GA4 关键事件。
- 不新增重定向，也不把通用 `click`、`not_found` 或 `purchase` 设为关键事件。

## 事件契约

### `download_click`

发送时机：用户激活下载弹窗中的“继续下载”链接、浏览器跳转至目标下载地址之前。

参数：

- `platform`：当前下载平台名称。
- `variant`：当前下载变体名称。
- `link_host`：目标下载地址的主机名。

不发送完整下载 URL 或查询参数。事件衡量的是用户发起下载，而不是跨域下载完成；下载完成无法由当前站点可靠观察。

### `not_found`

发送时机：路由解析为 `not-found` 时。

参数：

- `page_path`：未知路径，不包含查询参数或 hash。
- `referrer_host`：`document.referrer` 的主机名；没有来源或来源无法解析时省略。

该事件仅用于定位来源，不作为业务转化。

## 架构与实现边界

新增一个小型 analytics 工具模块，封装对全局 `gtag` 的安全调用及两类事件的载荷构造。页面和路由只负责在确定的业务时机调用该模块。

- `DownloadPage.vue` 在既有 `markDownloadAttempted` 过程中调用下载事件。
- `router.ts` 的既有 `afterEach` 钩子在更新 SEO 后，对 `not-found` 调用 404 事件。
- 当 `gtag` 不存在时工具模块静默返回，页面导航和下载链接保持原有行为。

## 验证

- 单元测试确认下载事件的事件名与三个参数。
- 单元测试确认 404 事件只保留路径与来源主机名，并安全处理缺失或无效来源。
- 单元测试确认没有 `gtag` 时不抛错。
- 运行相关 Vitest 测试、`npm run typecheck`、`npm run build`。
- 部署后，在 GA4 实时报告或 DebugView 验证 `download_click` 与 `not_found`；随后将 `download_click` 标为关键事件。

## 非目标

- 不追踪跨域文件下载是否完成。
- 不注册自定义维度或新建 404 重定向规则。
- 不调整现有通用增强型衡量 `click` 事件。
