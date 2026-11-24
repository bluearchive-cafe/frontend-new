<template>
  <div class="page-heading" :style="{ maxWidth }">
    <h1>{{ title }}</h1>
    <span>{{ description }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    maxWidth?: string
  }>(),
  {
    maxWidth: '720px'
  }
)
</script>

<style scoped>
.page-heading {
  margin-bottom: var(--page-heading-gap);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
}

.page-heading h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.25;
}

.page-heading span {
  display: block;
  margin-top: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--type-body);
  line-height: 1.8;
}

@media (prefers-reduced-motion: reduce) {
  .page-heading {
    animation: none;
  }
}
</style>
