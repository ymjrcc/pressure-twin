import { Html } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { PressureGauge, Valve } from './ProcessFittings'

type CirculationPumpProps = {
  position?: ThreeElements['group']['position']
}

type InstrumentTagProps = {
  code: string
  position: ThreeElements['group']['position']
}

const defaultPosition: [number, number, number] = [0, 0, 0]

const baseMaterial = {
  color: '#40505a',
  roughness: 0.6,
  metalness: 0.18,
}

const motorMaterial = {
  color: '#2563a8',
  roughness: 0.42,
  metalness: 0.3,
}

const pumpMaterial = {
  color: '#1f5d8d',
  roughness: 0.44,
  metalness: 0.32,
}

const darkMaterial = {
  color: '#26323d',
  roughness: 0.56,
  metalness: 0.24,
}

function MotorFin({ angle }: { angle: number }) {
  const radius = 0.36
  const y = 0.52 + Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  return (
    <mesh castShadow receiveShadow position={[-0.42, y, z]}>
      <boxGeometry args={[0.72, 0.026, 0.055]} />
      <meshStandardMaterial color="#174c82" roughness={0.46} metalness={0.28} />
    </mesh>
  )
}

function Flange({ x, radius = 0.24 }: { radius?: number; x: number }) {
  const bolts = Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2)

  return (
    <group position={[x, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.08, 36]} />
        <meshStandardMaterial color="#4f5d68" roughness={0.44} metalness={0.32} />
      </mesh>
      {bolts.map((angle) => (
        <mesh
          key={`pump-flange-bolt-${x}-${angle}`}
          castShadow
          receiveShadow
          position={[Math.cos(angle) * radius * 0.72, 0.055, Math.sin(angle) * radius * 0.72]}
        >
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#d6dee4" roughness={0.4} metalness={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function BaseBolt({ x, z }: { x: number; z: number }) {
  return (
    <mesh castShadow receiveShadow position={[x, 0.19, z]}>
      <cylinderGeometry args={[0.035, 0.035, 0.035, 12]} />
      <meshStandardMaterial color="#cbd5dc" roughness={0.4} metalness={0.4} />
    </mesh>
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

function CirculationPump({ position = defaultPosition }: CirculationPumpProps) {
  const fins = Array.from({ length: 9 }, (_, index) => -Math.PI * 0.72 + index * 0.18)
  const baseBolts = [
    [-0.62, -0.3],
    [-0.62, 0.3],
    [0.62, -0.3],
    [0.62, 0.3],
  ] as const

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[1.75, 0.16, 0.96]} />
        <meshStandardMaterial {...baseMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.38, 0.23, 0]}>
        <boxGeometry args={[0.92, 0.22, 0.54]} />
        <meshStandardMaterial color="#4b5563" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.42, 0.24, 0]}>
        <boxGeometry args={[0.58, 0.28, 0.54]} />
        <meshStandardMaterial color="#4b5563" roughness={0.58} metalness={0.18} />
      </mesh>
      {baseBolts.map(([x, z]) => (
        <BaseBolt key={`pump-base-bolt-${x}-${z}`} x={x} z={z} />
      ))}

      <mesh castShadow receiveShadow position={[-0.42, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 0.76, 40]} />
        <meshStandardMaterial {...motorMaterial} />
      </mesh>
      {fins.map((angle) => (
        <MotorFin key={`motor-fin-${angle}`} angle={angle} />
      ))}
      <mesh castShadow receiveShadow position={[-0.86, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.1, 32]} />
        <meshStandardMaterial {...darkMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.93, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.012, 8, 28]} />
        <meshStandardMaterial color="#111827" roughness={0.48} metalness={0.28} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.02, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.24, 24]} />
        <meshStandardMaterial {...darkMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.38, 0.52, 0]}>
        <sphereGeometry args={[0.39, 40, 22]} />
        <meshStandardMaterial {...pumpMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.38, 0.52, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.035, 12, 48]} />
        <meshStandardMaterial color="#174c82" roughness={0.44} metalness={0.32} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.84, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.46, 28]} />
        <meshStandardMaterial {...darkMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.38, 0.94, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.48, 24]} />
        <meshStandardMaterial {...darkMaterial} />
      </mesh>
      <Flange x={1.08} radius={0.24} />
      <Valve position={[1.44, 0.52, 0]} direction={[1, 0, 0]} />
      <PressureGauge position={[1.38, 0.82, 0]} />
      <InstrumentTag code="PG-103" position={[1.38, 1.58, 0.1]} />
      <mesh castShadow receiveShadow position={[0.38, 1.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
        <meshStandardMaterial color="#4f5d68" roughness={0.44} metalness={0.32} />
      </mesh>

      <Flange x={-1.12} radius={0.2} />
      <Valve position={[-1.44, 0.52, 0]} direction={[1, 0, 0]} />
    </group>
  )
}

export default CirculationPump
