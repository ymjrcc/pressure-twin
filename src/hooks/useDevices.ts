import type { DeviceInfo } from '@/data/workshopDevices'
import { useApiResource, type UseApiResourceResult } from '@/hooks/useApiResource'

type UseDevicesResult = {
  devices: DeviceInfo[]
  error: string | null
  loading: boolean
}

export function useDevices(): UseDevicesResult {
  const result = useApiResource<DeviceInfo[]>('/api/devices', [])

  return mapApiResourceResult(result)
}

function mapApiResourceResult<T>(result: UseApiResourceResult<T>) {
  return {
    devices: result.data as DeviceInfo[],
    error: result.error,
    loading: result.loading,
  }
}
