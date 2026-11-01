import type { RealtimePort } from '../../application/ports'
import type { KitchenBoard } from '../../domain/kitchen/kitchen'
import type { LiveEvent } from '../../domain/live/live-console'

// What the backend pushes: one JSON text message per change. The shape is a proposal until the backend
// confirms it (frontend/docs/backend-contract.md, section 6).
export type RealtimeMessage = { type: 'kitchen.board'; board: KitchenBoard } | { type: 'live.event'; event: LiveEvent }

// Anything that is not a known message is ignored, so a new message type from the server cannot break the page.
export function parseRealtimeMessage(raw: unknown): RealtimeMessage | null {
  if (typeof raw !== 'string') return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const data = parsed as { type?: unknown; board?: unknown; event?: unknown }
  if (data.type === 'kitchen.board' && typeof data.board === 'object' && data.board !== null) {
    return { type: 'kitchen.board', board: data.board as KitchenBoard }
  }
  if (data.type === 'live.event' && typeof data.event === 'object' && data.event !== null) {
    return { type: 'live.event', event: data.event as LiveEvent }
  }
  return null
}

type Options = {
  url: string
  // The socket constructor. The app uses the browser's WebSocket; tests pass a fake.
  openSocket?: (url: string) => WebSocket
  // How long to wait before each retry. The last delay repeats.
  retryDelaysMs?: number[]
}

// One socket for the whole page, open while anything watches it. When it drops, it reconnects with a
// growing wait. The session cookie is sent with the handshake, because the socket is on the same site.
export function createSocketRealtime({
  url,
  openSocket = (address) => new WebSocket(address),
  retryDelaysMs = [1000, 2000, 5000, 10000, 30000],
}: Options): RealtimePort {
  const boardWatchers = new Set<(board: KitchenBoard) => void>()
  const liveWatchers = new Set<(event: LiveEvent) => void>()
  let socket: WebSocket | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let failures = 0

  const watching = () => boardWatchers.size + liveWatchers.size > 0

  function connect() {
    const current = openSocket(url)
    socket = current
    current.onopen = () => {
      failures = 0
    }
    current.onmessage = (event) => {
      const message = parseRealtimeMessage(event.data)
      if (message?.type === 'kitchen.board') boardWatchers.forEach((onBoard) => onBoard(message.board))
      if (message?.type === 'live.event') liveWatchers.forEach((onEvent) => onEvent(message.event))
    }
    current.onclose = () => {
      // A socket that was already replaced by a newer one says nothing about the current connection.
      if (socket !== current) return
      socket = null
      if (watching()) scheduleRetry()
    }
  }

  function scheduleRetry() {
    const delay = retryDelaysMs[Math.min(failures, retryDelaysMs.length - 1)]
    failures += 1
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      if (watching()) connect()
    }, delay)
  }

  function start() {
    if (!socket && retryTimer === undefined && watching()) connect()
  }

  function stopIfUnused() {
    if (watching()) return
    clearTimeout(retryTimer)
    retryTimer = undefined
    const current = socket
    socket = null
    current?.close()
  }

  return {
    watchKitchenBoard(onBoard) {
      boardWatchers.add(onBoard)
      start()
      return () => {
        boardWatchers.delete(onBoard)
        stopIfUnused()
      }
    },
    watchLiveEvents(onEvent) {
      liveWatchers.add(onEvent)
      start()
      return () => {
        liveWatchers.delete(onEvent)
        stopIfUnused()
      }
    },
  }
}
