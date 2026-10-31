import { describe, expect, it } from 'vitest'
import { shouldDismiss, sheetMotion } from './motion'

describe('sheetMotion', () => {
  it('slides the sheet up on a spring and fades the overlay in over 0.2 s', () => {
    const { overlay, sheet } = sheetMotion(false)

    expect(overlay.hidden).toMatchObject({ opacity: 0, transition: { duration: 0.2 } })
    expect(overlay.show).toMatchObject({ opacity: 1, transition: { duration: 0.2 } })
    expect(sheet.hidden).toMatchObject({ y: '100%' })
    expect(sheet.show).toMatchObject({ y: 0, transition: { type: 'spring' } })
  })

  it('slides the sheet back down in under 0.25 s when it closes', () => {
    const { sheet } = sheetMotion(false)

    expect(sheet.hidden).toMatchObject({ y: '100%', transition: { duration: 0.22, ease: 'easeIn' } })
  })

  it('shows the sheet at once, with no movement, when the user asks for reduced motion', () => {
    const { overlay, sheet } = sheetMotion(true)

    for (const variant of [overlay.hidden, overlay.show, sheet.hidden, sheet.show]) {
      expect(variant).toMatchObject({ opacity: 1, transition: { duration: 0 } })
    }
    expect(sheet.hidden).toMatchObject({ y: 0 })
    expect(sheet.show).toMatchObject({ y: 0 })
  })
})

describe('shouldDismiss', () => {
  it('closes the sheet when it is dragged down past 120 px', () => {
    expect(shouldDismiss(121, 0)).toBe(true)
  })

  it('closes the sheet on a quick flick down, even when it moved less than 120 px', () => {
    expect(shouldDismiss(30, 700)).toBe(true)
  })

  it('keeps the sheet open for a short or upward drag', () => {
    expect(shouldDismiss(40, 100)).toBe(false)
    expect(shouldDismiss(-200, -900)).toBe(false)
  })
})
