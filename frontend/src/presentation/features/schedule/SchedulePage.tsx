import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScheduleOverview } from '../../../domain/schedule/schedule'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { staggerContainer, useFadeUp } from '../../ui/motion'
import { ClosuresCard } from './ClosuresCard'
import { OrderRulesCard } from './OrderRulesCard'
import { OrderingStatusBanner } from './OrderingStatusBanner'
import { WeeklyScheduleCard } from './WeeklyScheduleCard'

const statusError = 'No se pudo cambiar el estado de los pedidos'

export function SchedulePage() {
  const services = useServices()
  const state = useAsync(services.getScheduleOverview)
  const [changed, setChanged] = useState<ScheduleOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const update = (change: Promise<ScheduleOverview>) =>
    change.then((next) => {
      setChanged(next)
      setError(null)
    })
  const attempt = (change: Promise<ScheduleOverview>, message: string) => void update(change).catch(() => setError(message))
  const fadeUp = useFadeUp()

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const overview = changed ?? loaded
        return (
        <motion.main
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-6xl space-y-6 p-4 md:p-10"
        >
          <motion.header variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Lo que ven los clientes en la app</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Horario y pedidos</h1>
          </motion.header>

          {error && (
            <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          <motion.div variants={fadeUp}>
            <OrderingStatusBanner
              status={overview.status}
              onPause={(minutes) => attempt(services.pauseOrders(minutes), statusError)}
              onResume={() => attempt(services.resumeOrders(), statusError)}
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <motion.div variants={fadeUp} className="h-full [&>section]:h-full">
              <WeeklyScheduleCard weekly={overview.weekly} />
            </motion.div>
            <div className="space-y-6">
              <motion.div variants={fadeUp}>
                <OrderRulesCard rules={overview.rules} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <ClosuresCard
                  closures={overview.closures}
                  onAdd={(closure) => update(services.addClosure(closure))}
                  onRemove={(closure) => attempt(services.removeClosure(closure), 'No se pudo quitar el cierre')}
                />
              </motion.div>
            </div>
          </div>
        </motion.main>
        )
      }}
    </AsyncView>
  )
}
