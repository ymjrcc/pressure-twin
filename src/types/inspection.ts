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
