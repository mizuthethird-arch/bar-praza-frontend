import type { ReactNode } from 'react'
import type { OrderRules } from '../../../domain/schedule/schedule'
import { card, sectionTitle, selectClass } from '../../ui/classes'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-wide text-neutral-400">{label}</span>
      {children}
    </label>
  )
}

export function OrderRulesCard({ rules }: { rules: OrderRules }) {
  return (
    <section className={card}>
      <h2 className={sectionTitle}>Reglas de pedidos</h2>
      <div className="mt-5 space-y-5 text-sm">
        <Field label="Tiempo mínimo de preparación">
          <select defaultValue={rules.minPrepMinutes} className={`block w-full ${selectClass}`}>
            <option value={20}>20 minutos</option>
            <option value={30}>30 minutos</option>
          </select>
        </Field>
        <Field label="Último pedido antes del cierre">
          <select defaultValue={rules.lastOrderMinutesBeforeClose} className={`block w-full ${selectClass}`}>
            <option value={30}>30 minutos</option>
            <option value={15}>15 minutos</option>
          </select>
        </Field>
        <Field label="Máximo de pedidos cada 15 minutos">
          <input type="number" min={1} defaultValue={rules.maxOrdersPerSlot} className={`block w-full ${selectClass}`} />
        </Field>
        <p className="text-xs text-neutral-400">Si se llena, la app propone la siguiente franja libre.</p>
      </div>
    </section>
  )
}
