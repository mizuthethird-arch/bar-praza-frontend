import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'
import { API_ENDPOINTS } from './api-endpoints'

describe('API documentation', () => {
  it('lists every endpoint with its method and path', async () => {
    renderApp('/api-documentation')

    expect(await screen.findByRole('heading', { level: 1, name: 'API documentation' })).toBeInTheDocument()
    expect(screen.getByText('/auth/login')).toBeInTheDocument()
    expect(screen.getByText('/kitchen/orders/{id}/deliver')).toBeInTheDocument()
  })

  it('keeps every endpoint unique by method and path', () => {
    const keys = API_ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('filters to the endpoints that are built, and hides the rest', async () => {
    const user = userEvent.setup()
    renderApp('/api-documentation')
    await screen.findByRole('heading', { level: 1, name: 'API documentation' })

    await user.click(screen.getByRole('button', { name: 'Built' }))

    expect(screen.getByRole('button', { name: 'Built' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('/kitchen/orders/{id}/deliver')).not.toBeInTheDocument()
    expect(screen.getByText('/auth/login')).toBeInTheDocument()
  })

  it('shows the rules and errors of an endpoint when it is opened', async () => {
    const user = userEvent.setup()
    renderApp('/api-documentation')
    const login = (await screen.findByText('/auth/login')).closest('details')!

    await user.click(within(login).getByText('/auth/login'))

    expect(within(login).getByText(/401 invalid_credentials/)).toBeInTheDocument()
  })

  it('lists the browser-only behaviour and the open decisions', async () => {
    renderApp('/api-documentation')

    expect(await screen.findByRole('heading', { name: 'Open decisions for the backend' })).toBeInTheDocument()
    expect(screen.getByText(/Drag order inside Nuevos/)).toBeInTheDocument()
  })
})
