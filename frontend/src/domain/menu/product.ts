export type ProductVariant = {
  label: string
  priceCents: number
}

export type Product = {
  id: string
  name: string
  category: string
  description: string
  dishOfDay: boolean
  variants: ProductVariant[]
  stockLabel: string | null
  lowStock: boolean
  visibleInApp: boolean
  barOnly: boolean
  available: boolean
  soldOut: boolean
  allergens: string[]
  deductsStock: boolean
}

// The 14 allergens that must be declared in the EU.
export const ALLERGENS = [
  'Gluten',
  'Crustáceos',
  'Huevo',
  'Pescado',
  'Cacahuetes',
  'Soja',
  'Leche',
  'Frutos de cáscara',
  'Apio',
  'Mostaza',
  'Sésamo',
  'Sulfitos',
  'Altramuces',
  'Moluscos',
] as const

export function categoryCounts(products: Product[]): { category: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const { category } of products) counts.set(category, (counts.get(category) ?? 0) + 1)
  return [...counts].map(([category, count]) => ({ category, count }))
}

export const replaceProduct = (products: Product[], updated: Product): Product[] =>
  products.map((product) => (product.id === updated.id ? updated : product))

export const removeProduct = (products: Product[], id: string): Product[] =>
  products.filter((product) => product.id !== id)
