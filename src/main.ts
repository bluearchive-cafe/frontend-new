import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './styles/global.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'blueArchiveDark',
    themes: {
      blueArchiveDark: {
        dark: true,
        colors: {
          background: '#191d24',
          surface: '#242932',
          'surface-bright': '#303746',
          primary: '#29aeea',
          secondary: '#8bd8ff',
          accent: '#ffd76a',
          error: '#ff6b89',
          info: '#6bbdff',
          success: '#78d6a3',
          warning: '#ffd76a'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      height: 42
    },
    VCard: {
      rounded: 'lg'
    }
  }
})

createApp(App).use(router).use(vuetify).mount('#app')
