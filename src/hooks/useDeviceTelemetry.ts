import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  advanceTelemetryRuntime,
  createInitialTelemetryRuntime,
  createTelemetrySnapshot,
  type DeviceTelemetryOverrides,
  type DeviceTelemetryRuntime,
  type DeviceTelemetrySnapshot,
  type TelemetryOverrideStatus,
} from '@/data/deviceTelemetry'
import type { DeviceCode } from '@/data/workshopDevices'

export type UseDeviceTelemetryResult = {
  clearAllOverrides: () => void
  clearOverride: (deviceCode: DeviceCode, parameterKey?: string) => void
  overrides: DeviceTelemetryOverrides
  setDeviceOverride: (deviceCode: DeviceCode, status: TelemetryOverrideStatus) => void
  setParameterOverride: (deviceCode: DeviceCode, parameterKey: string, status: TelemetryOverrideStatus) => void
  telemetryByDevice: DeviceTelemetrySnapshot
}

export function useDeviceTelemetry(refreshMs = 2000): UseDeviceTelemetryResult {
  const initialRuntime = useMemo(() => createInitialTelemetryRuntime(), [])
  const runtimeRef = useRef<DeviceTelemetryRuntime>(initialRuntime)
  const [overrides, setOverrides] = useState<DeviceTelemetryOverrides>({})
  const [telemetryByDevice, setTelemetryByDevice] = useState<DeviceTelemetrySnapshot>(() =>
    createTelemetrySnapshot(initialRuntime),
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      runtimeRef.current = advanceTelemetryRuntime(runtimeRef.current)
      setTelemetryByDevice(createTelemetrySnapshot(runtimeRef.current, overrides))
    }, refreshMs)

    return () => window.clearInterval(intervalId)
  }, [overrides, refreshMs])

  useEffect(() => {
    setTelemetryByDevice(createTelemetrySnapshot(runtimeRef.current, overrides))
  }, [overrides])

  const setDeviceOverride = useCallback((deviceCode: DeviceCode, status: TelemetryOverrideStatus) => {
    setOverrides((currentOverrides) => ({
      ...currentOverrides,
      [deviceCode]: {
        ...currentOverrides[deviceCode],
        device: status,
      },
    }))
  }, [])

  const setParameterOverride = useCallback(
    (deviceCode: DeviceCode, parameterKey: string, status: TelemetryOverrideStatus) => {
      setOverrides((currentOverrides) => ({
        ...currentOverrides,
        [deviceCode]: {
          ...currentOverrides[deviceCode],
          parameters: {
            ...currentOverrides[deviceCode]?.parameters,
            [parameterKey]: status,
          },
        },
      }))
    },
    [],
  )

  const clearOverride = useCallback((deviceCode: DeviceCode, parameterKey?: string) => {
    setOverrides((currentOverrides) => {
      const currentOverride = currentOverrides[deviceCode]

      if (!currentOverride) {
        return currentOverrides
      }

      if (!parameterKey) {
        if (currentOverride.parameters && Object.keys(currentOverride.parameters).length > 0) {
          return {
            ...currentOverrides,
            [deviceCode]: {
              parameters: currentOverride.parameters,
            },
          }
        }

        const nextOverrides = { ...currentOverrides }
        delete nextOverrides[deviceCode]
        return nextOverrides
      }

      const nextParameters = { ...(currentOverride.parameters ?? {}) }
      delete nextParameters[parameterKey]

      if (currentOverride.device || Object.keys(nextParameters).length > 0) {
        return {
          ...currentOverrides,
          [deviceCode]: {
            ...currentOverride,
            parameters: Object.keys(nextParameters).length > 0 ? nextParameters : undefined,
          },
        }
      }

      const nextOverrides = { ...currentOverrides }
      delete nextOverrides[deviceCode]
      return nextOverrides
    })
  }, [])

  const clearAllOverrides = useCallback(() => {
    setOverrides({})
  }, [])

  return {
    clearAllOverrides,
    clearOverride,
    overrides,
    setDeviceOverride,
    setParameterOverride,
    telemetryByDevice,
  }
}
