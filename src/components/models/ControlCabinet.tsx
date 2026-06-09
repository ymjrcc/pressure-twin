import type { ThreeElements } from '@react-three/fiber'

type ControlCabinetProps = {
  position?: ThreeElements['group']['position']
  rotation?: ThreeElements['group']['rotation']
}

type IndicatorProps = {
  color: string
  x: number
  y: number
}

const defaultPosition: [number, number, number] = [0, 0, 0]

const cabinetMaterial = {
  color: '#7f8b93',
  roughness: 0.46,
  metalness: 0.18,
}

const trimMaterial = {
  color: '#3f4b55',
  roughness: 0.54,
  metalness: 0.22,
}

function Indicator({ color, x, y }: IndicatorProps) {
  return (
    <mesh castShadow receiveShadow position={[x, y, 0.268]}>
      <sphereGeometry args={[0.055, 18, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} roughness={0.35} />
    </mesh>
  )
}

function PushButton({ color, x, y }: IndicatorProps) {
  return (
    <group position={[x, y, 0.268]}>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.035, 18]} />
        <meshStandardMaterial color="#27323b" roughness={0.44} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.028]}>
        <sphereGeometry args={[0.041, 16, 10]} />
        <meshStandardMaterial color={color} roughness={0.36} metalness={0.08} />
      </mesh>
    </group>
  )
}

function Louver({ y }: { y: number }) {
  return (
    <mesh castShadow receiveShadow position={[0, y, 0.27]}>
      <boxGeometry args={[0.58, 0.025, 0.035]} />
      <meshStandardMaterial {...trimMaterial} />
    </mesh>
  )
}

function Hinge({ y }: { y: number }) {
  return (
    <mesh castShadow receiveShadow position={[-0.49, y, 0.248]}>
      <cylinderGeometry args={[0.024, 0.024, 0.2, 12]} />
      <meshStandardMaterial {...trimMaterial} />
    </mesh>
  )
}

function Foot({ x, z }: { x: number; z: number }) {
  return (
    <mesh castShadow receiveShadow position={[x, 0.08, z]}>
      <cylinderGeometry args={[0.055, 0.07, 0.16, 12]} />
      <meshStandardMaterial color="#2f3b45" roughness={0.58} metalness={0.24} />
    </mesh>
  )
}

function ControlCabinet({ position = defaultPosition, rotation }: ControlCabinetProps) {
  const indicators = [
    [-0.26, 1.18, '#22c55e'],
    [0, 1.18, '#f59e0b'],
    [0.26, 1.18, '#ef4444'],
  ] as const
  const buttons = [
    [-0.26, 0.98, '#22c55e'],
    [0, 0.98, '#2563eb'],
    [0.26, 0.98, '#ef4444'],
    [-0.26, 0.82, '#f59e0b'],
    [0, 0.82, '#e5e7eb'],
    [0.26, 0.82, '#111827'],
  ] as const

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[1.05, 2.1, 0.46]} />
        <meshStandardMaterial {...cabinetMaterial} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 1.13, 0.245]}>
        <boxGeometry args={[0.9, 1.68, 0.04]} />
        <meshStandardMaterial color="#d7dee4" roughness={0.42} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.13, 0.272]}>
        <boxGeometry args={[0.02, 1.58, 0.028]} />
        <meshStandardMaterial {...trimMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.42, 1.13, 0.282]}>
        <boxGeometry args={[0.045, 0.36, 0.05]} />
        <meshStandardMaterial color="#1f2933" roughness={0.48} metalness={0.28} />
      </mesh>
      {[1.7, 1.13, 0.56].map((y) => (
        <Hinge key={`cabinet-hinge-${y}`} y={y} />
      ))}

      <mesh castShadow receiveShadow position={[0, 1.66, 0.288]}>
        <boxGeometry args={[0.58, 0.28, 0.05]} />
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.66, 0.318]}>
        <boxGeometry args={[0.44, 0.17, 0.018]} />
        <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.45} roughness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.12, 1.66, 0.335]}>
        <boxGeometry args={[0.06, 0.1, 0.012]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.35} roughness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.04, 1.66, 0.335]}>
        <boxGeometry args={[0.11, 0.04, 0.012]} />
        <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.25} roughness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.12, 1.66, 0.332]}>
        <boxGeometry args={[0.16, 0.018, 0.012]} />
        <meshStandardMaterial color="#dbeafe" emissive="#93c5fd" emissiveIntensity={0.35} roughness={0.2} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.12, 1.61, 0.332]}>
        <boxGeometry args={[0.2, 0.018, 0.012]} />
        <meshStandardMaterial color="#dbeafe" emissive="#93c5fd" emissiveIntensity={0.35} roughness={0.2} />
      </mesh>

      {indicators.map(([x, y, color]) => (
        <Indicator key={`indicator-${x}-${y}`} color={color} x={x} y={y} />
      ))}
      {buttons.map(([x, y, color]) => (
        <PushButton key={`button-${x}-${y}`} color={color} x={x} y={y} />
      ))}
      <mesh castShadow receiveShadow position={[0, 0.34, 0.312]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.035, 0.19, 0.012]} />
        <meshStandardMaterial color="#111827" roughness={0.38} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.25, 0.312]}>
        <boxGeometry args={[0.11, 0.018, 0.012]} />
        <meshStandardMaterial color="#111827" roughness={0.38} />
      </mesh>

      {[0.48, 0.42, 0.36, 0.3].map((y) => (
        <Louver key={`cabinet-louver-${y}`} y={y} />
      ))}

      <mesh castShadow receiveShadow position={[0, 2.14, 0]}>
        <boxGeometry args={[1.14, 0.08, 0.54]} />
        <meshStandardMaterial {...trimMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[1.18, 0.1, 0.56]} />
        <meshStandardMaterial color="#18434a" roughness={0.62} metalness={0.18} />
      </mesh>
      <Foot x={-0.4} z={-0.16} />
      <Foot x={0.4} z={-0.16} />
      <Foot x={-0.4} z={0.16} />
      <Foot x={0.4} z={0.16} />
    </group>
  )
}

export default ControlCabinet
