<template>
  <span class="pinned-badge">置顶</span>
</template>

<style scoped>
.pinned-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: var(--badge-height);
  padding: var(--pill-padding);
  border: var(--border-decorative) solid var(--color-accent-border);
  border-radius: var(--md2-radius-button);
  color: var(--color-accent);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1;
}
</style>
