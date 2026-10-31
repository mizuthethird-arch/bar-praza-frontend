import type { CatalogRepository } from '../../application/ports'
import { removeProduct, replaceProduct, type Product } from '../../domain/menu/product'
import { memoryStore } from './memory-store'

const base: Omit<Product, 'id' | 'name' | 'category' | 'variants'> = {
  description: '',
  dishOfDay: false,
  stockLabel: null,
  lowStock: false,
  visibleInApp: true,
  barOnly: false,
  available: true,
  soldOut: false,
  allergens: [],
  deductsStock: false,
}

const initial: Product[] = [
  {
    ...base, id: 'pulpo', name: 'Pulpo á feira', category: 'Raciones', dishOfDay: true,
    description: 'Pulpo cocido con aceite, pimentón y sal gorda, sobre cachelos',
    variants: [{ label: 'Media ración', priceCents: 1100 }, { label: 'Ración', priceCents: 1900 }],
    stockLabel: '2,4 kg', allergens: ['Moluscos'], deductsStock: true,
  },
  {
    ...base, id: 'tortilla', name: 'Tortilla de patatas', category: 'Raciones',
    variants: [{ label: 'Pincho', priceCents: 300 }, { label: 'Entera', priceCents: 1400 }],
    allergens: ['Huevo'],
  },
  {
    ...base, id: 'pimientos', name: 'Pimientos de Padrón', category: 'Raciones',
    variants: [{ label: 'Ración', priceCents: 700 }], stockLabel: '0,6 kg', lowStock: true,
  },
  {
    ...base, id: 'croquetas', name: 'Croquetas de jamón', category: 'Raciones',
    variants: [{ label: 'Media', priceCents: 500 }, { label: 'Ración', priceCents: 900 }],
    stockLabel: '46 uds.', allergens: ['Gluten', 'Leche', 'Huevo'],
  },
  {
    ...base, id: 'raxo', name: 'Raxo con patatas', category: 'Raciones', barOnly: true,
    variants: [{ label: 'Media', priceCents: 800 }, { label: 'Ración', priceCents: 1300 }],
    stockLabel: '3,1 kg',
  },
  {
    ...base, id: 'empanada', name: 'Empanada de bonito', category: 'Raciones',
    variants: [{ label: 'Porción', priceCents: 450 }], stockLabel: '0 porciones', lowStock: true,
    available: false, soldOut: true, allergens: ['Gluten', 'Pescado'],
  },
  {
    ...base, id: 'calamares', name: 'Bocadillo de calamares', category: 'Bocadillos',
    variants: [{ label: 'Bocadillo', priceCents: 650 }], allergens: ['Gluten', 'Moluscos'],
  },
  {
    ...base, id: 'lomo', name: 'Bocadillo de lomo', category: 'Bocadillos',
    variants: [{ label: 'Bocadillo', priceCents: 600 }], allergens: ['Gluten'],
  },
  {
    ...base, id: 'tarta', name: 'Tarta de queixo', category: 'Postres',
    variants: [{ label: 'Porción', priceCents: 400 }], allergens: ['Leche', 'Huevo', 'Gluten'],
  },
  {
    ...base, id: 'filloas', name: 'Filloas', category: 'Postres',
    variants: [{ label: 'Ración', priceCents: 450 }], allergens: ['Huevo', 'Leche', 'Gluten'],
  },
  { ...base, id: 'albarino', name: 'Albariño', category: 'Bebidas', variants: [{ label: 'Copa', priceCents: 300 }], allergens: ['Sulfitos'] },
  { ...base, id: 'cerveza', name: 'Cerveza', category: 'Bebidas', variants: [{ label: 'Lata', priceCents: 250 }], allergens: ['Gluten'] },
  { ...base, id: 'agua', name: 'Agua', category: 'Bebidas', variants: [{ label: '50 cl', priceCents: 150 }] },
  { ...base, id: 'cafe', name: 'Café', category: 'Bebidas', variants: [{ label: 'Taza', priceCents: 150 }] },
]

export function createMockCatalogRepository(): CatalogRepository {
  const store = memoryStore(initial)
  return {
    list: store.read,
    save: (product) => store.change((products) => replaceProduct(products, product)),
    archive: (id) => store.change((products) => removeProduct(products, id)),
  }
}
