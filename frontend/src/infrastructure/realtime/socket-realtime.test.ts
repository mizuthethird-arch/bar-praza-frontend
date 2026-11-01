import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { KitchenBoard } from '../../domain/kitchen/kitchen'
import { createSocketRealtime, parseRealtimeMessage } from './socket-realtime'

const board: KitchenBoard = { shiftOpenedAt: '19:02', orders: [], delivered: [] }
const event = { id: 9, time: '21:20', kind: 'received' as const, orderId: '#50', detail: 'Noa' }

// A stand-in for the browser's WebSocket: the test decides when it opens, sends and closes.
class FakeSocket {
  static opened: FakeSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  closed = false
  url: string
  constructor(url: string) {
    this.url = url
    FakeSocket.opened.push(this)
  }
  close() {
    this.closed = true
  }
  open() {
    this.onopen?.()
  }
  send(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
  drop() {
    this.onclose?.()
  }
}

const openSocket = (url: string) => new FakeSocket(url) as unknown as WebSocket
const latest = () => FakeSocket.opened[FakeSocket.opened.length - 1]

describe('parseRealtimeMessage', () => {
  it('reads a kitchen board and a live event', () => {
    expect(parseRealtimeMessage(JSON.stringify({ type: 'kitchen.board', board }))).toEqual({ type: 'kitchen.board', board })
    expect(parseRealtimeMessage(JSON.stringify({ type: 'live.event', event }))).toEqual({ type: 'live.event', event })
  })

  it('ignores text that is not JSON, unknown types, and messages without their payload', () => {
    expect(parseRealtimeMessage('not json')).toBeNull()
    expect(parseRealtimeMessage(new Blob())).toBeNull()
    expect(parseRealtimeMessage(JSON.stringify({ type: 'ping' }))).toBeNull()
    expect(parseRealtimeMessage(JSON.stringify({ type: 'kitchen.board' }))).toBeNull()
    expect(parseRealtimeMessage(JSON.stringify({ type: 'live.event', event: null }))).toBeNull()
    expect(parseRealtimeMessage('null')).toBeNull()
  })
})

describe('createSocketRealtime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeSocket.opened = []
  })
  afterEach(() => vi.useRealTimers())

  it('opens one socket for every watcher and sends each board change to the kitchen watchers', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket })
    const first = vi.fn()
    const second = vi.fn()
    realtime.watchKitchenBoard(first)
    realtime.watchKitchenBoard(second)

    expect(FakeSocket.opened).toHaveLength(1)
    latest().send({ type: 'kitchen.board', board })

    expect(first).toHaveBeenCalledWith(board)
    expect(second).toHaveBeenCalledWith(board)
  })

  it('sends live events to the live watchers only', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket })
    const onBoard = vi.fn()
    const onEvent = vi.fn()
    realtime.watchKitchenBoard(onBoard)
    realtime.watchLiveEvents(onEvent)

    latest().send({ type: 'live.event', event })

    expect(onEvent).toHaveBeenCalledWith(event)
    expect(onBoard).not.toHaveBeenCalled()
  })

  it('closes the socket when nothing watches it any more', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket })
    const stopBoard = realtime.watchKitchenBoard(vi.fn())
    const stopLive = realtime.watchLiveEvents(vi.fn())
    const socket = latest()

    stopBoard()
    expect(socket.closed).toBe(false)
    stopLive()

    expect(socket.closed).toBe(true)
  })

  it('reconnects after a drop, waiting longer each time', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket, retryDelaysMs: [1000, 3000] })
    realtime.watchKitchenBoard(vi.fn())

    latest().drop()
    vi.advanceTimersByTime(999)
    expect(FakeSocket.opened).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.opened).toHaveLength(2)

    latest().drop()
    vi.advanceTimersByTime(3000)
    expect(FakeSocket.opened).toHaveLength(3)
  })

  it('starts the wait again from the first delay once a connection opens', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket, retryDelaysMs: [1000, 3000] })
    realtime.watchKitchenBoard(vi.fn())
    latest().drop()
    vi.advanceTimersByTime(1000)
    latest().open()

    latest().drop()
    vi.advanceTimersByTime(1000)

    expect(FakeSocket.opened).toHaveLength(3)
  })

  it('does not reconnect once the last watcher has stopped', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket })
    const stop = realtime.watchKitchenBoard(vi.fn())
    latest().drop()
    stop()

    vi.advanceTimersByTime(60000)

    expect(FakeSocket.opened).toHaveLength(1)
  })

  it('stops a pending reconnect when the last watcher stops during the wait', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket, retryDelaysMs: [1000] })
    const stop = realtime.watchKitchenBoard(vi.fn())
    latest().drop()

    stop()
    vi.advanceTimersByTime(5000)
    realtime.watchKitchenBoard(vi.fn())

    expect(FakeSocket.opened).toHaveLength(2)
  })

  it('ignores a close from a socket that was already replaced', () => {
    const realtime = createSocketRealtime({ url: 'ws://test/ws', openSocket })
    const stop = realtime.watchKitchenBoard(vi.fn())
    const old = latest()
    stop()
    realtime.watchKitchenBoard(vi.fn())
    const current = latest()

    old.drop()
    vi.advanceTimersByTime(60000)

    expect(FakeSocket.opened).toHaveLength(2)
    expect(current.closed).toBe(false)
  })
})
