import { useEffect, useRef, useCallback } from 'react'

export function useAsyncEffect<T>(
  effect: (isMounted: () => boolean) => Promise<T>,
  deps: React.DependencyList
): void

export function useAsyncEffect<T>(
  effect: (isMounted: () => boolean) => Promise<T>,
  deps: React.DependencyList,
  options?: {
    onResult?: (result: T) => void
    onError?: (error: Error) => void
  }
): void

export function useAsyncEffect<T>(
  effect: (isMounted: () => boolean) => Promise<T>,
  deps: React.DependencyList,
  options?: {
    onResult?: (result: T) => void
    onError?: (error: Error) => void
  }
): void {
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const isMounted = () => mountedRef.current

    effect(isMounted)
      .then((result) => {
        if (isMounted() && options?.onResult) {
          options.onResult(result)
        }
      })
      .catch((error) => {
        if (isMounted() && options?.onError) {
          options.onError(error)
        }
      })

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useMountedState(): () => boolean {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return useCallback(() => mountedRef.current, [])
}
