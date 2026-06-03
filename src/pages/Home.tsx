import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import ControlCabinet from '@/components/models/ControlCabinet'
import Factory from '@/components/models/Factory'
import HeatExchanger from '@/components/models/HeatExchanger'
import HorizontalPressureVessel from '@/components/models/HorizontalPressureVessel'
import ScalePerson from '@/components/models/ScalePerson'
import VerticalStorageTank from '@/components/models/VerticalStorageTank'

function WorkshopScene() {
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
      <VerticalStorageTank position={[3, 0, 3]} />
      <HorizontalPressureVessel position={[-3.5, 0, -3.8]} />
      <HorizontalPressureVessel position={[3.5, 0, -3.8]} />
      <HeatExchanger position={[-3.5, 0, 1.8]} />
      <ControlCabinet position={[7.2, 0, 5.4]} />
    </>
  )
}

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden bg-[#eef2f5]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [9.5, 6.6, 10.5], fov: 48 }}>
        <PerspectiveCamera makeDefault position={[9.5, 6.6, 10.5]} fov={48} />
        <WorkshopScene />
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          minDistance={2.4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}
