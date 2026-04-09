import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data-fetching hook.
 *
 * @param {Function} apiFn   Async function that returns data (called on mount + refetch)
 * @param {Array}    deps    Re-run whenever these values change (default [])
 *
 * Returns { data, loading, error, refetch }
 * Falls back to `fallback` if the request fails (so UI never breaks).
 */
export function useApi(apiFn, { deps = [], fallback = null, enabled = true } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError]     = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn()
      if (mountedRef.current) setData(result)
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message ?? 'Unknown error')
        if (fallback !== null) setData(fallback)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}
