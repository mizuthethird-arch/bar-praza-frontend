import type { Order } from '../../../domain/orders/order'
import { formatEuros } from '../../format/money'
import { bodyCell, card, headCell, sectionTitle, textButton } from '../../ui/classes'
import { orderStatusBadge, orderStatusLabel } from './order-status'

function StatusCell({ status }: { status: Order['status'] }) {
  if (status === 'collected') return <span className="text-neutral-400">{orderStatusLabel[status]}</span>

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${orderStatusBadge[status]}`}>
      {orderStatusLabel[status]}
    </span>
  )
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitle}>Pedidos de hoy</h2>
        <button type="button" className={textButton}>
          Abrir consola
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className={headCell}>Nº</th>
              <th className={headCell}>Cliente</th>
              <th className={headCell}>Recogida</th>
              <th className={headCell}>Artículos</th>
              <th className={headCell}>Total</th>
              <th className={headCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-800/70 last:border-0">
                <td className={`${bodyCell} font-bold`}>#{order.id}</td>
                <td className={bodyCell}>{order.client}</td>
                <td className={bodyCell}>{order.delayed ? `${order.pickupTime} · retrasado` : order.pickupTime}</td>
                <td className={bodyCell}>{order.itemCount}</td>
                <td className={bodyCell}>{formatEuros(order.totalCents)}</td>
                <td className={bodyCell}>
                  <StatusCell status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
