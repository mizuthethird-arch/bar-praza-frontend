import { describe, expect, it } from 'vitest'
import { contrast, oklchToRgb, over, type Rgb } from './contrast'

const black: Rgb = { r: 0, g: 0, b: 0 }
const white: Rgb = { r: 255, g: 255, b: 255 }

describe('contrast', () => {
  it('is 21:1 for black on white and 1:1 for a colour on itself', () => {
    expect(contrast(black, white)).toBeCloseTo(21, 1)
    expect(contrast(white, white)).toBeCloseTo(1, 5)
  })

  it('does not depend on the order of the two colours', () => {
    const grey: Rgb = { r: 118, g: 118, b: 118 }
    expect(contrast(grey, white)).toBeCloseTo(contrast(white, grey), 10)
  })
})

describe('oklchToRgb', () => {
  it('turns an achromatic oklch lightness into the matching grey', () => {
    expect(oklchToRgb(1, 0, 0)).toEqual({ r: 255, g: 255, b: 255 })
    expect(oklchToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('turns Tailwind neutral-950 (oklch 14.5 %) into a near-black grey', () => {
    const { r, g, b } = oklchToRgb(0.145, 0, 0)
    expect(r).toBeCloseTo(g, 0)
    expect(g).toBeCloseTo(b, 0)
    expect(r).toBeGreaterThanOrEqual(8)
    expect(r).toBeLessThanOrEqual(12)
  })
})

describe('over', () => {
  it('blends a translucent colour over the page colour, in sRGB', () => {
    expect(over(white, 0.5, black)).toEqual({ r: 128, g: 128, b: 128 })
    expect(over(white, 1, black)).toEqual(white)
  })
})
