import { useState } from 'react'
import type { OrderingStatus } from '../../../domain/schedule/schedule'
import { primaryButton, selectClass } from '../../ui/classes'

type Props = {
  status: OrderingStatus
  onPause: (minutes: number) => void
  onResume: () => void
}

export function OrderingStatusBanner({ status, onPause, onResume }: Props) {
  const [minutes, setMinutes] = useState(15)

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-900 bg-emerald-950/50 p-5">
      <div>
        <p className="text-xl font-semibold text-emerald-300">
          {status.accepting ? 'Ahora mismo: aceptando pedidos' : 'Ahora mismo: pedidos pausados'}
        </p>
        <p className="mt-1 text-sm text-emerald-200/70">
          {status.accepting
            ? `Hasta las [${status.until}] · ${status.queued} pedidos en cola`
            : `Pausados durante ${status.pausedMinutes} minutos · ${status.queued} pedidos en cola`}
        </p>
      </div>
      {status.accepting ? (
        <div className="flex items-end gap-3">
          <label className="block text-xs text-neutral-400">
            Pausar durante
            <select
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className={`mt-1 block ${selectClass}`}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </label>
          <button type="button" onClick={() => onPause(minutes)} className={primaryButton}>
            Pausar pedidos
          </button>
        </div>
      ) : (
        <button type="button" onClick={onResume} className={primaryButton}>
          Reanudar pedidos
        </button>
      )}
    </section>
  )
}
