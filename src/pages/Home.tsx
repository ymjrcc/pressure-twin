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
import SignalLines from '@/components/models/SignalLines'
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
      <VerticalStorageTank position={[5.2, 0, 2.3]} rotation={[0, 0, 0]} />
      <HorizontalPressureVessel position={[-4.2, 0, -3.2]} instrumentSuffix="101" />
      <HorizontalPressureVessel position={[2.6, 0, -3.2]} instrumentSuffix="102" />
      <HeatExchanger position={[-3.4, 0, 1.5]} />
      <CirculationPump position={[1.6, 0, 1.8]} />
      <ControlCabinet position={[-0.9, 0, 5.55]} rotation={[0, 0, 0]} />
      <ProcessPipeline />
      <SignalLines />

      <DeviceLabel index={1} code="T-201" name="立式储罐" model="Φ2.0 x 3.4" position={[6.25, 4.55, 2.45]} />
      <DeviceLabel index={2} code="PU-101" name="循环泵" position={[1.55, 1.72, 2.45]} />
      <DeviceLabel index={3} code="E-101" name="换热器" model="管壳式" position={[-3.45, 2.12, 2.15]} />
      <DeviceLabel index={4} code="V-101" name="卧式压力容器" model="6.0 x Φ2.0" position={[-4.35, 3.62, -2.05]} />
      <DeviceLabel index={5} code="V-102" name="卧式压力容器" model="6.0 x Φ2.0" position={[2.8, 3.62, -2.05]} />
      <DeviceLabel index={6} name="控制柜" position={[-0.9, 2.65, 6]} />
    </>
  )
}

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden bg-[#eef2f5]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [9.5, 6.6, 10.5], fov: 48 }}>
        <PerspectiveCamera makeDefault position={[-8, 6.6, 15]} fov={48} />
        <WorkshopScene />
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
      <div className="pointer-events-none absolute bottom-5 left-5 grid min-w-[210px] gap-2 rounded-[8px] border border-white/20 bg-slate-900/82 px-4 py-3 text-[13px] leading-tight text-white shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="inline-block h-[3px] w-13 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.45)]" />
          <span>工艺介质流向</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-13 border-t-[3px] border-dashed border-violet-400" />
          <span>信号/数据连接</span>
        </div>
      </div>
    </div>
  )
}
