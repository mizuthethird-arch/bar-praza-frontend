import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { shiftTotal, type DeliveredOrder } from '../../../domain/kitchen/kitchen'
import { formatEuros } from '../../format/money'
import { sortDelivered, type DeliverySort } from '../../../domain/kitchen/sort'
import { DeliveryDetailDialog } from './DeliveryDetailDialog'
import { Column, EmptyColumn } from './KitchenColumn'
import { SortControl } from './SortControl'

// A small green card: number, name, time and price. Tapping it opens the details.
function DeliveredCard({ order, onOpen }: { order: DeliveredOrder; onOpen: () => void }) {
  return (
    <motion.button
      layout
      layoutId={`order-${order.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
      className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-emerald-900 bg-neutral-900 px-4 py-3 text-left hover:bg-neutral-800/60"
    >
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="font-bold">{order.id}</span>
          <span className="truncate">{order.customer}</span>
        </span>
        <span className="text-xs text-emerald-300">{`Entregado ${order.deliveredAt}`}</span>
      </span>
      <span className="shrink-0 font-semibold">{formatEuros(order.totalCents)}</span>
    </motion.button>
  )
}

// Orders handed over and paid in the current shift, in the order chosen, with the shift total below.
export function DeliveryHistory({
  delivered,
  now,
  sort,
  onSort,
}: {
  delivered: DeliveredOrder[]
  now: string
  sort: DeliverySort
  onSort: (sort: DeliverySort) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const opened = delivered.find((order) => order.id === openId)
  const shown = sortDelivered(delivered, sort, now)

  return (
    <Column
      title="Entregados y cobrados"
      count={delivered.length || undefined}
      className="xl:sticky xl:top-6"
      controls={
        <SortControl
          column="entregados"
          options={[
            { value: 'delivery', label: 'Entrega' },
            { value: 'amount', label: 'Importe' },
          ]}
          value={sort}
          onChange={onSort}
        />
      }
    >
      {/* Six cards fit; any more scroll inside this box, so the total below always stays in view. */}
      <div role="group" aria-label="Entregados" className="max-h-[30rem] space-y-4 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {shown.map((order) => (
            <DeliveredCard key={order.id} order={order} onOpen={() => setOpenId(order.id)} />
          ))}
        </AnimatePresence>
        {delivered.length === 0 && <EmptyColumn text="Todavía no se ha entregado ningún pedido en este turno." />}
      </div>

      <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 p-5">
        <p className="text-sm text-neutral-400">Total cobrado</p>
        <p className="mt-1 text-2xl font-bold text-emerald-300">{formatEuros(shiftTotal(delivered))}</p>
        <p className="mt-1 text-xs text-neutral-400">En este turno</p>
      </div>

      <AnimatePresence>
        {opened && <DeliveryDetailDialog key={opened.id} order={opened} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </Column>
  )
}
