export type DeviceCode = 'T-201' | 'PU-101' | 'E-101' | 'V-101' | 'V-102' | 'CC-101'

export type DeviceInfo = {
  code: DeviceCode
  haloPosition: [number, number, number]
  haloRadius: number
  name: string
  position: [number, number, number]
}

export type InstrumentInfo = {
  code: string
  name: string
}

export const devices: DeviceInfo[] = [
  { code: 'T-201', name: '立式储罐', position: [6.25, 4.55, 2.45], haloPosition: [5.2, 0.035, 2.3], haloRadius: 1.5 },
  { code: 'PU-101', name: '循环泵', position: [1.55, 1.72, 2.45], haloPosition: [1.6, 0.035, 1.8], haloRadius: 1.15 },
  { code: 'E-101', name: '换热器', position: [-3.45, 2.12, 2.15], haloPosition: [-3.4, 0.035, 1.5], haloRadius: 2.15 },
  { code: 'V-101', name: '卧式压力容器', position: [-4.35, 3.62, -2.05], haloPosition: [-4.2, 0.035, -3.2], haloRadius: 3.35 },
  { code: 'V-102', name: '卧式压力容器', position: [2.8, 3.62, -2.05], haloPosition: [2.6, 0.035, -3.2], haloRadius: 3.35 },
  { code: 'CC-101', name: '控制柜', position: [-0.9, 2.65, 6], haloPosition: [-0.9, 0.035, 5.55], haloRadius: 0.8 },
]

export const instruments: InstrumentInfo[] = [
  { code: 'PG-101', name: '压力表' },
  { code: 'PT-101', name: '压力变送器' },
  { code: 'PSV-101', name: '安全阀' },
  { code: 'PG-102', name: '压力表' },
  { code: 'PT-102', name: '压力变送器' },
  { code: 'PSV-102', name: '安全阀' },
  { code: 'PG-103', name: '压力表' },
  { code: 'LG-201', name: '液位计' },
  { code: 'LT-201', name: '液位变送器' },
  { code: 'PG-201', name: '压力表' },
  { code: 'PT-201', name: '压力变送器' },
  { code: 'PG-202', name: '压力表' },
  { code: 'PT-202', name: '压力变送器' },
]
