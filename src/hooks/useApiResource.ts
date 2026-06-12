import { useEffect, useState } from 'react'

type ApiResponse<T> = {
  data?: T
  ok: boolean
}

export type UseApiResourceResult<T> = {
  data: T
  error: string | null
  loading: boolean
}

export function useApiResource<T>(path: string, initialData: T): UseApiResourceResult<T> {
  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(path, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const result = (await response.json()) as ApiResponse<T>

        if (!result.ok || result.data === undefined) {
          throw new Error(`Invalid response payload for ${path}`)
        }

        setData(result.data)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setError(error instanceof Error ? error.message : `Failed to load ${path}`)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [path])

  return {
    data,
    error,
    loading,
  }
}
