<template>
  <v-app-bar class="app-header" color="surface" elevation="4" height="56">
    <v-container class="header-inner" max-width="1120">
      <v-btn
        class="mobile-menu"
        icon="$menu"
        variant="text"
        aria-label="打开菜单"
        ref="menuTrigger"
        @click="drawer = true"
      />

      <RouterLink class="brand" to="/" aria-label="BlueArchive.Cafe 首页">
        <span>蔚蓝咖啡厅</span>
      </RouterLink>

      <v-tabs
        class="desktop-tabs"
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
        >
          {{ item.label }}
        </v-tab>
      </v-tabs>

    </v-container>

    <v-progress-linear
      :active="isToolbarLoading"
      absolute
      color="primary"
      height="3"
      indeterminate
      location="bottom"
      rounded
    />
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    class="app-drawer"
    temporary
    location="left"
    color="surface"
    width="280"
    scrim="rgba(0, 0, 0, 0.46)"
    @keydown.esc="closeDrawer"
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
        @click="closeDrawer"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useToolbarLoader } from '../utils/toolbar-loader'

const drawer = ref(false)
const menuTrigger = ref<{ $el?: HTMLElement } | null>(null)
const route = useRoute()
const { isToolbarLoading } = useToolbarLoader()

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
    label: '下载',
    value: 'download',
    to: '/download',
    isActive: () => route.path === '/download'
  },
  {
    label: '状态',
    value: 'status',
    to: '/status',
    isActive: () => route.path === '/status'
  },
  {
    label: '关于',
    value: 'about',
    to: '/about',
    isActive: () => route.path === '/about'
  }
])

function closeDrawer() {
  drawer.value = false
  void nextTick(() => menuTrigger.value?.$el?.focus())
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && drawer.value) {
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.app-header {
  border-bottom: 0;
  box-shadow: var(--md2-elevation-app-bar);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  height: 100%;
  padding-block: 0;
  padding-inline: var(--space-5);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--control-gap);
  color: var(--color-text);
  font-size: 18px;
  font-weight: var(--font-weight-action);
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
  padding-inline: var(--space-4);
  color: var(--color-nav-muted);
  font-size: var(--type-action);
  font-weight: var(--font-weight-action);
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

.nav-tab.v-tab--selected {
  color: var(--color-text);
}

.mobile-menu {
  display: none;
}

.app-drawer {
  top: 0 !important;
  height: 100dvh !important;
  border-left: 0;
  box-shadow: var(--md2-elevation-drawer);
  z-index: 2400 !important;
}

:global(.v-navigation-drawer__scrim) {
  z-index: 2399 !important;
}

.drawer-title {
  color: var(--color-text);
  font-size: 16px;
  font-weight: var(--font-weight-action);
}

.drawer-list {
  padding: var(--space-3);
}

.drawer-list :deep(.v-list-item) {
  min-height: 48px;
  margin-bottom: var(--space-1);
}

@media (max-width: 720px) {
  .header-inner {
    gap: var(--space-5);
    padding-inline: var(--space-1);
  }

  .brand {
    font-size: 20px;
    font-weight: 500;
  }

  .desktop-tabs {
    display: none;
  }

  .mobile-menu {
    display: inline-grid;
    height: 48px !important;
    min-height: 48px;
  }
}
</style>
