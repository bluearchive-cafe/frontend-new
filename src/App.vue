<template>
  <v-app>
    <AppHeader />

    <v-main>
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
