// Redirect www to apex domain before any app initialization
if (window.location.hostname === 'www.bluearchive.cafe') {
  window.location.replace('https://bluearchive.cafe' + window.location.pathname + window.location.search + window.location.hash)
}

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
  mdiRefresh,
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
import { blueArchiveDarkTheme } from './theme'
import { printConsoleBrand } from './utils/console-brand'

printConsoleBrand()

// Vuetify is configured here so icon aliases, theme tokens, and component defaults are app-wide.
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    // Only icons referenced by the app are registered as aliases.
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
      refresh: mdiRefresh,
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
    // Site palette mirrors the BlueArchive.Cafe dark visual system.
    themes: {
      blueArchiveDark: blueArchiveDarkTheme
    }
  },
  defaults: {
    // Shared component defaults keep common Vuetify controls visually consistent.
    VBtn: {
      rounded: 'lg',
      height: 42
    },
    VCard: {
      rounded: 'lg'
    }
  }
})

// Mount the Vue app after router and Vuetify are installed.
createApp(App).use(router).use(vuetify).mount('#app')
