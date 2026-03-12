import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncEffect, useMountedState } from './useAsyncEffect'

describe('useAsyncEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls effect function', async () => {
    const effect = vi.fn().mockResolvedValue('result')
    
    renderHook(() => useAsyncEffect(effect, []))
    
    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('provides isMounted function that returns true when mounted', async () => {
    let isMountedValue: boolean | undefined
    
    const effect = async (isMounted: () => boolean) => {
      isMountedValue = isMounted()
      return 'result'
    }
    
    renderHook(() => useAsyncEffect(effect, []))
    
    await waitFor(() => {
      expect(isMountedValue).toBe(true)
    })
  })

  it('calls onResult callback with result', async () => {
    const onResult = vi.fn()
    const effect = vi.fn().mockResolvedValue('test result')
    
    renderHook(() => useAsyncEffect(effect, [], { onResult }))
    
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('test result')
    })
  })

  it('calls onError callback on error', async () => {
    const onError = vi.fn()
    const error = new Error('test error')
    const effect = vi.fn().mockRejectedValue(error)
    
    renderHook(() => useAsyncEffect(effect, [], { onError }))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error)
    })
  })

  it('re-runs when deps change', async () => {
    const effect = vi.fn().mockResolvedValue('result')
    
    const { rerender } = renderHook(
      ({ dep }) => useAsyncEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    )
    
    expect(effect).toHaveBeenCalledTimes(1)
    
    rerender({ dep: 2 })
    
    await waitFor(() => {
      expect(effect).toHaveBeenCalledTimes(2)
    })
  })

  it('does not call onResult after unmount', async () => {
    const onResult = vi.fn()
    let resolvePromise: (value: string) => void
    
    const effect = vi.fn().mockImplementation(() => {
      return new Promise<string>((resolve) => {
        resolvePromise = resolve
      })
    })
    
    const { unmount } = renderHook(() => useAsyncEffect(effect, [], { onResult }))
    
    unmount()
    
    resolvePromise!('result')
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(onResult).not.toHaveBeenCalled()
  })
})

describe('useMountedState', () => {
  it('returns true when mounted', async () => {
    const { result } = renderHook(() => useMountedState())
    
    await waitFor(() => {
      expect(result.current()).toBe(true)
    })
  })

  it('returns false after unmount', async () => {
    const { result, unmount } = renderHook(() => useMountedState())
    
    await waitFor(() => {
      expect(result.current()).toBe(true)
    })
    
    const isMounted = result.current
    unmount()
    
    expect(isMounted()).toBe(false)
  })
})
