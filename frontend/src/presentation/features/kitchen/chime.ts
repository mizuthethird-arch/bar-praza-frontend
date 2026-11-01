// A short two-note chime for a new order. Browsers only let a page make sound after the person has
// pressed or clicked it, and a context made earlier starts held back. So the page keeps one audio
// context: unlockSound() resumes it on a press, and playChime() reports when it is still held back.
let context: AudioContext | null = null

function audio(): AudioContext {
  if (!context || context.state === 'closed') context = new AudioContext()
  return context
}

// Call from a press, click or key on the page. Resolves true when the browser now lets this page make
// sound, and false when it refused. Resolves true when there is no audio at all, so nothing is held back.
export async function unlockSound(): Promise<boolean> {
  let current: AudioContext
  try {
    current = audio()
  } catch {
    return true
  }
  // A helper, so the state is read again after the await rather than narrowed by the check above.
  const isRunning = () => current.state === 'running'
  if (isRunning()) return true
  try {
    await current.resume()
  } catch {
    // The browser refused: the sound stays held back.
  }
  return isRunning()
}

// Plays the two notes. Returns false when the browser is holding the sound back, because the page
// has not been pressed yet. Returns true when it played, or when there is no audio to hold back.
export function playChime(): boolean {
  try {
    const current = audio()
    const running = current.state === 'running'
    if (!running) void current.resume()
    const play = (frequency: number, at: number) => {
      const oscillator = current.createOscillator()
      const gain = current.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.2, current.currentTime + at)
      gain.gain.exponentialRampToValueAtTime(0.001, current.currentTime + at + 0.4)
      oscillator.connect(gain)
      gain.connect(current.destination)
      oscillator.start(current.currentTime + at)
      oscillator.stop(current.currentTime + at + 0.4)
    }
    play(880, 0)
    play(660, 0.25)
    return running
  } catch {
    return true
  }
}
