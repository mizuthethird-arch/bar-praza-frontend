import { describe, expect, it } from 'vitest'
import { contrast, oklchToRgb, over, type Rgb } from './contrast'

// Tailwind v4 default palette (node_modules/tailwindcss/theme.css), as oklch.
const palette: Record<string, Rgb> = {
  'neutral-100': oklchToRgb(0.97, 0, 0),
  'neutral-300': oklchToRgb(0.87, 0, 0),
  'neutral-400': oklchToRgb(0.708, 0, 0),
  'neutral-500': oklchToRgb(0.556, 0, 0),
  'neutral-900': oklchToRgb(0.205, 0, 0),
  'neutral-950': oklchToRgb(0.145, 0, 0),
  'red-100': oklchToRgb(0.936, 0.032, 17.717),
  'red-300': oklchToRgb(0.808, 0.114, 19.571),
  'red-400': oklchToRgb(0.704, 0.191, 22.216),
  'red-900': oklchToRgb(0.396, 0.141, 25.723),
  'red-950': oklchToRgb(0.258, 0.092, 26.042),
  'sky-100': oklchToRgb(0.951, 0.026, 236.824),
  'sky-300': oklchToRgb(0.828, 0.111, 230.318),
  'sky-900': oklchToRgb(0.391, 0.09, 240.876),
  'sky-950': oklchToRgb(0.293, 0.066, 243.157),
  'emerald-100': oklchToRgb(0.95, 0.052, 163.051),
  'emerald-300': oklchToRgb(0.845, 0.143, 164.978),
  'sky-700': oklchToRgb(0.5, 0.134, 242.749),
  'emerald-900': oklchToRgb(0.378, 0.077, 168.94),
  'emerald-950': oklchToRgb(0.262, 0.051, 172.552),
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
}

const page = palette['neutral-950']
const card = palette['neutral-900']
const redTint = over(palette['red-950'], 0.4, page)
const emeraldTint = over(palette['emerald-950'], 0.4, page)
const skyTint = over(palette['sky-950'], 0.4, page)

// Each pair is text on background, as used in the design standard (docs/design-standard.md §10).
// A pair listed in `knownFailures` is below WCAG AA on purpose until the human decides (open question 9).
const pairs = [
  { label: 'neutral-100 on page', fg: palette['neutral-100'], bg: page },
  { label: 'neutral-300 on card', fg: palette['neutral-300'], bg: card },
  { label: 'neutral-400 on card', fg: palette['neutral-400'], bg: card },
  { label: 'neutral-400 on page', fg: palette['neutral-400'], bg: page },
  { label: 'red-300 on red tint', fg: palette['red-300'], bg: redTint },
  { label: 'red-400 on card (destructive text button)', fg: palette['red-400'], bg: card },
  { label: 'red-100 on red-900 (Retrasado badge)', fg: palette['red-100'], bg: palette['red-900'] },
  { label: 'emerald-300 on emerald tint (ready, delivered, total)', fg: palette['emerald-300'], bg: emeraldTint },
  { label: 'emerald-100 on emerald-900 (Listo badge)', fg: palette['emerald-100'], bg: palette['emerald-900'] },
  { label: 'emerald-300 on emerald-950 (Turno abierto)', fg: palette['emerald-300'], bg: palette['emerald-950'] },
  { label: 'sky-100 on sky-900 (Listos badge)', fg: palette['sky-100'], bg: palette['sky-900'] },
  { label: 'sky-300 on sky tint (Listos card text)', fg: palette['sky-300'], bg: skyTint },
  { label: 'white on sky-700 (Entregado y cobrado)', fg: palette.white, bg: palette['sky-700'] },
  { label: 'neutral-950 on neutral-100 (primary button)', fg: palette['neutral-950'], bg: palette['neutral-100'] },
  { label: 'black on white (count badge)', fg: palette.black, bg: palette.white },
  { label: 'neutral-100 on card (outline button)', fg: palette['neutral-100'], bg: card },
  { label: 'neutral-400 on page (eyebrow, empty states)', fg: palette['neutral-400'], bg: page },
  { label: 'neutral-400 on card (hints inside cards)', fg: palette['neutral-400'], bg: card },
]

// No known failures: neutral-500 text was replaced by neutral-400 (CONFLICT-0003, resolved 2026-10-31).

describe('palette contrast (WCAG AA, 4.5:1 for text)', () => {
  it('keeps every text pair at 4.5:1 or better, except the known failures', () => {
    for (const { label, fg, bg } of pairs) {
      expect(contrast(fg, bg), label).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps the focus ring at 3:1 or better against the page and the cards (non-text)', () => {
    for (const bg of [page, card]) {
      expect(contrast(palette['neutral-100'], bg)).toBeGreaterThanOrEqual(3)
    }
  })
})
