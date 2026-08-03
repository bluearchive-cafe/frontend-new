// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { disableClickSound, enableClickSound } from './easter-egg'

describe('easter-egg click sound', () => {
  beforeEach(() => {
    disableClickSound()
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  })

  afterEach(() => {
    disableClickSound()
    document.documentElement.style.removeProperty('--ee-sticker-duration')
    // 移除测试泄漏的贴图，避免污染后续用例。
    document.querySelectorAll('img.easter-egg-sticker').forEach((sticker) => sticker.remove())
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function setSearchParam(value: string | null) {
    window.history.replaceState(null, '', value === null ? '/' : `/?kuyashi=${value}`)
  }

  // 事件委托挂载在 window 上，直接调度带 timeStamp 的 pointerup 事件。
  // jsdom 构造 PointerEvent 时会忽略 timeStamp 选项（统一取当前时间），
  // 因此事件创建后再用 defineProperty 覆盖。
  // 未指定 timeStamp 时自动递增，保证连续点击彼此独立。
  let nextTimeStamp = 0
  function dispatchClick(timeStamp?: number, target: Element = document.body) {
    const event = new window.PointerEvent('pointerup', { bubbles: true })
    const stamp = timeStamp ?? (nextTimeStamp += 1_000)
    Object.defineProperty(event, 'timeStamp', { value: stamp, configurable: true })
    target.dispatchEvent(event)
  }

  function mockRandom(value: number) {
    vi.spyOn(Math, 'random').mockReturnValue(value)
  }

  // 依次返回给定随机数，用于控制概率判定与素材选择。
  function mockRandomSequence(values: number[]) {
    const sequence = [...values]
    vi.spyOn(Math, 'random').mockImplementation(() => sequence.shift() ?? 0)
  }

  it('does not play before enable', () => {
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    mockRandom(0)

    dispatchClick(0)

    expect(play).not.toHaveBeenCalled()
  })

  it('plays kuyashi.ogg when the random draw hits', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, button)

    expect(play).toHaveBeenCalledTimes(1)
  })

  it('does not play when the random draw misses', () => {
    mockRandom(0.5)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, button)

    expect(play).not.toHaveBeenCalled()
  })

  it('plays for each interactive element type', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = [
      '<a href="#">link</a>',
      '<button>button</button>',
      '<input type="text">',
      '<select><option>a</option></select>',
      '<textarea></textarea>',
      '<summary>summary</summary>',
    ].join('')
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    let stamp = 0
    for (const element of Array.from(document.body.children)) {
      dispatchClick((stamp += 1_000), element)
    }

    expect(play).toHaveBeenCalledTimes(6)
  })

  it('does not play on non-interactive elements', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<div>plain text</div>'
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, document.querySelector('div')!)

    expect(play).not.toHaveBeenCalled()
  })

  it('respects data-easter-egg="off" exclusion zones', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML =
      '<div data-easter-egg="off"><button id="quiet">silent</button></div>'
    const button = document.getElementById('quiet')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, button)

    expect(play).not.toHaveBeenCalled()
  })

  it('does not fire twice for clicks inside the cooldown window', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, button)
    dispatchClick(50, button)
    dispatchClick(200, button)

    expect(play).toHaveBeenCalledTimes(1)
  })

  it('fires again for clicks after the cooldown window', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, button)
    dispatchClick(400, button)

    expect(play).toHaveBeenCalledTimes(2)
  })

  it('reuses a single audio element and restarts it from the beginning', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    const audio = new window.Audio()

    dispatchClick(0, button)
    dispatchClick(400, button)

    expect(play).toHaveBeenCalledTimes(2)
    expect(audio.currentTime).toBe(0)
  })

  it('stops playing after disable and resumes after re-enable', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const button = document.getElementById('btn')!
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    disableClickSound()
    dispatchClick(0, button)

    enableClickSound()
    dispatchClick(1_000, button)

    expect(play).toHaveBeenCalledTimes(1)
  })

  it('ignores playback failures from autoplay policy', () => {
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockRejectedValue(
      new Error('NotAllowedError')
    )

    expect(() => dispatchClick(0, document.getElementById('btn')!)).not.toThrow()
  })

  it('shows a sticker at the click position and removes it afterwards', () => {
    // fake timers 需在 dispatchClick（其内部注册 setTimeout）之前安装，才能拦截移除计时器。
    vi.useFakeTimers()
    mockRandom(0)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)
    const sticker = document.querySelector('img.easter-egg-sticker')
    const stickerStyle = sticker ? (sticker as HTMLImageElement).style : undefined

    expect(sticker).not.toBeNull()
    expect(sticker?.getAttribute('src')).toContain('/assets/img/easter-egg/kuyashi.jpg')
    expect(stickerStyle?.left).toBe('0px')
    expect(stickerStyle?.top).toBe('0px')

    vi.advanceTimersByTime(1_300)
    expect(document.querySelector('img.easter-egg-sticker')).toBeNull()
  })

  it('honors the CSS overridden sticker duration', () => {
    vi.useFakeTimers()
    mockRandom(0)
    document.documentElement.style.setProperty('--ee-sticker-duration', '2000ms')
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)

    vi.advanceTimersByTime(1_300)
    expect(document.querySelector('img.easter-egg-sticker')).not.toBeNull()

    vi.advanceTimersByTime(800)
    expect(document.querySelector('img.easter-egg-sticker')).toBeNull()
  })

  it('does not leak stickers when the draw misses', () => {
    mockRandom(0.5)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)

    expect(document.querySelector('img.easter-egg-sticker')).toBeNull()
  })

  it('uses the ?kuyashi=1 override to make every click hit', () => {
    setSearchParam('1')
    mockRandom(0.99)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)

    expect(document.querySelector('img.easter-egg-sticker')).not.toBeNull()
  })

  it('uses a fractional ?kuyashi= override for the hit probability', () => {
    setSearchParam('0.5')
    mockRandom(0.99)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)

    expect(document.querySelector('img.easter-egg-sticker')).toBeNull()
  })

  it('falls back to the default probability for invalid overrides', () => {
    setSearchParam('2')
    mockRandom(0.99)
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'

    dispatchClick(0, document.getElementById('btn')!)

    expect(document.querySelector('img.easter-egg-sticker')).toBeNull()
  })

  it('picks one asset group and plays its matching audio and sticker', () => {
    // 第一个随机数用于概率判定（0 必中），第二个用于素材选择（0.99 落在第三组 panpakapann）。
    mockRandomSequence([0, 0.99])
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, document.getElementById('btn')!)

    // 概率判定通过（0 < 1），素材选择命中第三组 panpakapann。
    const played = play.mock.instances[0] as HTMLAudioElement
    expect(played.src).toContain('/assets/audio/panpakapann.ogg')
    const sticker = document.querySelector('img.easter-egg-sticker')
    expect(sticker?.getAttribute('src')).toContain(
      '/assets/img/easter-egg/panpakapann.jpg'
    )
  })

  it('plays kuyashi when the pick lands on the first group', () => {
    mockRandomSequence([0, 0])
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, document.getElementById('btn')!)

    const played = play.mock.instances[0] as HTMLAudioElement
    expect(played.src).toContain('/assets/audio/kuyashi.ogg')
    expect(document.querySelector('img.easter-egg-sticker')?.getAttribute('src')).toContain(
      '/assets/img/easter-egg/kuyashi.jpg'
    )
  })

  it('plays gousyuzinsama when the pick lands on the second group', () => {
    // 素材选择 0.66 × 3 = 1.98 → 索引 1 → gousyuzinsama。
    mockRandomSequence([0, 0.66])
    enableClickSound()
    document.body.innerHTML = '<button id="btn">click me</button>'
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    dispatchClick(0, document.getElementById('btn')!)

    const played = play.mock.instances[0] as HTMLAudioElement
    expect(played.src).toContain('/assets/audio/gousyuzinsama.ogg')
    expect(document.querySelector('img.easter-egg-sticker')?.getAttribute('src')).toContain(
      '/assets/img/easter-egg/gousyuzinsama.png'
    )
  })
})
