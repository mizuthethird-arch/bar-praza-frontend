import type { OrderWindow } from '../../../domain/schedule/schedule'
import { card, outlineButton, sectionTitle } from '../../ui/classes'

type Props = {
  windows: OrderWindow[]
  minPrepMinutes: number
}

export function OrderWindowsCard({ windows, minPrepMinutes }: Props) {
  return (
    <section className={card}>
      <h2 className={sectionTitle}>Horario de pedidos</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {windows.map((window) => (
          <div key={window.days} className="flex justify-between border-b border-neutral-800 pb-3">
            <dt className="text-neutral-400">{window.days}</dt>
            <dd>{window.hours}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs uppercase tracking-wide text-neutral-400">Tiempo mínimo de preparación</p>
      <p className="mt-2 text-sm">{minPrepMinutes} minutos</p>
      <button type="button" className={`mt-6 w-full py-2.5 ${outlineButton}`}>
        Editar horario
      </button>
    </section>
  )
}
