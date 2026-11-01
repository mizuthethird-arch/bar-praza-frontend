import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createDemoServices } from '../../infrastructure/mock/demo-services'
import { ServicesProvider } from '../app/ServicesProvider'
import { AppShell } from './AppShell'

function renderShell() {
  const services = createDemoServices({ loginDelayMs: 0, signedIn: true })
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ServicesProvider services={services}>
        <AppShell />
      </ServicesProvider>
    </MemoryRouter>,
  )
}

describe('AppShell scrolling', () => {
  it('keeps the sidebar fixed on desktop, so only the page content scrolls', () => {
    renderShell()

    const sidebar = screen.getByRole('complementary')
    const shell = sidebar.parentElement
    const content = sidebar.nextElementSibling

    expect(shell).toHaveClass('md:h-screen', 'md:overflow-hidden')
    expect(sidebar).toHaveClass('md:h-screen', 'md:overflow-y-auto')
    expect(content).toHaveClass('md:h-screen', 'md:overflow-y-auto')
  })

  it('keeps a fixed top bar on mobile, with the page below it', () => {
    renderShell()

    const bar = screen.getByRole('banner')
    const content = screen.getByRole('complementary').nextElementSibling

    expect(bar).toHaveClass('fixed', 'top-0', 'md:hidden')
    expect(content).toHaveClass('pt-14', 'md:pt-0')
  })
})

describe('AppShell mobile menu', () => {
  it('opens from the hamburger button and lists every section', async () => {
    renderShell()

    const button = screen.getByRole('button', { name: 'Abrir menú' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(button)

    const menu = await screen.findByRole('dialog', { name: 'Menú' })
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(menu).getByRole('link', { name: 'Stock' })).toHaveAttribute('href', '/stock')
    expect(within(menu).getByRole('link', { name: 'Pedidos de cocina' })).toHaveAttribute('href', '/cocina')
  })

  it('closes when a section is chosen', async () => {
    renderShell()

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const menu = await screen.findByRole('dialog', { name: 'Menú' })
    await userEvent.click(within(menu).getByRole('link', { name: 'Stock' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menú' })).not.toBeInTheDocument())
  })

  it('closes with Escape and returns focus to the hamburger button', async () => {
    renderShell()

    const button = screen.getByRole('button', { name: 'Abrir menú' })
    await userEvent.click(button)
    await screen.findByRole('dialog', { name: 'Menú' })
    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menú' })).not.toBeInTheDocument())
    expect(button).toHaveFocus()
  })

  it('closes with the same button, now labelled Cerrar menú', async () => {
    renderShell()

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await screen.findByRole('dialog', { name: 'Menú' })
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menú' })).not.toBeInTheDocument())
  })
})
