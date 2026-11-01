import type { KitchenRepository } from './ports'

export const getKitchenBoard = (kitchen: KitchenRepository) => kitchen.getBoard()

export const startKitchenOrderIn = (kitchen: KitchenRepository, id: string) => kitchen.start(id)

export const markKitchenOrderReadyIn = (kitchen: KitchenRepository, id: string) => kitchen.markReady(id)

export const deliverKitchenOrderIn = (kitchen: KitchenRepository, id: string) => kitchen.deliver(id)

export const cancelKitchenOrderIn = (kitchen: KitchenRepository, id: string) => kitchen.cancel(id)

export const closeKitchenShiftIn = (kitchen: KitchenRepository) => kitchen.closeShift()
