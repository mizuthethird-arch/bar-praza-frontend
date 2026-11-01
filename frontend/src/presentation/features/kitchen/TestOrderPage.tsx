import { useState } from 'react'
import { Link } from 'react-router'
import { useServices } from '../../app/use-services'
import { outlineButton, primaryButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { playChime } from './chime'

// Demo build only: makes test orders for the kitchen board and tries the sound. The board hears about each new
// order as it is made, so it shows and chimes at once.
export function TestOrderPage() {
  const { testKitchen } = useServices()
  const [notice, setNotice] = useState<{ text: string; failed: boolean } | null>(null)

  if (!testKitchen) {
    return (
      <Page>
        <PageHeader eyebrow="Datos de demostración" title="Pedido de prueba" />
        <p role="alert" className="rounded-xl border border-neutral-700 p-4 text-sm text-neutral-300">
          Solo disponible con datos de demostración.
        </p>
      </Page>
    )
  }

  async function run(action: () => Promise<string>, failure: string) {
    try {
      setNotice({ text: await action(), failed: false })
    } catch {
      setNotice({ text: failure, failed: true })
    }
  }

  return (
    <Page>
      <PageHeader eyebrow="Datos de demostración" title="Pedido de prueba" />

      <Reveal className="flex max-w-xl flex-col gap-3">
        <button
          type="button"
          onClick={() =>
            void run(async () => {
              const board = await testKitchen.createOrder()
              const created = board.orders[board.orders.length - 1]
              return `Pedido ${created.id} creado. Aparecerá al momento en Pedidos de cocina.`
            }, 'No se pudo crear el pedido de prueba. Inténtalo de nuevo.')
          }
          className={`${primaryButton} self-start`}
        >
          Crear pedido de prueba
        </button>

        <button type="button" onClick={() => playChime()} className={`${outlineButton} self-start px-4 py-2`}>
          Probar sonido
        </button>

        <button
          type="button"
          onClick={() =>
            void run(async () => {
              await testKitchen.reset()
              return 'Pedidos de prueba borrados. El tablero vuelve a su estado inicial.'
            }, 'No se pudieron borrar los pedidos de prueba.')
          }
          className={`${outlineButton} self-start px-4 py-2`}
        >
          Borrar pedidos de prueba
        </button>

        <Link to="/cocina" className="self-start text-sm underline underline-offset-4">
          Abrir Pedidos de cocina
        </Link>

        {notice && (
          <p
            role={notice.failed ? 'alert' : 'status'}
            className={`rounded-xl border p-4 text-sm ${
              notice.failed ? 'border-red-900 bg-red-950/40 text-red-300' : 'border-emerald-900 bg-emerald-950/40 text-emerald-200'
            }`}
          >
            {notice.text}
          </p>
        )}
      </Reveal>
    </Page>
  )
}
