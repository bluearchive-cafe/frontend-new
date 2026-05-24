<template>
  <v-app-bar class="app-header" color="surface" elevation="0" height="56">
    <v-container class="header-inner" max-width="1120">
      <RouterLink class="brand" to="/" aria-label="BlueArchive.Cafe 首页">
        <span>蔚蓝咖啡厅</span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <v-btn
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          :class="['nav-button', { 'is-active': item.isActive() }]"
          variant="text"
        >
          {{ item.label }}
        </v-btn>
      </nav>

      <v-btn
        class="mobile-menu"
        icon="$menu"
        variant="text"
        aria-label="打开菜单"
        @click="drawer = true"
      />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right" color="surface">
    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        :title="item.label"
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
    to: '/',
    isActive: () => route.path === '/'
  },
  {
    label: '新闻',
    to: '/news',
    isActive: () => route.path.startsWith('/news')
  },
  {
    label: '关于',
    to: '/about',
    isActive: () => route.path === '/about'
  }
])
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
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

.desktop-nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.nav-button {
  position: relative;
  color: var(--color-nav-muted);
  font-weight: 600;
}

.nav-button.is-active {
  background: rgba(0, 0, 0, 0.26);
  color: var(--color-text);
}

.nav-button.is-active::after {
  position: absolute;
  right: 16px;
  bottom: 0;
  left: 16px;
  height: 2px;
  background: var(--color-primary);
  content: "";
}

.mobile-menu {
  display: none;
  margin-left: auto;
}

@media (max-width: 720px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu {
    display: inline-grid;
  }
}
</style>
