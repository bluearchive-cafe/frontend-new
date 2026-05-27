<template>
  <v-app-bar class="app-header" color="surface" elevation="0" height="56">
    <v-container class="header-inner" max-width="1120">
      <RouterLink class="brand" to="/" aria-label="BlueArchive.Cafe 首页">
        <span>蔚蓝咖啡厅</span>
      </RouterLink>

      <v-tabs
        class="desktop-tabs"
        :model-value="activeNavValue"
        color="primary"
        slider-color="primary"
        bg-color="transparent"
        density="comfortable"
        height="56"
        :show-arrows="false"
        aria-label="主导航"
      >
        <v-tab
          v-for="item in navItems"
          :key="item.label"
          :value="item.value"
          :to="item.to"
          class="nav-tab"
          height="56"
          :ripple="false"
        >
          {{ item.label }}
        </v-tab>
      </v-tabs>

      <v-btn
        class="mobile-menu"
        icon="$menu"
        variant="text"
        aria-label="打开菜单"
        @click="drawer = true"
      />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    class="app-drawer"
    temporary
    location="right"
    color="surface"
    width="280"
    scrim="rgba(0, 0, 0, 0.46)"
  >
    <v-toolbar color="surface" density="comfortable">
      <v-toolbar-title class="drawer-title">站点导航</v-toolbar-title>
    </v-toolbar>

    <v-divider />

    <v-list class="drawer-list" nav density="comfortable">
      <v-list-item
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        :title="item.label"
        :active="item.isActive()"
        color="primary"
        rounded="lg"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const drawer = ref(false)
const route = useRoute()

const navItems = computed(() => [
  {
    label: '首页',
    value: 'home',
    to: '/',
    isActive: () => route.path === '/'
  },
  {
    label: '新闻',
    value: 'news',
    to: '/news',
    isActive: () => route.path.startsWith('/news')
  },
  {
    label: '关于',
    value: 'about',
    to: '/about',
    isActive: () => route.path === '/about'
  }
])

const activeNavValue = computed(() => navItems.value.find((item) => item.isActive())?.value)
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;
  padding-block: 0;
  padding-inline: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-size: 18px;
  font-weight: 700;
}

.desktop-tabs {
  align-self: stretch;
  flex: 0 0 auto;
  margin-left: auto;
  max-width: max-content;
}

.desktop-tabs :deep(.v-slide-group),
.desktop-tabs :deep(.v-slide-group__container),
.desktop-tabs :deep(.v-slide-group__content) {
  height: 100%;
}

.desktop-tabs :deep(.v-slide-group__content) {
  align-items: stretch;
}

.nav-tab {
  min-width: 72px;
  height: 100%;
  border-radius: 0 !important;
  padding-inline: 14px;
  color: var(--color-nav-muted);
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.nav-tab :deep(.v-btn__underlay),
.nav-tab :deep(.v-btn__overlay) {
  border-radius: 0;
}

.nav-tab :deep(.v-btn__content) {
  height: 100%;
  align-items: center;
}

.nav-tab :deep(.v-btn__overlay) {
  opacity: 0;
}

.nav-tab:hover :deep(.v-btn__overlay) {
  background: var(--color-primary);
  opacity: 0.08;
}

.nav-tab.v-tab--selected {
  color: var(--color-text);
}

.mobile-menu {
  display: none;
  margin-left: auto;
}

.app-drawer {
  top: 0 !important;
  height: 100dvh !important;
  border-left: 1px solid var(--color-border);
  z-index: 2400 !important;
}

:global(.v-navigation-drawer__scrim) {
  z-index: 2399 !important;
}

.drawer-title {
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.drawer-list {
  padding: 12px;
}

.drawer-list :deep(.v-list-item) {
  min-height: 44px;
  margin-bottom: 4px;
}

@media (max-width: 720px) {
  .desktop-tabs {
    display: none;
  }

  .mobile-menu {
    display: inline-grid;
  }
}
</style>
