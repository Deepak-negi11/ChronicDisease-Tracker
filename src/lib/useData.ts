import { useEffect, useState } from 'react'
import { subscribe } from '../data/api'

/** Tiny loader hook: re-runs when deps change or when the stub store emits a change. */
export function useData<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribe(() => setTick((t) => t + 1))
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let live = true
    load()
      .then((d) => live && setData(d))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : 'Something went wrong'))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, error, loading: data === null && !error }
}
