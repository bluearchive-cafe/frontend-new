---
title: 示例文章
author: Saiba Midori
publishedAt: 2021-12-08 00:00
category: 示例
summary: 这是一篇示例文章，可以编辑或删除。
pinned: false
draft: true
---

你好，这是一篇示例文章。

下面是一段 Markdown 渲染测试的文本，您可以编辑或删除它。

---

# 一级标题（Heading 1）

## 二级标题（Heading 2）

### 三级标题（Heading 3）

---

## 一、文本样式

这是**粗体文本**

这是*斜体文本*

这是***粗斜体文本***

这是~~删除线文本~~

这是 `行内代码` 。

---

## 二、段落与换行

这是第一段文字。

这是第二段文字（中间空一行即可分段）。  
这是同一段中的强制换行（行尾加两个空格）。

---

## 三、列表

### 无序列表

* 苹果
* 香蕉

  * 小香蕉
  * 大香蕉
* 橘子

### 有序列表

1. 第一项
2. 第二项
3. 第三项

### 任务列表

* [x] 已完成任务
* [ ] 未完成任务

---

## 四、链接与图片

这是一个链接：[Google 搜索](https://www.google.com/)

这是一个图片示例：
![示例图片](image.webp)

---

## 五、引用（Blockquote）

> 这是一段引用文字  
> 可以多行书写
>
> > 这是嵌套引用

---

## 六、代码块

### 普通代码块

```
这是一个普通代码块
可以写任意内容
```

### 代码块与语言标注

站点没有挂载语法高亮器，因此围栏上写 `js`、`ts` 之类语言标注不会有任何效果（对应的 `language-*` 类名会被清洗丢弃）。写普通围栏即可：

```
function hello() {
  console.log("Hello, Markdown!");
}
```

---

## 七、表格

| 姓名 | 年龄 | 职业  |
| -- | -- | --- |
| 张三 | 18 | 学生  |
| 李四 | 25 | 工程师 |
| 王五 | 30 | 设计师 |

---

## 八、分隔线

---

## 九、转义字符

\* 这不是斜体

\# 这不是标题

---

## 十、HTML 混写与不被支持的写法

站点保留了少量内联 HTML（`<kbd>`、`<mark>`、`<del>` 之类按允许列表判定），但下面这些会被构建期的清洗规则静默丢弃，写了不生效：

- `style` 属性（颜色、字号、对齐等行内样式）。文字变色请改用 `**粗体**`、`~~删除线~~` 或 `<mark>高亮</mark>`。
- 表格列对齐（`:---:`、`---:`、`---` 靠右）。对齐信息落在 `style` 上，因此同样不生效。
- `<details>` / `<summary>` 折叠块。折叠结构会消失，藏在里面的文字**直接显示成正文**——不要用剧透。
- `<iframe>` / `<video>` 等嵌入。整块消失，只留空容器。
- 代码围栏上的语言标注（见第六节）。

需要这些效果时，请在提稿前说明，作者语法边界是逐次评估的产品决策。

---

## 十一、其他扩展语法

使用键盘快捷键：<kbd>Ctrl</kbd> + <kbd>C</kbd> 复制。

这是一段需要 <mark>高亮显示的重点内容</mark>。

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## 十二、特殊场景测试

[比如这是一段很长很长————————————————————的链接](https://example.com/)
