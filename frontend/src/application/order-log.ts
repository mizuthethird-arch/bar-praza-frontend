import type { OrderLogRepository } from './ports'

export const listOrderLog = (orders: OrderLogRepository) => orders.list()

export const cancelOrderIn = (orders: OrderLogRepository, id: string) => orders.cancel(id)
