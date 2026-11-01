import type { KitchenBoard } from '../domain/kitchen/kitchen'
import type { LiveEvent } from '../domain/live/live-console'
import type { Customer } from '../domain/customers/customers'
import type { Product } from '../domain/menu/product'
import type { OrderEntry } from '../domain/orders/order-log'
import type { Report } from '../domain/reports/report'
import type { StockMovement, StockState } from '../domain/stock/stock'
import type { BarSettings, Role, TeamState } from '../domain/team/team'
import type { Credentials } from '../domain/auth/credentials'
import type { PinResult } from '../domain/auth/pin'
import type { RememberedDevice } from '../domain/auth/remembered-device'
import type { Dashboard } from './get-dashboard'
import type { ScheduleOverview, SpecialClosure } from '../domain/schedule/schedule'

// What the presentation layer is allowed to call. Built in the composition root.
export type PinUnlockServices = {
  getRememberedDevice(): Promise<RememberedDevice>
  unlockWithPin(pin: string): Promise<PinResult>
}

export interface AppServices {
  login(credentials: Credentials): Promise<void>
  logout(): Promise<void>
  hasSession(): Promise<boolean>
  // Only where the backend has the PIN unlock. Without it the PIN button and /login/pin are not shown.
  pinUnlock?: PinUnlockServices
  // Only in the demo build: test orders for the kitchen board, to try the sound (/crear-pedido-prueba).
  testKitchen?: {
    createOrder(): Promise<KitchenBoard>
    reset(): Promise<KitchenBoard>
  }
  getDashboard(): Promise<Dashboard>
  getScheduleOverview(): Promise<ScheduleOverview>
  pauseOrders(minutes: number): Promise<ScheduleOverview>
  resumeOrders(): Promise<ScheduleOverview>
  addClosure(closure: SpecialClosure): Promise<ScheduleOverview>
  removeClosure(closure: SpecialClosure): Promise<ScheduleOverview>
  listOrderLog(): Promise<OrderEntry[]>
  cancelOrder(id: string): Promise<OrderEntry[]>
  getCatalog(): Promise<Product[]>
  saveProduct(product: Product): Promise<Product[]>
  archiveProduct(id: string): Promise<Product[]>
  getStock(): Promise<StockState>
  recordStockMovement(movement: StockMovement): Promise<StockState>
  listCustomers(): Promise<Customer[]>
  getReport(): Promise<Report>
  getTeam(): Promise<TeamState>
  addMember(member: { name: string; role: Role }): Promise<TeamState>
  setMemberActive(id: string, active: boolean): Promise<TeamState>
  removeMember(id: string): Promise<TeamState>
  saveSettings(settings: BarSettings): Promise<TeamState>
  getKitchenBoard(): Promise<KitchenBoard>
  startKitchenOrder(id: string): Promise<KitchenBoard>
  markKitchenOrderReady(id: string): Promise<KitchenBoard>
  deliverKitchenOrder(id: string): Promise<KitchenBoard>
  cancelKitchenOrder(id: string): Promise<KitchenBoard>
  closeKitchenShift(): Promise<KitchenBoard>
  listLiveEvents(): Promise<LiveEvent[]>
  pollLiveEvents(afterId: number): Promise<LiveEvent[]>
}
