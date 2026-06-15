import type {
  CreateInspectionReportPayload,
  CreateInspectionReportResponse,
  InspectionReportDetail,
  InspectionReportListItem,
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

export async function listInspectionReports(): Promise<InspectionReportListItem[]> {
  const response = await fetch('/api/inspections')
  const result = (await response.json()) as ApiResponse<InspectionReportListItem[]>

  if (!response.ok || !result.ok || !result.data) {
    throw new Error(result.error?.message ?? `Request failed with status ${response.status}`)
  }

  return result.data
}

export async function getInspectionReportDetail(reportId: number): Promise<InspectionReportDetail> {
  const response = await fetch(`/api/inspections/${reportId}`)
  const result = (await response.json()) as ApiResponse<InspectionReportDetail>

  if (!response.ok || !result.ok || !result.data) {
    throw new Error(result.error?.message ?? `Request failed with status ${response.status}`)
  }

  return result.data
}
