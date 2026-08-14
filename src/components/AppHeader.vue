<template>
  <v-app-bar class="app-header" color="surface" elevation="4" height="56">
    <v-app-bar-nav-icon
      class="mobile-menu"
      aria-label="打开菜单"
      :aria-expanded="drawer ? 'true' : 'false'"
      aria-controls="app-drawer"
      ref="menuTrigger"
      @click="drawer = true"
    />

    <v-toolbar-title class="mobile-brand">
      <RouterLink to="/" aria-label="BlueArchive.Cafe 首页">蔚蓝咖啡厅</RouterLink>
    </v-toolbar-title>

    <v-container class="header-inner" max-width="1120">
      <v-toolbar-title class="brand">
        <RouterLink to="/" aria-label="BlueArchive.Cafe 首页">蔚蓝咖啡厅</RouterLink>
      </v-toolbar-title>

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
    id="app-drawer"
    v-model="drawer"
    temporary
    location="left"
    color="surface"
    scrim="rgba(0, 0, 0, 0.46)"
    retain-focus
    @keydown.esc="closeDrawer"
  >
    <v-list>
      <v-list-item
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        :title="item.label"
        :active="item.isActive()"
        color="primary"
        @click="() => closeDrawerFromDestination(item.to)"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { staticRoutes } from '../shared/site-routes.mjs'
import { useToolbarLoader } from '../utils/toolbar-loader'

const drawer = ref(false)
const menuTrigger = ref<{ $el?: HTMLElement } | null>(null)
const route = useRoute()
const { isToolbarLoading } = useToolbarLoader()
let closeByRouteChange = false

// MD2 modal drawer: opening moves focus to the active destination, closing
// returns it to the hamburger button — unless the close came from choosing a
// destination, in which case focus follows the navigation to the new page.
watch(drawer, (open) => {
  if (open) {
    closeByRouteChange = false
    void nextTick(() => {
      document.getElementById('app-drawer')
        ?.querySelector<HTMLElement>('.v-list-item--active')?.focus()
    })
  } else if (!closeByRouteChange) {
    void nextTick(() => menuTrigger.value?.$el?.focus())
  }
})

// 导航项从共享路由表派生:path/标签与 router 注册保持单一来源;
// headerNavOrder 只表达展示顺序,不重复任何路由知识。
// 激活判定:首页仅精确匹配,其余路由同时匹配其子路径(如 /news/:slug)。
const headerNavOrder = ['home', 'news', 'download', 'status', 'about'] as const

function matchesPath(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const navItems = computed(() =>
  headerNavOrder
    .map((name) => staticRoutes.find((item) => item.name === name))
    .filter((item) => item !== undefined)
    .map((item) => ({
      label: item.label,
      value: item.name,
      to: item.path,
      isActive: () => matchesPath(item.path)
    }))
)

function closeDrawer() {
  drawer.value = false
}

// The drawer item is a router link: the click handler runs before the
// navigation, so only a destination pointing elsewhere really navigates and
// focus must stay on the new page. A same-route click merely closes the
// drawer, which restores focus to the hamburger.
function closeDrawerFromDestination(to: string) {
  closeByRouteChange = to !== route.path
  closeDrawer()
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
.app-header.v-app-bar.v-toolbar {
  border-bottom: 0;
  background-color: rgba(var(--v-theme-surface), 0.82) !important;
  box-shadow: var(--md2-elevation-app-bar);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
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
  flex: 0 0 auto;
  color: var(--color-text);
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
  font-size: var(--md2-type-subtitle1);
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

.mobile-menu,
.mobile-brand {
  display: none;
}

@media (max-width: 720px) {
  .header-inner {
    display: none;
  }

  .desktop-tabs {
    display: none;
  }

  .mobile-menu,
  .mobile-brand {
    display: flex;
  }
}
</style>
