import type { DeviceCode, InspectionItem } from '@/data/workshopDevices'
import { useApiResource } from '@/hooks/useApiResource'

export type InspectionChecklists = Record<DeviceCode, InspectionItem[]>

export function useInspectionChecklists() {
  const { data, error, loading } = useApiResource<InspectionChecklists>('/api/inspection-checklists', {} as InspectionChecklists)

  return {
    inspectionChecklists: data,
    error,
    loading,
  }
}
