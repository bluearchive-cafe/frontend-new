// www → apex 跳转放在模块体第一条语句。ES Module 会先求值下面的 import，
// 所以它的真实语义是"应用代码一行都还没跑"，而不是"依赖加载之前"。
const redirectingToApex = shouldRedirectToApex(window.location.hostname)

if (redirectingToApex) {
  window.location.replace(buildApexRedirectUrl(window.location))
}

import 'vuetify/styles'
import './styles/fonts.scss'
import './styles/global.css'

import { createApp } from 'vue'
import { createVuetify, type VuetifyOptions } from 'vuetify'
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
  mdiLinkVariant,
  mdiLinux,
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
import { blueArchiveDarkTheme, blueArchiveLightTheme } from './theme'
import { buildApexRedirectUrl, shouldRedirectToApex } from './utils/apex-redirect'
import { enableClickSound } from './utils/easter-egg'
import { printConsoleBrand } from './utils/console-brand'

// 配置在此声明，实例只在真正渲染的分支里创建（见文件末尾）。
const vuetifyOptions: VuetifyOptions = {
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
      linkVariant: mdiLinkVariant,
      linux: mdiLinux,
      menu: mdiMenu,
      microsoftWindows: mdiMicrosoftWindows,
      openInNew: mdiOpenInNew,
      refresh: mdiRefresh,
      tagOutline: mdiTagOutline,
      textBoxOutline: mdiTextBoxOutline,
      // MDI 无 volume-high 描边变体,语音包面板使用填充版。
      volumeHigh: mdiVolumeHigh,
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
    defaultTheme: 'system',
    themes: {
      dark: blueArchiveDarkTheme,
      light: blueArchiveLightTheme
    }
  },
  defaults: {
    // 按钮高度/圆角、卡片圆角等视觉参数的单一来源在 styles/settings.scss
    // 与 styles/global.css(VBtn/VCard 的 !important 覆盖与组件 Sass 变量),
    // 此处不再重复设置,避免双源漂移。
    VAppBarNavIcon: {
      rounded: 'circle'
    }
  }
}

// 跳转已发起时到此为止：不创建 Vuetify、不挂载应用。www 流量仍会付出这一趟
// 已下载的模块图（ES Module 先求值 import），但不会再跑一遍应用初始化。
if (!redirectingToApex) {
  printConsoleBrand()

  // 1% 概率彩蛋音效，挂载前就位。
  enableClickSound()

  // Mount the Vue app after router and Vuetify are installed.
  createApp(App).use(router).use(createVuetify(vuetifyOptions)).mount('#app')
}
