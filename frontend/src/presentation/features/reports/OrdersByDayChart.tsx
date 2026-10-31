import { dayTotal, type DayOrders } from '../../../domain/reports/report'
import { card, sectionTitle } from '../../ui/classes'

const BAR_AREA_PX = 140

export function OrdersByDayChart({ days }: { days: DayOrders[] }) {
  const max = Math.max(1, ...days.map(dayTotal))
  const scale = (value: number) => (value / max) * BAR_AREA_PX

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={sectionTitle}>Pedidos por día</h2>
        <p className="flex gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5"><i className="size-2.5 bg-neutral-100" /> App</span>
          <span className="flex items-center gap-1.5"><i className="size-2.5 bg-neutral-500" /> Barra y mesa</span>
        </p>
      </div>
      <div
        role="img"
        aria-label="Pedidos por día, divididos entre app y barra o mesa"
        className="mt-6 grid grid-cols-7 items-end gap-2 sm:gap-4"
      >
        {days.map((day) => (
          <div key={day.day} className="flex flex-col items-center gap-1 text-xs text-neutral-400">
            {day.closed ? (
              <span className="pb-1">cerrado</span>
            ) : (
              <>
                <span>{dayTotal(day)}</span>
                <div className="flex w-full flex-col justify-end" style={{ height: scale(dayTotal(day)) }}>
                  <div className="bg-neutral-500" style={{ height: scale(day.venue) }} />
                  <div className="bg-neutral-100" style={{ height: scale(day.app) }} />
                </div>
              </>
            )}
            <span className="mt-2 text-neutral-300">{day.day}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
