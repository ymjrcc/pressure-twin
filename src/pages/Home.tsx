import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import CirculationPump from '@/components/models/CirculationPump'
import ControlCabinet from '@/components/models/ControlCabinet'
import DeviceLabel from '@/components/models/DeviceLabel'
import Factory from '@/components/models/Factory'
import HeatExchanger from '@/components/models/HeatExchanger'
import HorizontalPressureVessel from '@/components/models/HorizontalPressureVessel'
import ProcessPipeline from '@/components/models/ProcessPipeline'
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
      <VerticalStorageTank position={[4.25, 0, 3]} />
      <HorizontalPressureVessel position={[-3.5, 0, -3.8]} />
      <HorizontalPressureVessel position={[3.5, 0, -3.8]} />
      <HeatExchanger position={[-4.5, 0, 1.8]} />
      <CirculationPump position={[-0.2, 0, 2.4]} />
      <ControlCabinet position={[7.2, 0, 5.4]} />
      <ProcessPipeline />

      <DeviceLabel index={1} code="V-101" name="卧式压力容器" model="6.0 x Φ2.0" position={[-3.5, 3.15, -3.8]} />
      <DeviceLabel index={2} code="V-102" name="卧式压力容器" model="6.0 x Φ2.0" position={[3.5, 3.15, -3.8]} />
      <DeviceLabel index={3} code="T-201" name="立式储罐" model="Φ2.0 x 3.4" position={[4.25, 4.05, 3]} />
      <DeviceLabel index={4} code="E-101" name="换热器" model="管壳式" position={[-4.5, 2.05, 1.8]} />
      <DeviceLabel index={5} name="控制柜" position={[7.2, 2.5, 5.4]} />
      <DeviceLabel index={6} name="循环泵" model="PU-101" position={[-0.2, 1.45, 2.4]} />
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
