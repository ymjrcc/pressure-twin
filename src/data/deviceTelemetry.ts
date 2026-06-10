import type { DeviceCode, DeviceStatus } from './workshopDevices'

export type TelemetryParameter = {
  key: string
  label: string
  max: string
  min: string
  normalizedRatio: number
  rawValue: number
  status: DeviceStatus
  unit?: string
  updatedAt: number
  value: string
}

export type DeviceTelemetry = {
  parameters: TelemetryParameter[]
  status: DeviceStatus
  updatedAt: number
}

export type DeviceTelemetrySnapshot = Record<DeviceCode, DeviceTelemetry>

export type TelemetryThreshold = {
  alarm?: number
  warning?: number
}

export type TelemetryMetricConfig = {
  alarmText?: string
  baseValue: number
  key: string
  label: string
  max: number
  min: number
  precision: number
  speed: number
  unit?: string
  warningText?: string
  thresholds?: {
    high?: TelemetryThreshold
    low?: TelemetryThreshold
  }
}

export type TelemetryMetricState = {
  direction: number
  phase: number
  value: number
}

export type DeviceTelemetryRuntime = Record<DeviceCode, Record<string, TelemetryMetricState>>

const statusPriority: Record<DeviceStatus, number> = {
  offline: 3,
  alarm: 2,
  warning: 1,
  normal: 0,
}

export const telemetryMetricConfigs: Record<DeviceCode, TelemetryMetricConfig[]> = {
  'T-201': [
    {
      baseValue: 68,
      key: 'level',
      label: '液位',
      max: 82,
      min: 52,
      precision: 0,
      speed: 1.7,
      thresholds: { high: { alarm: 80, warning: 76 }, low: { alarm: 48, warning: 52 } },
      unit: '%',
    },
    {
      baseValue: 0.42,
      key: 'pressure',
      label: '罐内压力',
      max: 0.52,
      min: 0.34,
      precision: 2,
      speed: 0.018,
      thresholds: { high: { alarm: 0.58, warning: 0.5 }, low: { warning: 0.32 } },
      unit: 'MPa',
    },
    {
      baseValue: 38.6,
      key: 'temperature',
      label: '介质温度',
      max: 43.5,
      min: 34.2,
      precision: 1,
      speed: 0.45,
      thresholds: { high: { alarm: 48, warning: 43 } },
      unit: '℃',
    },
  ],
  'PU-101': [
    {
      baseValue: 0.78,
      key: 'outletPressure',
      label: '出口压力',
      max: 0.9,
      min: 0.66,
      precision: 2,
      speed: 0.028,
      thresholds: { high: { alarm: 0.96, warning: 0.88 }, low: { alarm: 0.58, warning: 0.64 } },
      unit: 'MPa',
    },
    {
      baseValue: 42.5,
      key: 'flow',
      label: '流量',
      max: 49,
      min: 35,
      precision: 1,
      speed: 1.15,
      thresholds: { high: { warning: 48 }, low: { alarm: 30, warning: 35 } },
      unit: 'm3/h',
    },
    {
      baseValue: 54.2,
      key: 'bearingTemperature',
      label: '轴承温度',
      max: 63,
      min: 48,
      precision: 1,
      speed: 0.85,
      thresholds: { high: { alarm: 72, warning: 62 } },
      unit: '℃',
    },
    {
      baseValue: 1.8,
      key: 'vibration',
      label: '振动',
      max: 2.8,
      min: 1.1,
      precision: 1,
      speed: 0.22,
      thresholds: { high: { alarm: 4.5, warning: 2.6 } },
      unit: 'mm/s',
    },
  ],
  'E-101': [
    {
      baseValue: 92.4,
      key: 'inletTemperature',
      label: '入口温度',
      max: 96.5,
      min: 87.8,
      precision: 1,
      speed: 0.8,
      thresholds: { high: { alarm: 100, warning: 95 } },
      unit: '℃',
    },
    {
      baseValue: 73.8,
      key: 'outletTemperature',
      label: '出口温度',
      max: 78.8,
      min: 68.5,
      precision: 1,
      speed: 0.72,
      thresholds: { high: { alarm: 82, warning: 76 } },
      unit: '℃',
    },
    {
      baseValue: 0.64,
      key: 'shellPressure',
      label: '壳程压力',
      max: 0.74,
      min: 0.56,
      precision: 2,
      speed: 0.02,
      thresholds: { high: { alarm: 0.84, warning: 0.72 } },
      unit: 'MPa',
    },
    {
      baseValue: 0.58,
      key: 'tubePressure',
      label: '管程压力',
      max: 0.68,
      min: 0.5,
      precision: 2,
      speed: 0.018,
      thresholds: { high: { alarm: 0.78, warning: 0.66 } },
      unit: 'MPa',
    },
    {
      baseValue: 82,
      key: 'efficiency',
      label: '换热效率',
      max: 88,
      min: 76,
      precision: 0,
      speed: 0.9,
      thresholds: { low: { alarm: 72, warning: 80 } },
      unit: '%',
    },
  ],
  'V-101': [
    {
      baseValue: 0.86,
      key: 'workingPressure',
      label: '工作压力',
      max: 1,
      min: 0.72,
      precision: 2,
      speed: 0.026,
      thresholds: { high: { alarm: 1.26, warning: 0.98 }, low: { warning: 0.7 } },
      unit: 'MPa',
    },
    {
      baseValue: 46.3,
      key: 'workingTemperature',
      label: '工作温度',
      max: 51.5,
      min: 41.2,
      precision: 1,
      speed: 0.58,
      thresholds: { high: { alarm: 60, warning: 51 } },
      unit: '℃',
    },
  ],
  'V-102': [
    {
      baseValue: 0.82,
      key: 'workingPressure',
      label: '工作压力',
      max: 0.97,
      min: 0.7,
      precision: 2,
      speed: 0.024,
      thresholds: { high: { alarm: 1.22, warning: 0.95 }, low: { warning: 0.68 } },
      unit: 'MPa',
    },
    {
      baseValue: 44.9,
      key: 'workingTemperature',
      label: '工作温度',
      max: 50.5,
      min: 40.5,
      precision: 1,
      speed: 0.54,
      thresholds: { high: { alarm: 58, warning: 50 } },
      unit: '℃',
    },
  ],
  'CC-101': [
    {
      baseValue: 31.5,
      key: 'cabinetTemperature',
      label: '柜内温度',
      max: 38,
      min: 27,
      precision: 1,
      speed: 0.52,
      thresholds: { high: { alarm: 45, warning: 38 } },
      unit: '℃',
    },
    {
      baseValue: 36,
      key: 'plcLoad',
      label: 'PLC 负载',
      max: 58,
      min: 24,
      precision: 0,
      speed: 2.8,
      thresholds: { high: { alarm: 86, warning: 70 } },
      unit: '%',
    },
    {
      baseValue: 18,
      key: 'networkLatency',
      label: '网络延迟',
      max: 36,
      min: 10,
      precision: 0,
      speed: 3.4,
      thresholds: { high: { alarm: 120, warning: 60 } },
      unit: 'ms',
    },
  ],
}

