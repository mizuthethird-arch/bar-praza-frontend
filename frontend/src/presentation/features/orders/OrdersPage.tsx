import { useState } from 'react'
import { entryToFocus, filterOrders, type Channel, type EntryStatus, type OrderEntry } from '../../../domain/orders/order-log'
import { useServices } from '../../app/use-services'
import { downloadCsv } from '../../format/csv'
import { formatEuros } from '../../format/money'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, fieldLabel, headCell, inputClass, outlineButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { OrderDetail } from './OrderDetail'
import { channelLabel, entryStatusBadge, entryStatusLabel } from './order-labels'

function exportCsv(entries: OrderEntry[]) {
  downloadCsv('pedidos.csv', [
    ['Nº', 'Hora', 'Cliente', 'Canal', 'Total', 'Estado'],
    ...entries.map((e) => [e.id, e.time, e.customer, channelLabel[e.channel], formatEuros(e.totalCents), entryStatusLabel[e.status]]),
  ])
}

export function OrdersPage() {
  const services = useServices()
  const state = useAsync(services.listOrderLog)
  const [changed, setChanged] = useState<OrderEntry[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState<Channel | 'all'>('all')
  const [status, setStatus] = useState<EntryStatus | 'all'>('all')

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const entries = changed ?? loaded
        const visible = filterOrders(entries, { search, channel, status })
        const selected = entries.find((e) => e.id === selectedId) ?? entryToFocus(entries)

        return (
          <Page>
            <PageHeader
              eyebrow="Datos de demostración"
              title="Pedidos"
              actions={
                <button type="button" onClick={() => exportCsv(visible)} className={`px-4 py-2 ${outlineButton}`}>
                  Exportar CSV
                </button>
              }
            />

            <Reveal className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <label className={fieldLabel}>
                Buscar
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nº de pedido, nombre o teléfono"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className={fieldLabel}>
                Periodo
                <select className={`mt-1 ${inputClass}`} defaultValue="today">
                  <option value="today">Hoy</option>
                </select>
              </label>
              <label className={fieldLabel}>
                Canal
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as Channel | 'all')}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="all">Todos</option>
                  {Object.entries(channelLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={fieldLabel}>
                Estado
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as EntryStatus | 'all')}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="all">Todos</option>
                  {Object.entries(entryStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </Reveal>

            <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
              <Reveal>
                <section className={`${card} overflow-x-auto`}>
                  <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        {['Nº', 'Hora', 'Cliente / mesa', 'Canal', 'Total', 'Estado'].map((name) => (
                          <th key={name} className={headCell}>
                            {name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((entry) => {
                        const cancelled = entry.status === 'cancelled'
                        return (
                          <tr
                            key={entry.id}
                            tabIndex={0}
                            onClick={() => setSelectedId(entry.id)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return
                              event.preventDefault()
                              setSelectedId(entry.id)
                            }}
                            className={`cursor-pointer border-b border-neutral-800/70 last:border-0 hover:bg-neutral-800/40 ${selected?.id === entry.id ? 'bg-neutral-800/70' : ''}`}
                          >
                            <td className={`${bodyCell} font-bold`}>{entry.id}</td>
                            <td className={bodyCell}>{entry.time}</td>
                            <td className={bodyCell}>{entry.customer}</td>
                            <td className={bodyCell}>{channelLabel[entry.channel]}</td>
                            <td className={`${bodyCell} ${cancelled ? 'text-neutral-400 line-through' : ''}`}>
                              {formatEuros(entry.totalCents)}
                            </td>
                            <td className={bodyCell}>
                              {entryStatusBadge[entry.status] ? (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${entryStatusBadge[entry.status]}`}>
                                  {entryStatusLabel[entry.status]}
                                </span>
                              ) : (
                                <span className="text-neutral-400">{entryStatusLabel[entry.status]}</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {visible.length === 0 && <p className="p-4 text-sm text-neutral-400">Ningún pedido coincide.</p>}
                </section>
              </Reveal>
              <Reveal>
                <OrderDetail
                  entry={selected}
                  error={cancelError}
                  onCancel={(id) =>
                    void services.cancelOrder(id).then(
                      (next) => {
                        setChanged(next)
                        setCancelError(null)
                      },
                      () => setCancelError('No se pudo cancelar el pedido'),
                    )
                  }
                />
              </Reveal>
            </div>
          </Page>
        )
      }}
    </AsyncView>
  )
}
