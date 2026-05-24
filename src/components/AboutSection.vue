<template>
  <section class="section about-section">
    <v-container max-width="1120">
      <div class="about-layout">
        <div class="about-copy">
          <h2>关于 BlueArchive.Cafe</h2>
          <p>
            BlueArchive.Cafe 是一个非官方蔚蓝档案主题站点，目标是把公告、教程、资源入口和项目说明整理到一个清晰、易维护的位置。
          </p>
          <p>
            当前版本优先搭好站点结构和 Markdown 内容流程，后续会逐步补齐更完整的教程、下载指引、更新说明与免责声明。
          </p>
        </div>

        <div class="about-list" aria-label="站点说明">
          <div v-for="item in aboutItems" :key="item.title" class="about-row">
            <v-icon :icon="item.icon" color="primary" size="24" aria-hidden="true" />
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const aboutItems = [
  {
    icon: '$heartOutline',
    title: '非官方项目',
    description: '站点内容面向社区整理，不代表游戏官方立场。'
  },
  {
    icon: '$fileDocumentEditOutline',
    title: 'Markdown 驱动',
    description: '新闻和后续文档内容优先使用 Markdown 维护，方便持续补充。'
  },
  {
    icon: '$shieldCheckOutline',
    title: '清晰说明',
    description: '后续会补齐资源来源、使用边界和免责声明，避免信息含混。'
  }
]
</script>

<style scoped>
.section {
  min-height: 72vh;
  padding: 96px 0 88px;
}

.about-section {
  background:
    radial-gradient(circle at 84% 12%, var(--color-primary-soft), transparent 30%),
    linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg) 100%);
}

.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1fr);
  gap: 48px;
  align-items: start;
}

.about-copy h2 {
  max-width: 520px;
  margin: 0;
  color: var(--color-text);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 850;
  line-height: 1.2;
}

.about-copy p {
  max-width: 560px;
  margin: 18px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.85;
}

.about-list {
  display: grid;
  gap: 14px;
}

.about-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-card-soft);
}

.about-row h3 {
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: 18px;
}

.about-row p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.65;
}

@media (max-width: 840px) {
  .about-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
