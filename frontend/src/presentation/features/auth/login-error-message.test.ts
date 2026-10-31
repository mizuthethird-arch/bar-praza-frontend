import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../../domain/auth/errors'
import { loginErrorMessage } from './login-error-message'

describe('loginErrorMessage', () => {
  it('explains wrong credentials in Spanish', () => {
    expect(loginErrorMessage(new InvalidCredentialsError())).toBe('Email o contraseña incorrectos')
  })

  it('falls back to a generic message for anything else', () => {
    expect(loginErrorMessage(new Error('network down'))).toBe('No se pudo entrar')
    expect(loginErrorMessage('weird')).toBe('No se pudo entrar')
  })
})
