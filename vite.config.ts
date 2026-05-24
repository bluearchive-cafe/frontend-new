import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? '/frontend-new/' : '/'

export default defineConfig({
  base: githubPagesBase,
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
