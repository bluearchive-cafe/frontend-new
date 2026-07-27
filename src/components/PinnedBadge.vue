<template>
  <span class="pinned-badge">置顶</span>
</template>

<style scoped>
.pinned-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 32px;
  padding: var(--pill-padding);
  border: 1px solid var(--color-accent-border);
  border-radius: var(--md2-radius-button);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1;
}
</style>
