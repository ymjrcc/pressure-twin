import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { equipmentMaterialConfig } from './materialConfigs'

export type PipePoint = readonly [number, number, number]

type DirectionalProps = {
  direction?: PipePoint
  position?: ThreeElements['group']['position']
}

type FlangeProps = DirectionalProps & {
  radius?: number
}

type ValveProps = DirectionalProps & {
  bodyColor?: string
}

type InstrumentProps = {
  position?: ThreeElements['group']['position']
  rotation?: ThreeElements['group']['rotation']
}

const yAxis = new Vector3(0, 1, 0)
const { bolt: boltMaterial, darkMetal: darkMetalMaterial, flange: flangeMaterial, instrumentBlue } = equipmentMaterialConfig.fittings

function directionQuaternion(direction: PipePoint = [0, 1, 0]) {
  const axis = new Vector3(...direction).normalize()

  return new Quaternion().setFromUnitVectors(yAxis, axis)
}

function boltPositions(direction: PipePoint, radius: number, count: number) {
  const axis = new Vector3(...direction).normalize()
  const helper = Math.abs(axis.y) > 0.92 ? new Vector3(1, 0, 0) : yAxis
  const tangent = new Vector3().crossVectors(axis, helper).normalize()
  const bitangent = new Vector3().crossVectors(axis, tangent).normalize()

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2

    return tangent.clone().multiplyScalar(Math.cos(angle) * radius).add(bitangent.clone().multiplyScalar(Math.sin(angle) * radius))
  })
}

export function Flange({ direction = [0, 1, 0], position, radius = 0.22 }: FlangeProps) {
  const { bolts, quaternion } = useMemo(
    () => ({
      bolts: boltPositions(direction, radius * 0.78, 8),
      quaternion: directionQuaternion(direction),
    }),
    [direction, radius],
  )

  return (
    <group position={position}>
      <mesh castShadow receiveShadow quaternion={quaternion}>
        <cylinderGeometry args={[radius, radius, 0.08, 36]} />
        <meshStandardMaterial {...flangeMaterial} />
      </mesh>
      {bolts.map((bolt, index) => (
        <mesh key={`flange-bolt-${index}`} castShadow receiveShadow position={bolt}>
          <sphereGeometry args={[0.02, 8, 6]} />
          <meshStandardMaterial {...boltMaterial} />
        </mesh>
      ))}
    </group>
  )
}

export function Valve({ bodyColor = equipmentMaterialConfig.fittings.darkMetal.color, direction = [1, 0, 0], position }: ValveProps) {
  const quaternion = useMemo(() => directionQuaternion(direction), [direction])

  return (
    <group position={position}>
      <mesh castShadow receiveShadow quaternion={quaternion}>
        <cylinderGeometry args={[0.15, 0.15, 0.32, 28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.38} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 12]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 8, 36]} />
        <meshStandardMaterial color="#111827" roughness={0.44} metalness={0.32} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.43, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.26, 0.018, 0.018]} />
        <meshStandardMaterial color="#111827" roughness={0.44} metalness={0.32} />
      </mesh>
    </group>
  )
}

export function PressureGauge({ position, rotation }: InstrumentProps) {
  const tickAngles = Array.from({ length: 11 }, (_, index) => -Math.PI * 0.72 + index * Math.PI * 0.144)

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 14]} />
        <meshStandardMaterial color="#707a81" roughness={0.38} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.065, 0.06, 20]} />
        <meshStandardMaterial color="#9ba5ab" roughness={0.34} metalness={0.56} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.08, 48]} />
        <meshStandardMaterial color="#b9c2c8" roughness={0.34} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, 0.018]}>
        <circleGeometry args={[0.185, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.24} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, 0.034]}>
        <torusGeometry args={[0.186, 0.012, 8, 48]} />
        <meshStandardMaterial color="#606b72" roughness={0.34} metalness={0.58} />
      </mesh>
      {tickAngles.map((angle, index) => {
        const isMajor = index % 2 === 0
        const tickRadius = 0.142
        const x = Math.cos(angle) * tickRadius
        const y = 0.45 + Math.sin(angle) * tickRadius

        return (
          <mesh key={`gauge-tick-${angle}`} castShadow receiveShadow position={[x, y, 0.042]} rotation={[0, 0, angle]}>
            <boxGeometry args={[isMajor ? 0.036 : 0.024, 0.006, 0.008]} />
            <meshStandardMaterial color="#111827" roughness={0.36} />
          </mesh>
        )
      })}
      <mesh castShadow receiveShadow position={[0.042, 0.51, 0.052]} rotation={[0, 0, -0.62]}>
        <boxGeometry args={[0.012, 0.13, 0.01]} />
        <meshStandardMaterial color="#ef4444" roughness={0.34} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.45, 0.06]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.18, 14]} />
        <meshStandardMaterial color="#707a81" roughness={0.38} metalness={0.58} />
      </mesh>
    </group>
  )
}

