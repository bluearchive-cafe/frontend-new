import 'vuetify/styles'
import './styles/fonts.scss'
import './styles/global.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import {
  mdiAccountOutline,
  mdiAccountGroupOutline,
  mdiAlertCircleOutline,
  mdiAndroid,
  mdiApple,
  mdiAppleIos,
  mdiArrowLeft,
  mdiArrowRight,
  mdiBookOpenOutline,
  mdiCalendarClockOutline,
  mdiChevronDown,
  mdiChevronRight,
  mdiDownload,
  mdiFileDocumentEditOutline,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiLightningBolt,
  mdiLinkVariant,
  mdiMenu,
  mdiMicrosoftWindows,
  mdiOpenInNew,
  mdiTagOutline,
  mdiTextBoxOutline,
  mdiVolumeHigh,
  mdiImageOutline,
  mdiVideoOutline,
  mdiInformationOutline,
  mdiMessageAlertOutline
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
      alertCircleOutline: mdiAlertCircleOutline,
      android: mdiAndroid,
      apple: mdiApple,
      appleIos: mdiAppleIos,
      arrowLeft: mdiArrowLeft,
      arrowRight: mdiArrowRight,
      bookOpenOutline: mdiBookOpenOutline,
      calendarClockOutline: mdiCalendarClockOutline,
      chevronDown: mdiChevronDown,
      chevronRight: mdiChevronRight,
      download: mdiDownload,
      fileDocumentEditOutline: mdiFileDocumentEditOutline,
      github: mdiGithub,
      helpCircleOutline: mdiHelpCircleOutline,
      lightningBolt: mdiLightningBolt,
      linkVariant: mdiLinkVariant,
      menu: mdiMenu,
      microsoftWindows: mdiMicrosoftWindows,
      openInNew: mdiOpenInNew,
      tagOutline: mdiTagOutline,
      textBoxOutline: mdiTextBoxOutline,
      volumeHighOutline: mdiVolumeHigh,
      imageOutline: mdiImageOutline,
      videoOutline: mdiVideoOutline,
      infoOutline: mdiInformationOutline,
      messageAlertOutline: mdiMessageAlertOutline
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
