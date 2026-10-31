import { addClosureTo, pauseOrdersIn, removeClosureFrom, resumeOrdersIn } from '../../application/change-schedule'
import { archiveProductIn, getCatalog, saveProductIn } from '../../application/catalog'
import { getDashboard } from '../../application/get-dashboard'
import { getScheduleOverview } from '../../application/get-schedule-overview'
import { isSignedIn, login, logout } from '../../application/login'
import { getRememberedDevice, unlockWithPin } from '../../application/pin-unlock'
import { cancelOrderIn, listOrderLog } from '../../application/order-log'
import { addMemberTo, getTeam, removeMemberFrom, saveSettingsIn, setMemberActiveIn } from '../../application/manage-team'
import {
  cancelKitchenOrderIn,
  deliverKitchenOrderIn,
  getKitchenBoard,
  markKitchenOrderReadyIn,
  startKitchenOrderIn,
} from '../../application/kitchen'
import { listLiveEvents, pollLiveEvents } from '../../application/live-console'
import { getStock, recordMovementIn } from '../../application/stock'
import type { AppServices } from '../../application/services'
import type { AuthGateway } from '../../application/ports'
import { createMockAuthGateway } from './mock-auth-gateway'
import { createMockCatalogRepository } from './mock-catalog-repository'
import { createMockCustomersRepository } from './mock-customers-repository'
import { createMockKitchenRepository } from './mock-kitchen-repository'
import { createMockLiveEventsRepository } from './mock-live-events-repository'
import { createMockMenuRepository } from './mock-menu-repository'
import { createMockOrderLogRepository } from './mock-order-log-repository'
import { createMockOrdersRepository } from './mock-orders-repository'
import { createMockPinGateway } from './mock-pin-gateway'
import { createMockReportsRepository } from './mock-reports-repository'
import { createMockSessionStore } from './mock-session-store'
import { createMockScheduleRepository } from './mock-schedule-repository'
import { createMockStockRepository } from './mock-stock-repository'
import { createMockTeamRepository } from './mock-team-repository'

type Options = {
  loginDelayMs?: number
  signedIn?: boolean
  // Where the mock session is kept; the app passes sessionStorage so a reload keeps you signed in.
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  // The real login (HTTP). When given, it replaces the mock login and the PIN unlock is left out,
  // because the backend does not have it yet. The other screens stay on the mock until they are built.
  auth?: AuthGateway
}

// Composition root for the mock backend. The app passes the real login when the API address is set.
export function createMockServices({ loginDelayMs, signedIn = false, storage, auth: realAuth }: Options = {}): AppServices {
  const session = createMockSessionStore({ active: signedIn, storage })
  const auth = realAuth ?? createMockAuthGateway({ delayMs: loginDelayMs, session })
  const pin = createMockPinGateway()
  const orders = createMockOrdersRepository()
  const menu = createMockMenuRepository()
  const schedule = createMockScheduleRepository()
  const orderLog = createMockOrderLogRepository()
  const catalog = createMockCatalogRepository()
  const stock = createMockStockRepository()
  const customers = createMockCustomersRepository()
  const reports = createMockReportsRepository()
  const team = createMockTeamRepository()
  const live = createMockLiveEventsRepository()
  const kitchen = createMockKitchenRepository()

  return {
    login: (credentials) => login(auth, credentials),
    logout: () => logout(auth),
    hasSession: () => isSignedIn(auth),
    pinUnlock: realAuth
      ? undefined
      : {
          getRememberedDevice: () => getRememberedDevice(pin),
          unlockWithPin: (code) => unlockWithPin(pin, session, code),
        },
    getDashboard: () => getDashboard({ orders, menu, schedule }),
    getScheduleOverview: () => getScheduleOverview(schedule),
    pauseOrders: (minutes) => pauseOrdersIn(schedule, minutes),
    resumeOrders: () => resumeOrdersIn(schedule),
    addClosure: (closure) => addClosureTo(schedule, closure),
    removeClosure: (closure) => removeClosureFrom(schedule, closure),
    listOrderLog: () => listOrderLog(orderLog),
    cancelOrder: (id) => cancelOrderIn(orderLog, id),
    getCatalog: () => getCatalog(catalog),
    saveProduct: (product) => saveProductIn(catalog, product),
    archiveProduct: (id) => archiveProductIn(catalog, id),
    getStock: () => getStock(stock),
    recordStockMovement: (movement) => recordMovementIn(stock, movement),
    listCustomers: () => customers.list(),
    getReport: () => reports.getWeekly(),
    getTeam: () => getTeam(team),
    addMember: (member) => addMemberTo(team, member),
    setMemberActive: (id, active) => setMemberActiveIn(team, id, active),
    removeMember: (id) => removeMemberFrom(team, id),
    saveSettings: (settings) => saveSettingsIn(team, settings),
    getKitchenBoard: () => getKitchenBoard(kitchen),
    startKitchenOrder: (id) => startKitchenOrderIn(kitchen, id),
    markKitchenOrderReady: (id) => markKitchenOrderReadyIn(kitchen, id),
    deliverKitchenOrder: (id) => deliverKitchenOrderIn(kitchen, id),
    cancelKitchenOrder: (id) => cancelKitchenOrderIn(kitchen, id),
    listLiveEvents: () => listLiveEvents(live),
    pollLiveEvents: (afterId) => pollLiveEvents(live, afterId),
  }
}
