<template>
  <span class="draft-badge">草稿</span>
</template>

<style scoped>
.draft-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 32px;
  padding: var(--pill-padding);
  border: 1px solid var(--color-border);
  border-radius: var(--md2-radius-button);
  background: var(--color-neutral-soft);
  color: var(--color-text-muted);
  font-size: var(--md2-type-caption);
  font-weight: var(--font-weight-action);
  line-height: 1;
}
</style>
