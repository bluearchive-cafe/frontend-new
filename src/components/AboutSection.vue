<template>
  <section class="section about-section">
    <v-container max-width="1120">
      <div class="about-layout">
        <div class="about-copy">
          <h1>关于本站</h1>
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
                <v-icon :icon="link.icon" size="22" aria-hidden="true" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon icon="$openInNew" color="primary" size="18" aria-hidden="true" />
            </template>
          </v-list-item>
        </v-list>
      </section>

      <section class="sponsor-section" aria-labelledby="sponsor-title">
        <div class="sponsor-heading">
          <h2 id="sponsor-title">支持我们</h2>
          <p>如果本站对你有帮助，可以通过以下方式支持我们持续维护汉化内容、站点服务和相关工具。</p>
        </div>

        <v-list class="social-list sponsor-list" bg-color="transparent" lines="two">
          <v-list-item
            title="微信赞赏码"
            subtitle="点击查看赞赏码，支持项目长期维护。"
            @click="isSponsorQrOpen = true"
          >
            <template #prepend>
              <v-avatar class="social-icon sponsor-icon--wechat" rounded="lg">
                <v-icon icon="$imageOutline" size="22" aria-hidden="true" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon icon="$imageOutline" color="primary" size="18" aria-hidden="true" />
            </template>
          </v-list-item>

          <v-list-item
            href="https://afdian.com/a/MisakaCloud"
            target="_blank"
            rel="noopener noreferrer"
            title="爱发电"
            subtitle="通过爱发电进行赞助，支持项目长期维护。"
          >
            <template #prepend>
              <v-avatar class="social-icon sponsor-icon--afdian" rounded="lg">
                <v-icon icon="$linkVariant" size="22" aria-hidden="true" />
              </v-avatar>
            </template>

            <template #append>
              <v-icon icon="$openInNew" color="primary" size="18" aria-hidden="true" />
            </template>
          </v-list-item>
        </v-list>
      </section>
    </v-container>

    <v-dialog v-model="isSponsorQrOpen" max-width="420" aria-labelledby="sponsor-dialog-title">
      <v-card class="sponsor-dialog">
        <v-card-text>
          <div class="sponsor-dialog-heading">
            <div>
              <h2 id="sponsor-dialog-title">微信赞赏码</h2>
              <p>感谢你的支持。</p>
            </div>
            <v-btn variant="text" color="primary" @click="isSponsorQrOpen = false">
              关闭
            </v-btn>
          </div>

          <img class="sponsor-qr" :src="sponsorQrSrc" alt="微信赞赏码" loading="lazy" decoding="async">
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { aboutItems, socialLinks } from '../content/site-content'

const publicAssetBase = import.meta.env.BASE_URL
const sponsorQrSrc = `${publicAssetBase}assets/img/about/wechat-sponsor.png`
const isSponsorQrOpen = ref(false)
</script>

<style scoped>
.section {
  min-height: var(--page-min-height);
  padding-block: var(--page-padding-block);
}

.about-section {
  background: var(--page-background-fill);
}

.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1fr);
  gap: var(--space-12);
  align-items: start;
}

.about-copy h1 {
  max-width: 520px;
  margin: 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  color: var(--color-text);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-heading);
  line-height: 1.2;
}

.about-copy p {
  max-width: 560px;
  margin: var(--space-5) 0 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  color: var(--color-text-muted);
  font-size: var(--md2-type-body1);
  line-height: 1.85;
}

.about-list {
  display: grid;
  gap: var(--space-4);
}

.about-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--card-padding);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) both;
  background: var(--color-card-soft);
  transition: border-color var(--md2-duration-shorter) var(--md2-easing-standard), box-shadow var(--md2-duration-shorter) var(--md2-easing-standard), transform var(--md2-duration-shorter) var(--md2-easing-standard);
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

.about-row h3 {
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: var(--md2-type-subtitle1);
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
  gap: var(--space-12);
  align-items: start;
  margin-top: var(--content-section-gap);
  padding-top: var(--content-divider-padding);
  border-top: 1px solid var(--color-border);
}

.social-heading h2 {
  margin: 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 260ms both;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-heading);
}

.social-heading p {
  max-width: 560px;
  margin: var(--control-gap) 0 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 320ms both;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.social-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 320ms both;
  background: var(--color-card-soft) !important;
}

.social-list :deep(.v-list-item) {
  min-height: 72px;
}

.sponsor-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1fr);
  gap: var(--space-12);
  align-items: start;
  margin-top: var(--content-section-gap);
  padding-top: var(--content-divider-padding);
  border-top: 1px solid var(--color-border);
}

.sponsor-heading h2 {
  margin: 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 380ms both;
  color: var(--color-text);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-heading);
}

.sponsor-heading p {
  max-width: 560px;
  margin: var(--control-gap) 0 0;
  animation: fade-slide-up var(--md2-duration-complex) var(--md2-easing-deceleration) 440ms both;
  color: var(--color-text-muted);
  line-height: 1.75;
}

.sponsor-list {
  animation-delay: 440ms;
}

.sponsor-icon--wechat {
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
  color: var(--color-success);
}

.sponsor-icon--afdian {
  border-color: var(--color-accent-border);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.sponsor-dialog {
  border: 1px solid var(--color-border);
  background-color: var(--md2-surface);
}

.sponsor-dialog :deep(.v-card-text) {
  padding: var(--card-padding) !important;
}

.sponsor-dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.sponsor-dialog-heading h2 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--md2-type-h6);
  font-weight: var(--font-weight-heading);
}

.sponsor-dialog-heading p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.sponsor-qr {
  display: block;
  width: 100%;
  max-width: 360px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  margin: 0 auto;
  background: #fff;
}

.social-icon {
  border: 1px solid var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-secondary);
}

.social-icon--bilibili {
  border-color: var(--color-primary-border-strong);
  background: var(--color-primary-soft);
  color: var(--color-info);
}

.social-icon--qq {
  border-color: var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-secondary);
}

.social-icon--github {
  border-color: rgba(255, 255, 255, 0.22);
  background: var(--color-neutral-soft);
  color: var(--color-text);
}

@media (hover: hover) and (pointer: fine) {
  .about-row:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-hover);
    transform: translateY(-3px);
  }
}

@media (max-width: 840px) {
  .about-layout,
  .social-section,
  .sponsor-section {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .social-section,
  .sponsor-section {
    margin-top: var(--space-8);
    padding-top: var(--space-7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-copy h1,
  .about-copy p,
  .about-row,
  .social-heading h2,
  .social-heading p,
  .social-list,
  .sponsor-heading h2,
  .sponsor-heading p {
    animation: none;
  }
}
</style>
