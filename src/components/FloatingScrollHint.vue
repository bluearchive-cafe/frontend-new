<template>
  <Transition name="scroll-hint">
    <a v-if="visible" class="scroll-hint" href="#news" data-easter-egg="off">
      <v-icon icon="$arrowDown" size="18" aria-hidden="true" />
      <span>查看更新动态</span>
    </a>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 仅移动端首页展示的提示条：提示用户可向下滚动查看更新动态，
// 一旦用户离开页面顶部（scrollTop > 8）即淡出，此后不再出现。
const visible = ref(true)

function handleScroll() {
  visible.value = window.scrollY <= 8
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-hint {
  position: fixed;
  left: 50%;
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: var(--compact-gap);
  max-width: calc(100vw - 2 * var(--space-5));
  height: 40px;
  padding-inline: var(--space-4);
  border: 1px solid var(--color-primary-border-strong);
  border-radius: 999px;
  background: color-mix(in srgb, var(--md2-surface) 86%, var(--color-primary));
  color: var(--color-text);
  box-shadow: var(--md2-elevation-menu);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  font-size: var(--md2-type-button);
  font-weight: var(--font-weight-action);
  white-space: nowrap;
  cursor: pointer;
  translate: -50% 0;
}

.scroll-hint:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-hover);
}

.scroll-hint:active {
  box-shadow: var(--md2-elevation-button);
}

.scroll-hint-enter-active,
.scroll-hint-leave-active {
  transition: opacity var(--md2-duration-standard) var(--md2-easing-standard),
    translate var(--md2-duration-standard) var(--md2-easing-standard);
}

.scroll-hint-enter-from,
.scroll-hint-leave-to {
  opacity: 0;
  translate: -50% 16px;
}

@media (min-width: 721px) {
  .scroll-hint {
    display: none;
  }
}
</style>
