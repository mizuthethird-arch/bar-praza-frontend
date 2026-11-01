import { afterEach, describe, expect, it, vi } from 'vitest'
import { isIsoDate } from '../../domain/schedule/schedule-changes'
import { mockAccounts } from './mock-accounts'
import { createMockServices } from './create-mock-services'
import { createDemoServices } from './demo-services'

describe('createMockServices', () => {
  const services = createDemoServices({ loginDelayMs: 0, signedIn: true })

  it('seeds a dashboard whose figures match the demo screen', async () => {
    const { summary } = await services.getDashboard()

    expect(summary).toEqual({
      ordersToday: 5,
      newOrders: 2,
      inProgressOrders: 2,
      salesCents: 7150,
      averageTicketCents: 1430,
    })
  })

  it('seeds a weekly schedule with seven days and Wednesday closed', async () => {
    const { weekly } = await services.getScheduleOverview()

    expect(weekly).toHaveLength(7)
    expect(weekly.find((entry) => entry.day === 'Miércoles')?.hours).toBeNull()
  })
})

describe('writes from two devices at once', () => {
  it('keeps both changes instead of the last one overwriting the first', async () => {
    const services = createDemoServices({ loginDelayMs: 0, signedIn: true })

    await Promise.all([services.cancelOrder('#44'), services.cancelOrder('#42')])
    const orders = await services.listOrderLog()
    expect(orders.find((o) => o.id === '#44')?.status).toBe('cancelled')
    expect(orders.find((o) => o.id === '#42')?.status).toBe('cancelled')

    await Promise.all([
      services.recordStockMovement({ itemId: 'patata', kind: 'in', amount: 5 }),
      services.recordStockMovement({ itemId: 'pan', kind: 'in', amount: 5 }),
    ])
    const { items } = await services.getStock()
    expect(items.find((i) => i.id === 'patata')?.quantity).toBe(13)
    expect(items.find((i) => i.id === 'pan')?.quantity).toBe(19)

    await Promise.all([
      services.inviteMember({ email: 'brais@bar.es', role: 'bar' }),
      services.inviteMember({ email: 'antia@bar.es', role: 'kitchen' }),
    ])
    const invitations = (await services.getTeam()).invitations.map((i) => i.email)
    expect(invitations).toEqual(expect.arrayContaining(['brais@bar.es', 'antia@bar.es']))
    expect(new Set((await services.getTeam()).invitations.map((i) => i.id)).size).toBe(invitations.length)

    await Promise.all([services.archiveProduct('agua'), services.archiveProduct('cafe')])
    const ids = (await services.getCatalog()).map((p) => p.id)
    expect(ids).not.toContain('agua')
    expect(ids).not.toContain('cafe')

    await Promise.all([
      services.addClosure({ date: '2026-12-25', note: 'Navidad' }),
      services.addClosure({ date: '2027-01-01', note: 'Año nuevo' }),
    ])
    const notes = (await services.getScheduleOverview()).closures.map((c) => c.note)
    expect(notes).toEqual(expect.arrayContaining(['Navidad', 'Año nuevo']))
  })

  it('still enforces the rules on the server side', async () => {
    const services = createDemoServices({ loginDelayMs: 0, signedIn: true })

    await expect(services.cancelOrder('#40')).rejects.toThrow()
    await expect(services.setMemberActive('m1', false)).rejects.toThrow()
    await expect(services.recordStockMovement({ itemId: 'nope', kind: 'in', amount: 1 })).rejects.toThrow()
  })
})

describe('seed data', () => {
  it('prices every order line from the catalog and adds up each order', async () => {
    const services = createDemoServices({ loginDelayMs: 0 })
    const catalog = await services.getCatalog()

    for (const order of await services.listOrderLog()) {
      for (const line of order.lines) {
        const variant = catalog.find((p) => p.name === line.name)?.variants.find((v) => v.label === line.variant)
        expect(variant, `${order.id} ${line.name} · ${line.variant}`).toBeDefined()
        expect(line.totalCents, `${order.id} ${line.name}`).toBe(line.quantity * variant!.priceCents)
      }
      expect(order.lines.reduce((sum, l) => sum + l.totalCents, 0), order.id).toBe(order.totalCents)
    }
  })

  it('seeds closures with real dates', async () => {
    const { closures } = await createDemoServices({ loginDelayMs: 0 }).getScheduleOverview()

    for (const closure of closures) expect(isIsoDate(closure.date), closure.date).toBe(true)
  })
})

describe('real login in the services', () => {
  it('sends the login to the given gateway and leaves out the mock PIN unlock', async () => {
    const auth = {
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      isSignedIn: vi.fn().mockResolvedValue(true),
    }
    const services = createMockServices({ auth })

    await services.login({ email: 'staff@example.com', password: 'secret-pass' })

    expect(auth.login).toHaveBeenCalledWith({ email: 'staff@example.com', password: 'secret-pass' })
    await expect(services.hasSession()).resolves.toBe(true)
    expect(services.pinUnlock).toBeUndefined()
  })
})

describe('session across reloads', () => {
  afterEach(() => sessionStorage.clear())

  it('keeps the login when the services are built again on the same storage', async () => {
    const first = createDemoServices({ loginDelayMs: 0, storage: sessionStorage })
    await first.login({ email: mockAccounts[0].email, password: mockAccounts[0].password })

    await expect(createDemoServices({ loginDelayMs: 0, storage: sessionStorage }).hasSession()).resolves.toBe(true)
  })
})
