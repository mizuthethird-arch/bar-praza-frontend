import { afterEach, describe, expect, it, vi } from 'vitest'
import { playChime } from './chime'

describe('playChime', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('plays a short tone through the audio context', () => {
    const oscillator = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: '' }
    const gain = { connect: vi.fn(), gain: { value: 0, exponentialRampToValueAtTime: vi.fn(), setValueAtTime: vi.fn() } }
    const context = {
      currentTime: 0, destination: {}, createOscillator: () => oscillator, createGain: () => gain, close: vi.fn(),
    }
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))

    playChime()

    expect(oscillator.start).toHaveBeenCalled()
    expect(oscillator.stop).toHaveBeenCalled()
  })

  it('does nothing, without throwing, when audio is not available', () => {
    vi.stubGlobal('AudioContext', undefined)

    expect(() => playChime()).not.toThrow()
  })

  it('does nothing when the browser refuses to start audio', () => {
    vi.stubGlobal('AudioContext', vi.fn(function () { throw new Error('blocked') }))

    expect(() => playChime()).not.toThrow()
  })
})
