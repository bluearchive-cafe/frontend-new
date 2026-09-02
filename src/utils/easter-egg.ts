// 点击可交互元素时以 1%（1/100）概率触发彩蛋：播放音效并在点击位置弹出贴图，
// 动画结束后自动消失。每次触发从 kuyashi / panpakapann / gousyuzinsama / yuzu /
// nihahahaha / reisa 中随机选一组，音效与贴图始终来自同一组，不会出现声音和图片不匹配。
// 使用全局 pointerup 捕获委托：任何按钮、链接、输入框等被点击后都走这里判定，
// 无需为每个组件单独注册监听。交互元素需满足 closest 交互选择器，
// 且其祖先上没有标记 data-easter-egg="off" 的排除区。
import { readCssDurationToken, readCssPixelToken } from './css-tokens'

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'select',
  'textarea',
  'summary',
  'details',
].join(',')

// 避免快速连点时连续触发彩蛋；同一次点击事件的多个监听阶段也只算一次。
const COOLDOWN_MS = 300

// 彩蛋素材组：音效与贴图一一对应。
const EASTER_EGG_ASSETS = [
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/kuyashi.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/kuyashi.webp`,
  },
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/gousyuzinsama.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/gousyuzinsama.webp`,
  },
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/panpakapann.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/panpakapann.webp`,
  },
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/yuzu.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/yuzu.webp`,
  },
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/nihahahaha.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/nihahahaha.webp`,
  },
  {
    audioUrl: `${import.meta.env.BASE_URL}assets/audio/reisa.ogg`,
    stickerUrl: `${import.meta.env.BASE_URL}assets/img/easter-egg/reisa.webp`,
  },
]

// 默认触发概率；调试时可在 URL 上追加 ?kuyashi=1（100%）或 ?kuyashi=0.5（50%）覆盖。
const DEFAULT_CHANCE = 1 / 100

// 贴图时长由根 CSS token 提供,内联仅保留动画声明的最低样式保障。
const INLINE_ANIMATION_STYLE = 'opacity:0;animation:var(--ee-sticker-duration) cubic-bezier(0.2,0,0,1) both'

let lastPlayAt = -COOLDOWN_MS
let chance = DEFAULT_CHANCE
let active = false

// 每个素材组一个 Audio 实例，组间互不干扰；缓存避免重复创建。
const audioCache = new Map<string, HTMLAudioElement>()

export function enableClickSound() {
  if (active || typeof window === 'undefined') {
    return
  }
  active = true
  // URL 上的 ?kuyashi= 参数覆盖触发概率，便于调试。
  chance = parseChanceOverride()
  window.addEventListener('pointerup', handlePointerUp, { capture: true })
}

export function disableClickSound() {
  if (!active) {
    return
  }
  active = false
  window.removeEventListener('pointerup', handlePointerUp, { capture: true })
  audioCache.clear()
  lastPlayAt = -COOLDOWN_MS
  chance = DEFAULT_CHANCE
}

// 解析 ?kuyashi= 调试参数为概率；缺失、非法或超出 (0, 1] 时回退到默认值。
function parseChanceOverride() {
  const value = new URLSearchParams(window.location.search).get('kuyashi')
  if (!value) {
    return DEFAULT_CHANCE
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1 ? parsed : DEFAULT_CHANCE
}

function handlePointerUp(event: PointerEvent) {
  // 快速连点（如双击）只允许命中一次，避免连续触发彩蛋。
  if (event.timeStamp - lastPlayAt < COOLDOWN_MS) {
    return
  }
  if (Math.random() >= chance) {
    return
  }

  const target = event.target instanceof Element ? event.target : null
  if (!target) {
    return
  }
  if (target.closest(`[data-easter-egg="off"]`)) {
    return
  }
  if (!target.closest(INTERACTIVE_SELECTOR)) {
    return
  }

  lastPlayAt = event.timeStamp
  playEasterEgg(event.clientX, event.clientY)
}

// 随机选一组素材，音效与贴图始终同源。
function pickAssets() {
  return EASTER_EGG_ASSETS[Math.floor(Math.random() * EASTER_EGG_ASSETS.length)]
}

function playEasterEgg(x: number, y: number) {
  const assets = pickAssets()
  playAudio(assets.audioUrl)
  if (typeof document !== 'undefined') {
    showSticker(x, y, assets.stickerUrl)
  }
}

function playAudio(audioUrl: string) {
  let element = audioCache.get(audioUrl)
  if (!element) {
    element = new Audio(audioUrl)
    // 与其余元素共存，不打断主页面声音。
    element.preload = 'auto'
    audioCache.set(audioUrl, element)
  }
  // 重置到开头，保证快速连点时也能从头重播。
  element.currentTime = 0
  element.play().catch(() => {
    // 浏览器可能因未授权交互或自动播放策略拒绝播放，直接忽略。
  })
}

function showSticker(x: number, y: number, stickerUrl: string) {
  const sticker = document.createElement('img')
  sticker.className = 'easter-egg-sticker'
  sticker.src = stickerUrl
  sticker.alt = ''
  sticker.style.position = 'fixed'
  sticker.style.zIndex = '3000'
  sticker.style.left = `${x}px`
  sticker.style.top = `${y}px`
  // 直径与时长一样由 CSS 变量驱动:居中偏移读取同一变量,
  // 覆盖 --ee-sticker-size 后贴图仍保持居中。
  const size = readCssPixelToken('--ee-sticker-size')
  sticker.style.marginLeft = `${-size / 2}px`
  sticker.style.marginTop = `${-size / 2}px`
  sticker.style.animation = INLINE_ANIMATION_STYLE

  // 展示时长直接读取根 CSS token,避免与样式表维护两份默认值。
  const removeAfter = readCssDurationToken('--ee-sticker-duration')

  document.documentElement.append(sticker)
  window.setTimeout(() => sticker.remove(), removeAfter)
}
