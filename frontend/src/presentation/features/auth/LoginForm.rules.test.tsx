import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm checks the backend rules before sending', () => {
  it('shows the problem and does not send an address with an accent', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <LoginForm onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'josé@barpraza.test')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret-pass')
    await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('sin acentos ni espacios')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
