import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react'
import { Button } from 'antd'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { ClipboardCheck, LoaderCircle, SlidersHorizontal, Workflow, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Group, Material, Mesh, Vector3 } from 'three'
import DeviceDetailCard from '@/components/DeviceDetailCard'
import DeviceInspectionPanel from '@/components/DeviceInspectionPanel'
import InspectionReportDialog from '@/components/InspectionReportDialog'
import TelemetryControlPanel from '@/components/TelemetryControlPanel'
import WorkshopProcessFlow from '@/components/WorkshopProcessFlow'
import WorkshopLegend from '@/components/WorkshopLegend'
import CirculationPump from '@/components/models/CirculationPump'
import ControlCabinet from '@/components/models/ControlCabinet'
import DeviceLabel from '@/components/models/DeviceLabel'
import DeviceSelectionHalo from '@/components/models/DeviceSelectionHalo'
import Factory from '@/components/models/Factory'
import HeatExchanger from '@/components/models/HeatExchanger'
import HorizontalPressureVessel from '@/components/models/HorizontalPressureVessel'
import IndustrialYard from '@/components/models/IndustrialYard'
import ProcessPipeline from '@/components/models/ProcessPipeline'
import ScalePerson from '@/components/models/ScalePerson'
import SignalLines from '@/components/models/SignalLines'
import VerticalStorageTank from '@/components/models/VerticalStorageTank'
import type { DeviceTelemetrySnapshot } from '@/data/deviceTelemetry'
import {
  devices,
  inspectionChecklists,
  inspectionPersonTargets,
  type DeviceCode,
  type DeviceInspectionRecord,
  type DeviceStatus,
  type InspectionItemResult,
  type InspectionSession,
} from '@/data/workshopDevices'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'

type AbnormalDeviceStatuses = Partial<Record<DeviceCode, Exclude<DeviceStatus, 'normal'>>>

type SelectableDeviceProps = {
  children: ReactNode
  code: DeviceCode
  onSelect: (code: DeviceCode) => void
  selectedDeviceCode: DeviceCode | null
}

type WorkshopSceneProps = {
  abnormalDeviceStatuses: AbnormalDeviceStatuses
  inspectionPersonTarget: [number, number, number] | null
  onSelectDevice: (code: DeviceCode) => void
  selectedDeviceCode: DeviceCode | null
}

type DimmableGroupProps = {
  children: ReactNode
  dimmed: boolean
}

type SelectionMaterialState = {
  depthWrite: boolean
  opacity: number
  transparent: boolean
}

type SceneFocusTarget = {
  distance: number
  target: [number, number, number]
}

type CameraAnimation = {
  duration: number
  elapsed: number
  fromPosition: Vector3
  fromTarget: Vector3
  toPosition: Vector3
  toTarget: Vector3
}

type CameraFocusControllerProps = {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
  controlInteractionVersion: number
  selectedDeviceCode: DeviceCode | null
}

const defaultScalePersonPosition: [number, number, number] = [-7.2, 0, -5.4]
const defaultCameraPosition = new Vector3(-8, 6.6, 15)
const defaultControlsTarget = new Vector3(0.5, 1, -0.2)
const deviceFocusTargets: Record<DeviceCode, SceneFocusTarget> = {
  'CC-101': { distance: 10.5, target: [-0.9, 1.5, 5.55] },
  'E-101': { distance: 11.5, target: [-3.4, 1.25, 1.5] },
  'PU-101': { distance: 10.5, target: [1.6, 1, 1.8] },
  'T-201': { distance: 12, target: [5.2, 2.3, 2.3] },
  'V-101': { distance: 13, target: [-4.2, 1.85, -3.2] },
  'V-102': { distance: 13, target: [2.6, 1.85, -3.2] },
}

function createInspectionSession(): InspectionSession {
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

function cloneMaterialsForSelection(root: RefObject<Group | null>) {
  root.current?.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return
    }

    if (Array.isArray(object.material)) {
      object.material = object.material.map((material) => material.clone())
      return
    }

    object.material = object.material.clone()
  })
}

function updateMaterialOpacity(material: Material, dimmed: boolean) {
  const selectionState = (material.userData.selectionState ?? {
    depthWrite: material.depthWrite,
    opacity: material.opacity,
    transparent: material.transparent,
  }) as SelectionMaterialState

  material.userData.selectionState = selectionState
  material.transparent = dimmed || selectionState.transparent
  material.opacity = dimmed ? selectionState.opacity * 0.2 : selectionState.opacity
  material.depthWrite = dimmed ? false : selectionState.depthWrite
  material.needsUpdate = true
}

