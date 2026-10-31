import { InvalidCredentialsError } from '../../../domain/auth/errors'

export function loginErrorMessage(error: unknown): string {
  if (error instanceof InvalidCredentialsError) return 'Email o contraseña incorrectos'
  return 'No se pudo entrar'
}
