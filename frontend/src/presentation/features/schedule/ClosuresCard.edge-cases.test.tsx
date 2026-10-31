import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

async function openForm() {
  const user = userEvent.setup()
  renderApp('/horario')
  await user.click(await screen.findByRole('button', { name: 'Añadir cierre' }))
  return user
}

describe('ClosuresCard edge cases', () => {
  it('rejects a date that does not exist', async () => {
    const user = await openForm()

    await user.type(screen.getByLabelText('Fecha del cierre'), '2027-02-30')
    await user.type(screen.getByLabelText('Motivo'), 'Reforma')
    await user.click(screen.getByRole('button', { name: 'Guardar cierre' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Indica una fecha válida (AAAA-MM-DD)')
    expect(screen.queryByText(/Reforma/)).not.toBeInTheDocument()
  })

  it('rejects a closure that is already listed', async () => {
    const user = await openForm()

    for (const attempt of [1, 2]) {
      await user.type(screen.getByLabelText('Fecha del cierre'), '2027-01-01')
      await user.type(screen.getByLabelText('Motivo'), 'Reforma')
      await user.click(screen.getByRole('button', { name: 'Guardar cierre' }))
      if (attempt === 1) {
        await screen.findByText(/2027-01-01 · Reforma/)
        await user.click(screen.getByRole('button', { name: 'Añadir cierre' }))
      }
    }

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el cierre')
    expect(screen.getAllByText(/2027-01-01 · Reforma/)).toHaveLength(1)
  })

  it('tells the user when saving fails and keeps the form open', async () => {
    const user = userEvent.setup()
    renderApp('/horario', { addClosure: () => Promise.reject(new Error('down')) })
    await user.click(await screen.findByRole('button', { name: 'Añadir cierre' }))

    await user.type(screen.getByLabelText('Fecha del cierre'), '2027-01-01')
    await user.type(screen.getByLabelText('Motivo'), 'Reforma')
    await user.click(screen.getByRole('button', { name: 'Guardar cierre' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el cierre')
    expect(screen.getByLabelText('Motivo')).toHaveValue('Reforma')
  })

  it('closes the form on cancel without adding anything', async () => {
    const user = await openForm()

    await user.type(screen.getByLabelText('Motivo'), 'Reforma')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Añadir cierre' })).toBeInTheDocument()
    expect(screen.queryByText(/Reforma/)).not.toBeInTheDocument()
  })
})
