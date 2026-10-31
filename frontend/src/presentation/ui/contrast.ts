// WCAG 2.x contrast, used by the design standard tests. sRGB values run 0–255.
export type Rgb = { r: number; g: number; b: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

const encode = (linear: number) => {
  const v = linear <= 0.0031308 ? 12.92 * linear : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055
  return Math.round(clamp01(v) * 255)
}

// OKLab → linear sRGB → sRGB. `h` is in degrees; with `c` = 0 the hue has no effect.
export function oklchToRgb(l: number, c: number, h: number): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const L = l_ ** 3
  const M = m_ ** 3
  const S = s_ ** 3
  return {
    r: encode(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    g: encode(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    b: encode(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  }
}

const linear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

const luminance = ({ r, g, b }: Rgb) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// A translucent colour (Tailwind's /40 style) shown over a background, blended in sRGB like a browser.
export function over(top: Rgb, alpha: number, bottom: Rgb): Rgb {
  const mix = (t: number, u: number) => Math.round(t * alpha + u * (1 - alpha))
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b) }
}
