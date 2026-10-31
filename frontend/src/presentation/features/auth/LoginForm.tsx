import { useState, type FormEvent } from 'react'
import type { Credentials } from '../../../domain/auth/credentials'

type Props = {
  onSubmit: (credentials: Credentials) => Promise<void>
}

const inputClass =
  'h-11 w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-100 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none disabled:opacity-50'

export function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-xs">
      <h1 className="text-center text-lg font-semibold">Entrar al panel</h1>

      <form onSubmit={handleSubmit} aria-label="Entrar al panel" className="mt-8 space-y-4">
        <label className="block space-y-2 text-xs text-neutral-300">
          Email
          <input
            type="email"
            name="email"
            placeholder="Escribe tu email"
            autoComplete="username"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block space-y-2 text-xs text-neutral-300">
          Contraseña
          <input
            type="password"
            name="password"
            placeholder="Escribe tu contraseña"
            autoComplete="current-password"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-md bg-neutral-100 text-sm font-medium text-neutral-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
