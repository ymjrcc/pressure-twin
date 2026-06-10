import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Group, Material, Mesh, Vector3 } from 'three'
import DeviceDetailCard from '@/components/DeviceDetailCard'
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
import { devices, type DeviceCode } from '@/data/workshopDevices'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'

type SelectableDeviceProps = {
  children: ReactNode
  code: DeviceCode
  selectedDeviceCode: DeviceCode | null
  onSelect: (code: DeviceCode) => void
}

type WorkshopSceneProps = {
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

function WorkshopScene({ onSelectDevice, selectedDeviceCode }: WorkshopSceneProps) {
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
      <DimmableGroup dimmed={selectedDeviceCode !== null}>
        <ScalePerson position={[-7.2, 0, -5.4]} />
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
      <DeviceSelectionHalo selectedDeviceCode={selectedDeviceCode} />
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

export default function Home() {
  const [isProcessFlowOpen, setIsProcessFlowOpen] = useState(false)
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<DeviceCode | null>(null)
  const [controlInteractionVersion, setControlInteractionVersion] = useState(0)
  const telemetryByDevice = useDeviceTelemetry(2000)
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const toggleSelectedDevice = (code: DeviceCode) => {
    setSelectedDeviceCode((currentCode) => (currentCode === code ? null : code))
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden bg-[#eef2f5]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [9.5, 6.6, 10.5], fov: 48 }}
        onPointerMissed={() => setSelectedDeviceCode(null)}
      >
        <PerspectiveCamera makeDefault position={[-8, 6.6, 15]} fov={48} />
        <WorkshopScene
          onSelectDevice={toggleSelectedDevice}
          selectedDeviceCode={selectedDeviceCode}
        />
        <CameraFocusController
          controlsRef={controlsRef}
          controlInteractionVersion={controlInteractionVersion}
          selectedDeviceCode={selectedDeviceCode}
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
      <div className="absolute bottom-5 left-5 z-10 max-h-[calc(100%-2.5rem)] max-w-[calc(100%-2.5rem)] overflow-y-auto">
        <WorkshopLegend
          onOpenProcessFlow={() => setIsProcessFlowOpen(true)}
          selectedDeviceCode={selectedDeviceCode}
        />
      </div>
      {isProcessFlowOpen ? (
        <div
          className="absolute inset-0 z-[2147483647] grid place-items-center bg-slate-950/24 px-4 py-6 backdrop-blur-[1px]"
          onClick={() => setIsProcessFlowOpen(false)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <WorkshopProcessFlow onClose={() => setIsProcessFlowOpen(false)} />
          </div>
        </div>
      ) : null}
      <DeviceDetailCard
        selectedDeviceCode={selectedDeviceCode}
        telemetryByDevice={telemetryByDevice}
        onClose={() => setSelectedDeviceCode(null)}
      />
    </div>
  )
}
