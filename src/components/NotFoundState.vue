<template>
  <v-card class="not-found-state" elevation="0">
    <v-card-text class="not-found-content">
      <p class="status-code">404</p>
      <h1>{{ title }}</h1>
      <p class="description">{{ description }}</p>

      <div class="actions">
        <v-btn
          color="primary"
          size="large"
          :to="primaryTo"
          :prepend-icon="primaryPrependIcon"
          :append-icon="primaryAppendIcon"
        >
          {{ primaryLabel }}
        </v-btn>
        <v-btn
          v-if="secondaryLabel && secondaryTo"
          variant="outlined"
          size="large"
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
  border: 1px solid var(--color-border);
  background:
    radial-gradient(circle at 88% 12%, var(--color-primary-soft), transparent 34%),
    var(--gradient-card);
}

.not-found-content {
  padding: clamp(30px, 5vw, 52px) !important;
}

.status-code {
  margin: 0 0 12px;
  color: var(--color-primary);
  font-size: 14px;
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
  margin: 18px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

@media (max-width: 420px) {
  .actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
