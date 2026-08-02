<template>
  <div class="page-heading" :style="{ maxWidth }">
    <p>{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <span>{{ description }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
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

.page-heading p {
  margin: 0 0 var(--inline-gap);
  color: var(--color-primary);
  font-size: var(--type-overline);
  font-weight: var(--font-weight-overline);
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.page-heading span {
  display: block;
  margin-top: 16px;
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
