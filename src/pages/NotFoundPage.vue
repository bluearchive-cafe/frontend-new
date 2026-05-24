<template>
  <section class="not-found-page">
    <v-container max-width="860">
      <div class="not-found-shell">
        <p class="status-code">404</p>
        <h1>页面不存在</h1>
        <p class="description">
          这个地址可能已经移动、删除，或者暂时还没有发布。
        </p>

        <div class="actions">
          <v-btn color="primary" size="large" to="/" prepend-icon="$arrowLeft">
            返回首页
          </v-btn>
          <v-btn variant="outlined" size="large" to="/news" append-icon="$arrowRight">
            查看新闻
          </v-btn>
        </div>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  min-height: 72vh;
  padding: 96px 0 88px;
  background:
    radial-gradient(circle at 82% 12%, var(--color-primary-soft), transparent 30%),
    linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 100%);
}

.not-found-shell {
  max-width: 640px;
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
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.05;
}

.description {
  max-width: 520px;
  margin: 20px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

@media (max-width: 420px) {
  .actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
