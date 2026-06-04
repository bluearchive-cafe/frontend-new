<template>
  <v-app>
    <AppHeader />

    <v-main class="app-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </v-main>

    <SiteFooter />
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<style scoped>
.app-main {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-deep);
}

.app-main > :deep(*) {
  flex: 1 0 auto;
  width: 100%;
}
</style>
