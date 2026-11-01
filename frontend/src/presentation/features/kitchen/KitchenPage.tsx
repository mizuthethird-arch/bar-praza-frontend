import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, Reorder } from 'framer-motion'
import { boardColumns, type KitchenBoard, type KitchenOrder } from '../../../domain/kitchen/kitchen'
import { arrangeColumn, type DeliverySort } from '../../../domain/kitchen/sort'
import { clockOf } from '../../../domain/time/clock'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { useNow } from '../../hooks/use-now'
import { AsyncView } from '../../ui/async-view'
import { outlineButton, primaryButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { Sheet } from '../../ui/Sheet'
import { Toast } from '../../ui/Toast'
import { playChime, unlockSound } from './chime'
import { CloseShiftDialog } from './CloseShiftDialog'
import { DeliveryHistory } from './DeliveryHistory'
import { Column, EmptyColumn } from './KitchenColumn'
import { ColumnFilter, type ColumnKey } from './ColumnFilter'
import { KitchenOrderCard } from './KitchenOrderCard'
import { SoundToggle } from './SoundToggle'

const REFRESH_MS = 15000

// The grid for each number of columns shown, from 1280 px up. The class names are written out in full
// so Tailwind keeps them.
const GRID_BY_COUNT = ['', 'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4'] as const

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
  // Whether the browser lets this page make sound. False until the page is pressed, or a chime plays.
  const [soundReady, setSoundReady] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  // The order the person dragged the cards of each live column into, by order id. New orders join below them.
  const [placed, setPlaced] = useState<Record<'fresh' | 'preparing' | 'ready', string[]>>({ fresh: [], preparing: [], ready: [] })
  const [deliverySort, setDeliverySort] = useState<DeliverySort>('delivery')
  // Which columns are on the board. All four at first; the toolbar above the board changes it.
  const [shown, setShown] = useState<Record<ColumnKey, boolean>>({ fresh: true, preparing: true, ready: true, delivered: true })
  const shownCount = Object.values(shown).filter(Boolean).length
  const closed = board.shiftClosedAt !== undefined
  const now = clockOf(useNow(30000))
  const known = useRef(new Set(initial.orders.map((order) => order.id)))
  const soundRef = useRef(sound)
  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  // Off when the person switched it off; waiting when the browser still holds it back; otherwise active.
  const soundState = !sound ? 'off' : soundReady ? 'on' : 'waiting'

  // Pressing it switches the sound off and on, and a press while it is waiting lets the browser play it.
  function pressSound() {
    if (sound && soundReady) {
      setSound(false)
      return
    }
    setSound(true)
    void unlockSound().then(setSoundReady)
  }

  const show = useCallback((next: KitchenBoard) => {
    const arrived = next.orders.filter((order) => !known.current.has(order.id))
    arrived.forEach((order) => known.current.add(order.id))
    if (arrived.length > 0 && soundRef.current) setSoundReady(playChime())
    setBoard(next)
  }, [])

  // A press, click or key on the page lets the browser play the chime, if it still holds it back.
  useEffect(() => {
    // A press on the sound button is left to the button: unlocking here first would change what its click means.
    const unlock = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-sound-toggle]')) return
      void unlockSound().then(setSoundReady)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
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

  const columns = boardColumns(board.orders)
  const fresh = arrangeColumn(columns.fresh, placed.fresh)
  const preparing = arrangeColumn(columns.preparing, placed.preparing)
  const ready = arrangeColumn(columns.ready, placed.ready)

  // The cards of a live column can be dragged into another order; the order they are left in is kept.
  const draggable = (column: 'fresh' | 'preparing' | 'ready', list: KitchenOrder[]) => (
    <Reorder.Group
      as="div"
      axis="y"
      values={list}
      onReorder={(next: KitchenOrder[]) => setPlaced((current) => ({ ...current, [column]: next.map((order) => order.id) }))}
      className="space-y-4"
    >
      <AnimatePresence initial={false}>
        {list.map((order) => (
          <Reorder.Item key={order.id} value={order} as="div">
            {card(order)}
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  )
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
            <SoundToggle state={soundState} onPress={pressSound} />
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

      <div className="mb-6">
        <ColumnFilter shown={shown} onChange={setShown} />
      </div>

      {/* Below 1280 px the columns stack in one column, like a phone; from 1280 px they sit side by side,
          as many as are shown. */}
      <Reveal className={`grid items-start gap-6 ${GRID_BY_COUNT[shownCount]}`}>
        {shown.fresh && (
          <Column title="Nuevos" count={fresh.length}>
            {draggable('fresh', fresh)}
            {fresh.length === 0 && <EmptyColumn text="No hay pedidos nuevos." />}
          </Column>
        )}
        {shown.preparing && (
          <Column title="En curso">
            {draggable('preparing', preparing)}
            {preparing.length === 0 && <EmptyColumn text="Nada en curso." />}
          </Column>
        )}
        {shown.ready && (
          <Column title="Listos" count={ready.length}>
            {draggable('ready', ready)}
            {ready.length === 0 && <EmptyColumn text="Nada listo para entregar." />}
          </Column>
        )}
        {shown.delivered && (
          <DeliveryHistory delivered={board.delivered} now={now} sort={deliverySort} onSort={setDeliverySort} />
        )}
      </Reveal>
    </Page>
  )
}

export function KitchenPage() {
  const services = useServices()
  const state = useAsync(services.getKitchenBoard)

  // Reduced motion: cards still fade, but they no longer slide between columns.
  return (
    <MotionConfig reducedMotion="user">
      <AsyncView state={state}>{(initial) => <Board initial={initial} />}</AsyncView>
    </MotionConfig>
  )
}
