import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import type { AppServices } from './application/services'
import { createHttpAuthGateway } from './infrastructure/http/http-auth-gateway'
import { createHttpPinGateway } from './infrastructure/http/http-pin-gateway'
import { createSocketRealtime } from './infrastructure/realtime/socket-realtime'
import { createMockServices } from './infrastructure/mock/create-mock-services'
import App from './presentation/app/App'
import { ServicesProvider } from './presentation/app/ServicesProvider'
import { routerBasename } from './presentation/app/router-base'
import './index.css'

// Which services the app runs on (ISS-13):
// - VITE_API_URL set: the real login and PIN unlock talk to the backend; the other screens stay on the mock.
// - Demo build (VITE_DEMO_MODE=true), or development with no VITE_API_URL: the demo logins, on the mock.
// - Otherwise (a production build with neither): nothing starts, and the page says what is missing.
// VITE_REALTIME_URL (a WebSocket address) brings changes from other devices in as they happen. Without it the
// board and the live console use the mock's own changes only.
// The demo module is imported only on the demo path, so a production build without the flag leaves it out.
const apiUrl = import.meta.env.VITE_API_URL
const demo = import.meta.env.VITE_DEMO_MODE === 'true' || (import.meta.env.DEV && !apiUrl)

async function buildServices(): Promise<AppServices | null> {
  if (demo) {
    const { createDemoServices } = await import('./infrastructure/mock/demo-services')
    return createDemoServices({ storage: window.sessionStorage, kitchenStorage: window.localStorage })
  }
  if (!apiUrl) return null
  const realtimeUrl = import.meta.env.VITE_REALTIME_URL
  return createMockServices({
    auth: createHttpAuthGateway({ baseUrl: apiUrl }),
    pin: createHttpPinGateway({ baseUrl: apiUrl }),
    realtime: realtimeUrl ? createSocketRealtime({ url: realtimeUrl }) : undefined,
  })
}

const root = createRoot(document.getElementById('root')!)
void buildServices().then((services) => {
  if (!services) {
    root.render(<p>Configuración incompleta: falta VITE_API_URL o VITE_DEMO_MODE=true al compilar.</p>)
    return
  }
  root.render(
    <StrictMode>
      <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
        <ServicesProvider services={services}>
          <App />
        </ServicesProvider>
      </BrowserRouter>
    </StrictMode>,
  )
})
