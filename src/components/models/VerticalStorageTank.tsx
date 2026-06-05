import type { ThreeElements } from '@react-three/fiber'

type VerticalStorageTankProps = {
  position?: ThreeElements['group']['position']
  rotation?: ThreeElements['group']['rotation']
}

type AnglePositionProps = {
  angle: number
  y: number
}

type BoltRingProps = {
  count?: number
  radius: number
  y: number
}

const diameter = 2
const height = 3.4
const radius = diameter / 2
const defaultPosition: [number, number, number] = [0, 0, 0]

const shellMaterial = {
  color: '#9aa6ad',
  metalness: 0.52,
  roughness: 0.34,
}

const darkMetalMaterial = {
  color: '#42505a',
  metalness: 0.32,
  roughness: 0.5,
}

const safetyMaterial = {
  color: '#e2a82e',
  metalness: 0.22,
  roughness: 0.42,
}

const accentMaterial = {
  color: '#2f6f9f',
  metalness: 0.36,
  roughness: 0.42,
}

function ShellRing({ y }: { y: number }) {
  return (
    <mesh castShadow receiveShadow position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius + 0.012, 0.012, 8, 96]} />
      <meshStandardMaterial color="#c2cbd1" roughness={0.36} metalness={0.48} />
    </mesh>
  )
}

function VerticalPost({ angle, y }: AnglePositionProps) {
  const postRadius = radius + 0.18
  const x = Math.cos(angle) * postRadius
  const z = Math.sin(angle) * postRadius

  return (
    <mesh castShadow receiveShadow position={[x, y, z]}>
      <cylinderGeometry args={[0.018, 0.018, 0.7, 12]} />
      <meshStandardMaterial {...safetyMaterial} />
    </mesh>
  )
}

function GuardRail() {
  const platformRadius = radius + 0.18
  const posts = Array.from({ length: 12 }, (_, index) => (index / 12) * Math.PI * 2)

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, height + 0.07, 0]}>
        <cylinderGeometry args={[platformRadius, platformRadius, 0.08, 72]} />
        <meshStandardMaterial color="#7f8b93" roughness={0.48} metalness={0.38} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, height + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[platformRadius, 0.025, 10, 96]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, height + 0.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[platformRadius, 0.018, 8, 96]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, height + 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[platformRadius, 0.018, 8, 96]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
      {posts.map((angle) => (
        <VerticalPost key={`guard-post-${angle}`} angle={angle} y={height + 0.45} />
      ))}
    </group>
  )
}

function TopNozzle() {
  return (
    <group position={[0, height + 0.18, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.16, 40]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.16, 32]} />
        <meshStandardMaterial {...accentMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 40]} />
        <meshStandardMaterial color="#5b6872" roughness={0.42} metalness={0.36} />
      </mesh>
    </group>
  )
}

function SideNozzle() {
  return (
    <group position={[-radius - 0.03, 1.22, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.32, 28]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 36]} />
        <meshStandardMaterial color="#67737c" roughness={0.42} metalness={0.36} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.43, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 36]} />
        <meshStandardMaterial color="#c3ccd2" roughness={0.36} metalness={0.44} />
      </mesh>
    </group>
  )
}

