import { useState } from 'react'
import { filterCustomers, type CustomerFilter } from '../../../domain/customers/customers'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, fieldLabel, headCell, inputClass, outlineButton, sectionTitle } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'

export function CustomersPage() {
  const services = useServices()
  const state = useAsync(services.listCustomers)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<CustomerFilter['type']>('all')

  return (
    <AsyncView state={state}>
      {(customers) => (
        <Page>
          <PageHeader eyebrow="Datos de demostración" title="Clientes" />

          <Reveal>
            <p className={`${card} text-sm text-neutral-300`}>
              Solo ves a quien ha pedido por la app. Los teléfonos se muestran parcialmente y se usan solo para avisar de un
              pedido. Los clientes con cuenta pueden borrar sus datos desde la app.
            </p>
          </Reveal>

          <Reveal className="grid gap-4 md:grid-cols-[1fr_14rem]">
            <label className={fieldLabel}>
              Buscar
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre o últimas cifras del teléfono"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className={fieldLabel}>
              Tipo
              <select value={type} onChange={(event) => setType(event.target.value as CustomerFilter['type'])} className={`mt-1 ${inputClass}`}>
                <option value="all">Todos</option>
                <option value="account">Con cuenta</option>
                <option value="guest">Sin cuenta</option>
              </select>
            </label>
          </Reveal>

          <Reveal>
            <section className={`${card} overflow-x-auto`}>
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800">
                    {['Cliente', 'Teléfono', 'Cuenta', 'Pedidos', 'Último', 'Suele pedir'].map((name) => (
                      <th key={name} className={headCell}>
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterCustomers(customers, { search, type }).map((customer) => (
                    <tr key={customer.id} className="border-b border-neutral-800/70 last:border-0">
                      <td className={`${bodyCell} font-bold`}>{customer.name}</td>
                      <td className={bodyCell}>--{customer.phoneTail}</td>
                      <td className={bodyCell}>
                        {customer.hasAccount ? (
                          <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                            Sí
                          </span>
                        ) : (
                          <span className="text-neutral-400">No</span>
                        )}
                      </td>
                      <td className={bodyCell}>{customer.orders}</td>
                      <td className={bodyCell}>{customer.lastOrder}</td>
                      <td className={`${bodyCell} text-neutral-400`}>{customer.usualOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </Reveal>

          <Reveal>
            <section className={`${card} flex flex-wrap items-center justify-between gap-4`}>
              <div>
                <h2 className={sectionTitle}>Solicitudes de datos</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Ninguna pendiente. Si un cliente pide sus datos o que los borres, aparece aquí.
                </p>
              </div>
              <button type="button" disabled className={`px-4 py-2 opacity-40 ${outlineButton}`}>
                Ver historial
              </button>
            </section>
          </Reveal>
        </Page>
      )}
    </AsyncView>
  )
}
