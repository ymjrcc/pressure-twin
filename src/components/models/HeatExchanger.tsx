import type { ThreeElements } from '@react-three/fiber'

type HeatExchangerProps = {
  position?: ThreeElements['group']['position']
}

type RingProps = {
  radius?: number
  tube?: number
  x: number
}

type NozzleProps = {
  x: number
  z?: number
}

const diameter = 1
const length = 3.4
const radius = diameter / 2
const saddleHeight = 0.22
const shellCenterY = radius + saddleHeight
const halfLength = length / 2
const defaultPosition: [number, number, number] = [0, 0, 0]

const shellMaterial = {
  color: '#c9873f',
  roughness: 0.38,
  metalness: 0.34,
}

const darkMetalMaterial = {
  color: '#4b5563',
  roughness: 0.52,
  metalness: 0.24,
}

const rimMaterial = {
  color: '#e2b36f',
  roughness: 0.34,
  metalness: 0.36,
}

function ShellRing({ radius: ringRadius = radius + 0.012, tube = 0.014, x }: RingProps) {
  return (
    <mesh castShadow receiveShadow position={[x, shellCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[ringRadius, tube, 8, 72]} />
      <meshStandardMaterial {...rimMaterial} />
    </mesh>
  )
}

function FlangedNozzle({ x, z = 0 }: NozzleProps) {
  return (
    <group position={[x, shellCenterY + radius, z]}>
      <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.28, 24]} />
        <meshStandardMaterial color="#8a531f" roughness={0.46} metalness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 32]} />
        <meshStandardMaterial color="#a86124" roughness={0.42} metalness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <torusGeometry args={[0.13, 0.011, 8, 32]} />
        <meshStandardMaterial {...rimMaterial} />
      </mesh>
    </group>
  )
}

function EndCap({ side }: { side: -1 | 1 }) {
  const x = side * (halfLength + 0.08)

  return (
    <group position={[x, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.96, radius * 0.96, 0.16, 48]} />
        <meshStandardMaterial color="#a9652d" roughness={0.44} metalness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, side * 0.1, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 40]} />
        <meshStandardMaterial color="#70451f" roughness={0.48} metalness={0.26} />
      </mesh>
    </group>
  )
}

function Saddle({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[0.46, 0.07, 0.82]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight / 2, -0.25]}>
        <boxGeometry args={[0.28, saddleHeight, 0.12]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight / 2, 0.25]}>
        <boxGeometry args={[0.28, saddleHeight, 0.12]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, saddleHeight + 0.035, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.3, 28, 1, true]} />
        <meshStandardMaterial color="#65737d" roughness={0.52} metalness={0.22} side={2} />
      </mesh>
    </group>
  )
}

function HeatExchanger({ position = defaultPosition }: HeatExchangerProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, length, 56]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>

      {[-1.35, -0.68, 0, 0.68, 1.35].map((x) => (
        <ShellRing key={`exchanger-ring-${x}`} x={x} />
      ))}
      <ShellRing x={-halfLength + 0.16} radius={radius * 0.92} tube={0.016} />
      <ShellRing x={halfLength - 0.16} radius={radius * 0.92} tube={0.016} />

      <EndCap side={-1} />
      <EndCap side={1} />
      <FlangedNozzle x={-0.78} />
      <FlangedNozzle x={0.78} z={-0.04} />

      <Saddle x={-0.94} />
      <Saddle x={0.94} />
    </group>
  )
}

export default HeatExchanger
