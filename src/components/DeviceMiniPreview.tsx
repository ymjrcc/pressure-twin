import { Canvas } from '@react-three/fiber'
import { Bounds, Center, PerspectiveCamera } from '@react-three/drei'
import type { DeviceCode } from '@/data/workshopDevices'
import CirculationPump from './models/CirculationPump'
import ControlCabinet from './models/ControlCabinet'
import HeatExchanger from './models/HeatExchanger'
import HorizontalPressureVessel from './models/HorizontalPressureVessel'
import VerticalStorageTank from './models/VerticalStorageTank'

type DeviceMiniPreviewProps = {
  code: DeviceCode
}

const previewQuarterTurn = Math.PI / 2

function PreviewModel({ code }: DeviceMiniPreviewProps) {
  switch (code) {
    case 'T-201':
      return (
        <group rotation={[0, -0.45 + previewQuarterTurn, 0]}>
          <VerticalStorageTank showLabels={false} />
        </group>
      )
    case 'PU-101':
      return (
        <group rotation={[0, -0.5 + previewQuarterTurn, 0]}>
          <CirculationPump showLabels={false} />
        </group>
      )
    case 'E-101':
      return (
        <group rotation={[0, -0.55 + previewQuarterTurn, 0]}>
          <HeatExchanger />
        </group>
      )
    case 'V-101':
    case 'V-102':
      return (
        <group rotation={[0, -0.5 + previewQuarterTurn, 0]}>
          <HorizontalPressureVessel instrumentSuffix={code === 'V-101' ? '101' : '102'} showLabels={false} />
        </group>
      )
    case 'CC-101':
      return (
        <group rotation={[0, -0.45 + previewQuarterTurn, 0]}>
          <ControlCabinet />
        </group>
      )
  }
}

export default function DeviceMiniPreview({ code }: DeviceMiniPreviewProps) {
  return (
    <div className="pointer-events-none h-40 overflow-hidden rounded-[8px] border border-slate-400/30 bg-slate-300/80">
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <color attach="background" args={['#aeb8bf']} />
        <PerspectiveCamera makeDefault position={[5.2, 3.2, 6]} fov={38} />
        <ambientLight intensity={0.78} />
        <hemisphereLight args={['#ffffff', '#4b5563', 0.92]} />
        <directionalLight position={[3.8, 5.2, 4.2]} intensity={1.45} />
        <directionalLight position={[-3, 2.4, -3]} intensity={0.42} color="#d9f7ff" />
        <Bounds fit clip observe margin={1.28}>
          <Center precise>
            <PreviewModel code={code} />
          </Center>
        </Bounds>
      </Canvas>
    </div>
  )
}
