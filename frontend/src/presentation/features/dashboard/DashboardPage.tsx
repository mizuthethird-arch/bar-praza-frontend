import { motion } from 'framer-motion'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { outlineButton } from '../../ui/classes'
import { staggerContainer, useFadeUp } from '../../ui/motion'
import { MenuTable } from './MenuTable'
import { OrderWindowsCard } from './OrderWindowsCard'
import { OrdersTable } from './OrdersTable'
import { StatCards } from './StatCards'

export function DashboardPage() {
  const { getDashboard } = useServices()
  const state = useAsync(getDashboard)
  const fadeUp = useFadeUp()

  return (
    <AsyncView state={state}>
      {(dashboard) => (
        <motion.main
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-6xl space-y-6 p-4 md:p-10"
        >
          <motion.header variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Lunes 19 oct · Datos de demostración
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Hoy en la praza</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs uppercase text-emerald-300">
                Pedidos abiertos
              </span>
              <button type="button" className={`px-4 py-2 ${outlineButton}`}>
                Pausar pedidos
              </button>
            </div>
          </motion.header>

          <motion.section variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCards summary={dashboard.summary} />
          </motion.section>

          <motion.div variants={fadeUp}>
            <OrdersTable orders={dashboard.orders} />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <motion.div variants={fadeUp} className="h-full [&>section]:h-full">
              <MenuTable dishes={dashboard.dishes} />
            </motion.div>
            <motion.div variants={fadeUp} className="h-full [&>section]:h-full">
              <OrderWindowsCard windows={dashboard.windows} minPrepMinutes={dashboard.minPrepMinutes} />
            </motion.div>
          </div>
        </motion.main>
      )}
    </AsyncView>
  )
}
