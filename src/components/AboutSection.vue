<template>
  <section class="section about-section">
    <v-container max-width="1120">
      <div class="about-layout">
        <div class="about-copy">
          <h2>关于本站</h2>
          <p>
            蔚蓝咖啡厅 是游戏《ブルーアーカイブ》的民间汉化组织，旨在为各位玩家提供优质、准确的汉化服务。
          </p>
          <p>
            如发现问题，请反馈到 feedback@bluearchive.cafe。
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

      <section class="social-section" aria-labelledby="social-title">
        <div class="social-heading">
          <h2 id="social-title">社交媒体</h2>
          <p>在这里，查看我们的社交平台。</p>
        </div>

        <v-list class="social-list" bg-color="transparent" lines="two">
          <v-list-item
            v-for="link in socialLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            :title="link.label"
            :subtitle="link.description"
          >
            <template #prepend>
              <v-avatar :class="['social-icon', `social-icon--${link.tone}`]" rounded="lg">
                <v-icon :icon="link.icon" size="22" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon icon="$arrowRight" color="primary" size="18" />
            </template>
          </v-list-item>
        </v-list>
      </section>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const aboutItems = [
  {
    icon: '$info',
    title: '非官方项目',
    description: '“蔚蓝咖啡厅”是由爱好者创立并维护的民间项目，与游戏“ブルーアーカイブ（中文名‘蔚蓝档案’）”及相关公司并无官方关联。'
  }
]

const socialLinks = [
  {
        label: '哔哩哔哩',
        href: 'https://space.bilibili.com/3706947316484682',
    icon: '$videoOutline',
    tone: 'bilibili',
    description: '发布站点更新、公告同步和阶段性内容预览。'
  },
  {
    label: 'QQ 群组',
    href: 'https://qm.qq.com/q/YPU4KjGVmA',
    icon: '$accountGroupOutline',
    tone: 'qq',
    description: '加入社区交流，反馈页面问题、内容错误或使用建议。'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/bluearchive-cafe',
    icon: '$github',
    tone: 'github',
    description: '查看源码、跟踪开发进度，或通过 issue 参与改进。'
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
  animation: fade-slide-up 520ms ease both;
  color: var(--color-text);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.2;
}

.about-copy p {
  max-width: 560px;
  margin: 18px 0 0;
  animation: fade-slide-up 520ms ease both;
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
  animation: fade-slide-up 520ms ease both;
  background: var(--color-card-soft);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.about-copy p:nth-of-type(1) {
  animation-delay: 80ms;
}

.about-copy p:nth-of-type(2) {
  animation-delay: 160ms;
}

.about-row:nth-child(1) {
  animation-delay: 80ms;
}

.about-row:nth-child(2) {
  animation-delay: 160ms;
}

.about-row:nth-child(3) {
  animation-delay: 240ms;
}

.about-row:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-3px);
}

.about-row h3 {
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: 18px;
  font-weight: var(--font-weight-subheading);
}

.about-row p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.65;
}

.social-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1fr);
  gap: 48px;
  align-items: start;
  margin-top: 40px;
  padding-top: 34px;
  border-top: 1px solid var(--color-border);
}

.social-heading h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-heading);
}

.social-heading p {
  max-width: 560px;
  margin: 12px 0 0;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.social-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-card-soft) !important;
}

.social-list :deep(.v-list-item) {
  min-height: 72px;
}

.social-icon {
  border: 1px solid rgba(41, 174, 234, 0.32);
  background: rgba(41, 174, 234, 0.1);
  color: var(--color-secondary);
}

.social-icon--bilibili {
  border-color: rgba(41, 174, 234, 0.42);
  background: rgba(41, 174, 234, 0.14);
  color: #69d8ff;
}

.social-icon--qq {
  border-color: rgba(139, 216, 255, 0.36);
  background: rgba(139, 216, 255, 0.12);
  color: #8bd8ff;
}

.social-icon--github {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

@media (max-width: 840px) {
  .about-layout,
  .social-section {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .social-section {
    margin-top: 32px;
    padding-top: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-copy h2,
  .about-copy p,
  .about-row {
    animation: none;
  }
}
</style>
