export type StockCategory = 'kitchen' | 'drinks'

export type StockItem = {
  id: string
  name: string
  quantity: number
  unit: string
  minimum: number
  category: StockCategory
  usedIn: string
  restockLabel: string
}

export type StockState = {
  countedAt: string
  wasteThisWeek: number
  items: StockItem[]
}

export type StockMovement = {
  itemId: string
  kind: 'in' | 'waste' | 'count'
  amount: number
}

export type StockFilter = 'all' | StockCategory | 'low'

export type StockSummary = {
  controlled: number
  belowMinimum: number
  soldOut: number
  waste: number
}

export const isSoldOut = (item: StockItem) => item.quantity <= 0
export const isBelowMinimum = (item: StockItem) => item.quantity < item.minimum

export function summarizeStock({ items, wasteThisWeek }: StockState): StockSummary {
  return {
    controlled: items.length,
    belowMinimum: items.filter((item) => isBelowMinimum(item) && !isSoldOut(item)).length,
    soldOut: items.filter(isSoldOut).length,
    waste: wasteThisWeek,
  }
}

function nextQuantity(item: StockItem, { kind, amount }: StockMovement): number {
  if (kind === 'in') return item.quantity + amount
  if (kind === 'waste') return Math.max(0, item.quantity - amount)
  return amount
}

export function applyMovement(state: StockState, movement: StockMovement): StockState {
  if (!state.items.some((item) => item.id === movement.itemId)) throw new Error(`Unknown stock item ${movement.itemId}`)
  return {
    ...state,
    wasteThisWeek: movement.kind === 'waste' ? state.wasteThisWeek + 1 : state.wasteThisWeek,
    items: state.items.map((item) =>
      item.id === movement.itemId ? { ...item, quantity: nextQuantity(item, movement) } : item,
    ),
  }
}

export function filterStock(items: StockItem[], filter: StockFilter): StockItem[] {
  if (filter === 'all') return items
  if (filter === 'low') return items.filter(isBelowMinimum)
  return items.filter((item) => item.category === filter)
}

export const shoppingList = (items: StockItem[]) => items.filter(isBelowMinimum)

export const suggestedItem = (items: StockItem[]): StockItem | undefined =>
  items.find((item) => isBelowMinimum(item) && !isSoldOut(item)) ?? items[0]

// How full the stock is, from 0 to 1; twice the minimum counts as full.
export function stockLevel(item: StockItem): number {
  if (item.minimum <= 0) return item.quantity > 0 ? 1 : 0
  return Math.min(1, Math.max(0, item.quantity / (item.minimum * 2)))
}