function DimmableGroup({ children, dimmed }: DimmableGroupProps) {
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    cloneMaterialsForSelection(groupRef)
  }, [])

  useEffect(() => {
    groupRef.current?.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return
      }

      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => updateMaterialOpacity(material, dimmed))
    })
  }, [dimmed])

  return (
    <group ref={groupRef}>
      {children}
    </group>
  )
}

function MovingScalePerson({ targetPosition }: { targetPosition: [number, number, number] }) {
  const groupRef = useRef<Group>(null)
  const targetVector = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!groupRef.current) {
      return
    }

    groupRef.current.position.fromArray(defaultScalePersonPosition)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    targetVector.fromArray(targetPosition)
    groupRef.current.position.lerp(targetVector, Math.min(1, delta * 2.8))
  })

  return (
    <group ref={groupRef}>
      <ScalePerson position={[0, 0, 0]} />
    </group>
  )
}

function SelectableDevice({ children, code, onSelect, selectedDeviceCode }: SelectableDeviceProps) {
  const dimmed = selectedDeviceCode !== null && selectedDeviceCode !== code

  return (
    <group
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(code)
      }}
    >
      <DimmableGroup dimmed={dimmed}>{children}</DimmableGroup>
    </group>
  )
}

function CameraFocusController({ controlsRef, controlInteractionVersion, selectedDeviceCode }: CameraFocusControllerProps) {
  const focusTarget = selectedDeviceCode ? deviceFocusTargets[selectedDeviceCode] : null
  const animationRef = useRef<CameraAnimation | null>(null)
  const previousSelectedDeviceRef = useRef<DeviceCode | null>(null)
  const cameraTarget = useMemo(() => new Vector3(), [])
  const controlsTarget = useMemo(() => new Vector3(), [])

  useEffect(() => {
    animationRef.current = null
  }, [controlInteractionVersion])

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current
    const selectedDeviceChanged = previousSelectedDeviceRef.current !== selectedDeviceCode

    if (selectedDeviceChanged) {
      previousSelectedDeviceRef.current = selectedDeviceCode

      if (focusTarget) {
        controlsTarget.fromArray(focusTarget.target)
        const direction = camera.position.clone().sub(controlsTarget).normalize()
        cameraTarget.copy(controlsTarget).addScaledVector(direction, focusTarget.distance)
      } else {
        controlsTarget.copy(defaultControlsTarget)
        cameraTarget.copy(defaultCameraPosition)
      }

      animationRef.current = {
        duration: 0.82,
        elapsed: 0,
        fromPosition: camera.position.clone(),
        fromTarget: controls?.target.clone() ?? defaultControlsTarget.clone(),
        toPosition: cameraTarget.clone(),
        toTarget: controlsTarget.clone(),
      }
    }

    const animation = animationRef.current

    if (!animation) {
      return
    }

    animation.elapsed = Math.min(animation.elapsed + delta, animation.duration)
    const progress = animation.elapsed / animation.duration
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    camera.position.lerpVectors(animation.fromPosition, animation.toPosition, easedProgress)

    if (controls) {
      controls.target.lerpVectors(animation.fromTarget, animation.toTarget, easedProgress)
      controls.update()
    }

    camera.updateProjectionMatrix()

    if (progress >= 1) {
      animationRef.current = null
    }
  })

  return null
}

