import { describe, expect, it } from 'vitest'
import type { Dish } from '../domain/menu/dish'
import type { Order } from '../domain/orders/order'
import type { ScheduleOverview } from '../domain/schedule/schedule'
import { getDashboard } from './get-dashboard'

const orders: Order[] = [
  { id: 2, client: 'Ana', pickupTime: '21:30', delayed: false, itemCount: 1, totalCents: 1400, status: 'new' },
  { id: 1, client: 'Pablo', pickupTime: '21:35', delayed: true, itemCount: 2, totalCents: 900, status: 'preparing' },
]

const dishes: Dish[] = [
  { name: 'Pulpo á feira', pricesCents: [1100, 1900], allergens: ['Moluscos'], available: true },
]

const overview: ScheduleOverview = {
  status: { accepting: true, until: '23:30', queued: 2 },
  weekly: [],
  closures: [],
  rules: { minPrepMinutes: 20, lastOrderMinutesBeforeClose: 30, maxOrdersPerSlot: 4 },
  windows: [{ days: 'Lun–Jue', hours: 'Por definir' }],
}

const deps = {
  orders: { listToday: async () => orders },
  menu: { listDishes: async () => dishes },
  schedule: { getOverview: async () => overview },
}

describe('getDashboard use case', () => {
  it('summarises the orders it reads from the repository', async () => {
    const dashboard = await getDashboard(deps)

    expect(dashboard.summary).toEqual({
      ordersToday: 2,
      newOrders: 1,
      inProgressOrders: 1,
      salesCents: 2300,
      averageTicketCents: 1150,
    })
  })

  it('returns the orders, the dishes and the order windows as they come', async () => {
    const dashboard = await getDashboard(deps)

    expect(dashboard.orders).toEqual(orders)
    expect(dashboard.dishes).toEqual(dishes)
    expect(dashboard.windows).toEqual(overview.windows)
  })

  it('takes the minimum preparation time from the schedule rules', async () => {
    const dashboard = await getDashboard(deps)

    expect(dashboard.minPrepMinutes).toBe(20)
  })
})