function Manway() {
  const bolts = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2)

  return (
    <group position={[0, 0.95, radius + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.08, 44]} />
        <meshStandardMaterial color="#6c7881" roughness={0.44} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.035, 36]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      {bolts.map((angle) => (
        <mesh
          key={`manway-bolt-${angle}`}
          castShadow
          receiveShadow
          position={[Math.cos(angle) * 0.27, 0.075, Math.sin(angle) * 0.27]}
        >
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color="#d5dde2" roughness={0.4} metalness={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function BoltRing({ count = 8, radius: boltRadius, y }: BoltRingProps) {
  const bolts = Array.from({ length: count }, (_, index) => (index / count) * Math.PI * 2)

  return (
    <group position={[0, y, 0]}>
      {bolts.map((angle) => (
        <mesh
          key={`top-bolt-${angle}`}
          castShadow
          receiveShadow
          position={[Math.cos(angle) * boltRadius, 0, Math.sin(angle) * boltRadius]}
        >
          <sphereGeometry args={[0.026, 10, 8]} />
          <meshStandardMaterial color="#d5dde2" roughness={0.4} metalness={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function Ladder() {
  const ladderX = radius + 0.2
  const bracketLength = ladderX - radius
  const bracketCenterX = radius + bracketLength / 2
  const railSpacing = 0.36
  const railZOffset = 0.18
  const railHeight = height + 0.16
  const railCenterY = railHeight / 2
  const rungYs = Array.from({ length: 12 }, (_, index) => 0.22 + index * 0.27)
  const bracketYs = [0.62, 1.45, 2.28, 3.1]

  return (
    <group>
      <mesh castShadow receiveShadow position={[ladderX, railCenterY, -railZOffset]}>
        <cylinderGeometry args={[0.018, 0.018, railHeight, 12]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[ladderX, railCenterY, railZOffset]}>
        <cylinderGeometry args={[0.018, 0.018, railHeight, 12]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
      {rungYs.map((y) => (
        <mesh key={`ladder-rung-${y}`} castShadow receiveShadow position={[ladderX, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, railSpacing, 10]} />
          <meshStandardMaterial {...safetyMaterial} />
        </mesh>
      ))}
      {bracketYs.map((y) => (
        <group key={`ladder-bracket-${y}`}>
          <mesh castShadow receiveShadow position={[bracketCenterX, y, -railZOffset]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, bracketLength, 8]} />
            <meshStandardMaterial {...safetyMaterial} />
          </mesh>
          <mesh castShadow receiveShadow position={[bracketCenterX, y, railZOffset]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, bracketLength, 8]} />
            <meshStandardMaterial {...safetyMaterial} />
          </mesh>
          <mesh castShadow receiveShadow position={[radius + 0.002, y, -railZOffset]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.018, 12]} />
            <meshStandardMaterial color="#d0d8dd" roughness={0.4} metalness={0.38} />
          </mesh>
          <mesh castShadow receiveShadow position={[radius + 0.002, y, railZOffset]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.018, 12]} />
            <meshStandardMaterial color="#d0d8dd" roughness={0.4} metalness={0.38} />
          </mesh>
        </group>
      ))}
      <mesh castShadow receiveShadow position={[ladderX, 0.035, -railZOffset]}>
        <cylinderGeometry args={[0.04, 0.05, 0.07, 12]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[ladderX, 0.035, railZOffset]}>
        <cylinderGeometry args={[0.04, 0.05, 0.07, 12]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[radius + 0.1, height + 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, bracketLength, 10]} />
        <meshStandardMaterial {...safetyMaterial} />
      </mesh>
    </group>
  )
}

function TankFoot({ angle }: { angle: number }) {
  const footRadius = radius * 0.72
  const x = Math.cos(angle) * footRadius
  const z = Math.sin(angle) * footRadius

  return (
    <group position={[x, 0.13, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.26, 0.32]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.16, 0]}>
        <boxGeometry args={[0.42, 0.06, 0.48]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
    </group>
  )
}

function VerticalStorageTank({ position = defaultPosition, rotation }: VerticalStorageTankProps) {
  const footAngles = [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4]

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 72]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, height + 0.025, 0]}>
        <cylinderGeometry args={[radius * 0.96, radius, 0.05, 72]} />
        <meshStandardMaterial color="#b9c3c9" roughness={0.32} metalness={0.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[radius, radius * 0.96, 0.06, 72]} />
        <meshStandardMaterial color="#87939b" roughness={0.42} metalness={0.4} />
      </mesh>

      {[0.64, 1.48, 2.32, 3.16].map((y) => (
        <ShellRing key={`shell-ring-${y}`} y={y} />
      ))}

      <GuardRail />
      <TopNozzle />
      <BoltRing radius={0.34} y={height + 0.46} />
      <SideNozzle />
      <Manway />
      <Ladder />

      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[radius + 0.08, radius + 0.08, 0.04, 72]} />
        <meshStandardMaterial color="#4b5563" roughness={0.56} metalness={0.18} />
      </mesh>
      {footAngles.map((angle) => (
        <TankFoot key={`tank-foot-${angle}`} angle={angle} />
      ))}
    </group>
  )
}

export default VerticalStorageTank
