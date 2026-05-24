import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string
}
const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? '/frontend-new/' : '/'
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
        manualChunks: {
          markdown: ['markdown-it'],
          vuetify: ['vuetify', 'vue', 'vue-router']
        }
      }
    }
  },
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' }
    })
  ]
})
