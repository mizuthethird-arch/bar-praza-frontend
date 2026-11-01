import type { KitchenBoard } from '../domain/kitchen/kitchen'
import type { Credentials } from '../domain/auth/credentials'
import type { LiveEvent } from '../domain/live/live-console'
import type { Customer } from '../domain/customers/customers'
import type { Product } from '../domain/menu/product'
import type { OrderEntry } from '../domain/orders/order-log'
import type { Report } from '../domain/reports/report'
import type { BarSettings, Role, TeamState } from '../domain/team/team'
import type { StockMovement, StockState } from '../domain/stock/stock'
import type { Dish } from '../domain/menu/dish'
import type { Order } from '../domain/orders/order'
import type { ScheduleOverview, SpecialClosure } from '../domain/schedule/schedule'
import type { PinResult } from '../domain/auth/pin'
import type { RememberedDevice } from '../domain/auth/remembered-device'

export interface AuthGateway {
  login(credentials: Credentials): Promise<void>
  logout(): Promise<void>
  // Asks the backend whether this browser still has a session.
  isSignedIn(): Promise<boolean>
}

export interface PinGateway {
  rememberedDevice(): Promise<RememberedDevice>
  unlock(pin: string): Promise<PinResult>
}

export interface SessionStore {
  isActive(): boolean
  start(): void
  end(): void
}

export interface OrdersRepository {
  listToday(): Promise<Order[]>
}

export interface MenuRepository {
  listDishes(): Promise<Dish[]>
}

// Writes are one command per change, never "save the whole list": the server applies
// each change to its latest state and enforces the rules, so two devices cannot
// overwrite each other. Every command answers with the server's state after it.
export interface ScheduleRepository {
  getOverview(): Promise<ScheduleOverview>
  pause(minutes: number): Promise<ScheduleOverview>
  resume(): Promise<ScheduleOverview>
  addClosure(closure: SpecialClosure): Promise<ScheduleOverview>
  removeClosure(closure: SpecialClosure): Promise<ScheduleOverview>
}

export interface OrderLogRepository {
  list(): Promise<OrderEntry[]>
  cancel(id: string): Promise<OrderEntry[]>
}

export interface CatalogRepository {
  list(): Promise<Product[]>
  save(product: Product): Promise<Product[]>
  archive(id: string): Promise<Product[]>
}

export interface StockRepository {
  get(): Promise<StockState>
  recordMovement(movement: StockMovement): Promise<StockState>
}

export interface CustomersRepository {
  list(): Promise<Customer[]>
}

export interface ReportsRepository {
  getWeekly(): Promise<Report>
}

export interface TeamRepository {
  get(): Promise<TeamState>
  addMember(member: { name: string; role: Role }): Promise<TeamState>
  setMemberActive(id: string, active: boolean): Promise<TeamState>
  removeMember(id: string): Promise<TeamState>
  saveSettings(settings: BarSettings): Promise<TeamState>
}

export interface LiveEventsRepository {
  snapshot(): Promise<LiveEvent[]>
  poll(afterId: number): Promise<LiveEvent[]>
}

export interface KitchenRepository {
  getBoard(): Promise<KitchenBoard>
  start(id: string): Promise<KitchenBoard>
  markReady(id: string): Promise<KitchenBoard>
  deliver(id: string): Promise<KitchenBoard>
  cancel(id: string): Promise<KitchenBoard>
  closeShift(): Promise<KitchenBoard>
}
