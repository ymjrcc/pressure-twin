import type { DeviceCode, DeviceStatus } from './workshopDevices'

export type TelemetryParameter = {
  alarmDurationMs?: number
  alarmStartedAt?: number
  alarmSuggestion?: string
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

export type TelemetryOverrideStatus = Exclude<DeviceStatus, 'normal'>

export type DeviceTelemetryOverride = {
  device?: TelemetryOverrideStatus
  parameters?: Record<string, TelemetryOverrideStatus>
}

export type DeviceTelemetryOverrides = Partial<Record<DeviceCode, DeviceTelemetryOverride>>

export type TelemetryAlarmStartedAtByParameter = Record<string, number>

export type TelemetryThreshold = {
  alarm?: number
  warning?: number
}

export type TelemetryMetricConfig = {
  alarmSuggestion?: string
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

const fallbackAlarmSuggestion = '请立即核对现场仪表状态，必要时降低负荷并通知值班人员处置。'

export function getTelemetryAlarmKey(deviceCode: DeviceCode, parameterKey: string) {
  return `${deviceCode}:${parameterKey}`
}

export function createInitialTelemetryRuntime(telemetryMetricConfigs: Record<DeviceCode, TelemetryMetricConfig[]>): DeviceTelemetryRuntime {
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

export function createTelemetrySnapshot(
  telemetryMetricConfigs: Record<DeviceCode, TelemetryMetricConfig[]>,
  runtime: DeviceTelemetryRuntime,
  overrides: DeviceTelemetryOverrides = {},
  updatedAt = Date.now(),
  alarmStartedAtByParameter: TelemetryAlarmStartedAtByParameter = {},
): DeviceTelemetrySnapshot {
  return Object.fromEntries(
    Object.entries(telemetryMetricConfigs).map(([deviceCode, configs]) => {
      const override = overrides[deviceCode as DeviceCode]
      const deviceParameters = configs.map((config) => {
        const metric = runtime[deviceCode as DeviceCode][config.key]
        const value = metric?.value ?? config.baseValue
        const overrideStatus = override?.parameters?.[config.key] ?? override?.device
        const displayValue = overrideStatus ? getOverrideMetricValue(config, overrideStatus) : value
        const status = overrideStatus ?? getMetricStatus(value, config)
        const alarmStartedAt = alarmStartedAtByParameter[getTelemetryAlarmKey(deviceCode as DeviceCode, config.key)]

        return {
          ...(status === 'alarm' && alarmStartedAt !== undefined
            ? {
                alarmDurationMs: Math.max(0, updatedAt - alarmStartedAt),
                alarmStartedAt,
                alarmSuggestion: config.alarmSuggestion ?? fallbackAlarmSuggestion,
              }
            : {}),
          key: config.key,
          label: config.label,
          max: formatMetricValue(config.max, config.precision),
          min: formatMetricValue(config.min, config.precision),
          normalizedRatio: getNormalizedRatio(displayValue, config.min, config.max),
          rawValue: displayValue,
          status,
          unit: config.unit,
          updatedAt,
          value: overrideStatus === 'offline' ? '离线' : formatMetricValue(displayValue, config.precision),
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

export function advanceTelemetryRuntime(
  telemetryMetricConfigs: Record<DeviceCode, TelemetryMetricConfig[]>,
  runtime: DeviceTelemetryRuntime,
): DeviceTelemetryRuntime {
  return Object.fromEntries(
    Object.entries(telemetryMetricConfigs).map(([deviceCode, configs]) => [
      deviceCode,
      Object.fromEntries(
        configs.map((config) => {
          const currentMetric = runtime[deviceCode as DeviceCode][config.key] ?? {
            direction: 1,
            phase: 0,
            value: config.baseValue,
          }
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

function getOverrideMetricValue(config: TelemetryMetricConfig, status: TelemetryOverrideStatus) {
  if (status === 'offline') {
    return config.baseValue
  }

  const range = config.max - config.min
  const fallbackOffset = range > 0 ? range * 0.12 : Math.max(Math.abs(config.baseValue) * 0.12, 1)
  const threshold = getPreferredOverrideThreshold(config, status)

  if (!threshold) {
    return config.max + fallbackOffset
  }

  if (threshold.direction === 'high') {
    const nextThreshold =
      status === 'warning' && config.thresholds?.high?.alarm !== undefined ? config.thresholds.high.alarm : undefined

    return nextThreshold !== undefined
      ? threshold.value + (nextThreshold - threshold.value) * 0.45
      : threshold.value + fallbackOffset
  }

  const nextThreshold =
    status === 'warning' && config.thresholds?.low?.alarm !== undefined ? config.thresholds.low.alarm : undefined

  return nextThreshold !== undefined
    ? threshold.value - (threshold.value - nextThreshold) * 0.45
    : threshold.value - fallbackOffset
}

function getPreferredOverrideThreshold(config: TelemetryMetricConfig, status: 'warning' | 'alarm') {
  const highValue = config.thresholds?.high?.[status]
  const lowValue = config.thresholds?.low?.[status]

  if (highValue !== undefined) {
    return { direction: 'high' as const, value: highValue }
  }

  if (lowValue !== undefined) {
    return { direction: 'low' as const, value: lowValue }
  }

  const highFallback = config.thresholds?.high?.warning ?? config.thresholds?.high?.alarm
  const lowFallback = config.thresholds?.low?.warning ?? config.thresholds?.low?.alarm

  if (highFallback !== undefined) {
    return { direction: 'high' as const, value: highFallback }
  }

  if (lowFallback !== undefined) {
    return { direction: 'low' as const, value: lowFallback }
  }

  return null
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
