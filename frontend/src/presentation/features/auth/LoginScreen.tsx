import { Navigate, useLocation, useNavigate } from 'react-router'
import type { Credentials } from '../../../domain/auth/credentials'
import { useServices } from '../../app/use-services'
import { LoginForm } from './LoginForm'
import { loginErrorMessage } from './login-error-message'

export function LoginScreen() {
  const { login, hasSession } = useServices()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'

  async function handleLogin(credentials: Credentials) {
    try {
      await login(credentials)
    } catch (error) {
      throw new Error(loginErrorMessage(error))
    }
    navigate(from, { replace: true })
  }

  if (hasSession()) return <Navigate to={from} replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-300 font-mono md:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden bg-neutral-950 text-neutral-100 md:grid-cols-2 md:rounded-2xl">
        <main className="flex min-h-screen flex-col px-6 py-8 md:min-h-0 md:px-12 md:py-10">
          <p className="text-sm font-semibold">Bar Praza</p>
          <div className="flex flex-1 items-center justify-center py-16">
            <LoginForm onSubmit={handleLogin} />
          </div>
        </main>

        <aside className="hidden p-4 md:block">
          <div className="flex h-full items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
            <img src="/login-art.svg" alt="" className="h-full w-full object-cover" />
          </div>
        </aside>
      </div>
    </div>
  )
}
