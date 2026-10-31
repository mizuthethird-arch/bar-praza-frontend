// A short two-note chime for a new order. Browsers may block audio until the user has
// touched the page, so every failure is swallowed: the board still works silently.
export function playChime() {
  try {
    const context = new AudioContext()
    const play = (frequency: number, at: number) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.2, context.currentTime + at)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + at + 0.4)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(context.currentTime + at)
      oscillator.stop(context.currentTime + at + 0.4)
    }
    play(880, 0)
    play(660, 0.25)
    setTimeout(() => void context.close(), 1000)
  } catch {
    // No audio available.
  }
}
