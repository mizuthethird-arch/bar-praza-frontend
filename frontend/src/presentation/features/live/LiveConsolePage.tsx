import { useCallback, useEffect, useState } from 'react'
import { lastEventId, summarizeConsole, type LiveEvent, type LiveEventKind } from '../../../domain/live/live-console'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { card, outlineButton, primaryButton, sectionTitle } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'

const REFRESH_MS = 5000

const kindLabel: Record<LiveEventKind, string> = {
  received: 'Nuevo',
  preparing: 'Preparando',
  ready: 'Listo',
  delayed: 'Retrasado',
  cancelled: 'Cancelado',
}

const kindTone: Record<LiveEventKind, string> = {
  received: 'bg-white text-black',
  preparing: 'bg-neutral-700 text-neutral-100',
  ready: 'bg-emerald-950 text-emerald-300',
  delayed: 'bg-red-900 text-red-100',
  cancelled: 'bg-neutral-800 text-neutral-400',
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className={alert ? 'rounded-xl border border-red-900 bg-red-950/40 p-5' : card}>
      <p className={`text-sm ${alert ? 'text-red-300' : 'text-neutral-400'}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold ${alert ? 'text-red-300' : ''}`}>{value}</p>
    </div>
  )
}

function LiveConsole({ initial }: { initial: LiveEvent[] }) {
  const services = useServices()
  const [events, setEvents] = useState(initial)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const fresh = await services.pollLiveEvents(lastEventId(events))
      setEvents((current) => [...current, ...fresh.filter((event) => event.id > lastEventId(current))])
      setError(null)
    } catch {
      setError('No se pudo actualizar')
    }
  }, [events, services])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => void refresh(), REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [paused, refresh])

  const summary = summarizeConsole(events)
  const newestFirst = [...events].reverse()

  return (
    <Page>
      <PageHeader
        eyebrow={`Datos de demostración · ${paused ? 'en pausa' : 'se actualiza cada 5 s'}`}
        title="Consola en vivo"
        actions={
          <>
            <button type="button" onClick={() => void refresh()} className={`px-4 py-2 ${outlineButton}`}>
              Actualizar
            </button>
            <button type="button" onClick={() => setPaused(!paused)} className={primaryButton}>
              {paused ? 'Reanudar' : 'Pausar'}
            </button>
          </>
        }
      />

      <Reveal className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pedidos recibidos" value={summary.received} />
        <Stat label="Retrasados" value={summary.delayed} alert={summary.delayed > 0} />
        <Stat label="Cancelados" value={summary.cancelled} />
      </Reveal>

      <Reveal>
        <section className={card}>
          <h2 className={sectionTitle}>Actividad</h2>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
          <ol className="mt-4 divide-y divide-neutral-800">
            {newestFirst.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="w-14 text-neutral-400">{event.time}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${kindTone[event.kind]}`}>
                  {kindLabel[event.kind]}
                </span>
                <span className="font-bold">{event.orderId}</span>
                <span className="text-neutral-300">{event.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </Page>
  )
}

export function LiveConsolePage() {
  const services = useServices()
  const state = useAsync(services.listLiveEvents)

  return <AsyncView state={state}>{(initial) => <LiveConsole initial={initial} />}</AsyncView>
}
