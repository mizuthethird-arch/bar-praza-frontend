import { InvalidCredentialsError, InvalidRequestError, TooManyAttemptsError } from '../../../domain/auth/errors'

// The backend sends codes only; these are the messages the screen shows for them.
export function loginErrorMessage(error: unknown): string {
  if (error instanceof InvalidCredentialsError) return 'Email o contraseña incorrectos'
  if (error instanceof InvalidRequestError) return 'Revisa el email y la contraseña'
  if (error instanceof TooManyAttemptsError) return 'Demasiados intentos. Inténtalo más tarde.'
  return 'No se pudo entrar. Inténtalo de nuevo.'
}
