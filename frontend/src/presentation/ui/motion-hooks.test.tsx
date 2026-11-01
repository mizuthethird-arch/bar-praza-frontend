import { renderHook } from '@testing-library/react'
import { useReducedMotion } from 'framer-motion'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  authMotion,
  closeOnDragEnd,
  lockMotion,
  menuMotion,
  sheetMotion,
  signInMotion,
  useAuthMotion,
  useFadeUp,
  useLockMotion,
  useMenuMotion,
  useSheetMotion,
  useSignInMotion,
} from './motion'

// The browser's reduced-motion preference is faked here, so each hook is tried with every answer it can get.
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: vi.fn(),
}))

const preference = vi.mocked(useReducedMotion)

describe('motion hooks', () => {
  beforeEach(() => preference.mockReset())

  it('use normal motion when the browser gives no preference', () => {
    preference.mockReturnValue(null)

    expect(renderHook(() => useSheetMotion()).result.current).toEqual(sheetMotion(false))
    expect(renderHook(() => useMenuMotion()).result.current).toEqual(menuMotion(false))
    expect(renderHook(() => useAuthMotion()).result.current).toEqual(authMotion(false))
    expect(renderHook(() => useLockMotion()).result.current).toEqual(lockMotion(false))
    expect(renderHook(() => useSignInMotion()).result.current).toEqual(signInMotion(false))
  })

  it('use reduced motion when the person asks for it', () => {
    preference.mockReturnValue(true)

    expect(renderHook(() => useSheetMotion()).result.current).toEqual(sheetMotion(true))
    expect(renderHook(() => useMenuMotion()).result.current).toEqual(menuMotion(true))
    expect(renderHook(() => useAuthMotion()).result.current).toEqual(authMotion(true))
    expect(renderHook(() => useLockMotion()).result.current).toEqual(lockMotion(true))
    expect(renderHook(() => useSignInMotion()).result.current).toEqual(signInMotion(true))
  })

  it('fade up moves nothing for a person who asks for reduced motion', () => {
    preference.mockReturnValue(true)

    expect(renderHook(() => useFadeUp()).result.current).toEqual({ hidden: {}, show: {} })
  })

  it('fade up rises a little otherwise', () => {
    preference.mockReturnValue(false)

    expect(renderHook(() => useFadeUp()).result.current).toMatchObject({ hidden: { opacity: 0 }, show: { opacity: 1 } })
  })
})

describe('closeOnDragEnd', () => {
  it('closes after a long drag down', () => {
    const close = vi.fn()

    closeOnDragEnd({ offset: { y: 200 }, velocity: { y: 0 } }, close)

    expect(close).toHaveBeenCalledTimes(1)
  })

  it('closes after a fast flick down', () => {
    const close = vi.fn()

    closeOnDragEnd({ offset: { y: 10 }, velocity: { y: 900 } }, close)

    expect(close).toHaveBeenCalledTimes(1)
  })

  it('stays open after a short, slow drag', () => {
    const close = vi.fn()

    closeOnDragEnd({ offset: { y: 30 }, velocity: { y: 50 } }, close)

    expect(close).not.toHaveBeenCalled()
  })
})
