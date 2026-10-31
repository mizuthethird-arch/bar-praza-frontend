import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { shiftTotal, type DeliveredOrder } from '../../../domain/kitchen/kitchen'
import { formatEuros } from '../../format/money'
import { DeliveryDetailDialog } from './DeliveryDetailDialog'
import { Column, EmptyColumn } from './KitchenColumn'

const triggerId = (id: string) => `delivered-${id}`

// A small green card: number, name, time and price. Tapping it opens the details.
function DeliveredCard({ order, onOpen }: { order: DeliveredOrder; onOpen: () => void }) {
  return (
    <button
      id={triggerId(order.id)}
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
    </button>
  )
}

// Orders handed over and paid in the current shift, newest first, with the shift total below.
export function DeliveryHistory({ delivered }: { delivered: DeliveredOrder[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const opened = delivered.find((order) => order.id === openId)

  function close() {
    const trigger = openId ? document.getElementById(triggerId(openId)) : null
    setOpenId(null)
    trigger?.focus()
  }

  return (
    <Column
      title="Entregados y cobrados"
      count={delivered.length || undefined}
      className="md:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-6"
    >
      {delivered.length === 0 ? (
        <EmptyColumn text="Todavía no se ha entregado ningún pedido en este turno." />
      ) : (
        delivered.map((order) => <DeliveredCard key={order.id} order={order} onOpen={() => setOpenId(order.id)} />)
      )}

      <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 p-5">
        <p className="text-sm text-neutral-400">Total cobrado</p>
        <p className="mt-1 text-2xl font-bold text-emerald-300">{formatEuros(shiftTotal(delivered))}</p>
        <p className="mt-1 text-xs text-neutral-400">En este turno</p>
      </div>

      <AnimatePresence>
        {opened && <DeliveryDetailDialog key={opened.id} order={opened} onClose={close} />}
      </AnimatePresence>
    </Column>
  )
}
