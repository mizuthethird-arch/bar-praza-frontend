import type { OrdersSummary } from '../../../domain/orders/summarize-orders'
import { formatEuros } from '../../format/money'
import { card } from '../../ui/classes'

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={card}>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-neutral-400">{detail}</p>
    </div>
  )
}

export function StatCards({ summary }: { summary: OrdersSummary }) {
  return (
    <>
      <StatCard
        label="Pedidos hoy"
        value={String(summary.ordersToday)}
        detail={`${summary.newOrders} nuevos · ${summary.inProgressOrders} en curso`}
      />
      <StatCard label="Ventas por la app" value={formatEuros(summary.salesCents)} detail="Cobro en barra" />
      <StatCard
        label="Ticket medio"
        value={formatEuros(summary.averageTicketCents)}
        detail={`${summary.ordersToday} pedidos`}
      />
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-5">
        <p className="text-sm text-red-300">App vs WhatsApp</p>
        <p className="mt-3 text-3xl font-bold text-red-300">—</p>
        <p className="mt-2 text-xs text-red-300/70">Pendiente del recuento de 7 días</p>
      </div>
    </>
  )
}
