import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { createHttpAuthGateway } from './infrastructure/http/http-auth-gateway'
import { createHttpPinGateway } from './infrastructure/http/http-pin-gateway'
import { createMockServices } from './infrastructure/mock/create-mock-services'
import App from './presentation/app/App'
import { ServicesProvider } from './presentation/app/ServicesProvider'
import { routerBasename } from './presentation/app/router-base'
import './index.css'

// Composition root. With VITE_API_URL set (see frontend/docs/backend-contract.md), the login and the PIN
// unlock talk to the backend; the other screens stay on the mock until each one is built.
const apiUrl = import.meta.env.VITE_API_URL
const services = createMockServices({
  storage: window.sessionStorage,
  auth: apiUrl ? createHttpAuthGateway({ baseUrl: apiUrl }) : undefined,
  pin: apiUrl ? createHttpPinGateway({ baseUrl: apiUrl }) : undefined,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
      <ServicesProvider services={services}>
        <App />
      </ServicesProvider>
    </BrowserRouter>
  </StrictMode>,
)
