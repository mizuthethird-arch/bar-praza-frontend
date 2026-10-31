import type { Product } from '../domain/menu/product'
import type { CatalogRepository } from './ports'

export const getCatalog = (catalog: CatalogRepository) => catalog.list()

export async function saveProductIn(catalog: CatalogRepository, product: Product): Promise<Product[]> {
  if (product.name.trim() === '') throw new Error('A product needs a name')
  return catalog.save({ ...product, name: product.name.trim() })
}

export const archiveProductIn = (catalog: CatalogRepository, id: string) => catalog.archive(id)
