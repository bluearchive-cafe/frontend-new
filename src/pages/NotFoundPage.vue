<template>
  <section class="not-found-page">
    <v-container max-width="860">
      <NotFoundState
        title="页面不存在"
        description="这个地址可能已经移动、删除，或者暂时还没有发布。你可以回到首页重新开始，也可以查看最近的新闻公告。"
        primary-label="返回首页"
        primary-to="/"
        primary-prepend-icon="$arrowLeft"
        secondary-label="查看新闻"
        secondary-to="/news"
        secondary-append-icon="$arrowRight"
      />
    </v-container>
  </section>
</template>

<script setup lang="ts">
import NotFoundState from '../components/NotFoundState.vue'
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  min-height: 72vh;
  padding: 88px 0;
  background:
    radial-gradient(circle at 82% 12%, var(--color-primary-soft), transparent 30%),
    linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 100%);
}

.not-found-page :deep(.v-container) {
  width: 100%;
}
</style>
