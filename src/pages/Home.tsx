import { useState, type ReactNode } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import WorkshopLegend from '@/components/WorkshopLegend'
import CirculationPump from '@/components/models/CirculationPump'
import ControlCabinet from '@/components/models/ControlCabinet'
import DeviceLabel from '@/components/models/DeviceLabel'
import DeviceSelectionHalo from '@/components/models/DeviceSelectionHalo'
import Factory from '@/components/models/Factory'
import HeatExchanger from '@/components/models/HeatExchanger'
import HorizontalPressureVessel from '@/components/models/HorizontalPressureVessel'
import ProcessPipeline from '@/components/models/ProcessPipeline'
import ScalePerson from '@/components/models/ScalePerson'
import SignalLines from '@/components/models/SignalLines'
import VerticalStorageTank from '@/components/models/VerticalStorageTank'
import { devices, type DeviceCode } from '@/data/workshopDevices'

type SelectableDeviceProps = {
  children: ReactNode
  code: DeviceCode
  onSelect: (code: DeviceCode) => void
}

type WorkshopSceneProps = {
  onSelectDevice: (code: DeviceCode) => void
  selectedDeviceCode: DeviceCode | null
}

function SelectableDevice({ children, code, onSelect }: SelectableDeviceProps) {
  return (
    <group
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(code)
      }}
    >
      {children}
    </group>
  )
}

function WorkshopScene({ onSelectDevice, selectedDeviceCode }: WorkshopSceneProps) {
  return (
    <>
      <color attach="background" args={['#dfe5e9']} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#f8fbff', '#6d7880', 0.7]} />
      <directionalLight
        castShadow
        position={[5, 9, 5]}
        intensity={0.85}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      <Factory />
      <ScalePerson position={[-7.2, 0, -5.4]} />
      <SelectableDevice code="T-201" onSelect={onSelectDevice}>
        <VerticalStorageTank position={[5.2, 0, 2.3]} rotation={[0, 0, 0]} />
      </SelectableDevice>
      <SelectableDevice code="V-101" onSelect={onSelectDevice}>
        <HorizontalPressureVessel position={[-4.2, 0, -3.2]} instrumentSuffix="101" />
      </SelectableDevice>
      <SelectableDevice code="V-102" onSelect={onSelectDevice}>
        <HorizontalPressureVessel position={[2.6, 0, -3.2]} instrumentSuffix="102" />
      </SelectableDevice>
      <SelectableDevice code="E-101" onSelect={onSelectDevice}>
        <HeatExchanger position={[-3.4, 0, 1.5]} />
      </SelectableDevice>
      <SelectableDevice code="PU-101" onSelect={onSelectDevice}>
        <CirculationPump position={[1.6, 0, 1.8]} />
      </SelectableDevice>
      <SelectableDevice code="CC-101" onSelect={onSelectDevice}>
        <ControlCabinet position={[-0.9, 0, 5.55]} rotation={[0, 0, 0]} />
      </SelectableDevice>
      <ProcessPipeline />
      <SignalLines />
      <DeviceSelectionHalo selectedDeviceCode={selectedDeviceCode} />

      {devices.map((device) => (
        <DeviceLabel key={device.code} code={device.code} position={device.position} />
      ))}
    </>
  )
}

export default function Home() {
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<DeviceCode | null>(null)
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
        <OrbitControls
          makeDefault
          target={[0.5, 1, -0.2]}
          minDistance={2.4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
      <WorkshopLegend selectedDeviceCode={selectedDeviceCode} />
    </div>
  )
}
