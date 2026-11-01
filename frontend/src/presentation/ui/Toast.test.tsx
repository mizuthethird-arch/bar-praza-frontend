import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('shows its message as a status and tells the owner when it is time to go', async () => {
    const onDone = vi.fn()
    render(<Toast message="Turno finalizado" onDone={onDone} durationMs={20} />)

    expect(screen.getByRole('status')).toHaveTextContent('Turno finalizado')
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))
  })

  it('shows nothing without a message', () => {
    render(<Toast message={null} onDone={() => undefined} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
