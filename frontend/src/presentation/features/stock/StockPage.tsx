import { useState } from 'react'
import {
  filterStock,
  isBelowMinimum,
  isSoldOut,
  stockLevel,
  shoppingList,
  suggestedItem,
  summarizeStock,
  type StockFilter,
  type StockMovement,
  type StockState,
} from '../../../domain/stock/stock'
import { useServices } from '../../app/use-services'
import { formatQuantity } from '../../format/quantity'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, headCell, outlineButton, pill, pillActive, pillIdle, primaryButton, sectionTitle, textButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { StockAdjuster } from './StockAdjuster'

const filters: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'kitchen', label: 'Cocina' },
  { value: 'drinks', label: 'Bebidas' },
  { value: 'low', label: 'Bajo mínimo' },
]

function SummaryCard({ label, value, detail, alert }: { label: string; value: number; detail?: string; alert?: boolean }) {
  return (
    <div className={alert ? 'rounded-xl border border-red-900 bg-red-950/40 p-5' : card}>
      <p className={`text-sm ${alert ? 'text-red-300' : 'text-neutral-400'}`}>{label}</p>
      <p className={`mt-3 text-3xl font-bold ${alert ? 'text-red-300' : ''}`}>{value}</p>
      {detail && <p className="mt-2 text-xs text-neutral-400">{detail}</p>}
    </div>
  )
}

export function StockPage() {
  const services = useServices()
  const state = useAsync(services.getStock)
  const [changed, setChanged] = useState<StockState | null>(null)
  const [filter, setFilter] = useState<StockFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [kind, setKind] = useState<StockMovement['kind']>('in')

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const stock = changed ?? loaded
        const summary = summarizeStock(stock)
        const selected = stock.items.find((item) => item.id === selectedId) ?? suggestedItem(stock.items)
        const toBuy = shoppingList(stock.items).filter((item) => item.restockLabel !== '')

        return (
          <Page>
            <PageHeader
              eyebrow={`Datos de demostración · Recuento ${stock.countedAt}`}
              title="Stock"
              actions={
                <>
                  <button type="button" onClick={() => setKind('count')} className={`px-4 py-2 ${outlineButton}`}>
                    Hacer recuento
                  </button>
                  <button type="button" onClick={() => setKind('in')} className={primaryButton}>
                    Registrar entrada
                  </button>
                </>
              }
            />

            <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Artículos controlados" value={summary.controlled} />
              <SummaryCard label="Bajo mínimo" value={summary.belowMinimum} alert />
              <SummaryCard label="Agotados" value={summary.soldOut} detail="Ocultos en la app" />
              <SummaryCard label="Mermas esta semana" value={summary.waste} detail="registros" />
            </Reveal>

            <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
              <Reveal>
                <section className={`${card} min-w-0`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className={sectionTitle}>Inventario</h2>
                    <div className="flex flex-wrap gap-2">
                      {filters.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFilter(option.value)}
                          className={`${pill} ${option.value === filter ? pillActive : pillIdle}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-800">
                          {['Artículo', 'En stock', 'Nivel', 'Mínimo', 'Usado en'].map((name) => (
                            <th key={name} className={headCell}>
                              {name}
                            </th>
                          ))}
                          <th className={`${headCell} relative`}>
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterStock(stock.items, filter).map((item) => {
                          const low = isBelowMinimum(item)
                          const fill = stockLevel(item)
                          return (
                            <tr key={item.id} className={`border-b border-neutral-800/70 last:border-0 ${selected?.id === item.id ? 'bg-neutral-800/70' : ''}`}>
                              <td className={`${bodyCell} font-medium`}>{item.name}</td>
                              <td className={`${bodyCell} ${low ? 'text-red-400' : ''}`}>{formatQuantity(item.quantity, item.unit)}</td>
                              <td className={bodyCell}>
                                <div className="h-1.5 w-24 rounded-full bg-neutral-800" aria-hidden="true">
                                  <div
                                    className={`h-full rounded-full ${isSoldOut(item) ? '' : low ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${fill * 100}%` }}
                                  />
                                </div>
                              </td>
                              <td className={bodyCell}>{formatQuantity(item.minimum, item.unit)}</td>
                              <td className={`${bodyCell} text-neutral-400`}>{item.usedIn}</td>
                              <td className={`${bodyCell} text-right`}>
                                <button type="button" onClick={() => setSelectedId(item.id)} className={textButton} aria-label={`Ajustar ${item.name}`}>
                                  Ajustar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <label className="mt-4 flex items-center gap-3 border-t border-neutral-800 pt-4 text-sm">
                    <input type="checkbox" defaultChecked className="size-4 accent-emerald-500" />
                    Marcar como «Agotado» en la app cuando un producto llegue a 0
                  </label>
                </section>
              </Reveal>

              <div className="min-w-0 space-y-6">
                {selected && (
                  <Reveal>
                    <StockAdjuster
                      key={selected.id}
                      item={selected}
                      kind={kind}
                      onKindChange={setKind}
                      onSubmit={(movement) => services.recordStockMovement(movement).then(setChanged)}
                    />
                  </Reveal>
                )}
                <Reveal>
                  <section className={card}>
                    <h2 className={sectionTitle}>Lista de compra</h2>
                    <ul className="mt-4 divide-y divide-neutral-800 text-sm">
                      {toBuy.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 py-3">
                          <span>{item.name}</span>
                          <span className="text-neutral-400">{item.restockLabel}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              </div>
            </div>
          </Page>
        )
      }}
    </AsyncView>
  )
}
