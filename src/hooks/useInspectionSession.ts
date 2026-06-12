import { useEffect, useRef, useState } from 'react'

import {
  inspectionChecklists,
  inspectionPersonTargets,
  type DeviceCode,
  type DeviceInfo,
  type DeviceInspectionRecord,
  type InspectionItemResult,
  type InspectionSession,
} from '@/data/workshopDevices'

type UseInspectionSessionOptions = {
  devices: DeviceInfo[]
  onClearSelectedDevice?: () => void
}

function createInspectionSession(devices: DeviceInfo[]): InspectionSession {
  return {
    currentDeviceIndex: 0,
    records: Object.fromEntries(
      devices.map((device) => [
        device.code,
        {
          deviceCode: device.code,
          itemResults: {},
          note: '',
        } satisfies DeviceInspectionRecord,
      ]),
    ) as Record<DeviceCode, DeviceInspectionRecord>,
    startedAt: Date.now(),
    status: 'running',
  }
}

function isDeviceInspectionComplete(record: DeviceInspectionRecord, deviceCode: DeviceCode) {
  return inspectionChecklists[deviceCode].every((item) => record.itemResults[item.id])
}

export function useInspectionSession({ devices, onClearSelectedDevice }: UseInspectionSessionOptions) {
  const [inspectionSession, setInspectionSession] = useState<InspectionSession | null>(null)
  const [isGeneratingInspectionReport, setIsGeneratingInspectionReport] = useState(false)
  const inspectionReportTimerRef = useRef<number | null>(null)
  const runningInspectionSession = inspectionSession?.status === 'running' ? inspectionSession : null
  const isInspectionRunning = Boolean(runningInspectionSession)
  const currentInspectionDevice = runningInspectionSession ? devices[runningInspectionSession.currentDeviceIndex] : null
  const currentInspectionRecord = currentInspectionDevice && runningInspectionSession ? runningInspectionSession.records[currentInspectionDevice.code] : null
  const inspectionPersonTarget = currentInspectionDevice ? inspectionPersonTargets[currentInspectionDevice.code] : null

  const clearInspectionReportTimer = () => {
    if (inspectionReportTimerRef.current !== null) {
      window.clearTimeout(inspectionReportTimerRef.current)
      inspectionReportTimerRef.current = null
    }
  }

  useEffect(() => clearInspectionReportTimer, [])

  const startInspection = () => {
    if (devices.length === 0) {
      return
    }

    clearInspectionReportTimer()
    setIsGeneratingInspectionReport(false)
    setInspectionSession(createInspectionSession(devices))
  }

  const cancelInspection = () => {
    clearInspectionReportTimer()
    setIsGeneratingInspectionReport(false)
    setInspectionSession(null)
    onClearSelectedDevice?.()
  }

  const updateInspectionItemResult = (deviceCode: DeviceCode, itemId: string, result: InspectionItemResult) => {
    setInspectionSession((session) => {
      if (!session || session.status !== 'running') {
        return session
      }

      const record = session.records[deviceCode]

      return {
        ...session,
        records: {
          ...session.records,
          [deviceCode]: {
            ...record,
            checkedAt: Date.now(),
            itemResults: {
              ...record.itemResults,
              [itemId]: result,
            },
          },
        },
      }
    })
  }

  const updateInspectionNote = (deviceCode: DeviceCode, note: string) => {
    setInspectionSession((session) => {
      if (!session || session.status !== 'running') {
        return session
      }

      const record = session.records[deviceCode]

      return {
        ...session,
        records: {
          ...session.records,
          [deviceCode]: {
            ...record,
            checkedAt: Date.now(),
            note,
          },
        },
      }
    })
  }

  const goToPreviousInspectionDevice = () => {
    setInspectionSession((session) => {
      if (!session || session.status !== 'running') {
        return session
      }

      return {
        ...session,
        currentDeviceIndex: Math.max(0, session.currentDeviceIndex - 1),
      }
    })
  }

  const goToNextInspectionDevice = () => {
    setInspectionSession((session) => {
      if (!session || session.status !== 'running') {
        return session
      }

      const device = devices[session.currentDeviceIndex]
      const record = session.records[device.code]

      if (!isDeviceInspectionComplete(record, device.code)) {
        return session
      }

      if (session.currentDeviceIndex === devices.length - 1) {
        setIsGeneratingInspectionReport(true)
        clearInspectionReportTimer()

        inspectionReportTimerRef.current = window.setTimeout(() => {
          setIsGeneratingInspectionReport(false)
          inspectionReportTimerRef.current = null
        }, 2000)

        return {
          ...session,
          completedAt: Date.now(),
          status: 'completed',
        }
      }

      return {
        ...session,
        currentDeviceIndex: session.currentDeviceIndex + 1,
      }
    })
  }

  const closeInspectionReport = () => {
    clearInspectionReportTimer()
    setIsGeneratingInspectionReport(false)
    setInspectionSession(null)
    onClearSelectedDevice?.()
  }

  const restartInspection = () => {
    startInspection()
  }

  return {
    cancelInspection,
    closeInspectionReport,
    currentInspectionDevice,
    currentInspectionRecord,
    goToNextInspectionDevice,
    goToPreviousInspectionDevice,
    inspectionPersonTarget,
    inspectionSession,
    isGeneratingInspectionReport,
    isInspectionRunning,
    restartInspection,
    runningInspectionSession,
    startInspection,
    updateInspectionItemResult,
    updateInspectionNote,
  }
}
