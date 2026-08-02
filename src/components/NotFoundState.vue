<template>
  <v-card class="not-found-state" elevation="1">
    <v-card-text class="not-found-content">
      <p class="status-code">404</p>
      <h1>{{ title }}</h1>
      <p class="description">{{ description }}</p>

      <div class="actions">
        <v-btn
          color="primary"
          :to="primaryTo"
          :prepend-icon="primaryPrependIcon"
          :append-icon="primaryAppendIcon"
        >
          {{ primaryLabel }}
        </v-btn>
        <v-btn
          v-if="secondaryLabel && secondaryTo"
          variant="outlined"
          :to="secondaryTo"
          :prepend-icon="secondaryPrependIcon"
          :append-icon="secondaryAppendIcon"
        >
          {{ secondaryLabel }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    primaryLabel: string
    primaryTo: string
    primaryPrependIcon?: string
    primaryAppendIcon?: string
    secondaryLabel?: string
    secondaryTo?: string
    secondaryPrependIcon?: string
    secondaryAppendIcon?: string
  }>(),
  {
    primaryPrependIcon: undefined,
    primaryAppendIcon: undefined,
    secondaryLabel: undefined,
    secondaryTo: undefined,
    secondaryPrependIcon: undefined,
    secondaryAppendIcon: undefined
  }
)
</script>

<style scoped>
.not-found-state {
  width: 100%;
  background: var(--color-card);
}

.not-found-content {
  padding: var(--space-8) !important;
}

.status-code {
  margin: 0 0 var(--control-gap);
  color: var(--color-primary);
  font-size: var(--type-meta);
  font-weight: var(--font-weight-heading);
  letter-spacing: 0;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-article-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.18;
}

.description {
  max-width: 560px;
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  font-size: var(--type-body);
  line-height: 1.8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

@media (max-width: 420px) {
  .actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