function WorkshopScene({ abnormalDeviceStatuses, inspectionPersonTarget, onSelectDevice, selectedDeviceCode }: WorkshopSceneProps) {
  return (
    <>
      <color attach="background" args={['#dbe7ec']} />
      <fog attach="fog" args={['#dbe7ec', 18, 46]} />
      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#f8fbff', '#667178', 0.68]} />
      <directionalLight
        castShadow
        position={[5.5, 10.5, 4.8]}
        intensity={1.0}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-7, 5, -4]} intensity={0.18} color="#c8e8ff" />

      <IndustrialYard />
      <Factory />
      <DimmableGroup dimmed={selectedDeviceCode !== null && !inspectionPersonTarget}>
        <MovingScalePerson targetPosition={inspectionPersonTarget ?? defaultScalePersonPosition} />
      </DimmableGroup>
      <SelectableDevice code="T-201" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <VerticalStorageTank dimmed={selectedDeviceCode !== null && selectedDeviceCode !== 'T-201'} position={[5.2, 0, 2.3]} rotation={[0, 0, 0]} />
      </SelectableDevice>
      <SelectableDevice code="V-101" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <HorizontalPressureVessel
          dimmed={selectedDeviceCode !== null && selectedDeviceCode !== 'V-101'}
          position={[-4.2, 0, -3.2]}
          instrumentSuffix="101"
        />
      </SelectableDevice>
      <SelectableDevice code="V-102" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <HorizontalPressureVessel
          dimmed={selectedDeviceCode !== null && selectedDeviceCode !== 'V-102'}
          position={[2.6, 0, -3.2]}
          instrumentSuffix="102"
        />
      </SelectableDevice>
      <SelectableDevice code="E-101" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <HeatExchanger position={[-3.4, 0, 1.5]} />
      </SelectableDevice>
      <SelectableDevice code="PU-101" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <CirculationPump dimmed={selectedDeviceCode !== null && selectedDeviceCode !== 'PU-101'} position={[1.6, 0, 1.8]} />
      </SelectableDevice>
      <SelectableDevice code="CC-101" onSelect={onSelectDevice} selectedDeviceCode={selectedDeviceCode}>
        <ControlCabinet position={[-0.9, 0, 5.55]} rotation={[0, 0, 0]} />
      </SelectableDevice>
      <DimmableGroup dimmed={selectedDeviceCode !== null}>
        <ProcessPipeline dimmed={selectedDeviceCode !== null} />
      </DimmableGroup>
      <DimmableGroup dimmed={selectedDeviceCode !== null}>
        <SignalLines />
      </DimmableGroup>
      <DeviceSelectionHalo abnormalDeviceStatuses={abnormalDeviceStatuses} selectedDeviceCode={selectedDeviceCode} />
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.36}
        scale={18}
        blur={1.8}
        far={8}
        resolution={1024}
        color="#1f2933"
      />

      {devices.map((device) => (
        <DeviceLabel
          key={device.code}
          code={device.code}
          dimmed={selectedDeviceCode !== null && selectedDeviceCode !== device.code}
          position={device.position}
        />
      ))}
    </>
  )
}

function getAbnormalDeviceStatuses(telemetryByDevice: DeviceTelemetrySnapshot): AbnormalDeviceStatuses {
  return Object.fromEntries(
    Object.entries(telemetryByDevice)
      .filter(([, telemetry]) => telemetry.status !== 'normal')
      .map(([deviceCode, telemetry]) => [deviceCode, telemetry.status]),
  ) as AbnormalDeviceStatuses
}

