import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useServices } from './use-services'

describe('useServices', () => {
  it('fails loudly when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useServices())).toThrow('ServicesProvider is missing')

    vi.restoreAllMocks()
  })
})