export function SafetyValve({ position, rotation }: InstrumentProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 24]} />
        <meshStandardMaterial color="#727d84" roughness={0.4} metalness={0.54} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 28]} />
        <meshStandardMaterial color="#a5afb5" roughness={0.36} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.365, 0]}>
        <cylinderGeometry args={[0.105, 0.13, 0.25, 28]} />
        <meshStandardMaterial color="#66727a" roughness={0.4} metalness={0.54} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.17, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.24, 18]} />
        <meshStandardMaterial color="#9da8ae" roughness={0.36} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.31, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.05, 24]} />
        <meshStandardMaterial color="#89949b" roughness={0.38} metalness={0.56} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.525, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.07, 24]} />
        <meshStandardMaterial color="#a5afb5" roughness={0.36} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.69, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.24, 24]} />
        <meshStandardMaterial color="#b7c1c7" roughness={0.34} metalness={0.58} />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <mesh key={`safety-valve-guide-${x}`} castShadow receiveShadow position={[x, 0.69, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
          <meshStandardMaterial color="#6f7a81" roughness={0.3} metalness={0.55} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 0.69, 0]}>
        <torusGeometry args={[0.075, 0.012, 8, 36]} />
        <meshStandardMaterial color="#111827" roughness={0.38} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.87, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.12, 24]} />
        <meshStandardMaterial color="#b9c2c8" roughness={0.34} metalness={0.58} />
      </mesh>
    </group>
  )
}

export function Transmitter({ position, rotation }: InstrumentProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.24, 14]} />
        <meshStandardMaterial color="#707a81" roughness={0.38} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.06, 20]} />
        <meshStandardMaterial color="#9da8ae" roughness={0.36} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.2]} />
        <meshStandardMaterial {...instrumentBlue} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.2, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 28]} />
        <meshStandardMaterial color="#b8c2c8" roughness={0.34} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.2, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 28]} />
        <meshStandardMaterial color="#b8c2c8" roughness={0.34} metalness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0.106]}>
        <boxGeometry args={[0.17, 0.1, 0.014]} />
        <meshStandardMaterial color="#d7dee4" roughness={0.22} metalness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0.116]}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#16313b" emissive="#1f9fcf" emissiveIntensity={0.12} roughness={0.24} />
      </mesh>
    </group>
  )
}

export function PipeSupport({ position }: { position: PipePoint }) {
  const [x, y, z] = position
  const postHeight = Math.max(y - 0.12, 0.4)

  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[0.42, 0.07, 0.42]} />
        <meshStandardMaterial {...flangeMaterial} roughness={0.56} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, postHeight / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.035, 0.035, postHeight, 12]} />
        <meshStandardMaterial {...darkMetalMaterial} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, y - 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.38, 24, 1, true]} />
        <meshStandardMaterial {...flangeMaterial} roughness={0.48} side={2} />
      </mesh>
    </group>
  )
}

export function FlowArrow({ direction = [1, 0, 0], position }: DirectionalProps) {
  const quaternion = useMemo(() => directionQuaternion(direction), [direction])

  return (
    <group position={position} quaternion={quaternion}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.13, 0.3, 3]} />
        <meshStandardMaterial color="#f8fafc" emissive="#67e8f9" emissiveIntensity={0.25} roughness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
        <meshStandardMaterial color="#e0faff" emissive="#22d3ee" emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
    </group>
  )
}
