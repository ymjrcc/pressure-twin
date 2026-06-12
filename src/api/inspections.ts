import type {
  CreateInspectionReportPayload,
  CreateInspectionReportResponse,
} from '@/types/inspection'

type ApiResponse<T> = {
  data?: T
  error?: {
    message?: string
  }
  ok: boolean
}

export async function submitInspectionReport(payload: CreateInspectionReportPayload): Promise<CreateInspectionReportResponse> {
  const response = await fetch('/api/inspections', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const result = (await response.json()) as ApiResponse<CreateInspectionReportResponse>

  if (!response.ok || !result.ok || !result.data) {
    throw new Error(result.error?.message ?? `Request failed with status ${response.status}`)
  }

  return result.data
}
