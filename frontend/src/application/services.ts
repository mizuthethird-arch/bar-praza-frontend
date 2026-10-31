import type { KitchenBoard } from '../domain/kitchen/kitchen'
import type { LiveEvent } from '../domain/live/live-console'
import type { Customer } from '../domain/customers/customers'
import type { Product } from '../domain/menu/product'
import type { OrderEntry } from '../domain/orders/order-log'
import type { Report } from '../domain/reports/report'
import type { StockMovement, StockState } from '../domain/stock/stock'
import type { BarSettings, Role, TeamState } from '../domain/team/team'
import type { Credentials } from '../domain/auth/credentials'
import type { Dashboard } from './get-dashboard'
import type { ScheduleOverview, SpecialClosure } from '../domain/schedule/schedule'

// What the presentation layer is allowed to call. Built in the composition root.
export interface AppServices {
  login(credentials: Credentials): Promise<void>
  logout(): void
  hasSession(): boolean
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
  listLiveEvents(): Promise<LiveEvent[]>
  pollLiveEvents(afterId: number): Promise<LiveEvent[]>
}
