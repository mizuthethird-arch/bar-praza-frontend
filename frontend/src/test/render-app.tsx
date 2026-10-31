import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { AppServices } from '../application/services'
import { createMockServices } from '../infrastructure/mock/create-mock-services'
import App from '../presentation/app/App'
import { ServicesProvider } from '../presentation/app/ServicesProvider'

type Options = { signedIn?: boolean }

export function renderApp(path: string, overrides: Partial<AppServices> = {}, { signedIn = true }: Options = {}) {
  const services: AppServices = { ...createMockServices({ loginDelayMs: 0, signedIn }), ...overrides }

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ServicesProvider services={services}>
        <App />
      </ServicesProvider>
    </MemoryRouter>,
  )
}
