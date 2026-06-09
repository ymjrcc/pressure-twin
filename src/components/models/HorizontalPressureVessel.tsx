import { Html } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { Flange, PressureGauge, SafetyValve, Transmitter } from './ProcessFittings'

type HorizontalPressureVesselProps = {
  instrumentSuffix?: string
  position?: ThreeElements['group']['position']
}

type SaddleProps = {
  x: number
}

type ShellRingProps = {
  radius?: number
  tube?: number
  x: number
}

type InstrumentTagProps = {
  code: string
  position: ThreeElements['group']['position']
}

const diameter = 2
const length = 6
const radius = diameter / 2
const saddleHeight = 0.35
const shellCenterY = radius + saddleHeight
const straightShellLength = length - diameter
const halfLength = length / 2
const defaultPosition: [number, number, number] = [0, 0, 0]

const shellMaterial = {
  color: '#c7cdd1',
  roughness: 0.24,
  metalness: 0.62,
}

const rimMaterial = {
  color: '#e1e6e9',
  roughness: 0.28,
  metalness: 0.56,
}

const darkMetalMaterial = {
  color: '#7b858b',
  roughness: 0.38,
  metalness: 0.46,
}

const accentMaterial = {
  color: '#9aa4aa',
  roughness: 0.34,
  metalness: 0.5,
}

function ShellRing({ radius: ringRadius = radius + 0.015, tube = 0.018, x }: ShellRingProps) {
  return (
    <mesh castShadow receiveShadow position={[x, shellCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[ringRadius, tube, 8, 96]} />
      <meshStandardMaterial {...rimMaterial} />
    </mesh>
  )
}

function EndNozzle({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * (halfLength + 0.02), shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow position={[0, side * 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.24, 30]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, side * 0.25, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 40]} />
        <meshStandardMaterial color="#66727c" roughness={0.42} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, side * 0.32, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 30]} />
        <meshStandardMaterial {...accentMaterial} />
      </mesh>
    </group>
  )
}

function Manway() {
  const bolts = Array.from({ length: 16 }, (_, index) => (index / 16) * Math.PI * 2)

  return (
    <group position={[0, shellCenterY - 0.02, radius + 0.045]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.1, 56]} />
        <meshStandardMaterial color="#aeb7bd" roughness={0.3} metalness={0.56} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.055, 48]} />
        <meshStandardMaterial color="#c7cdd1" roughness={0.26} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <torusGeometry args={[0.41, 0.025, 10, 56]} />
        <meshStandardMaterial color="#e0e5e8" roughness={0.24} metalness={0.58} />
      </mesh>
      {bolts.map((angle) => (
        <mesh
          key={`manway-bolt-${angle}`}
          castShadow
          receiveShadow
          position={[Math.cos(angle) * 0.455, 0.1, Math.sin(angle) * 0.455]}
        >
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshStandardMaterial color="#f0f3f5" roughness={0.3} metalness={0.55} />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x) => (
        <group key={`manway-handle-${x}`} position={[x, 0.13, 0]}>
          <mesh castShadow receiveShadow position={[0, 0, -0.14]}>
            <cylinderGeometry args={[0.018, 0.018, 0.16, 10]} />
            <meshStandardMaterial color="#7b858b" roughness={0.34} metalness={0.5} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.14]}>
            <cylinderGeometry args={[0.018, 0.018, 0.16, 10]} />
            <meshStandardMaterial color="#7b858b" roughness={0.34} metalness={0.5} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.018, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#7b858b" roughness={0.34} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Saddle({ x }: SaddleProps) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.92, 0.08, 1.65]} />
        <meshStandardMaterial color="#8b969c" roughness={0.44} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight / 2, -0.43]}>
        <boxGeometry args={[0.48, saddleHeight, 0.16]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight / 2, 0.43]}>
        <boxGeometry args={[0.48, saddleHeight, 0.16]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight + 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.52, 0.52, 0.54, 32, 1, true]} />
        <meshStandardMaterial color="#9fa9af" roughness={0.4} metalness={0.4} side={2} />
      </mesh>
    </group>
  )
}

function Nameplate() {
  return (
    <group position={[-1.15, shellCenterY + 0.2, radius + 0.035]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.28, 0.035]} />
        <meshStandardMaterial color="#243746" roughness={0.46} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.025]}>
        <boxGeometry args={[0.48, 0.045, 0.018]} />
        <meshStandardMaterial color="#d6e2ea" roughness={0.35} metalness={0.28} />
      </mesh>
    </group>
  )
}

function InstrumentTag({ code, position }: InstrumentTagProps) {
  return (
    <group position={position}>
      <Html center distanceFactor={8} occlude>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(226, 232, 240, 0.28)',
            borderRadius: 4,
            color: '#f8fafc',
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1,
            padding: '4px 7px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {code}
        </div>
      </Html>
    </group>
  )
}

function VesselInstruments({ suffix }: { suffix: string }) {
  const topY = shellCenterY + radius

  return (
    <group>
      <PressureGauge position={[-1.9, topY, 0]} />
      <InstrumentTag code={`PG-${suffix}`} position={[-1.9, topY + 0.94, 0.12]} />

      <Transmitter position={[0, topY, 0.03]} />
      <InstrumentTag code={`PT-${suffix}`} position={[0, topY + 0.79, 0.12]} />

      <SafetyValve position={[1.9, topY, 0]} />
      <InstrumentTag code={`PSV-${suffix}`} position={[1.9, topY + 0.98, 0.12]} />

      <Flange position={[-halfLength - 0.36, shellCenterY, 0]} direction={[1, 0, 0]} radius={0.25} />
      <Flange position={[halfLength + 0.36, shellCenterY, 0]} direction={[1, 0, 0]} radius={0.25} />
    </group>
  )
}

function HorizontalPressureVessel({ instrumentSuffix = '101', position = defaultPosition }: HorizontalPressureVesselProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[radius, straightShellLength, 20, 72]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>

      {[-2, -1.15, 0, 1.15, 2].map((x) => (
        <ShellRing key={`shell-ring-${x}`} x={x} />
      ))}
      <ShellRing x={-halfLength + 0.18} radius={0.54} tube={0.015} />
      <ShellRing x={halfLength - 0.18} radius={0.54} tube={0.015} />

      <EndNozzle side={-1} />
      <EndNozzle side={1} />

      <Manway />
      <Nameplate />
      <VesselInstruments suffix={instrumentSuffix} />

      <Saddle x={-1.85} />
      <Saddle x={1.85} />
    </group>
  )
}

export default HorizontalPressureVessel
