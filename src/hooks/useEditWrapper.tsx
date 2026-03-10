import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

export function useItemId(): string | undefined {
  const { id } = useParams<{ id?: string }>()
  return id
}

export function useTaskIdFromPath(): string | undefined {
  const { id } = useParams<{ id?: string }>()
  return id
}

export function useEditItem<T>(
  id: string | undefined,
  fetchAll: () => Promise<T[]>,
  matchId: (item: T, id: string) => boolean
): { item: T | null; loading: boolean } {
  const [item, setItem] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (id) {
        const items = await fetchAll()
        const found = items.find(i => matchId(i, id))
        if (mounted) {
          setItem(found || null)
          setLoading(false)
        }
      } else {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, fetchAll, matchId])

  return { item, loading }
}

export function useFormFields<T extends Record<string, unknown>>(
  initialValues: T
): [T, (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, (values: T) => void] {
  const [values, setValues] = useState<T>(initialValues)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setValues(prev => ({ ...prev, [name]: value }))
    },
    []
  )

  const setValuesDirectly = useCallback((newValues: T) => {
    setValues(newValues)
  }, [])

  return [values, handleChange, setValuesDirectly]
}

export function safeParseInt(value: string | undefined | null, fallback = 0): number {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

export function formatCurrency(value: string | undefined | null): string {
  const num = safeParseInt(value, 0)
  return num.toLocaleString()
}
