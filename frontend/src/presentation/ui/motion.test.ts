import { describe, expect, it } from 'vitest'
import { authMotion, lockMotion, menuMotion, shouldDismiss, sheetMotion, signInMotion } from './motion'

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

describe('authMotion', () => {
  it('slides the sign-in view in from the right and out to the left, with no wait between them', () => {
    const { view } = authMotion(false)

    expect(view.initial).toMatchObject({ opacity: 0, x: 24 })
    expect(view.animate).toMatchObject({ opacity: 1, x: 0 })
    expect(view.exit).toMatchObject({ opacity: 0, x: -24 })
  })

  it('opens an alert by growing it from zero height, and closes it the same way', () => {
    const { notice } = authMotion(false)

    expect(notice.initial).toMatchObject({ opacity: 0, height: 0 })
    expect(notice.animate).toMatchObject({ opacity: 1, height: 'auto' })
    expect(notice.exit).toMatchObject({ opacity: 0, height: 0 })
  })

  it('switches at once, with no movement, when the user asks for reduced motion', () => {
    const { view, notice } = authMotion(true)

    for (const step of [view.initial, view.animate, view.exit]) expect(step).toMatchObject({ x: 0 })
    expect(view.transition).toEqual({ duration: 0 })
    expect(notice.transition).toEqual({ duration: 0 })
  })
})

describe('lockMotion', () => {
  it('lets the keypad fade out and up before the lock view comes in', () => {
    const { leave } = lockMotion(false)

    expect(leave.exit).toMatchObject({ opacity: 0, y: -8, transition: { duration: 0.2 } })
  })

  it('rises the lock view in from below over 0.5 s', () => {
    const { panel } = lockMotion(false)

    expect(panel.initial).toMatchObject({ opacity: 0, y: 16 })
    expect(panel.animate).toMatchObject({ opacity: 1, y: 0 })
    expect(panel.transition).toMatchObject({ duration: 0.5 })
  })

  it('pops the padlock up and shakes it once, after it has landed', () => {
    const { icon } = lockMotion(false)

    expect(icon.initial).toMatchObject({ opacity: 0, scale: 0.4 })
    expect(icon.animate).toMatchObject({ opacity: 1, scale: 1, rotate: [0, -12, 10, -6, 4, 0] })
    expect(icon.transition).toMatchObject({ type: 'spring', rotate: { duration: 0.6, delay: 0.3 } })
  })

  it('shows the lock at once, with no movement, when the user asks for reduced motion', () => {
    const { leave, panel, icon } = lockMotion(true)

    expect(leave.exit).toMatchObject({ opacity: 0, transition: { duration: 0 } })
    expect(panel.initial).toMatchObject({ opacity: 1, y: 0 })
    expect(panel.transition).toEqual({ duration: 0 })
    expect(icon.animate).toMatchObject({ scale: 1, rotate: 0 })
    expect(icon.transition).toEqual({ duration: 0 })
  })
})

describe('signInMotion', () => {
  it('fades the card out, drifts it up and blurs it over 0.45 s before the app opens', () => {
    const { leave, leaveMs } = signInMotion(false)

    expect(leaveMs).toBe(450)
    expect(leave.animate).toMatchObject({ opacity: 0, y: -16, scale: 0.97, filter: 'blur(6px)' })
    expect(leave.transition).toMatchObject({ duration: 0.45 })
  })

  it('rises the dashboard in from below and slightly small over 0.6 s', () => {
    const { arrive } = signInMotion(false)

    expect(arrive.initial).toMatchObject({ opacity: 0, y: 20, scale: 0.99 })
    expect(arrive.animate).toMatchObject({ opacity: 1, y: 0, scale: 1 })
    expect(arrive.transition).toMatchObject({ duration: 0.6 })
  })

  it('switches at once, with no wait and no movement, when the user asks for reduced motion', () => {
    const { leaveMs, leave, arrive } = signInMotion(true)

    expect(leaveMs).toBe(0)
    expect(leave.animate).toEqual({ opacity: 0 })
    expect(leave.transition).toEqual({ duration: 0 })
    expect(arrive.initial).toMatchObject({ opacity: 1, y: 0, scale: 1 })
    expect(arrive.transition).toEqual({ duration: 0 })
  })
})
