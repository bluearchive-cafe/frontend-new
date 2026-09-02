import { mkdtemp, mkdir, rm, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  generateNewsModule,
  sanitizeRenderedHtml
} from './news-content.mjs'

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
draft: ${draft}
---

${body}
`
}
