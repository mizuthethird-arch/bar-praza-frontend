import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError, InvalidRequestError, TooManyAttemptsError } from '../../../domain/auth/errors'
import { loginErrorMessage } from './login-error-message'

describe('loginErrorMessage', () => {
  it('explains wrong credentials in Spanish', () => {
    expect(loginErrorMessage(new InvalidCredentialsError())).toBe('Email o contraseña incorrectos')
  })

  it('asks for the form to be checked when the request was refused as malformed', () => {
    expect(loginErrorMessage(new InvalidRequestError())).toBe('Revisa el email y la contraseña')
  })

  it('tells the person to wait when there were too many attempts', () => {
    expect(loginErrorMessage(new TooManyAttemptsError())).toBe('Demasiados intentos. Inténtalo más tarde.')
  })

  it('falls back to a generic message for anything else', () => {
    expect(loginErrorMessage(new Error('network down'))).toBe('No se pudo entrar. Inténtalo de nuevo.')
    expect(loginErrorMessage('weird')).toBe('No se pudo entrar. Inténtalo de nuevo.')
  })
})
