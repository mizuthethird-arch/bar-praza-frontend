import type { Dish } from '../../../domain/menu/dish'
import { formatPrices } from '../../format/money'
import { bodyCell, card, headCell, primaryButton, sectionTitle, textButton } from '../../ui/classes'

export function MenuTable({ dishes }: { dishes: Dish[] }) {
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={sectionTitle}>Carta</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-neutral-400">
            Categoría
            <select className="ml-2 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm">
              <option>Raciones</option>
            </select>
          </label>
          <button type="button" className={primaryButton}>
            Añadir plato
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className={headCell}>Plato</th>
              <th className={headCell}>Precios</th>
              <th className={headCell}>Alérgenos</th>
              <th className={headCell}>Disponible</th>
              <th className={`${headCell} relative`}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish.name} className="border-b border-neutral-800/70 last:border-0">
                <td className={`${bodyCell} ${dish.available ? 'font-medium' : 'text-neutral-400'}`}>{dish.name}</td>
                <td className={bodyCell}>{formatPrices(dish.pricesCents)}</td>
                <td className={`${bodyCell} text-neutral-400`}>
                  {dish.allergens.length > 0 ? dish.allergens.join(', ') : '—'}
                </td>
                <td className={bodyCell}>
                  {dish.available ? (
                    <span className="text-emerald-400">Sí</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide text-neutral-400">Agotado</span>
                  )}
                </td>
                <td className={`${bodyCell} text-right`}>
                  <button type="button" className={textButton}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
