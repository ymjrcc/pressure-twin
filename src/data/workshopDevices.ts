export type DeviceCode = 'T-201' | 'PU-101' | 'E-101' | 'V-101' | 'V-102' | 'CC-101'

export type DeviceStatus = 'normal' | 'warning' | 'alarm' | 'offline'

export type DeviceThumbnailType = 'tank' | 'pump' | 'exchanger' | 'vessel' | 'cabinet'

export type InspectionItemResult = 'normal' | 'abnormal'

export type InspectionItem = {
  description: string
  id: string
  label: string
}

export type DeviceInspectionRecord = {
  checkedAt?: number
  deviceCode: DeviceCode
  itemResults: Record<string, InspectionItemResult | undefined>
  note: string
}

export type InspectionSession = {
  completedAt?: number
  currentDeviceIndex: number
  records: Record<DeviceCode, DeviceInspectionRecord>
  startedAt: number
  status: 'idle' | 'running' | 'completed'
}

export type StaticDeviceParameter = {
  label: string
  status?: DeviceStatus
  unit?: string
  value: string
}

export type DeviceInfo = {
  code: DeviceCode
  description: string
  haloPosition: [number, number, number]
  haloRadius: number
  name: string
  parameters: StaticDeviceParameter[]
  position: [number, number, number]
  status: DeviceStatus
  thumbnailType: DeviceThumbnailType
}

export type InstrumentInfo = {
  code: string
  name: string
}

export type ProcessFlowStep = {
  code: string
  description: string
  deviceName: string
  status?: DeviceStatus
  title: string
  variant?: 'control' | 'return'
}

export const inspectionPersonTargets: Record<DeviceCode, [number, number, number]> = {
  'CC-101': [-1.8, 0, 5.3],
  'E-101': [-4.8, 0, 0.2],
  'PU-101': [0.4, 0, 2.5],
  'T-201': [3.6, 0, 3.3],
  'V-101': [-6.2, 0, -2.2],
  'V-102': [0.7, 0, -2.2],
}
