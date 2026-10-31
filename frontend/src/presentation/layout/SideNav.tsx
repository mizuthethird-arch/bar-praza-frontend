import { NavLink, useNavigate } from 'react-router'
import { motion, type Variants } from 'framer-motion'
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

const itemClass = 'block shrink-0 rounded-md px-3 py-3 text-sm md:py-2'

// Items without a route yet are shown dimmed and do nothing.
function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
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
      onClick={onNavigate}
      className={({ isActive }) =>
        `${itemClass} ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'}`
      }
    >
      {item.label}
    </NavLink>
  )
}

type Props = {
  // Called after a link or "Cerrar sesión" is chosen (the mobile menu closes itself).
  onNavigate?: () => void
  // Animation for each row when the list sits inside an animated parent.
  itemMotion?: Variants
}

export function SideNav({ onNavigate, itemMotion }: Props) {
  const { logout } = useServices()
  const navigate = useNavigate()

  function signOut() {
    logout()
    onNavigate?.()
    navigate('/login', { replace: true })
  }

  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {mainNav.map((item) => (
        <motion.div key={item.label} variants={itemMotion}>
          <NavEntry item={item} onNavigate={onNavigate} />
        </motion.div>
      ))}
      <hr aria-hidden="true" className="my-4 border-neutral-800" />
      {secondaryNav.map((item) => (
        <motion.div key={item.label} variants={itemMotion}>
          <NavEntry item={item} onNavigate={onNavigate} />
        </motion.div>
      ))}
      <motion.div variants={itemMotion}>
        <button
          type="button"
          onClick={signOut}
          className={`${itemClass} w-full text-left text-neutral-400 hover:bg-neutral-800/60`}
        >
          Cerrar sesión
        </button>
      </motion.div>
    </nav>
  )
}
