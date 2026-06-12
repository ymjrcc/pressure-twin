import { useEffect, useState } from 'react'

import type { DeviceInfo } from '@/data/workshopDevices'

type DevicesResponse = {
  data?: DeviceInfo[]
  ok: boolean
}

type UseDevicesResult = {
  devices: DeviceInfo[]
  error: string | null
  loading: boolean
}

export function useDevices(): UseDevicesResult {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDevices() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/devices', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const result = (await response.json()) as DevicesResponse

        if (!result.ok || !Array.isArray(result.data)) {
          throw new Error('Invalid devices response payload')
        }

        setDevices(result.data)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setError(error instanceof Error ? error.message : 'Failed to load devices')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadDevices()

    return () => controller.abort()
  }, [])

  return {
    devices,
    error,
    loading,
  }
}
