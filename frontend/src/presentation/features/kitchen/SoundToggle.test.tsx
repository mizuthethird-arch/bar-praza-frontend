import { fireEvent, render, screen } from '@testing-library/react'
import { useReducedMotion } from 'framer-motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundToggle } from './SoundToggle'

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: vi.fn(() => false),
}))

describe('SoundToggle motion', () => {
  it('still reports the press when the person asks for reduced motion, and skips the shake', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)
    const onPress = vi.fn()
    render(<SoundToggle state="on" onPress={onPress} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sonido activo' }))

    expect(onPress).toHaveBeenCalledTimes(1)
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })
})

describe('SoundToggle', () => {
  it('says whether the chime is active, off, or waiting for a press', () => {
    const { rerender } = render(<SoundToggle state="on" onPress={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()

    rerender(<SoundToggle state="off" onPress={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Sonido apagado' })).toBeInTheDocument()

    rerender(<SoundToggle state="waiting" onPress={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Toca para activar el sonido' })).toBeInTheDocument()
  })

  it('reports each press', () => {
    const onPress = vi.fn()
    render(<SoundToggle state="on" onPress={onPress} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sonido activo' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('SoundToggle vibration', () => {
  const vibrateFn = vi.fn(() => true)

  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', { value: vibrateFn, configurable: true, writable: true })
    vibrateFn.mockClear()
  })
  afterEach(() => {
    delete (navigator as { vibrate?: unknown }).vibrate
  })

  it('buzzes briefly on every press, where the device can vibrate', () => {
    render(<SoundToggle state="off" onPress={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sonido apagado' }))

    expect(vibrateFn).toHaveBeenCalledWith(25)
  })

  it('does nothing, without throwing, on a device that cannot vibrate', () => {
    delete (navigator as { vibrate?: unknown }).vibrate
    const onPress = vi.fn()
    render(<SoundToggle state="off" onPress={onPress} />)

    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Sonido apagado' }))).not.toThrow()
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
