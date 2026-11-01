import { Navigate, Route, Routes } from 'react-router'
import { KitchenPage } from '../features/kitchen/KitchenPage'
import { TestOrderPage } from '../features/kitchen/TestOrderPage'
import { LiveConsolePage } from '../features/live/LiveConsolePage'
import { AuthScreen } from '../features/auth/AuthScreen'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { CustomersPage } from '../features/customers/CustomersPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { OrdersPage } from '../features/orders/OrdersPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { SchedulePage } from '../features/schedule/SchedulePage'
import { TeamPage } from '../features/team/TeamPage'
import { StockPage } from '../features/stock/StockPage'
import { RequireSession } from './RequireSession'
import { AppShell } from '../layout/AppShell'

function App() {
  return (
    <Routes>
      <Route path="/login/*" element={<AuthScreen />} />
      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="horario" element={<SchedulePage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="carta" element={<CatalogPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="cocina" element={<KitchenPage />} />
          <Route path="crear-pedido-prueba" element={<TestOrderPage />} />
          <Route path="consola" element={<LiveConsolePage />} />
          <Route path="ajustes" element={<TeamPage />} />
          <Route path="informes" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
