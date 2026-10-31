import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAsync } from './use-async'

describe('useAsync', () => {
  it('starts loading and then exposes the data', async () => {
    const { result } = renderHook(() => useAsync(async () => 'ready'))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.data).toBe('ready')
  })

  it('exposes the error when the load fails', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw new Error('boom')
      }),
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.message).toBe('boom')
  })
})

describe('useAsync edge cases', () => {
  it('wraps a rejection that is not an Error', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject('boom')))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('boom')
  })

  it('runs the load only once even when re-rendered', async () => {
    let calls = 0
    const { rerender } = renderHook(() =>
      useAsync(async () => {
        calls += 1
        return calls
      }),
    )

    rerender()
    rerender()

    await waitFor(() => expect(calls).toBe(1))
  })
})
