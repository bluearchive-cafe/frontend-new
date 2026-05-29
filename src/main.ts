import 'vuetify/styles'
import './styles/global.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import {
  mdiAccountOutline,
  mdiAccountGroupOutline,
  mdiArrowLeft,
  mdiArrowRight,
  mdiCalendarClockOutline,
  mdiChevronRight,
  mdiFileDocumentEditOutline,
  mdiGithub,
  mdiHeartOutline,
  mdiLightningBolt,
  mdiMenu,
  mdiShieldCheckOutline,
  mdiTagOutline,
  mdiTextBoxOutline,
  mdiVideoOutline
} from '@mdi/js'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import App from './App.vue'
import router from './router'
import { printConsoleBrand } from './utils/console-brand'

printConsoleBrand()

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      accountOutline: mdiAccountOutline,
      accountGroupOutline: mdiAccountGroupOutline,
      arrowLeft: mdiArrowLeft,
      arrowRight: mdiArrowRight,
      calendarClockOutline: mdiCalendarClockOutline,
      chevronRight: mdiChevronRight,
      fileDocumentEditOutline: mdiFileDocumentEditOutline,
      github: mdiGithub,
      heartOutline: mdiHeartOutline,
      lightningBolt: mdiLightningBolt,
      menu: mdiMenu,
      shieldCheckOutline: mdiShieldCheckOutline,
      tagOutline: mdiTagOutline,
      textBoxOutline: mdiTextBoxOutline,
      videoOutline: mdiVideoOutline
    },
    sets: {
      mdi
    }
  },
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
