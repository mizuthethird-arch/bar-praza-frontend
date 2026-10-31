import type { StockMovement, StockState } from '../domain/stock/stock'
import type { StockRepository } from './ports'

export const getStock = (stock: StockRepository) => stock.get()

export async function recordMovementIn(stock: StockRepository, movement: StockMovement): Promise<StockState> {
  const { amount, kind } = movement
  if (!Number.isFinite(amount) || amount < 0) throw new Error('The amount must be a non-negative number')
  if (amount === 0 && kind !== 'count') throw new Error('The amount must be positive')
  return stock.recordMovement(movement)
}