export function createInitialTelemetryRuntime(): DeviceTelemetryRuntime {
  return Object.fromEntries(
    Object.entries(telemetryMetricConfigs).map(([deviceCode, configs], deviceIndex) => [
      deviceCode,
      Object.fromEntries(
        configs.map((config, metricIndex) => [
          config.key,
          {
            direction: metricIndex % 2 === 0 ? 1 : -1,
            phase: (deviceIndex + 1) * 0.9 + metricIndex * 0.65,
            value: config.baseValue,
          },
        ]),
      ),
    ]),
  ) as DeviceTelemetryRuntime
}

export function createTelemetrySnapshot(runtime: DeviceTelemetryRuntime, updatedAt = Date.now()): DeviceTelemetrySnapshot {
  return Object.fromEntries(
    Object.entries(telemetryMetricConfigs).map(([deviceCode, configs]) => {
      const deviceParameters = configs.map((config) => {
        const metric = runtime[deviceCode as DeviceCode][config.key]
        const value = metric?.value ?? config.baseValue

        return {
          key: config.key,
          label: config.label,
          max: formatMetricValue(config.max, config.precision),
          min: formatMetricValue(config.min, config.precision),
          normalizedRatio: getNormalizedRatio(value, config.min, config.max),
          rawValue: value,
          status: getMetricStatus(value, config),
          unit: config.unit,
          updatedAt,
          value: formatMetricValue(value, config.precision),
        }
      })
      const status = deviceParameters.reduce<DeviceStatus>(
        (currentStatus, parameter) =>
          statusPriority[parameter.status] > statusPriority[currentStatus] ? parameter.status : currentStatus,
        'normal',
      )

      return [
        deviceCode,
        {
          parameters: deviceParameters,
          status,
          updatedAt,
        },
      ]
    }),
  ) as DeviceTelemetrySnapshot
}

export function advanceTelemetryRuntime(runtime: DeviceTelemetryRuntime): DeviceTelemetryRuntime {
  return Object.fromEntries(
    Object.entries(telemetryMetricConfigs).map(([deviceCode, configs]) => [
      deviceCode,
      Object.fromEntries(
        configs.map((config) => {
          const currentMetric = runtime[deviceCode as DeviceCode][config.key]
          const nextPhase = currentMetric.phase + 0.5
          const wave = Math.sin(nextPhase) * config.speed * 0.48
          const drift = currentMetric.direction * config.speed * 0.52
          let nextDirection = currentMetric.direction
          let nextValue = currentMetric.value + wave + drift

          if (nextValue >= config.max) {
            nextValue = config.max
            nextDirection = -1
          }

          if (nextValue <= config.min) {
            nextValue = config.min
            nextDirection = 1
          }

          return [
            config.key,
            {
              direction: nextDirection,
              phase: nextPhase,
              value: nextValue,
            },
          ]
        }),
      ),
    ]),
  ) as DeviceTelemetryRuntime
}

function getMetricStatus(value: number, config: TelemetryMetricConfig): DeviceStatus {
  const high = config.thresholds?.high
  const low = config.thresholds?.low

  if ((high?.alarm !== undefined && value >= high.alarm) || (low?.alarm !== undefined && value <= low.alarm)) {
    return 'alarm'
  }

  if ((high?.warning !== undefined && value >= high.warning) || (low?.warning !== undefined && value <= low.warning)) {
    return 'warning'
  }

  return 'normal'
}

function formatMetricValue(value: number, precision: number) {
  return value.toFixed(precision)
}

function getNormalizedRatio(value: number, min: number, max: number) {
  if (max <= min) {
    return 0
  }

  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}
