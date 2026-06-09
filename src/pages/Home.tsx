import { useState, type ReactNode } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
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
        <DeviceLabel key={device.code} code={device.code} position={device.position} />
      ))}
    </>
  )
}

export default function Home() {
  const [isProcessFlowOpen, setIsProcessFlowOpen] = useState(false)
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
      <DeviceDetailCard selectedDeviceCode={selectedDeviceCode} onClose={() => setSelectedDeviceCode(null)} />
    </div>
  )
}
