import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { credentialsProblem, type Credentials } from '../../../domain/auth/credentials'
import { useAuthMotion } from '../../ui/motion'

type Props = {
  onSubmit: (credentials: Credentials) => Promise<void>
  // Opens the PIN unlock screen for the device that remembers this person.
  onPin?: () => void
}

const fieldClass =
  'h-12 w-full rounded-sm border border-ink-muted bg-surface pl-4 pr-12 text-base text-ink placeholder:text-ink-muted focus:border-tella focus:outline-none aria-invalid:border-tella aria-invalid:bg-tella-soft disabled:opacity-50'

const labelClass = 'block text-[15px] leading-5 font-semibold text-ink'

const socialClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-ink-muted px-3 text-center text-[15px] leading-5 font-semibold text-ink'

export function LoginForm({ onSubmit, onPin }: Props) {
  const { notice } = useAuthMotion()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Ticked by default, as in the Design artifact; sent with the login so the backend remembers the device.
  const [rememberDevice, setRememberDevice] = useState(true)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const problem = credentialsProblem({ email, password })
    if (problem) {
      setError(problem)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ email, password, rememberDevice })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl leading-10 font-semibold tracking-[-0.01em] text-ink">Entrar al panel</h1>
        <p className="text-base leading-6 text-ink-muted">Introduce tus datos para gestionar pedidos, carta y personal.</p>
      </div>

      {/* noValidate: the browser's own email check would block an accent before our message can say why. */}
      <form onSubmit={handleSubmit} noValidate aria-label="Entrar al panel" className="flex flex-col">
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key={error}
              initial={notice.initial}
              animate={notice.animate}
              exit={notice.exit}
              transition={notice.transition}
              className="overflow-hidden"
            >
              <p role="alert" className="mb-4 flex items-start gap-3 rounded-xl bg-tella-soft px-4 py-3 text-sm font-semibold text-tella">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6M12 16.5v.5" strokeLinecap="round" />
                </svg>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 flex flex-col gap-2">
          <label htmlFor="login-email" className={labelClass}>
            Email
          </label>
          <span className="relative block">
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Escribe tu email"
              autoComplete="username"
              required
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 fill-none stroke-ink-muted stroke-2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <label htmlFor="login-password" className={labelClass}>
            Contraseña
          </label>
          <span className="relative block">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Escribe tu contraseña"
              autoComplete="current-password"
              required
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              aria-controls="login-password"
              onClick={() => setShowPassword((shown) => !shown)}
              className="absolute top-0.5 right-1 flex h-11 w-11 items-center justify-center rounded-sm text-ink-muted hover:text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </span>
        </div>

        <div className="mb-4 flex h-24 flex-col justify-between">
          <label className="flex h-11 items-center gap-2 text-[15px] leading-5 text-ink">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              className="size-5 accent-tella"
            />
            Recordar este dispositivo 30 días
          </label>
          <a href="#recuperar" className="flex h-11 items-center text-[15px] leading-5 font-semibold text-lousa underline underline-offset-4">
            ¿Olvidaste la contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-xl bg-tella text-base font-semibold text-on-tella transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      {onPin && (
        <>
          <div className="flex h-5 items-center gap-4 text-[15px] leading-5 text-ink-muted">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            o en este dispositivo
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onPin} className={socialClass}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M12 15h.01" strokeLinecap="round" />
              </svg>
              Desbloquear con PIN
            </button>
          </div>
        </>
      )}
    </div>
  )
}
