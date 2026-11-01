import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { boardColumns, type KitchenBoard } from '../../../domain/kitchen/kitchen'
import { clockOf } from '../../../domain/time/clock'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { useNow } from '../../hooks/use-now'
import { AsyncView } from '../../ui/async-view'
import { outlineButton, primaryButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { Sheet } from '../../ui/Sheet'
import { Toast } from '../../ui/Toast'
import { playChime } from './chime'
import { CloseShiftDialog } from './CloseShiftDialog'
import { DeliveryHistory } from './DeliveryHistory'
import { Column, EmptyColumn } from './KitchenColumn'
import { KitchenOrderCard } from './KitchenOrderCard'

const REFRESH_MS = 15000

// The sold-out products, one per line, in a pop-up like the delivered orders.
function SoldOutDialog({ names, onClose }: { names: string[]; onClose: () => void }) {
  const titleId = useId()

  return (
    <Sheet titleId={titleId} onClose={onClose}>
      <h2 id={titleId} className="text-xl font-bold">Agotados</h2>
      {names.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-300">Nada agotado.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}

function SoldOut() {
  const { getCatalog } = useServices()
  const state = useAsync(getCatalog)
  const [open, setOpen] = useState(false)
  const names = state.data?.filter((product) => product.soldOut).map((product) => product.name)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!names}
        aria-haspopup="dialog"
        className={`px-4 py-2 ${outlineButton} disabled:opacity-40`}
      >
        {names ? `Agotados (${names.length})` : 'Agotados'}
      </button>
      <AnimatePresence>{open && names && <SoldOutDialog names={names} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}

function Board({ initial }: { initial: KitchenBoard }) {
  const services = useServices()
  const [board, setBoard] = useState(initial)
  const [sound, setSound] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const closed = board.shiftClosedAt !== undefined
  const now = clockOf(useNow(30000))
  const known = useRef(new Set(initial.orders.map((order) => order.id)))
  const soundRef = useRef(sound)
  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  const show = useCallback((next: KitchenBoard) => {
    const arrived = next.orders.filter((order) => !known.current.has(order.id))
    arrived.forEach((order) => known.current.add(order.id))
    if (arrived.length > 0 && soundRef.current) playChime()
    setBoard(next)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      services.getKitchenBoard().then(
        (next) => {
          show(next)
          setError(null)
        },
        () => setError('No se pudo actualizar'),
      )
    }, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [services, show])

  async function closeShift() {
    setConfirming(false)
    try {
      show(await services.closeKitchenShift())
      setError(null)
      setNotice('Turno finalizado')
    } catch {
      setError('No se pudo cerrar el turno')
    }
  }

  const act = (change: Promise<KitchenBoard>) =>
    change.then(
      (next) => {
        show(next)
        setError(null)
      },
      () => setError('No se pudo actualizar el pedido'),
    )

  const { fresh, preparing, ready } = boardColumns(board.orders, now)
  const card = (order: (typeof board.orders)[number]) => (
    <KitchenOrderCard
      key={order.id}
      order={order}
      now={now}
      onStart={() => void act(services.startKitchenOrder(order.id))}
      onReady={() => void act(services.markKitchenOrderReady(order.id))}
      onDeliver={() => void act(services.deliverKitchenOrder(order.id))}
      onCancel={() => void act(services.cancelKitchenOrder(order.id))}
    />
  )

  return (
    <Page>
      <PageHeader
        eyebrow="Datos de demostración"
        title="Pedidos de cocina"
        actions={
          <>
            <button type="button" onClick={() => setSound(!sound)} className={`px-4 py-2 ${outlineButton}`}>
              {sound ? 'Sonido activo' : 'Sonido apagado'}
            </button>
            <SoldOut />
            <button type="button" onClick={() => setConfirming(true)} disabled={closed} className={`${primaryButton} disabled:opacity-40`}>
              Cerrar turno
            </button>
          </>
        }
      />

      <AnimatePresence>
        {confirming && <CloseShiftDialog onConfirm={() => void closeShift()} onClose={() => setConfirming(false)} />}
      </AnimatePresence>
      <Toast message={notice} onDone={() => setNotice(null)} />

      <Reveal className="flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
            closed ? 'bg-neutral-800 text-neutral-300' : 'bg-emerald-950 text-emerald-300'
          }`}
        >
          {closed ? 'Turno cerrado' : 'Turno abierto'} · {board.shiftOpenedAt}
        </span>
        <span className="text-neutral-400">{now}</span>
      </Reveal>

      {error && (
        <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <Reveal className="grid items-start gap-6 md:grid-cols-2 2xl:grid-cols-4">
        <Column title="Nuevos" count={fresh.length}>
          {fresh.length === 0 ? <EmptyColumn text="No hay pedidos nuevos." /> : fresh.map(card)}
        </Column>
        <Column title="En curso">
          {preparing.length === 0 ? <EmptyColumn text="Nada en curso." /> : preparing.map(card)}
        </Column>
        <Column title="Listos" count={ready.length}>
          {ready.length === 0 ? <EmptyColumn text="Nada listo para entregar." /> : ready.map(card)}
        </Column>
        <DeliveryHistory delivered={board.delivered} />
      </Reveal>
    </Page>
  )
}

export function KitchenPage() {
  const services = useServices()
  const state = useAsync(services.getKitchenBoard)

  return <AsyncView state={state}>{(initial) => <Board initial={initial} />}</AsyncView>
}
