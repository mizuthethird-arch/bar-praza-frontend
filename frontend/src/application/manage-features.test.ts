import { describe, expect, it, vi } from 'vitest'
import type { Product } from '../domain/menu/product'
import { archiveProductIn, saveProductIn } from './catalog'
import { cancelOrderIn } from './order-log'
import type { CatalogRepository, OrderLogRepository, StockRepository } from './ports'
import { recordMovementIn } from './stock'

const product = { id: 'p', name: ' Uno ', category: 'Raciones' } as Product

describe('application use cases', () => {
  it('asks the repository to cancel one order', async () => {
    const repo: OrderLogRepository = { list: vi.fn(), cancel: vi.fn().mockResolvedValue([]) }

    await cancelOrderIn(repo, '#1')

    expect(repo.cancel).toHaveBeenCalledWith('#1')
  })

  it('sends one trimmed product, refuses a nameless one, and archives by id', async () => {
    const repo: CatalogRepository = { list: vi.fn(), save: vi.fn().mockResolvedValue([]), archive: vi.fn().mockResolvedValue([]) }

    await saveProductIn(repo, product)
    expect(repo.save).toHaveBeenCalledWith({ ...product, name: 'Uno' })

    await expect(saveProductIn(repo, { ...product, name: '  ' })).rejects.toThrow()
    expect(repo.save).toHaveBeenCalledTimes(1)

    await archiveProductIn(repo, 'p')
    expect(repo.archive).toHaveBeenCalledWith('p')
  })
})

describe('stock movement validation', () => {
  const repo = (): StockRepository => ({ get: vi.fn(), recordMovement: vi.fn().mockResolvedValue({}) })

  it('sends a valid movement', async () => {
    const stock = repo()

    await recordMovementIn(stock, { itemId: 'i', kind: 'in', amount: 2 })

    expect(stock.recordMovement).toHaveBeenCalledWith({ itemId: 'i', kind: 'in', amount: 2 })
  })

  it('rejects amounts that are not finite numbers, or are negative, without sending them', async () => {
    const stock = repo()

    for (const kind of ['in', 'waste', 'count'] as const) {
      for (const amount of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
        await expect(recordMovementIn(stock, { itemId: 'i', kind, amount }), `${kind} ${amount}`).rejects.toThrow()
      }
    }
    await expect(recordMovementIn(stock, { itemId: 'i', kind: 'in', amount: 0 })).rejects.toThrow()
    expect(stock.recordMovement).not.toHaveBeenCalled()
  })

  it('allows counting down to zero', async () => {
    const stock = repo()

    await recordMovementIn(stock, { itemId: 'i', kind: 'count', amount: 0 })

    expect(stock.recordMovement).toHaveBeenCalled()
  })
})
