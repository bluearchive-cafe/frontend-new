import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

// Vite configuration for the Vue and Vuetify single-page app.
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string
}
const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? '/frontend-new/' : '/'
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
    rollupOptions: {
      output: {
        // Keep Markdown parsing and Vuetify framework code in stable shared chunks.
        manualChunks: {
          markdown: ['markdown-it'],
          vuetify: ['vuetify', 'vue', 'vue-router']
        }
      }
    }
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
    // Vue SFC support and Vuetify auto imports/styles are the only build-time plugins.
    vue(),
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' }
    })
  ]
})
