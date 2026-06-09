import type { ThreeElements } from '@react-three/fiber'
import { Flange, Valve } from './ProcessFittings'
import { equipmentMaterialConfig } from './materialConfigs'

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

const shellMaterial = equipmentMaterialConfig.heatExchanger.shell
const darkMetalMaterial = equipmentMaterialConfig.fittings.darkMetal
const rimMaterial = equipmentMaterialConfig.heatExchanger.rim

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
        <meshStandardMaterial color="#76481f" roughness={0.5} metalness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 32]} />
        <meshStandardMaterial {...equipmentMaterialConfig.heatExchanger.cap} />
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
        <meshStandardMaterial {...equipmentMaterialConfig.heatExchanger.cap} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, side * 0.1, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 40]} />
        <meshStandardMaterial color="#5f3d22" roughness={0.52} metalness={0.34} />
      </mesh>
    </group>
  )
}

function Saddle({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[0.46, 0.07, 0.82]} />
        <meshStandardMaterial color="#3d4850" roughness={0.6} metalness={0.24} />
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
        <meshStandardMaterial color="#46535b" roughness={0.56} metalness={0.28} side={2} />
      </mesh>
    </group>
  )
}

function EndProcessNozzles() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[-halfLength - 0.24, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.34, 28]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <Flange position={[-halfLength - 0.32, shellCenterY, 0]} direction={[1, 0, 0]} radius={0.22} />
      <Valve position={[-halfLength - 0.68, shellCenterY, 0]} direction={[1, 0, 0]} />
      <mesh castShadow receiveShadow position={[halfLength + 0.24, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.34, 28]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <Flange position={[halfLength + 0.32, shellCenterY, 0]} direction={[1, 0, 0]} radius={0.22} />
      <Valve position={[halfLength + 0.68, shellCenterY, 0]} direction={[1, 0, 0]} />
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
      <mesh castShadow receiveShadow position={[-0.22, shellCenterY + radius + 0.018, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.48, 0.2, 0.028]} />
        <meshStandardMaterial color="#23313a" roughness={0.5} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.22, shellCenterY + radius + 0.034, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.36, 0.028, 0.014]} />
        <meshStandardMaterial color="#d7c5a2" roughness={0.42} metalness={0.3} />
      </mesh>
      <ShellRing x={-halfLength + 0.16} radius={radius * 0.92} tube={0.016} />
      <ShellRing x={halfLength - 0.16} radius={radius * 0.92} tube={0.016} />

      <EndCap side={-1} />
      <EndCap side={1} />
      <FlangedNozzle x={-0.78} />
      <FlangedNozzle x={0.78} z={-0.04} />
      <EndProcessNozzles />

      <Saddle x={-0.94} />
      <Saddle x={0.94} />
    </group>
  )
}

export default HeatExchanger
