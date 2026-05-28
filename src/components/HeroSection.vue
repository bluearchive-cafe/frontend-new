<template>
  <section id="home" class="hero">
    <img
      class="hero-image"
      :src="currentHeroImage.src"
      :srcset="currentHeroImage.srcset"
      sizes="(max-width: 720px) 132vw, 72vw"
      alt=""
      decoding="async"
      fetchpriority="high"
    />
    <div class="hero-shade" />

    <v-container class="hero-content" max-width="1120">
      <div class="hero-copy">
        <h1>
          <span class="hero-line">提供 <span class="text-gradient">全面的</span></span>
          <span class="hero-line">蔚蓝档案汉化服务</span>
        </h1>
        <p>
          整理公告、教程和资源入口，让玩家更快找到需要的汉化内容与使用指引。
        </p>

        <div class="hero-actions">
          <v-btn color="primary" size="large" to="/news" prepend-icon="$lightningBolt">
            立即使用
          </v-btn>
          <v-btn class="tutorial-link" variant="text" size="large" href="#news" append-icon="$arrowRight">
            查看教程
          </v-btn>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const publicAssetBase = import.meta.env.BASE_URL

const heroImageNames = [
  'hero',
  'hero-haruka',
  '115938338_p0_cut',
  '100941489_p0_cut',
  '110486537_p0',
  '123658183_p0',
  '131020176_p0_cut',
  '142932674_p0'
]

const heroImages = heroImageNames.map((name) => {
  const basePath = `${publicAssetBase}assets/img/hero/optimized/${name}`

  return {
    src: `${basePath}-1440.webp`,
    srcset: `${basePath}-960.webp 960w, ${basePath}-1440.webp 1440w, ${basePath}-1920.webp 1920w`
  }
})

function getRandomHeroImage() {
  return heroImages[Math.floor(Math.random() * heroImages.length)]
}

const currentHeroImage = ref(getRandomHeroImage())
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 460px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(25, 29, 36, 0.98), rgba(25, 29, 36, 0.92)),
    var(--color-bg);
}

.hero-image {
  position: absolute;
  top: 0;
  right: -2vw;
  width: 72vw;
  height: 100%;
  object-fit: cover;
  object-position: center 26%;
  /* opacity: 0.64; */
  filter: saturate(1.06);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, var(--color-bg) 0%, var(--color-bg) 32%, rgba(25, 29, 36, 0.98) 42%, rgba(25, 29, 36, 0.62) 58%, rgba(25, 29, 36, 0.24) 100%),
    linear-gradient(180deg, transparent 74%, var(--color-bg-deep) 100%);
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 460px;
  padding-block: 72px 56px;
}

.hero-copy {
  width: min(560px, 100%);
}

.hero-copy h1 {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-heading);
  line-height: 1.08;
}

.hero-line {
  display: block;
  white-space: nowrap;
}

.hero-copy p {
  max-width: 520px;
  margin: 22px 0 0;
  color: var(--color-text-muted);
  font-size: 17px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.tutorial-link {
  color: rgba(255, 255, 255, 0.9);
  min-height: 42px;
}

@media (max-width: 720px) {
  .hero {
    min-height: clamp(560px, 86svh, 680px);
  }

  .hero-image {
    top: 0;
    right: -32vw;
    width: 132vw;
    height: 76%;
    max-width: none;
    object-position: 58% top;
    opacity: 0.5;
  }

  .hero-shade {
    background:
      linear-gradient(90deg, rgba(25, 29, 36, 0.98) 0%, rgba(25, 29, 36, 0.86) 48%, rgba(25, 29, 36, 0.46) 100%),
      linear-gradient(180deg, rgba(25, 29, 36, 0.18) 0%, rgba(25, 29, 36, 0.58) 42%, var(--color-bg) 78%, var(--color-bg-deep) 100%);
  }

  .hero-content {
    align-items: flex-end;
    min-height: clamp(560px, 86svh, 680px);
    padding-block: 112px 48px;
  }

  .hero-copy {
    max-width: 100%;
  }

  .hero-copy h1 {
    max-width: 9em;
    font-size: clamp(30px, 9vw, 38px);
    line-height: 1.12;
  }

  .hero-line {
    white-space: normal;
  }

  .hero-copy p {
    max-width: 22em;
    margin-top: 18px;
    font-size: 15px;
    line-height: 1.7;
  }

  .hero-actions {
    align-items: center;
    gap: 12px;
    margin-top: 28px;
  }

  .hero-actions :deep(.v-btn) {
    min-width: 136px;
  }
}

@media (max-width: 360px) {
  .hero-content {
    padding-inline: 16px;
    padding-block-end: 40px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions :deep(.v-btn) {
    width: 100%;
  }
}
</style>
