import { useState } from 'react'
import { categoryCounts, type Product } from '../../../domain/menu/product'
import { useServices } from '../../app/use-services'
import { formatAmount } from '../../format/money'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, headCell, outlineButton, pill, pillActive, pillIdle, primaryButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { ProductEditor } from './ProductEditor'

const variantSummary = (product: Product) =>
  product.variants.map((variant) => `${variant.label.split(' ')[0]} ${formatAmount(variant.priceCents)}`).join(' · ')

function stockText(product: Product) {
  if (product.stockLabel === null) return 'Sin control'
  return product.lowStock && !product.soldOut ? `${product.stockLabel} · bajo` : product.stockLabel
}

export function CatalogPage() {
  const services = useServices()
  const state = useAsync(services.getCatalog)
  const [changed, setChanged] = useState<Product[] | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const products = changed ?? loaded
        const categories = categoryCounts(products)
        const activeCategory = categories.find((c) => c.category === category)?.category ?? categories[0]?.category
        const visible = products.filter((product) => product.category === activeCategory)
        const selected = visible.find((product) => product.id === selectedId) ?? visible[0]

        return (
          <Page>
            <PageHeader
              eyebrow="Carta de demostración activa"
              title="Carta y productos"
              actions={
                <>
                  <button type="button" disabled className={`px-4 py-2 opacity-40 ${outlineButton}`}>
                    Nueva categoría
                  </button>
                  <button type="button" disabled className={`${primaryButton} opacity-40`}>
                    Nuevo producto
                  </button>
                </>
              }
            />

            <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="min-w-0 space-y-4">
                <Reveal className="flex flex-wrap gap-2">
                  {categories.map(({ category: name, count }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCategory(name)}
                      className={`${pill} ${name === activeCategory ? pillActive : pillIdle}`}
                    >
                      {name} · {count}
                    </button>
                  ))}
                </Reveal>

                <Reveal>
                  <section className={`${card} overflow-x-auto`}>
                    <table className="w-full min-w-[520px] border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-800">
                          {['Producto', 'Variantes', 'Stock', 'En la app', 'Disponible'].map((name) => (
                            <th key={name} className={headCell}>
                              {name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((product) => (
                          <tr
                            key={product.id}
                            className={`border-b border-neutral-800/70 last:border-0 ${selected?.id === product.id ? 'bg-neutral-800/70' : ''}`}
                          >
                            <td className={bodyCell}>
                              <button
                                type="button"
                                onClick={() => setSelectedId(product.id)}
                                className={`text-left font-medium ${product.available ? '' : 'text-neutral-400'}`}
                              >
                                {product.name}
                              </button>
                              {product.dishOfDay && (
                                <span className="block text-[10px] uppercase tracking-widest text-neutral-400">Plato del día</span>
                              )}
                            </td>
                            <td className={`${bodyCell} text-neutral-300`}>{variantSummary(product)}</td>
                            <td className={`${bodyCell} ${product.lowStock ? 'text-red-400' : 'text-neutral-300'}`}>
                              {stockText(product)}
                            </td>
                            <td className={`${bodyCell} text-neutral-300`}>
                              {!product.visibleInApp ? 'Oculto' : product.barOnly ? 'Solo en barra' : 'Visible'}
                            </td>
                            <td className={bodyCell}>
                              {product.soldOut ? (
                                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Agotado auto</span>
                              ) : (
                                <span className="text-emerald-400" aria-label={product.available ? 'Disponible' : 'No disponible'}>
                                  {product.available ? '✓' : '—'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </Reveal>
              </div>

              <Reveal>
                {selected ? (
                  <ProductEditor
                    key={selected.id}
                    product={selected}
                    onSave={(product) => services.saveProduct(product).then(setChanged)}
                    onArchive={(id) => services.archiveProduct(id).then(setChanged)}
                  />
                ) : (
                  <aside aria-label="Editar producto" className={`${card} text-sm text-neutral-400`}>
                    No hay productos en esta categoría.
                  </aside>
                )}
              </Reveal>
            </div>
          </Page>
        )
      }}
    </AsyncView>
  )
}
