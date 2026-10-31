import { totalOrders, dayTotal, type Report } from '../../../domain/reports/report'
import { useServices } from '../../app/use-services'
import { downloadCsv } from '../../format/csv'
import { formatEuros } from '../../format/money'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { card, fieldLabel, outlineButton, sectionTitle, selectClass } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { OrdersByDayChart } from './OrdersByDayChart'

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={card}>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-neutral-400">{detail}</p>
    </div>
  )
}

function exportCsv(report: Report) {
  downloadCsv('informe.csv', [
    ['Día', 'App', 'Barra y mesa', 'Total'],
    ...report.days.map((day) => [day.day, String(day.app), String(day.venue), String(dayTotal(day))]),
  ])
}

export function ReportsPage() {
  const services = useServices()
  const state = useAsync(services.getReport)

  return (
    <AsyncView state={state}>
      {(report) => {
        const topCount = Math.max(1, ...report.topDishes.map((dish) => dish.count))

        return (
          <Page>
            <PageHeader
              eyebrow="Datos inventados para el diseño · No son del bar"
              title="Informes"
              actions={
                <>
                  <label className={fieldLabel}>
                    Periodo
                    <select className={`mt-1 ${selectClass}`} defaultValue="7">
                      <option value="7">{report.periodLabel}</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => exportCsv(report)} className={`px-4 py-2 ${outlineButton}`}>
                    Exportar
                  </button>
                </>
              }
            />

            <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Pedidos" value={String(totalOrders(report))} detail="App y barra" />
              <Kpi label="Ventas" value={formatEuros(report.salesCents)} detail="Periodo completo" />
              <Kpi label="Recogidos a tiempo" value={`${report.onTimePercent} %`} detail="listos antes de la hora" />
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-5">
                <p className="text-sm text-red-300">App vs WhatsApp</p>
                <p className="mt-3 text-3xl font-bold text-red-300">—</p>
                <p className="mt-2 text-xs text-red-300/70">Necesita el recuento de WhatsApp</p>
              </div>
            </Reveal>

            <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Reveal>
                <OrdersByDayChart days={report.days} />
              </Reveal>
              <Reveal>
                <section className={card}>
                  <h2 className={sectionTitle}>Lo más pedido</h2>
                  <ol className="mt-4 space-y-3 text-sm">
                    {report.topDishes.map((dish, index) => (
                      <li key={dish.name}>
                        <div className="flex justify-between gap-3">
                          <span>{`${index + 1}. ${dish.name}`}</span>
                          <span className="font-bold">{dish.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-neutral-800" aria-hidden="true">
                          <div className="h-full rounded-full bg-neutral-100" style={{ width: `${(dish.count / topCount) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </Reveal>
            </div>

            <Reveal>
              <section className={card}>
                <h2 className={sectionTitle}>Horas punta de la app</h2>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-neutral-400">Comida</dt>
                    <dd className="mt-1 font-bold">{report.peaks.lunch}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Cena</dt>
                    <dd className="mt-1 font-bold">{report.peaks.dinner}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Pedidos retrasados</dt>
                    <dd className="mt-1 font-bold">
                      {report.peaks.delayedOrders} · {report.peaks.delayedNote}
                    </dd>
                  </div>
                </dl>
              </section>
            </Reveal>
          </Page>
        )
      }}
    </AsyncView>
  )
}
