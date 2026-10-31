import { describe, expect, it } from 'vitest'
import { menuMotion, shouldDismiss, sheetMotion } from './motion'

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

describe('menuMotion', () => {
  it('grows the menu out of the hamburger button over 0.9 s, slowing down at the end', () => {
    const { panel } = menuMotion(false)

    expect(panel.hidden).toMatchObject({ clipPath: 'circle(0% at 2rem 1.75rem)' })
    expect(panel.show).toMatchObject({
      clipPath: 'circle(150% at 2rem 1.75rem)',
      transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] },
    })
  })

  it('closes the menu back into the button over 0.5 s', () => {
    const { panel } = menuMotion(false)

    expect(panel.hidden).toMatchObject({ transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } })
  })

  it('starts the links shortly after the menu opens, one at a time, so each is seen', () => {
    const { list } = menuMotion(false)

    expect(list.show).toMatchObject({ transition: { delayChildren: 0.25, staggerChildren: 0.06 } })
  })

  it('moves each link only a little, up and into place, with no sideways jump', () => {
    const { item } = menuMotion(false)

    expect(item.hidden).toMatchObject({ opacity: 0, y: 6 })
    expect(item.show).toMatchObject({ opacity: 1, y: 0 })
    expect(item.hidden).not.toHaveProperty('x')
    expect(item.show).not.toHaveProperty('x')
  })

  it('shows the menu at once, with no movement, when the user asks for reduced motion', () => {
    const { panel, list, item } = menuMotion(true)

    expect(panel.show).toMatchObject({ clipPath: 'circle(150% at 2rem 1.75rem)', transition: { duration: 0 } })
    expect(panel.hidden).toMatchObject({ clipPath: 'circle(150% at 2rem 1.75rem)', transition: { duration: 0 } })
    expect(list.show).toEqual({})
    expect(item.show).toEqual({})
  })
})
