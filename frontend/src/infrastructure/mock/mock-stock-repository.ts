import type { StockRepository } from '../../application/ports'
import { applyMovement, type StockCategory, type StockItem, type StockState } from '../../domain/stock/stock'
import { memoryStore } from './memory-store'

const item = (
  id: string,
  name: string,
  quantity: number,
  unit: string,
  minimum: number,
  usedIn: string,
  restockLabel: string,
  category: StockCategory = 'kitchen',
): StockItem => ({ id, name, quantity, unit, minimum, category, usedIn, restockLabel })

const initial: StockState = {
  countedAt: '19 oct, 12:05',
  wasteThisWeek: 2,
  items: [
    item('empanada', 'Empanada de bonito', 0, 'porc.', 4, 'Empanada', '12 porc.'),
    item('pimiento', 'Pimiento de Padrón', 0.6, 'kg', 1, 'Padrón', '3 kg'),
    item('patata', 'Patata', 8, 'kg', 10, 'Tortilla, raxo, pulpo', '15 kg'),
    item('cerveza', 'Cerveza lata', 38, 'uds.', 48, 'Cerveza', '2 cajas', 'drinks'),
    item('pulpo', 'Pulpo cocido', 2.4, 'kg', 2, 'Pulpo á feira', ''),
    item('croquetas', 'Croquetas (congeladas)', 46, 'uds.', 30, 'Croquetas', ''),
    item('lomo', 'Lomo adobado', 3.1, 'kg', 2, 'Raxo, bocadillo de lomo', ''),
    item('pan', 'Pan de leña', 14, 'uds.', 10, 'Bocadillos', ''),
    item('albarino', 'Albariño', 9, 'bot.', 6, 'Albariño', '', 'drinks'),
    item('agua', 'Agua 50 cl', 60, 'uds.', 24, 'Agua', '', 'drinks'),
  ],
}

export function createMockStockRepository(): StockRepository {
  const store = memoryStore(initial)
  return {
    get: store.read,
    recordMovement: (movement) => store.change((state) => applyMovement(state, movement)),
  }
}
