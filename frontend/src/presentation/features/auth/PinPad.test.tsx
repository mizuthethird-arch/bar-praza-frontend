import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

async function typePin(digits: string) {
  for (const digit of digits) await userEvent.click(screen.getByRole('button', { name: digit }))
}

describe('PIN unlock screen (/login/pin)', () => {
  it('greets the remembered person and shows the tablet', async () => {
    renderApp('/login/pin', {}, { signedIn: false })

    expect(await screen.findByRole('heading', { name: 'Hola, [Titular]' })).toBeInTheDocument()
    expect(screen.getByText('DISPOSITIVO RECORDADO · TABLET BARRA')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'PIN, 0 de 4 cifras' })).toBeInTheDocument()
  })

  it('shows the keypad at once after pressing "Desbloquear con PIN", without waiting for the device', async () => {
    renderApp('/login', {}, { signedIn: false })

    await userEvent.click(screen.getByRole('button', { name: 'Desbloquear con PIN' }))

    expect(screen.getByRole('status', { name: 'PIN, 0 de 4 cifras' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeEnabled()
  })

  it('fills the dots as the keypad is pressed, and opens the panel with the right PIN', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await typePin('12')
    expect(screen.getByRole('status', { name: 'PIN, 2 de 4 cifras' })).toBeInTheDocument()

    await typePin('34')

    expect(await screen.findByRole('heading', { name: 'Hoy en la praza' })).toBeInTheDocument()
  })

  it('deletes the last digit with Borrar', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await typePin('12')
    await userEvent.click(screen.getByRole('button', { name: 'Borrar última cifra' }))

    expect(screen.getByRole('status', { name: 'PIN, 1 de 4 cifras' })).toBeInTheDocument()
  })

  it('takes digits from the physical keyboard too', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await userEvent.keyboard('12')

    expect(screen.getByRole('status', { name: 'PIN, 2 de 4 cifras' })).toBeInTheDocument()
  })

  it('tells the user how many attempts are left after a wrong PIN', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await typePin('0000')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'PIN incorrecto. Te quedan 2 intentos antes de bloquear el acceso.',
    )
  })

  it('locks the access after the last wrong attempt, and offers the email login', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await typePin('0000')
    expect(await screen.findByText(/Te quedan 2 intentos/)).toBeInTheDocument()
    await typePin('0000')
    expect(await screen.findByText(/Te queda 1 intento/)).toBeInTheDocument()
    await typePin('0000')

    expect(await screen.findByRole('heading', { name: 'Acceso bloqueado' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar con email y contraseña' }))

    expect(await screen.findByRole('form', { name: 'Entrar al panel' })).toBeInTheDocument()
  })

  it('goes to the email login from "No soy yo"', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await userEvent.click(screen.getByRole('button', { name: 'No soy yo · Entrar con email' }))

    const form = await screen.findByRole('form', { name: 'Entrar al panel' })
    expect(within(form).getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('disables the keypad while the PIN is being checked', async () => {
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, [Titular]' })

    await typePin('0000')

    expect(screen.getByRole('button', { name: '1' })).toBeDisabled()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeEnabled()
  })

  it('keeps the PIN view out of the accessibility tree while the email login is shown', () => {
    renderApp('/login', {}, { signedIn: false })

    expect(screen.queryByRole('status', { name: 'PIN, 0 de 4 cifras' })).not.toBeInTheDocument()
  })

  it('does not read digits typed in the email field as a PIN', async () => {
    renderApp('/login', {}, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), '1234')

    expect(screen.getByRole('form', { name: 'Entrar al panel' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Hoy en la praza' })).not.toBeInTheDocument()
  })
})

