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
  min-height: var(--page-min-height);
  padding-block: 88px;
  background: var(--page-background-fill);
}

.not-found-page :deep(.v-container) {
  width: 100%;
}
</style>
