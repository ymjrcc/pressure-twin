import type { ProcessFlowStep } from '@/data/workshopDevices'
import { useApiResource } from '@/hooks/useApiResource'

export function useProcessFlowSteps() {
  const { data, error, loading } = useApiResource<ProcessFlowStep[]>('/api/process-flow', [])

  return {
    processFlowSteps: data,
    error,
    loading,
  }
}
