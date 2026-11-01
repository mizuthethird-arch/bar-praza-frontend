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
  closeKitchenShiftIn,
  deliverKitchenOrderIn,
  getKitchenBoard,
  markKitchenOrderReadyIn,
  startKitchenOrderIn,
  watchKitchenBoardIn,
} from '../../application/kitchen'
import { listLiveEvents, watchLiveEvents } from '../../application/live-console'
import { getStock, recordMovementIn } from '../../application/stock'
import type { AppServices } from '../../application/services'
import type { AuthGateway, PinGateway, RealtimePort } from '../../application/ports'
import { createMockCatalogRepository } from './mock-catalog-repository'
import { createMockCustomersRepository } from './mock-customers-repository'
import { createMockKitchenRepository } from './mock-kitchen-repository'
import { createMockLiveEventsRepository } from './mock-live-events-repository'
import { createMockMenuRepository } from './mock-menu-repository'
import { createMockOrderLogRepository } from './mock-order-log-repository'
import { createMockOrdersRepository } from './mock-orders-repository'
import { createMockReportsRepository } from './mock-reports-repository'
import { createMockScheduleRepository } from './mock-schedule-repository'
import { createMockStockRepository } from './mock-stock-repository'
import { createMockTeamRepository } from './mock-team-repository'

type Options = {
  // The login: the demo logins (createDemoServices) or the real one (HTTP).
  auth: AuthGateway
  // The PIN unlock. Left out when there is no PIN for this build.
  pin?: PinGateway
  // Where the kitchen board is kept, so every open tab sees the same board. The demo build passes localStorage.
  kitchenStorage?: Pick<Storage, 'getItem' | 'setItem'>
  // Changes from other devices. Left out, the mock's own watch is used (the demo build); the HTTP build passes a socket.
  realtime?: RealtimePort
}

// The read side is still mock data, with no accounts and no login. The login and the PIN come in as
// arguments, so a production build never includes the demo accounts (ISS-13).
export function createMockServices({ auth, pin, kitchenStorage, realtime }: Options): AppServices {
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
  const kitchen = createMockKitchenRepository({ storage: kitchenStorage })

  return {
    login: (credentials) => login(auth, credentials),
    logout: () => logout(auth),
    hasSession: () => isSignedIn(auth),
    pinUnlock: pin
      ? {
          getRememberedDevice: () => getRememberedDevice(pin),
          unlockWithPin: (code) => unlockWithPin(pin, code),
        }
      : undefined,
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
    watchKitchenBoard: (onBoard) => (realtime ? realtime.watchKitchenBoard(onBoard) : watchKitchenBoardIn(kitchen, onBoard)),
    startKitchenOrder: (id) => startKitchenOrderIn(kitchen, id),
    markKitchenOrderReady: (id) => markKitchenOrderReadyIn(kitchen, id),
    deliverKitchenOrder: (id) => deliverKitchenOrderIn(kitchen, id),
    cancelKitchenOrder: (id) => cancelKitchenOrderIn(kitchen, id),
    closeKitchenShift: () => closeKitchenShiftIn(kitchen),
    testKitchen: { createOrder: () => kitchen.createTestOrder(), reset: () => kitchen.reset() },
    listLiveEvents: () => listLiveEvents(live),
    watchLiveEvents: (onEvent) => (realtime ? realtime.watchLiveEvents(onEvent) : watchLiveEvents(live, onEvent)),
  }
}
