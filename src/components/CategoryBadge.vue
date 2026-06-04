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
  min-height: 28px;
  padding: var(--pill-padding);
  border: 1px solid var(--color-primary-border);
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
