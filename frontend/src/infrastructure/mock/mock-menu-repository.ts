import type { MenuRepository } from '../../application/ports'
import type { Dish } from '../../domain/menu/dish'

const dishes: Dish[] = [
  { name: 'Pulpo á feira', pricesCents: [1100, 1900], allergens: ['Moluscos'], available: true },
  { name: 'Tortilla de patatas', pricesCents: [300, 1400], allergens: ['Huevo'], available: true },
  { name: 'Pimientos de Padrón', pricesCents: [700], allergens: [], available: true },
  { name: 'Croquetas de jamón', pricesCents: [500, 900], allergens: ['Gluten', 'leche', 'huevo'], available: true },
  { name: 'Empanada de bonito', pricesCents: [450], allergens: ['Gluten', 'pescado', 'huevo'], available: false },
]

export function createMockMenuRepository(): MenuRepository {
  return { listDishes: async () => dishes }
}
