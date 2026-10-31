import { NavLink, Outlet, useNavigate } from 'react-router'
import { useServices } from '../app/use-services'

type NavItem = { label: string; to?: string }

const mainNav: NavItem[] = [
  { label: 'Resumen', to: '/' },
  { label: 'Pedidos', to: '/pedidos' },
  { label: 'Carta y productos', to: '/carta' },
  { label: 'Stock', to: '/stock' },
  { label: 'Horario y pedidos', to: '/horario' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Informes', to: '/informes' },
  { label: 'Personal y ajustes', to: '/ajustes' },
]

const secondaryNav: NavItem[] = [
  { label: 'Pedidos de cocina', to: '/cocina' },
  { label: 'Consola en vivo', to: '/consola' },
  { label: 'Tomar pedido (móvil)' },
]

const itemClass = 'block shrink-0 rounded-md px-3 py-2 text-sm'

// Items without a route yet are shown dimmed and do nothing.
function NavEntry({ item }: { item: NavItem }) {
  if (!item.to) {
    return (
      <span aria-disabled="true" className={`${itemClass} text-neutral-600`}>
        {item.label}
      </span>
    )
  }
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        `${itemClass} ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'}`
      }
    >
      {item.label}
    </NavLink>
  )
}

export function AppShell() {
  const { logout } = useServices()
  const navigate = useNavigate()

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 font-mono text-neutral-100 md:flex-row">
      <aside className="min-w-0 border-b border-neutral-800 bg-neutral-900 p-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r md:p-6">
        <p className="px-3 pb-6 text-base font-bold">Bar Praza</p>

        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {mainNav.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
          <hr aria-hidden="true" className="my-4 hidden border-neutral-800 md:block" />
          {secondaryNav.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
          <button
            type="button"
            onClick={signOut}
            className={`${itemClass} text-left text-neutral-400 hover:bg-neutral-800/60 md:mt-4`}
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}
