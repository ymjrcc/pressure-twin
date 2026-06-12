import type { TelemetryMetricConfig } from '@/data/deviceTelemetry'
import type { DeviceCode } from '@/data/workshopDevices'
import { useApiResource } from '@/hooks/useApiResource'

export type TelemetryConfigs = Record<DeviceCode, TelemetryMetricConfig[]>

export function useTelemetryConfigs() {
  const { data, error, loading } = useApiResource<TelemetryConfigs>('/api/telemetry-configs', {} as TelemetryConfigs)

  return {
    telemetryConfigs: data,
    error,
    loading,
  }
}
