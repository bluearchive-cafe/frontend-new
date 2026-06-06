<template>
  <span class="draft-badge">草稿</span>
</template>

<style scoped>
.draft-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: var(--pill-padding);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-neutral-soft);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}
</style>
