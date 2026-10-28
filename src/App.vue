<template>
  <v-app>
    <a class="skip-link" href="#main-content">跳转到主内容</a>

    <AppHeader />

    <v-main id="main-content" class="app-main">
      <div class="page-viewport">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" @before-leave="disableLeavingPage" @leave-cancelled="restoreLeavingPage">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </div>
    </v-main>

    <SiteFooter />
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

function disableLeavingPage(element: Element) {
  element.setAttribute('inert', '')
}

function restoreLeavingPage(element: Element) {
  element.removeAttribute('inert')
}
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: 0;
  left: 16px;
  z-index: 2500;
  padding: 10px 20px;
  border-radius: 0 0 var(--radius-card) var(--radius-card);
  background: var(--color-primary);
  color: rgb(var(--v-theme-on-primary));
  font-size: var(--md2-type-button);
  font-weight: 700;
  text-decoration: none;
  translate: 0 -100%;
  transition: translate var(--md2-duration-shorter) var(--md2-easing-standard);
}

.skip-link:focus-visible {
  translate: 0 0;
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.app-main {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-deep);
}

.app-main > :deep(*) {
  flex: 1 0 auto;
  width: 100%;
}

.page-viewport {
  position: relative;
  display: grid;
  overflow: clip;
}

.page-viewport > :deep(*) {
  grid-area: 1 / 1;
  min-width: 0;
}

/* 新页面决定容器高度，离场页覆盖在同一位置，避免两页上下堆叠。 */
.page-viewport > :deep(.page-leave-active) {
  position: absolute;
  top: 0;
  inset-inline: 0;
  pointer-events: none;
}
</style>
