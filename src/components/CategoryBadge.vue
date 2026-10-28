<template>
  <span class="category-badge">
    <v-icon icon="$tagOutline" size="16" aria-hidden="true" />
    <span class="sr-only">分类：</span>
    <span>{{ category }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  category: string
}>()
</script>

<style scoped>
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--compact-gap);
  width: fit-content;
  min-height: var(--badge-height);
  padding: var(--pill-padding);
  border-radius: var(--md2-radius-button);
  background: var(--color-neutral-soft);
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1;
}
</style>
