export type Credentials = {
  email: string
  password: string
}

// The limits the backend enforces on the login (backend docs/api-for-frontend.md, section 4).
const EMAIL_MAX_LENGTH = 254
const PASSWORD_MAX_LENGTH = 1024
// Printable ASCII without spaces: no accents, no spaces inside the address.
const EMAIL_CHARS = /^[\x21-\x7e]+$/

// The first problem with the login form, in Spanish, or null when it can be sent. The email is
// trimmed first, because the backend trims it too.
export function credentialsProblem({ email, password }: Credentials): string | null {
  const address = email.trim()
  if (address === '') return 'Escribe tu email.'
  if (!EMAIL_CHARS.test(address) || address.length > EMAIL_MAX_LENGTH) {
    return 'Revisa el email: sin acentos ni espacios, hasta 254 caracteres.'
  }
  if (password === '') return 'Escribe tu contraseña.'
  if (password.length > PASSWORD_MAX_LENGTH) return 'La contraseña es demasiado larga.'
  return null
}
