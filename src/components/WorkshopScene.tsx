import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Group, Material, Mesh, Vector3 } from 'three'

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
import { devices, type DeviceCode, type DeviceStatus } from '@/data/workshopDevices'

export type AbnormalDeviceStatuses = Partial<Record<DeviceCode, Exclude<DeviceStatus, 'normal'>>>

type WorkshopSceneProps = {
  abnormalDeviceStatuses: AbnormalDeviceStatuses
  inspectionPersonTarget: [number, number, number] | null
  onSelectDevice: (code: DeviceCode) => void
  selectedDeviceCode: DeviceCode | null
}

type SelectableDeviceProps = {
  children: ReactNode
  code: DeviceCode
  onSelect: (code: DeviceCode) => void
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

const defaultScalePersonPosition: [number, number, number] = [-7.2, 0, -5.4]

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

export default function WorkshopScene({
  abnormalDeviceStatuses,
  inspectionPersonTarget,
  onSelectDevice,
  selectedDeviceCode,
}: WorkshopSceneProps) {
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
