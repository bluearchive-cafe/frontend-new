// Redirect www to apex domain before any app initialization
if (shouldRedirectToApex(window.location.hostname)) {
  window.location.replace(buildApexRedirectUrl(window.location))
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
  mdiArrowDown,
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
import { buildApexRedirectUrl, shouldRedirectToApex } from './utils/apex-redirect'
import { enableClickSound } from './utils/easter-egg'
import { printConsoleBrand } from './utils/console-brand'

printConsoleBrand()

// 1% 概率彩蛋音效，挂载前就位。
enableClickSound()

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
      arrowDown: mdiArrowDown,
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
      rounded: 'sm',
      height: 48
    },
    VAppBarNavIcon: {
      rounded: 'circle'
    },
    VCard: {
      rounded: 'lg'
    }
  }
})

// Mount the Vue app after router and Vuetify are installed.
createApp(App).use(router).use(vuetify).mount('#app')
