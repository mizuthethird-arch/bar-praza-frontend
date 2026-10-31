import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { PIN_LENGTH } from '../../../domain/auth/pin'
import type { RememberedDevice } from '../../../domain/auth/remembered-device'
import { useServices } from '../../app/use-services'
import { useAuthMotion, useLockMotion } from '../../ui/motion'

type Props = {
  // Only the active view takes keys; the hidden one stays mounted to keep the card's height.
  active: boolean
  // Where to go once the PIN is right: the page the person asked for before signing in.
  from: string
  onEmail: () => void
}

const digitKey = 'h-12 rounded-xl border border-line bg-surface text-xl leading-6 font-semibold text-ink disabled:opacity-50'

// The PIN view of the sign-in card: unlocks the panel on the device that remembers this person.
// It does not wait for the device to load before the keypad works.
export function PinPad({ active, from, onEmail }: Props) {
  const { getRememberedDevice, unlockWithPin } = useServices()
  const navigate = useNavigate()
  const { notice } = useAuthMotion()
  const lock = useLockMotion()
  const [device, setDevice] = useState<RememberedDevice | null>(null)
  const [pin, setPin] = useState('')
  const [locked, setLocked] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let current = true
    getRememberedDevice().then((found) => {
      if (current) setDevice(found)
    })
    return () => {
      current = false
    }
  }, [getRememberedDevice])

  async function check(code: string) {
    setBusy(true)
    setFailed(false)
    try {
      const result = await unlockWithPin(code)
      if (result.status === 'ok') {
        navigate(from, { replace: true })
        return
      }
      if (result.status === 'locked') {
        setLocked(true)
        return
      }
      setAttemptsLeft(result.attemptsLeft)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
      setPin('')
    }
  }

  function press(digit: string) {
    if (!active || busy || locked) return
    const next = pin + digit
    setPin(next)
    if (next.length === PIN_LENGTH) void check(next)
  }

  function erase() {
    if (!busy) setPin(pin.slice(0, -1))
  }

  // The physical keyboard works like the keypad on the tablet.
  useEffect(() => {
    if (!active || locked) return
    function onKey(event: KeyboardEvent) {
      if (/^[0-9]$/.test(event.key)) press(event.key)
      else if (event.key === 'Backspace') erase()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const message =
    attemptsLeft !== null
      ? attemptsLeft === 1
        ? 'PIN incorrecto. Te queda 1 intento antes de bloquear el acceso.'
        : `PIN incorrecto. Te quedan ${attemptsLeft} intentos antes de bloquear el acceso.`
      : failed
        ? 'No se pudo entrar. Inténtalo de nuevo.'
        : null

  return (
    // mode="wait": the keypad leaves first, then the lock view comes in, so the two never overlap.
    <AnimatePresence mode="wait" initial={false}>
      {locked ? (
        <motion.div
          key="locked"
          initial={lock.panel.initial}
          animate={lock.panel.animate}
          transition={lock.panel.transition}
          className="flex flex-col gap-4"
        >
          <motion.div
            aria-hidden="true"
            initial={lock.icon.initial}
            animate={lock.icon.animate}
            transition={lock.icon.transition}
            className="flex size-12 items-center justify-center rounded-full bg-tella-soft text-tella"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </motion.div>
          <div role="alert" className="flex flex-col gap-2">
            <span className="text-xs leading-4 font-semibold tracking-[0.12em] text-tella uppercase">Bloqueado</span>
            <h1 className="font-display text-4xl leading-10 font-semibold tracking-[-0.01em] text-ink">Acceso bloqueado</h1>
            <p className="text-base leading-6 text-ink-muted">
              Se han agotado los intentos de PIN en este dispositivo. El desbloqueo con PIN queda suspendido hasta que entres con tu
              email y contraseña.
            </p>
          </div>
          <button
            type="button"
            onClick={onEmail}
            className="h-12 w-full rounded-xl bg-tella text-base font-semibold text-on-tella hover:opacity-90"
          >
            Entrar con email y contraseña
          </button>
          <a href="#ayuda" className="flex min-h-11 items-center justify-center text-[15px] leading-5 font-semibold text-lousa underline underline-offset-4">
            ¿No eres tú? Avisa al encargado
          </a>
        </motion.div>
      ) : (
        <motion.div key="pin" exit={lock.leave.exit} className="flex flex-col">
          {device && (
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-tella-soft font-display text-xl leading-7 font-semibold text-tella">
                {device.initials}
              </div>
              <h1 className="font-display text-4xl leading-10 font-semibold tracking-[-0.01em] break-words text-ink">Hola, {device.name}</h1>
              <span className="max-w-full text-[15px] leading-5 break-all text-ink-muted">{device.email}</span>
              <span className="flex items-center gap-1 text-xs leading-4 font-semibold tracking-[0.12em] text-ink-muted">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                  <path d="M11 18h2" />
                </svg>
                DISPOSITIVO RECORDADO · {device.device}
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {message && (
              <motion.div
                key={message}
                initial={notice.initial}
                animate={notice.animate}
                exit={notice.exit}
                transition={notice.transition}
                className="overflow-hidden"
              >
                <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl bg-tella-soft px-4 py-4 text-[15px] leading-5 font-semibold text-tella">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6M12 16.5v.5" strokeLinecap="round" />
                  </svg>
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6 flex flex-col items-center gap-2">
            <span className="text-[15px] leading-5 font-semibold">Introduce tu PIN de {PIN_LENGTH} cifras</span>
            <div role="status" aria-label={`PIN, ${pin.length} de ${PIN_LENGTH} cifras`} className="flex justify-center gap-4 py-2">
              {Array.from({ length: PIN_LENGTH }, (_, index) => (
                <span
                  key={index}
                  className={`size-4 rounded-full border-2 ${
                    index < pin.length ? 'border-transparent bg-ink' : attemptsLeft !== null ? 'border-tella' : 'border-ink-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2" aria-label="Teclado del PIN">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button key={digit} type="button" disabled={busy} onClick={() => press(digit)} className={digitKey}>
                {digit}
              </button>
            ))}
            <span />
            <button type="button" disabled={busy} onClick={() => press('0')} className={digitKey}>
              0
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={erase}
              aria-label="Borrar última cifra"
              className="h-12 rounded-xl text-[15px] leading-5 font-semibold text-ink-muted disabled:opacity-50"
            >
              Borrar
            </button>
          </div>

          <button
            type="button"
            onClick={onEmail}
            className="flex min-h-11 items-center justify-center text-[15px] leading-5 font-semibold text-lousa underline underline-offset-4"
          >
            No soy yo · Entrar con email
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
