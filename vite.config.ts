import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { configDefaults, defineConfig } from 'vitest/config'

// Vite configuration for the Vue and Vuetify single-page app.
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string
}
const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? '/frontend-new/' : '/'
const newsDirectory = path.resolve('src/content/news')
// Prefer the CI-provided short SHA; local builds fall back to the current Git commit.
const commitSha =
  process.env.GITHUB_SHA?.slice(0, 7) ??
  (() => {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
    } catch {
      return 'local'
    }
  })()

export default defineConfig({
  // GitHub Pages serves this repository under /frontend-new/ in Pages builds.
  base: githubPagesBase,
  define: {
    __APP_INFO__: JSON.stringify({
      name: 'BlueArchive.Cafe',
      version: packageJson.version,
      buildTime: new Date().toISOString(),
      commitSha,
      developer: 'BlueArchive.Cafe Team, KFACBT, Sensei'
    })
  },
  build: {
    rolldownOptions: {
      output: {
        // Keep the Vue framework stack in a stable shared chunk with Rolldown.
        codeSplitting: {
          groups: [
            {
              name: 'vuetify',
              test: /node_modules[\\/](?:vuetify|vue|vue-router)[\\/]/
            }
          ]
        }
      }
    }
  },
  test: {
    exclude: [...configDefaults.exclude, '**/.worktrees/**']
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Vuetify still emits Sass if() deprecation warnings through its SCSS stack.
        silenceDeprecations: ['if-function']
      }
    }
  },
  plugins: [
    {
      name: 'news-content-watcher',
      configureServer(server) {
        let generation: Promise<unknown> = Promise.resolve()

        server.watcher.on('all', (_event, filePath) => {
          const relativePath = path.relative(newsDirectory, filePath)

          if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            return
          }

          // 内容生成管线(含 markdown-it 与 sanitize-html)仅在开发监听
          // 需要时按需加载,避免生产构建加载无关的重依赖。
          generation = generation
            .then(() => import('./scripts/news-content.mjs').then(({ generateNewsModule }) => generateNewsModule({ includeDrafts: true })))
            .then(() => server.ws.send({ type: 'full-reload' }))
            .catch((error: unknown) => {
              server.config.logger.error(`News content generation failed: ${String(error)}`)
            })
        })
      }
    },
    vue(),
    vuetify({
      autoImport: process.env.VITEST ? false : true,
      styles: { configFile: 'src/styles/settings.scss' }
    })
  ]
})
