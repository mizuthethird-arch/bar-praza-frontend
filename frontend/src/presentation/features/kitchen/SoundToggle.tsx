import { useAnimate, useReducedMotion } from 'framer-motion'

// on: the chime sounds. off: the person switched it off. waiting: the browser holds it back until the page is pressed.
export type SoundState = 'on' | 'off' | 'waiting'

const labels: Record<SoundState, string> = {
  on: 'Sonido activo',
  off: 'Sonido apagado',
  waiting: 'Toca para activar el sonido',
}

const tones: Record<SoundState, string> = {
  on: 'border-emerald-700 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/60',
  off: 'border-neutral-600 text-neutral-400 hover:bg-neutral-800',
  waiting: 'border-yellow-700 bg-yellow-950/60 text-yellow-200 hover:bg-yellow-900/60',
}

// A short buzz on a phone that supports vibration. Desktop browsers and iPhones do not, and ignore it.
export function vibrate(ms = 25) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Not supported here.
  }
}

// The sound button: its label and icon say whether the chime is active, off, or waiting for a press.
// Each press also shakes the button, the way the buzz feels, unless the person asks for less motion.
export function SoundToggle({ state, onPress }: { state: SoundState; onPress: () => void }) {
  const [scope, animate] = useAnimate<HTMLButtonElement>()
  const reduced = useReducedMotion()

  return (
    <button
      ref={scope}
      type="button"
      data-sound-toggle=""
      onClick={() => {
        vibrate()
        if (!reduced) void animate(scope.current, { x: [0, -5, 5, -4, 4, -2, 2, 0] }, { duration: 0.4 })
        onPress()
      }}
      className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${tones[state]}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
        <path d="M4 9h3l5-4v14l-5-4H4z" strokeLinejoin="round" />
        {state === 'on' && <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" strokeLinecap="round" />}
        {state === 'off' && <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />}
        {state === 'waiting' && (
          <>
            <path d="M16 9a4 4 0 0 1 0 6" strokeLinecap="round" />
            <circle cx="19" cy="5" r="2" className="fill-current stroke-none" />
          </>
        )}
      </svg>
      {labels[state]}
    </button>
  )
}
