import { afterEach, describe, expect, it, vi } from 'vitest'

// The chime keeps one audio context, so each test loads a fresh copy of the module.
async function loadChime() {
  vi.resetModules()
  return import('./chime')
}

function fakeAudio(state: 'running' | 'suspended') {
  const oscillator = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: '' }
  const gain = { connect: vi.fn(), gain: { value: 0, exponentialRampToValueAtTime: vi.fn(), setValueAtTime: vi.fn() } }
  const context = {
    currentTime: 0, destination: {}, state, resume: vi.fn(() => Promise.resolve()),
    createOscillator: () => oscillator, createGain: () => gain, close: vi.fn(),
  }
  return { context, oscillator }
}

describe('playChime', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('plays two notes through a running audio context, and reports that it played', async () => {
    const { context, oscillator } = fakeAudio('running')
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { playChime } = await loadChime()

    expect(playChime()).toBe(true)
    expect(oscillator.start).toHaveBeenCalledTimes(2)
    expect(context.resume).not.toHaveBeenCalled()
  })

  it('asks a held-back context to resume, and reports that the browser is holding the sound back', async () => {
    const { context, oscillator } = fakeAudio('suspended')
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { playChime } = await loadChime()

    expect(playChime()).toBe(false)
    expect(context.resume).toHaveBeenCalledTimes(1)
    expect(oscillator.start).toHaveBeenCalledTimes(2)
  })

  it('plays one chime per new order, each starting after the one before', async () => {
    const { context, oscillator } = fakeAudio('running')
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { playChime } = await loadChime()

    playChime(3)

    expect(oscillator.start).toHaveBeenCalledTimes(6)
    expect(oscillator.start.mock.calls.map(([at]) => at)).toEqual([0, 0.25, 0.7, 0.95, 1.4, 1.65])
  })

  it('makes one audio context and reuses it for every chime', async () => {
    const { context } = fakeAudio('running')
    const constructor = vi.fn(function () { return context })
    vi.stubGlobal('AudioContext', constructor)
    const { playChime } = await loadChime()

    playChime()
    playChime()

    expect(constructor).toHaveBeenCalledTimes(1)
  })

  it('does nothing, without throwing, when audio is not available', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { playChime } = await loadChime()

    expect(() => playChime()).not.toThrow()
    expect(playChime()).toBe(true)
  })

  it('does nothing when the browser refuses to start audio', async () => {
    vi.stubGlobal('AudioContext', vi.fn(function () { throw new Error('blocked') }))
    const { playChime } = await loadChime()

    expect(() => playChime()).not.toThrow()
  })
})

describe('unlockSound', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('resumes a held-back context, so the next chime is heard', async () => {
    const { context } = fakeAudio('suspended')
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { unlockSound } = await loadChime()

    await unlockSound()

    expect(context.resume).toHaveBeenCalledTimes(1)
  })

  it('resolves true once the browser lets the page make sound', async () => {
    const { context } = fakeAudio('suspended')
    context.resume.mockImplementation(async () => {
      context.state = 'running'
    })
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { unlockSound } = await loadChime()

    expect(await unlockSound()).toBe(true)
  })

  it('resolves false when the browser refuses to start the sound', async () => {
    const { context } = fakeAudio('suspended')
    context.resume.mockImplementation(async () => {
      throw new Error('not allowed')
    })
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { unlockSound } = await loadChime()

    expect(await unlockSound()).toBe(false)
  })

  it('leaves a running context alone', async () => {
    const { context } = fakeAudio('running')
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    const { unlockSound } = await loadChime()

    unlockSound()

    expect(context.resume).not.toHaveBeenCalled()
  })

  it('does nothing, without throwing, when audio is not available', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { unlockSound } = await loadChime()

    expect(() => unlockSound()).not.toThrow()
  })
})
