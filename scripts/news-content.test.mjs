import { mkdtemp, mkdir, rm, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  generateNewsModule,
  sanitizeRenderedHtml
} from './news-content.mjs'
import { describeDroppedStructures } from './news-sanitize.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('sanitizeRenderedHtml', () => {
  it('sanitizes allowed descendants after removing an unknown wrapper', () => {
    const output = sanitizeRenderedHtml(
      '<unknown><img src="https://example.com/a.png" onerror="alert(1)"><a href="javascript:alert(1)">x</a></unknown>'
    )

    expect(output).toContain('<img src="https://example.com/a.png" />')
    expect(output).toContain('<a>x</a>')
    expect(output).not.toContain('onerror')
    expect(output).not.toContain('javascript:')
  })

  it('rejects empty and protocol-relative urls', () => {
    const output = sanitizeRenderedHtml('<a href=" ">empty</a><a href="//example.com">relative</a>')

    expect(output).toBe('<a>empty</a><a>relative</a>')
  })

  it('preserves supported urls and secures blank links', () => {
    const output = sanitizeRenderedHtml(
      '<a href="/news">internal</a><a href="mailto:test@example.com">mail</a><a href="https://example.com" target="_blank">external</a>'
    )

    expect(output).toContain('<a href="/news">internal</a>')
    expect(output).toContain('<a href="mailto:test@example.com">mail</a>')
    expect(output).toContain('target="_blank" rel="noopener noreferrer"')
  })

  it('keeps only supported classes and checkbox inputs', () => {
    const output = sanitizeRenderedHtml(
      '<p class="markdown-alert unknown">text</p><input type="text"><input class="task-list-item-checkbox" type="checkbox" checked>'
    )

    expect(output).toContain('<p class="markdown-alert">text</p>')
    expect(output).not.toContain('type="text"')
    expect(output).toContain('type="checkbox" checked disabled')
  })

  it('strips script, iframe and event handler payloads', () => {
    const output = sanitizeRenderedHtml(
      '<p>ok</p><script>alert(1)</script><iframe src="https://evil.example"></iframe><img src="https://example.com/a.png" onclick="steal()" onerror="steal()">'
    )

    expect(output).toContain('<p>ok</p>')
    expect(output).not.toContain('<script')
    expect(output).not.toContain('<iframe')
    expect(output).not.toContain('onclick')
    expect(output).not.toContain('onerror')
  })

  it('rejects javascript: and data: urls', () => {
    const output = sanitizeRenderedHtml(
      '<a href="javascript:alert(1)">js</a><a href="data:text/html,<script>alert(1)</script>">data</a><img src="data:text/html,evil">'
    )

    expect(output).toContain('<a>js</a>')
    expect(output).toContain('<a>data</a>')
    expect(output).not.toContain('javascript:')
    expect(output).not.toContain('data:')
  })

  it('rejects style attributes and dangerous svg descendants', () => {
    const output = sanitizeRenderedHtml(
      '<p style="color:red">styled</p><svg><style>*{display:none}</style><foreignObject><iframe></iframe></foreignObject></svg>'
    )

    expect(output).toContain('<p>styled</p>')
    expect(output).not.toContain('style=')
    expect(output).not.toContain('<foreignObject')
    expect(output).not.toContain('<iframe')
  })
})

describe('describeDroppedStructures', () => {
  /** @param {string} rendered */
  const droppedFrom = (rendered) => describeDroppedStructures(rendered, sanitizeRenderedHtml(rendered))

  it('reports nothing for syntax the whitelist actually supports', () => {
    const rendered = [
      '<table><thead><tr><th>姓名</th></tr></thead><tbody><tr><td>张三</td></tr></tbody></table>',
      '<ul class="contains-task-list"><li class="task-list-item"><input class="task-list-item-checkbox" disabled type="checkbox"> 已完成</li></ul>',
      '<p><code>行内代码</code> <kbd>Ctrl</kbd> <mark>重点</mark></p>',
      '<pre><code>普通代码块</code></pre>'
    ].join('\n')

    expect(droppedFrom(rendered)).toEqual([])
  })

  it('reports the folding structure that disappears', () => {
    expect(droppedFrom('<details><summary>剧透</summary><p>答案</p></details>')).toContain('<details> 标签 ×1')
  })

  it('reports the table alignment attribute that markdown-it produces', () => {
    const dropped = droppedFrom('<table><thead><tr><th style="text-align:right">数值</th></tr></thead></table>')

    expect(dropped).toContain('th 的 style 属性 ×1')
  })

  it('reports the code language class that has no highlighter to mount on', () => {
    expect(droppedFrom('<pre><code class="language-js">console.log(1)</code></pre>')).toContain('"language-js" 类名 ×1')
  })

  it('does not treat sanitized attribute-case normalization as a loss', () => {
    // sanitize-html 把 viewBox 规范成 viewbox,两者都算同一个属性,不该报丢弃。
    expect(droppedFrom('<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"></path></svg>')).toEqual([])
  })
})

