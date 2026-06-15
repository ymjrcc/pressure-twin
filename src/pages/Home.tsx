import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { Button } from 'antd'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { ClipboardCheck, SlidersHorizontal, Workflow, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import CameraFocusController from '@/components/CameraFocusController'
import DeviceDetailCard from '@/components/DeviceDetailCard'
import DeviceInspectionPanel from '@/components/DeviceInspectionPanel'
import GeneratingInspectionReportOverlay from '@/components/GeneratingInspectionReportOverlay'
import InspectionReportDialog from '@/components/InspectionReportDialog'
import TelemetryControlPanel from '@/components/TelemetryControlPanel'
import WorkshopLegend from '@/components/WorkshopLegend'
import WorkshopProcessFlow from '@/components/WorkshopProcessFlow'
import WorkshopScene, { type AbnormalDeviceStatuses } from '@/components/WorkshopScene'
import type { DeviceTelemetrySnapshot } from '@/data/deviceTelemetry'
import type { DeviceCode, InspectionSession } from '@/data/workshopDevices'
import { submitInspectionReport } from '@/api/inspections'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { useDevices } from '@/hooks/useDevices'
import { useInspectionChecklists } from '@/hooks/useInspectionChecklists'
import { useInstruments } from '@/hooks/useInstruments'
import { useInspectionSession } from '@/hooks/useInspectionSession'
import { useProcessFlowSteps } from '@/hooks/useProcessFlowSteps'
import { useTelemetryConfigs } from '@/hooks/useTelemetryConfigs'
import type { CreateInspectionReportPayload } from '@/types/inspection'

function getAbnormalDeviceStatuses(telemetryByDevice: DeviceTelemetrySnapshot): AbnormalDeviceStatuses {
  return Object.fromEntries(
    Object.entries(telemetryByDevice)
      .filter(([, telemetry]) => telemetry.status !== 'normal')
      .map(([deviceCode, telemetry]) => [deviceCode, telemetry.status]),
  ) as AbnormalDeviceStatuses
}

function buildInspectionReportPayload(session: InspectionSession): CreateInspectionReportPayload {
  return {
    completedAt: session.completedAt ?? session.startedAt,
    records: Object.values(session.records).map((record) => ({
      checkedAt: record.checkedAt,
      deviceCode: record.deviceCode,
      itemResults: Object.entries(record.itemResults).flatMap(([itemId, result]) => (
        result
          ? [{
              itemId,
              result,
            }]
          : []
      )),
      note: record.note,
    })),
    startedAt: session.startedAt,
  }
}

export default function Home() {
  const { devices, error, loading } = useDevices()
  const { inspectionChecklists, error: inspectionChecklistsError, loading: inspectionChecklistsLoading } = useInspectionChecklists()
  const { instruments, error: instrumentsError, loading: instrumentsLoading } = useInstruments()
  const { processFlowSteps, error: processFlowStepsError, loading: processFlowStepsLoading } = useProcessFlowSteps()
  const { telemetryConfigs, error: telemetryConfigsError, loading: telemetryConfigsLoading } = useTelemetryConfigs()
  const [isProcessFlowOpen, setIsProcessFlowOpen] = useState(false)
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<DeviceCode | null>(null)
  const [controlInteractionVersion, setControlInteractionVersion] = useState(0)
  const [isSubmittingInspectionReport, setIsSubmittingInspectionReport] = useState(false)
  const [inspectionSubmitError, setInspectionSubmitError] = useState<string | null>(null)
  const [submittedInspectionReportId, setSubmittedInspectionReportId] = useState<number | null>(null)
  const {
    clearAllOverrides,
    clearOverride,
    overrides,
    setDeviceOverride,
    setParameterOverride,
    telemetryByDevice,
  } = useDeviceTelemetry(telemetryConfigs, 2000)
  const {
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
  } = useInspectionSession({
    devices,
    inspectionChecklists,
    onClearSelectedDevice: () => setSelectedDeviceCode(null),
  })
  const isMetaLoading = loading || inspectionChecklistsLoading || instrumentsLoading || processFlowStepsLoading || telemetryConfigsLoading
  const metaError = error ?? inspectionChecklistsError ?? instrumentsError ?? processFlowStepsError ?? telemetryConfigsError
  const abnormalDeviceStatuses = useMemo(() => getAbnormalDeviceStatuses(telemetryByDevice), [telemetryByDevice])
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const activeSelectedDeviceCode = currentInspectionDevice?.code ?? selectedDeviceCode

  useEffect(() => {
    if (inspectionSession?.status === 'completed') {
      return
    }

    setIsSubmittingInspectionReport(false)
    setInspectionSubmitError(null)
    setSubmittedInspectionReportId(null)
  }, [inspectionSession])

  const handleSubmitInspectionReport = async () => {
    if (!inspectionSession || inspectionSession.status !== 'completed' || isSubmittingInspectionReport || submittedInspectionReportId !== null) {
      return
    }

    try {
      setIsSubmittingInspectionReport(true)
      setInspectionSubmitError(null)

      const result = await submitInspectionReport(buildInspectionReportPayload(inspectionSession))
      setSubmittedInspectionReportId(result.reportId)
    } catch (error) {
      setInspectionSubmitError(error instanceof Error ? error.message : '提交巡检报告失败')
    } finally {
      setIsSubmittingInspectionReport(false)
    }
  }

  const toggleSelectedDevice = (code: DeviceCode) => {
    if (isInspectionRunning) {
      return
    }

    setSelectedDeviceCode((currentCode) => (currentCode === code ? null : code))
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden bg-[#eef2f5]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [9.5, 6.6, 10.5], fov: 48 }}
        onPointerMissed={() => {
          if (!isInspectionRunning) {
            setSelectedDeviceCode(null)
          }
        }}
      >
        <PerspectiveCamera makeDefault position={[-8, 6.6, 15]} fov={48} />
        <WorkshopScene
          abnormalDeviceStatuses={abnormalDeviceStatuses}
          devices={devices}
          inspectionPersonTarget={inspectionPersonTarget}
          onSelectDevice={toggleSelectedDevice}
          selectedDeviceCode={activeSelectedDeviceCode}
        />
        <CameraFocusController
          controlsRef={controlsRef}
          controlInteractionVersion={controlInteractionVersion}
          selectedDeviceCode={activeSelectedDeviceCode}
        />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0.5, 1, -0.2]}
          minDistance={2.4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
          onStart={() => setControlInteractionVersion((version) => version + 1)}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
      <div className="absolute bottom-5 left-5 z-10 flex max-h-[calc(100%-2.5rem)] max-w-[calc(100%-2.5rem)] flex-col gap-3 overflow-y-auto">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <Button
            className="h-9 rounded-[6px] border-cyan-300/32 bg-slate-900/84 px-3 text-sm font-bold text-cyan-100 shadow-lg shadow-slate-950/20 backdrop-blur hover:!border-cyan-200/70 hover:!bg-cyan-300/16 hover:!text-white"
            icon={<Workflow size={16} strokeWidth={2.3} />}
            onClick={() => setIsProcessFlowOpen(true)}
            type="default"
          >
            工艺流程
          </Button>
          <TelemetryControlPanel
            clearAllOverrides={clearAllOverrides}
            clearOverride={clearOverride}
            devices={devices}
            overrides={overrides}
            renderTrigger={({ openPanel }) => (
              <Button
                className="h-9 rounded-[6px] border-rose-300/38 bg-slate-900/84 px-3 text-sm font-bold text-rose-100 shadow-lg shadow-slate-950/20 backdrop-blur hover:!border-rose-200/70 hover:!bg-rose-400/18 hover:!text-white"
                icon={<SlidersHorizontal size={16} strokeWidth={2.3} />}
                onClick={openPanel}
                type="default"
              >
                异常模拟
              </Button>
            )}
            selectedDeviceCode={activeSelectedDeviceCode}
            setDeviceOverride={setDeviceOverride}
            setParameterOverride={setParameterOverride}
            telemetryConfigs={telemetryConfigs}
            telemetryByDevice={telemetryByDevice}
          />
          <Button
            className={`h-9 rounded-[6px] px-3 text-sm font-bold shadow-lg shadow-slate-950/20 backdrop-blur ${
              isInspectionRunning
                ? 'border-rose-300/38 bg-slate-900/84 text-rose-100 hover:!border-rose-200/70 hover:!bg-rose-400/18 hover:!text-white'
                : 'border-emerald-300/38 bg-slate-900/84 text-emerald-100 hover:!border-emerald-200/70 hover:!bg-emerald-300/16 hover:!text-white'
            }`}
            disabled={devices.length === 0 || isMetaLoading || Object.keys(inspectionChecklists).length === 0}
            icon={isInspectionRunning ? <X size={16} strokeWidth={2.3} /> : <ClipboardCheck size={16} strokeWidth={2.3} />}
            onClick={isInspectionRunning ? cancelInspection : startInspection}
            type="default"
          >
            {isInspectionRunning ? '取消巡检' : '开始巡检'}
          </Button>
        </div>
        <WorkshopLegend devices={devices} instruments={instruments} selectedDeviceCode={activeSelectedDeviceCode} />
      </div>
      {isProcessFlowOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/24 px-4 py-6 backdrop-blur-[1px]"
              onClick={() => setIsProcessFlowOpen(false)}
            >
              <div onClick={(event) => event.stopPropagation()}>
                <WorkshopProcessFlow onClose={() => setIsProcessFlowOpen(false)} processFlowSteps={processFlowSteps} />
              </div>
            </div>,
            document.body,
          )
        : null}
      {runningInspectionSession && currentInspectionDevice && currentInspectionRecord ? (
        <DeviceInspectionPanel
          currentDeviceCode={currentInspectionDevice.code}
          currentDeviceIndex={runningInspectionSession.currentDeviceIndex}
          devices={devices}
          inspectionChecklists={inspectionChecklists}
          onGoNext={goToNextInspectionDevice}
          onGoPrevious={goToPreviousInspectionDevice}
          onSetItemResult={updateInspectionItemResult}
          onSetNote={updateInspectionNote}
          record={currentInspectionRecord}
          totalDevices={devices.length}
        />
      ) : (
        <DeviceDetailCard
          devices={devices}
          selectedDeviceCode={activeSelectedDeviceCode}
          telemetryByDevice={telemetryByDevice}
          onClose={() => setSelectedDeviceCode(null)}
        />
      )}
      {isGeneratingInspectionReport ? <GeneratingInspectionReportOverlay /> : null}
      {inspectionSession?.status === 'completed' && !isGeneratingInspectionReport && typeof document !== 'undefined'
        ? createPortal(
            <InspectionReportDialog
              devices={devices}
              inspectionChecklists={inspectionChecklists}
              isSubmitting={isSubmittingInspectionReport}
              onSubmit={() => void handleSubmitInspectionReport()}
              session={inspectionSession}
              onClose={closeInspectionReport}
              onRestart={restartInspection}
              submitError={inspectionSubmitError}
              submittedReportId={submittedInspectionReportId}
            />,
            document.body,
          )
        : null}
      {isMetaLoading || metaError ? (
        <div className="pointer-events-none absolute inset-x-0 top-18 z-20 flex justify-center px-4">
          <div className="pointer-events-auto rounded-[8px] border border-white/20 bg-slate-950/82 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">
            {isMetaLoading ? '正在加载设备与页面配置数据...' : `页面配置加载失败：${metaError}`}
          </div>
        </div>
      ) : null}
    </div>
  )
}
