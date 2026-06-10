import { useEffect, useMemo, useRef, useState } from 'react'
import {
  advanceTelemetryRuntime,
  createInitialTelemetryRuntime,
  createTelemetrySnapshot,
  type DeviceTelemetryRuntime,
  type DeviceTelemetrySnapshot,
} from '@/data/deviceTelemetry'

export function useDeviceTelemetry(refreshMs = 2000): DeviceTelemetrySnapshot {
  const initialRuntime = useMemo(() => createInitialTelemetryRuntime(), [])
  const runtimeRef = useRef<DeviceTelemetryRuntime>(initialRuntime)
  const [telemetryByDevice, setTelemetryByDevice] = useState<DeviceTelemetrySnapshot>(() =>
    createTelemetrySnapshot(initialRuntime),
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      runtimeRef.current = advanceTelemetryRuntime(runtimeRef.current)
      setTelemetryByDevice(createTelemetrySnapshot(runtimeRef.current))
    }, refreshMs)

    return () => window.clearInterval(intervalId)
  }, [refreshMs])

  return telemetryByDevice
}