describe('generateNewsModule', () => {
  it('excludes draft content and draft assets from production output', async () => {
    const fixture = await createFixture()
    await writeArticle(fixture.newsDirectory, 'published.md', 'Published body', false, 'published.png')
    await writeArticle(fixture.newsDirectory, 'draft.md', 'Private draft body', true, 'draft.png')

    const production = await generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile,
      entriesFile: fixture.entriesFile,
      includeDrafts: false
    })

    expect(production.output).toContain('Published body')
    expect(production.output).toContain('published.png?url')
    expect(production.output).not.toContain('Private draft body')
    expect(production.output).not.toContain('draft.png?url')

    const development = await generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile,
      entriesFile: fixture.entriesFile,
      includeDrafts: true
    })

    expect(development.output).toContain('Private draft body')
    expect(development.output).toContain('draft.png?url')
  })

  it('emits the lightweight entries list without html or assets', async () => {
    const fixture = await createFixture()
    await writeArticle(fixture.newsDirectory, 'published.md', 'Published body', false, 'published.png')
    await writeArticle(fixture.newsDirectory, 'draft.md', 'Private draft body', true, 'draft.png')

    const production = await generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile,
      entriesFile: fixture.entriesFile,
      includeDrafts: false
    })

    expect(production.entries).toEqual([
      {
        slug: 'published',
        title: 'Test article',
        author: 'Test author',
        publishedAt: '2026-01-02 03:04',
        publishedAtDateTime: '2026-01-02T03:04',
        category: 'Test',
        summary: 'Test summary'
      }
    ])

    const writtenEntries = JSON.parse(await readFile(fixture.entriesFile, 'utf-8'))
    expect(writtenEntries).toEqual(production.entries)
    expect(JSON.stringify(writtenEntries)).not.toContain('html')
    expect(JSON.stringify(writtenEntries)).not.toContain('Published body')
  })

  it('rejects missing frontmatter and invalid dates', async () => {
    const fixture = await createFixture()
    await writeFile(path.join(fixture.newsDirectory, 'missing.md'), 'No frontmatter')

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow('requires frontmatter')

    await writeFile(path.join(fixture.newsDirectory, 'missing.md'), articleSource('body', false, '', 'invalid-date'))

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow('invalid publishedAt')
  })

  // frontmatter 写错必须在构建期失败，不能退回默认值：
  // draft 的默认值是「可发布」，静默降级等于把草稿推上生产。
  const baseFrontmatter = [
    'title: Test article',
    'author: Test author',
    'publishedAt: 2026-01-02 03:04',
    'category: Test',
    'summary: Test summary'
  ]

  function frontmatterSource(extraLines, body = '正文内容') {
    return `---\n${[...baseFrontmatter, ...extraLines].join('\n')}\n---\n\n${body}\n`
  }

  async function expectGenerationFailure(fixture, source, message) {
    await writeFile(path.join(fixture.newsDirectory, 'article.md'), source)

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow(message)
  }

  it('rejects unknown frontmatter keys instead of ignoring them', async () => {
    const fixture = await createFixture()

    await expectGenerationFailure(
      fixture,
      frontmatterSource(['Draft: true']),
      'unknown frontmatter key: Draft'
    )
  })

  it('rejects flag values it cannot parse', async () => {
    const fixture = await createFixture()

    await expectGenerationFailure(
      fixture,
      frontmatterSource(['draft: 是的']),
      'invalid draft frontmatter'
    )

    await expectGenerationFailure(
      fixture,
      frontmatterSource(['draft: true # 待补']),
      'invalid draft frontmatter'
    )
  })

  it('ignores commented-out frontmatter keys', async () => {
    const fixture = await createFixture()
    await writeFile(
      path.join(fixture.newsDirectory, 'article.md'),
      frontmatterSource(['# pinned: true'])
    )

    const generated = await generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile,
      entriesFile: fixture.entriesFile
    })

    expect(generated.articles).toHaveLength(1)
    expect(generated.articles[0]?.pinned).toBe(false)
  })

  it('rejects missing assets and assets outside the news directory', async () => {
    const fixture = await createFixture()
    await writeFile(path.join(fixture.newsDirectory, 'missing.md'), articleSource('![missing](missing.png)', false))

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow()

    await writeFile(path.join(fixture.newsDirectory, 'missing.md'), articleSource('![outside](../outside.png)', false))
    await writeFile(path.join(fixture.root, 'outside.png'), 'outside')

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow('outside the news directory')
  })

  it('rejects duplicate news slugs', async () => {
    const fixture = await createFixture()
    await writeFile(path.join(fixture.newsDirectory, 'a.md'), articleSource('first article'))
    await mkdir(path.join(fixture.newsDirectory, 'a'), { recursive: true })
    await writeFile(path.join(fixture.newsDirectory, 'a', 'index.md'), articleSource('second article'))

    await expect(generateNewsModule({
      newsDirectory: fixture.newsDirectory,
      outputFile: fixture.outputFile
    })).rejects.toThrow('Duplicate news slug: a')
  })
})

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'bluearchive-news-'))
  const newsDirectory = path.join(root, 'news')
  const outputFile = path.join(root, 'news.generated.ts')
  const entriesFile = path.join(root, 'news-entries.generated.json')
  temporaryDirectories.push(root)
  await mkdir(newsDirectory, { recursive: true })
  return { root, newsDirectory, outputFile, entriesFile }
}

async function writeArticle(newsDirectory, filename, body, draft, assetName) {
  await writeFile(path.join(newsDirectory, filename), articleSource(`${body}\n\n![asset](${assetName})`, draft))
  await writeFile(path.join(newsDirectory, assetName), assetName)
}

function articleSource(body, draft, assetName = '', publishedAt = '2026-01-02 03:04') {
  void assetName
  return `---
title: Test article
author: Test author
publishedAt: ${publishedAt}
category: Test
summary: Test summary
pinned: false
draft: ${draft ?? false}
---

${body}
`
}
