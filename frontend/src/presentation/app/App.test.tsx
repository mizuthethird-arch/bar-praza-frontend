import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockAccounts } from '../../infrastructure/mock/mock-accounts'
import { renderApp } from '../../test/render-app'

const [owner] = mockAccounts

describe('App routes', () => {
  it('shows the login form at /login', () => {
    renderApp('/login', {}, { signedIn: false })

    expect(screen.getByRole('form', { name: /entrar al panel/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('shows the dashboard at /', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Hoy en la praza' })).toBeInTheDocument()
    expect(await screen.findByText('#44')).toBeInTheDocument()
  })

  it('goes to the dashboard after a successful login', async () => {
    renderApp('/login', {}, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), owner.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), owner.password)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: 'Hoy en la praza' })).toBeInTheDocument()
  })

  it('stays on the login form after a wrong password', async () => {
    renderApp('/login', {}, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), owner.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'nope')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos')
    expect(screen.queryByRole('heading', { name: 'Hoy en la praza' })).not.toBeInTheDocument()
  })

  it('shows the schedule page at /horario', async () => {
    renderApp('/horario')

    expect(await screen.findByRole('heading', { name: 'Horario y pedidos' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Horario semanal' })).toBeInTheDocument()
  })

  it('redirects unknown paths to the dashboard', async () => {
    renderApp('/no-such-page')

    expect(await screen.findByRole('heading', { name: 'Hoy en la praza' })).toBeInTheDocument()
  })
})

describe('session guard', () => {
  it('sends a visitor without a session to the login form', () => {
    renderApp('/pedidos', {}, { signedIn: false })

    expect(screen.getByRole('form', { name: /entrar al panel/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pedidos' })).not.toBeInTheDocument()
  })

  it('opens the page that was asked for once the visitor logs in', async () => {
    renderApp('/pedidos', {}, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), owner.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), owner.password)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: 'Pedidos' })).toBeInTheDocument()
  })

  it('goes back to the login form after signing out', async () => {
    renderApp('/')

    await userEvent.click(await screen.findByRole('button', { name: /cerrar sesión/i }))

    expect(screen.getByRole('form', { name: /entrar al panel/i })).toBeInTheDocument()
  })

  it('skips the login form when already signed in', async () => {
    renderApp('/login')

    expect(await screen.findByRole('heading', { name: 'Hoy en la praza' })).toBeInTheDocument()
  })

  it('guards every panel page', () => {
    for (const path of ['/', '/horario', '/pedidos', '/carta', '/stock', '/clientes', '/informes', '/consola', '/ajustes', '/cocina']) {
      const { unmount } = renderApp(path, {}, { signedIn: false })
      expect(screen.getByRole('form', { name: /entrar al panel/i }), path).toBeInTheDocument()
      unmount()
    }
  })

  it('refuses an email without an account', async () => {
    renderApp('/', {}, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), 'nadie@barpraza.test')
    await userEvent.type(screen.getByLabelText(/contraseña/i), owner.password)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos')
  })

  it('does not let an unknown path past the guard', () => {
    renderApp('/no-such-page', {}, { signedIn: false })

    expect(screen.getByRole('form', { name: /entrar al panel/i })).toBeInTheDocument()
  })
})

describe('sidebar navigation', () => {
  it('links every finished view', async () => {
    renderApp('/')

    for (const [name, href] of [
      ['Pedidos', '/pedidos'],
      ['Carta y productos', '/carta'],
      ['Stock', '/stock'],
      ['Clientes', '/clientes'],
      ['Informes', '/informes'],
      ['Pedidos de cocina', '/cocina'],
      ['Consola en vivo', '/consola'],
      ['Personal y ajustes', '/ajustes'],
    ]) {
      expect(await screen.findByRole('link', { name })).toHaveAttribute('href', href)
    }
  })
})

describe('login errors', () => {
  it('shows a generic message for an unexpected failure', async () => {
    renderApp('/login', { login: () => Promise.reject(new Error('network')) }, { signedIn: false })

    await userEvent.type(screen.getByLabelText(/email/i), owner.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), owner.password)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo entrar')
  })
})
