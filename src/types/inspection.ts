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