export default function Home() {
  const [isProcessFlowOpen, setIsProcessFlowOpen] = useState(false)
  const [inspectionSession, setInspectionSession] = useState<InspectionSession | null>(null)
  const [isGeneratingInspectionReport, setIsGeneratingInspectionReport] = useState(false)
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<DeviceCode | null>(null)
  const [controlInteractionVersion, setControlInteractionVersion] = useState(0)
  const {
    clearAllOverrides,
    clearOverride,
    overrides,
    setDeviceOverride,
    setParameterOverride,
    telemetryByDevice,
  } = useDeviceTelemetry(2000)
  const abnormalDeviceStatuses = useMemo(() => getAbnormalDeviceStatuses(telemetryByDevice), [telemetryByDevice])
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const inspectionReportTimerRef = useRef<number | null>(null)
  const runningInspectionSession = inspectionSession?.status === 'running' ? inspectionSession : null
  const isInspectionRunning = Boolean(runningInspectionSession)
  const currentInspectionDevice = runningInspectionSession ? devices[runningInspectionSession.currentDeviceIndex] : null
  const currentInspectionRecord = currentInspectionDevice && runningInspectionSession ? runningInspectionSession.records[currentInspectionDevice.code] : null
  const inspectionPersonTarget = currentInspectionDevice ? inspectionPersonTargets[currentInspectionDevice.code] : null
  const activeSelectedDeviceCode = currentInspectionDevice?.code ?? selectedDeviceCode

  useEffect(() => {
    return () => {
      if (inspectionReportTimerRef.current !== null) {
        window.clearTimeout(inspectionReportTimerRef.current)
      }
    }
  }, [])

  const toggleSelectedDevice = (code: DeviceCode) => {
    if (isInspectionRunning) {
      return
    }

    setSelectedDeviceCode((currentCode) => (currentCode === code ? null : code))
  }
  const startInspection = () => {
    if (inspectionReportTimerRef.current !== null) {
      window.clearTimeout(inspectionReportTimerRef.current)
      inspectionReportTimerRef.current = null
    }

    setIsGeneratingInspectionReport(false)
    setInspectionSession(createInspectionSession())
  }
  const cancelInspection = () => {
    if (inspectionReportTimerRef.current !== null) {
      window.clearTimeout(inspectionReportTimerRef.current)
      inspectionReportTimerRef.current = null
    }

    setIsGeneratingInspectionReport(false)
    setInspectionSession(null)
    setSelectedDeviceCode(null)
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
        if (inspectionReportTimerRef.current !== null) {
          window.clearTimeout(inspectionReportTimerRef.current)
        }

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
    if (inspectionReportTimerRef.current !== null) {
      window.clearTimeout(inspectionReportTimerRef.current)
      inspectionReportTimerRef.current = null
    }

    setIsGeneratingInspectionReport(false)
    setInspectionSession(null)
    setSelectedDeviceCode(null)
  }
  const restartInspection = () => {
    startInspection()
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
            overrides={overrides}
            renderTrigger={({ openPanel }) => (
              <Button
                className="h-9 rounded-[6px] border-rose-300/38 bg-slate-900/84 px-3 text-sm font-bold text-rose-100 shadow-lg shadow-slate-950/20 backdrop-blur hover:!border-rose-200/70 hover:!bg-rose-400/18 hover:!text-white"
                icon={<SlidersHorizontal size={16} strokeWidth={2.3} />}
                onClick={openPanel}
                type="default"
              >
                模拟预警
              </Button>
            )}
            selectedDeviceCode={activeSelectedDeviceCode}
            setDeviceOverride={setDeviceOverride}
            setParameterOverride={setParameterOverride}
            telemetryByDevice={telemetryByDevice}
          />
          <Button
            className={`h-9 rounded-[6px] px-3 text-sm font-bold shadow-lg shadow-slate-950/20 backdrop-blur ${
              isInspectionRunning
                ? 'border-rose-300/38 bg-slate-900/84 text-rose-100 hover:!border-rose-200/70 hover:!bg-rose-400/18 hover:!text-white'
                : 'border-emerald-300/38 bg-slate-900/84 text-emerald-100 hover:!border-emerald-200/70 hover:!bg-emerald-300/16 hover:!text-white'
            }`}
            icon={isInspectionRunning ? <X size={16} strokeWidth={2.3} /> : <ClipboardCheck size={16} strokeWidth={2.3} />}
            onClick={isInspectionRunning ? cancelInspection : startInspection}
            type="default"
          >
            {isInspectionRunning ? '取消巡检' : '开始巡检'}
          </Button>
        </div>
        <WorkshopLegend selectedDeviceCode={activeSelectedDeviceCode} />
      </div>
      {isProcessFlowOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/24 px-4 py-6 backdrop-blur-[1px]"
              onClick={() => setIsProcessFlowOpen(false)}
            >
              <div onClick={(event) => event.stopPropagation()}>
                <WorkshopProcessFlow onClose={() => setIsProcessFlowOpen(false)} />
              </div>
            </div>,
            document.body,
          )
        : null}
      {runningInspectionSession && currentInspectionDevice && currentInspectionRecord ? (
        <DeviceInspectionPanel
          currentDeviceCode={currentInspectionDevice.code}
          currentDeviceIndex={runningInspectionSession.currentDeviceIndex}
          onGoNext={goToNextInspectionDevice}
          onGoPrevious={goToPreviousInspectionDevice}
          onSetItemResult={updateInspectionItemResult}
          onSetNote={updateInspectionNote}
          record={currentInspectionRecord}
          totalDevices={devices.length}
        />
      ) : (
        <DeviceDetailCard
          selectedDeviceCode={activeSelectedDeviceCode}
          telemetryByDevice={telemetryByDevice}
          onClose={() => setSelectedDeviceCode(null)}
        />
      )}
      {isGeneratingInspectionReport && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/42 px-4 py-6 backdrop-blur-[2px]">
              <div className="grid w-[360px] max-w-[calc(100vw-2rem)] justify-items-center gap-4 rounded-[8px] border border-cyan-200/18 bg-slate-950/92 px-6 py-7 text-center text-slate-100 shadow-2xl shadow-slate-950/40">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
                  <LoaderCircle aria-hidden="true" className="animate-spin text-cyan-100" size={28} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white">正在生成巡检报告</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-slate-300">请稍候</div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {inspectionSession?.status === 'completed' && !isGeneratingInspectionReport && typeof document !== 'undefined'
        ? createPortal(
            <InspectionReportDialog
              session={inspectionSession}
              onClose={closeInspectionReport}
              onRestart={restartInspection}
            />,
            document.body,
          )
        : null}
    </div>
  )
}
