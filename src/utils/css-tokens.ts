export type CssCustomProperty = `--${string}`

export function readCssPixelToken(property: CssCustomProperty) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const match = /^(\d+(?:\.\d+)?)px$/.exec(raw)
  const value = match ? Number(match[1]) : Number.NaN

  if (!Number.isFinite(value)) {
    throw new Error(`CSS token ${property} must be a pixel value, received: ${raw || '(empty)'}`)
  }

  return value
}

export function readCssDurationToken(property: CssCustomProperty) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const match = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(raw)
  const value = match ? Number(match[1]) : Number.NaN

  if (!Number.isFinite(value) || !match) {
    throw new Error(`CSS token ${property} must be a duration, received: ${raw || '(empty)'}`)
  }

  return match[2] === 's' ? value * 1000 : value
}
