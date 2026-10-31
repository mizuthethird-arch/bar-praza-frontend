import { useState, type ReactNode } from 'react'
import { ALLERGENS, type Product } from '../../../domain/menu/product'
import { formatAmount, parseEuros } from '../../format/money'
import { card, fieldLabel, inputClass, outlineButton, primaryButton, textButton } from '../../ui/classes'

type Props = {
  product: Product
  onSave: (product: Product) => Promise<void>
  onArchive: (id: string) => Promise<void>
}

type VariantDraft = { label: string; price: string }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-emerald-500" />
    </label>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

export function ProductEditor({ product, onSave, onArchive }: Props) {
  const [draft, setDraft] = useState(product)
  const [variants, setVariants] = useState<VariantDraft[]>(
    product.variants.map((variant) => ({ label: variant.label, price: formatAmount(variant.priceCents) })),
  )
  const [error, setError] = useState<string | null>(null)

  const patch = (changes: Partial<Product>) => setDraft((current) => ({ ...current, ...changes }))
  const patchVariant = (index: number, changes: Partial<VariantDraft>) =>
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...changes } : variant)))

  function toggleAllergen(allergen: string, on: boolean) {
    patch({ allergens: on ? [...draft.allergens, allergen] : draft.allergens.filter((a) => a !== allergen) })
  }

  async function save() {
    if (draft.name.trim() === '') return setError('Indica un nombre')

    const parsed = variants.map((variant) => ({ label: variant.label.trim(), priceCents: parseEuros(variant.price) }))
    if (parsed.some((variant) => variant.label === '' || variant.priceCents === null)) {
      return setError('Revisa los nombres y precios de las variantes')
    }

    try {
      await onSave({ ...draft, variants: parsed as Product['variants'] })
      setError(null)
    } catch {
      setError('No se pudo guardar el producto')
    }
  }

  async function archive() {
    try {
      await onArchive(product.id)
    } catch {
      setError('No se pudo archivar el producto')
    }
  }

  return (
    <aside aria-label="Editar producto" className={`${card} min-w-0 space-y-5`}>
      <h2 className="text-xl font-bold">Editar · {product.name}</h2>

      <label className={fieldLabel}>
        Nombre
        <input value={draft.name} onChange={(event) => patch({ name: event.target.value })} className={`mt-1 ${inputClass}`} />
      </label>
      <label className={fieldLabel}>
        Descripción
        <textarea
          value={draft.description}
          onChange={(event) => patch({ description: event.target.value })}
          rows={2}
          className={`mt-1 ${inputClass}`}
        />
      </label>

      <Section title="Variantes y precios">
        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-[1fr_6rem] gap-2">
            <input
              aria-label={`Nombre de variante ${index + 1}`}
              value={variant.label}
              onChange={(event) => patchVariant(index, { label: event.target.value })}
              className={inputClass}
            />
            <input
              aria-label={variant.label ? `Precio ${variant.label}` : `Precio de variante ${index + 1}`}
              value={variant.price}
              onChange={(event) => patchVariant(index, { price: event.target.value })}
              className={inputClass}
            />
          </div>
        ))}
        <button type="button" onClick={() => setVariants([...variants, { label: '', price: '' }])} className={textButton}>
          + Añadir variante
        </button>
      </Section>

      <Section title="Alérgenos (los 14 de la UE)">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {ALLERGENS.map((allergen) => (
            <label key={allergen} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.allergens.includes(allergen)}
                onChange={(event) => toggleAllergen(allergen, event.target.checked)}
                className="size-4 accent-neutral-100"
              />
              {allergen}
            </label>
          ))}
        </div>
      </Section>

      <div className="space-y-3 border-t border-neutral-800 pt-4">
        <Toggle label="Visible en la app de pedidos" checked={draft.visibleInApp} onChange={(value) => patch({ visibleInApp: value })} />
        <Toggle label="Plato del día (sale en «Hoy»)" checked={draft.dishOfDay} onChange={(value) => patch({ dishOfDay: value })} />
        <Toggle label="Descontar del stock" checked={draft.deductsStock} onChange={(value) => patch({ deductsStock: value })} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => void save()} className={`flex-1 ${primaryButton}`}>
          Guardar
        </button>
        <button type="button" onClick={() => void archive()} className={`px-4 py-2 ${outlineButton}`}>
          Archivar
        </button>
      </div>
    </aside>
  )
}
