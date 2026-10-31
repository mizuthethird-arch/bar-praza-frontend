import type { Dish } from '../domain/menu/dish'
import type { Order } from '../domain/orders/order'
import { summarizeOrders, type OrdersSummary } from '../domain/orders/summarize-orders'
import type { OrderWindow } from '../domain/schedule/schedule'
import type { MenuRepository, OrdersRepository, ScheduleRepository } from './ports'

export type Dashboard = {
  summary: OrdersSummary
  orders: Order[]
  dishes: Dish[]
  windows: OrderWindow[]
  minPrepMinutes: number
}

type Dependencies = {
  orders: OrdersRepository
  menu: MenuRepository
  schedule: Pick<ScheduleRepository, 'getOverview'>
}

export async function getDashboard({ orders, menu, schedule }: Dependencies): Promise<Dashboard> {
  const [todaysOrders, dishes, overview] = await Promise.all([
    orders.listToday(),
    menu.listDishes(),
    schedule.getOverview(),
  ])

  return {
    summary: summarizeOrders(todaysOrders),
    orders: todaysOrders,
    dishes,
    windows: overview.windows,
    minPrepMinutes: overview.rules.minPrepMinutes,
  }
}
