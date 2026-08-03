<template>
  <div class="home-page">
    <HeroSection />
    <NewsSection />
    <FloatingScrollHint />
  </div>
</template>

<script setup lang="ts">
import FloatingScrollHint from '../components/FloatingScrollHint.vue'
import HeroSection from '../components/HeroSection.vue'
import NewsSection from '../components/NewsSection.vue'
</script>

<style scoped>
.home-page {
  --home-module-fill: color-mix(in srgb, var(--md2-background) 88%, #52698f);
  background: var(--home-module-fill);
}
</style>
