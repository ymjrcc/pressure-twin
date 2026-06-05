import type { ThreeElements } from '@react-three/fiber'

type HorizontalPressureVesselProps = {
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

type BoltCircleProps = {
  count?: number
  radius: number
  x?: number
  y?: number
  z?: number
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
  color: '#8ea2b2',
  roughness: 0.34,
  metalness: 0.48,
}

const rimMaterial = {
  color: '#c0cbd3',
  roughness: 0.35,
  metalness: 0.45,
}

const darkMetalMaterial = {
  color: '#47535d',
  roughness: 0.5,
  metalness: 0.28,
}

const accentMaterial = {
  color: '#2f6f9f',
  roughness: 0.42,
  metalness: 0.34,
}

function ShellRing({ radius: ringRadius = radius + 0.015, tube = 0.018, x }: ShellRingProps) {
  return (
    <mesh castShadow receiveShadow position={[x, shellCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[ringRadius, tube, 8, 96]} />
      <meshStandardMaterial {...rimMaterial} />
    </mesh>
  )
}

function BoltCircle({ count = 12, radius: boltRadius, x = 0, y = 0, z = 0 }: BoltCircleProps) {
  const bolts = Array.from({ length: count }, (_, index) => (index / count) * Math.PI * 2)

  return (
    <group position={[x, y, z]}>
      {bolts.map((angle) => (
        <mesh
          key={`bolt-${x}-${y}-${z}-${angle}`}
          castShadow
          receiveShadow
          position={[0, Math.cos(angle) * boltRadius, Math.sin(angle) * boltRadius]}
        >
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#d6dee4" roughness={0.42} metalness={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function TopNozzle({ x }: { x: number }) {
  return (
    <group position={[x, shellCenterY + radius, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.36, 28]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 36]} />
        <meshStandardMaterial color="#66727c" roughness={0.42} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 28]} />
        <meshStandardMaterial {...accentMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.53, 0]}>
        <torusGeometry args={[0.2, 0.016, 8, 32]} />
        <meshStandardMaterial color="#2b5d86" roughness={0.38} metalness={0.34} />
      </mesh>
    </group>
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
  const bolts = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2)

  return (
    <group position={[1.55, shellCenterY + 0.06, radius + 0.04]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.08, 44]} />
        <meshStandardMaterial color="#687783" roughness={0.44} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 36]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      {bolts.map((angle) => (
        <mesh
          key={`manway-bolt-${angle}`}
          castShadow
          receiveShadow
          position={[Math.cos(angle) * 0.28, 0.08, Math.sin(angle) * 0.28]}
        >
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color="#d6dee4" roughness={0.42} metalness={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function Saddle({ x }: SaddleProps) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.92, 0.08, 1.65]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
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
        <meshStandardMaterial color="#5f6d77" roughness={0.52} metalness={0.24} side={2} />
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

function HorizontalPressureVessel({ position = defaultPosition }: HorizontalPressureVesselProps) {
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

      <TopNozzle x={-1.9} />
      <TopNozzle x={0} />
      <TopNozzle x={1.9} />
      <BoltCircle radius={0.23} x={-1.9} y={shellCenterY + radius + 0.435} />
      <BoltCircle radius={0.23} x={0} y={shellCenterY + radius + 0.435} />
      <BoltCircle radius={0.23} x={1.9} y={shellCenterY + radius + 0.435} />

      <EndNozzle side={-1} />
      <EndNozzle side={1} />

      <Manway />
      <Nameplate />

      <Saddle x={-1.85} />
      <Saddle x={1.85} />
    </group>
  )
}

export default HorizontalPressureVessel
