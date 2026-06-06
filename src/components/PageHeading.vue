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
  animation: fade-slide-up 520ms ease both;
}

.page-heading p {
  margin: 0 0 var(--inline-gap);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 800;
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
  font-size: 16px;
  line-height: 1.8;
}

@media (prefers-reduced-motion: reduce) {
  .page-heading {
    animation: none;
  }
}
</style>
