import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm (WP-2.1)', () => {
  it('shows email and password fields and a submit button', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('passes the entered email and password to onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'staff@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret-pass')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'staff@example.com',
      password: 'secret-pass',
    })
  })

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Wrong credentials'))
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'staff@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'bad')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong credentials')
  })
})

describe('LoginForm edge cases', () => {
  it('shows a pending state and blocks double submits while waiting', async () => {
    let finish: () => void = () => {}
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'staff@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    const pending = await screen.findByRole('button', { name: 'Entrando…' })
    expect(pending).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    await userEvent.click(pending)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    finish()
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('does not submit when the fields are empty', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('uses a generic message when the rejection is not an Error', async () => {
    render(<LoginForm onSubmit={vi.fn().mockRejectedValue('boom')} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.co')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo entrar')
  })

  it('clears the previous error when trying again', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Wrong credentials')).mockResolvedValueOnce(undefined)
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.co')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await vi.waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})

describe('LoginForm design (dark warm mockup)', () => {
  it('shows the title and the one-line introduction', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Entrar al panel' })).toBeInTheDocument()
    expect(screen.getByText(/introduce tus datos para gestionar pedidos, carta y personal/i)).toBeInTheDocument()
  })

  it('lets the user show and hide the password with a button', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    const password = screen.getByLabelText(/contraseña/i)

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(password).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('marks both fields invalid and shows the error with an icon after a failed sign-in', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Email o contraseña incorrectos'))
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.co')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Email o contraseña incorrectos')
    expect(alert.querySelector('svg')).not.toBeNull()
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('LoginForm artifact parity', () => {
  it('has no Google button: it is removed for now', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument()
  })

  it('offers the PIN unlock and hands over to it', async () => {
    const onPin = vi.fn()
    render(<LoginForm onSubmit={vi.fn()} onPin={onPin} />)

    await userEvent.click(screen.getByRole('button', { name: 'Desbloquear con PIN' }))

    expect(onPin).toHaveBeenCalledTimes(1)
  })

  it('shows the remember-device checkbox and the forgot-password link', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('checkbox', { name: 'Recordar este dispositivo 30 días' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '¿Olvidaste la contraseña?' })).toBeInTheDocument()
  })

  it('shows the divider between the form and the other sign-in options', () => {
    render(<LoginForm onSubmit={vi.fn()} onPin={vi.fn()} />)

    expect(screen.getByText('o en este dispositivo')).toBeInTheDocument()
  })

  it('hides the divider and the PIN button when there is no PIN unlock', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.queryByText('o en este dispositivo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /desbloquear con pin/i })).not.toBeInTheDocument()
  })
})
