import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from './Sheet'

// A pop-up opened from a button, the way every screen uses it.
function Opener({ onClose = () => undefined }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      {open && (
        <Sheet
          titleId="sheet-title"
          footer={<span>Total 4,50 €</span>}
          onClose={() => {
            setOpen(false)
            onClose()
          }}
        >
          <h2 id="sheet-title">Detalle</h2>
        </Sheet>
      )}
    </>
  )
}

describe('Sheet', () => {
  it('is named after its heading and shows its footer beside the close button', async () => {
    render(<Opener />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(screen.getByRole('dialog', { name: 'Detalle' })).toBeInTheDocument()
    expect(screen.getByText('Total 4,50 €')).toBeInTheDocument()
  })

  it('stays open for any key other than Escape', async () => {
    const onClose = vi.fn()
    render(<Opener onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    await userEvent.keyboard('a')

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Detalle' })).toBeInTheDocument()
  })

  it('closes with Escape and gives focus back to the element that opened it', async () => {
    const onClose = vi.fn()
    render(<Opener onClose={onClose} />)
    const opener = screen.getByRole('button', { name: 'Abrir' })
    await userEvent.click(opener)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(opener).toHaveFocus()
  })
})
