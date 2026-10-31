import { describe, expect, it } from 'vitest'
import { credentialsProblem } from './credentials'

const password = 'secret-pass'

describe('credentialsProblem', () => {
  it('lets a plain address and a password through', () => {
    expect(credentialsProblem({ email: 'staff@barpraza.test', password })).toBeNull()
  })

  it('ignores spaces around the address, as the backend does', () => {
    expect(credentialsProblem({ email: '  staff@barpraza.test ', password })).toBeNull()
  })

  it('asks for an email when it is empty', () => {
    expect(credentialsProblem({ email: '   ', password })).toBe('Escribe tu email.')
  })

  it('refuses accents and spaces inside the address', () => {
    expect(credentialsProblem({ email: 'josé@barpraza.test', password })).toMatch(/sin acentos ni espacios/)
    expect(credentialsProblem({ email: 'staff @barpraza.test', password })).toMatch(/sin acentos ni espacios/)
  })

  it('refuses an address over 254 characters', () => {
    const long = `${'a'.repeat(241)}@barpraza.test`
    expect(long.length).toBe(255)
    expect(credentialsProblem({ email: long, password })).toMatch(/hasta 254 caracteres/)
  })

  it('asks for a password when it is empty', () => {
    expect(credentialsProblem({ email: 'staff@barpraza.test', password: '' })).toBe('Escribe tu contraseña.')
  })

  it('refuses a password over 1024 characters, and accepts exactly 1024', () => {
    expect(credentialsProblem({ email: 'staff@barpraza.test', password: 'p'.repeat(1025) })).toBe(
      'La contraseña es demasiado larga.',
    )
    expect(credentialsProblem({ email: 'staff@barpraza.test', password: 'p'.repeat(1024) })).toBeNull()
  })
})
