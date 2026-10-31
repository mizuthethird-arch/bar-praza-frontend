import type { DaySchedule } from '../../../domain/schedule/schedule'
import { bodyCell, card, headCell, sectionTitle } from '../../ui/classes'

const timeInput = 'h-9 w-24 rounded-md border border-neutral-700 bg-neutral-950 px-2 text-sm'

function DayRow({ entry }: { entry: DaySchedule }) {
  const { day, hours } = entry

  return (
    <tr className="border-b border-neutral-800/70 last:border-0">
      <td className={`${bodyCell} font-medium ${hours ? '' : 'text-neutral-400'}`}>{day}</td>
      {hours ? (
        <>
          <td className={bodyCell}>
            <input type="time" defaultValue={hours.opensAt} className={timeInput} aria-label={`Abre ${day}`} />
          </td>
          <td className={bodyCell}>
            <input type="time" defaultValue={hours.closesAt} className={timeInput} aria-label={`Cierra ${day}`} />
          </td>
        </>
      ) : (
        <td colSpan={2} className={`${bodyCell} text-neutral-400`}>
          Cerrado
        </td>
      )}
      <td className={bodyCell}>
        <input
          type="checkbox"
          defaultChecked={hours !== null}
          aria-label={`${day} abierto`}
          className="h-4 w-4 accent-emerald-500"
        />
      </td>
    </tr>
  )
}

export function WeeklyScheduleCard({ weekly }: { weekly: DaySchedule[] }) {
  return (
    <section className={card}>
      <h2 className={sectionTitle}>Horario semanal</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className={headCell}>Día</th>
              <th className={headCell}>Abre</th>
              <th className={headCell}>Cierra</th>
              <th className={headCell}>Abierto</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((entry) => (
              <DayRow key={entry.day} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-neutral-400">Horas de ejemplo: sustituir por el horario real del bar.</p>
    </section>
  )
}
