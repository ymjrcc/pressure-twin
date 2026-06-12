import type { InstrumentInfo } from '@/data/workshopDevices'
import { useApiResource } from '@/hooks/useApiResource'

export function useInstruments() {
  const { data, error, loading } = useApiResource<InstrumentInfo[]>('/api/instruments', [])

  return {
    instruments: data,
    error,
    loading,
  }
}
