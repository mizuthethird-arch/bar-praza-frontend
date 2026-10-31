import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { createMockServices } from './infrastructure/mock/create-mock-services'
import App from './presentation/app/App'
import { ServicesProvider } from './presentation/app/ServicesProvider'
import { routerBasename } from './presentation/app/router-base'
import './index.css'

// Composition root: swap createMockServices for the HTTP adapters when the backend is ready.
const services = createMockServices({ storage: window.sessionStorage })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
      <ServicesProvider services={services}>
        <App />
      </ServicesProvider>
    </BrowserRouter>
  </StrictMode>,
)
