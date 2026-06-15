import type { DeviceCode, InspectionItemResult } from '@/data/workshopDevices'

export type InspectionReportItemResultPayload = {
  itemId: string
  result: InspectionItemResult
}

export type InspectionReportDeviceRecordPayload = {
  checkedAt?: number
  deviceCode: DeviceCode
  itemResults: InspectionReportItemResultPayload[]
  note: string
}

export type CreateInspectionReportPayload = {
  completedAt: number
  records: InspectionReportDeviceRecordPayload[]
  startedAt: number
}

export type CreateInspectionReportResponse = {
  reportId: number
}

export type InspectionReportListItem = {
  abnormalItemCount: number
  completedAt: number
  deviceCount: number
  id: number
  normalItemCount: number
  startedAt: number
  submittedAt: number
}

export type InspectionReportItemResultDetail = {
  itemId: string
  label: string
  result: InspectionItemResult
  sortOrder: number
}

export type InspectionReportDeviceDetail = {
  abnormalItemCount: number
  checkedAt?: number
  deviceCode: DeviceCode
  deviceName: string
  itemResults: InspectionReportItemResultDetail[]
  note: string
  sortOrder: number
}

export type InspectionReportDetail = InspectionReportListItem & {
  deviceRecords: InspectionReportDeviceDetail[]
}

export type InspectionReportAnalysisStatus = 'normal' | 'warning' | 'critical'

export type InspectionReportAnalysisRiskLevel = 'low' | 'medium' | 'high'

export type InspectionReportAnalysisDevice = {
  abnormalItemCount: number
  abnormalItems: string[]
  deviceCode: string
  deviceName: string
  issueSummary: string
  note: string
  recommendation: string
  riskLevel: InspectionReportAnalysisRiskLevel
}

export type InspectionReportAnalysis = {
  abnormalDevices: InspectionReportAnalysisDevice[]
  overallStatus: InspectionReportAnalysisStatus
  recommendations: string[]
  risks: string[]
  summary: string
}
