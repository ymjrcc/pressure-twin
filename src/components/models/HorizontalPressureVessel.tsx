import type { ThreeElements } from '@react-three/fiber'

type HorizontalPressureVesselProps = {
  position?: ThreeElements['group']['position']
}

const diameter = 2
const length = 6
const radius = diameter / 2
const saddleHeight = 0.35
const shellCenterY = radius + saddleHeight
const straightShellLength = length - diameter
const defaultPosition: [number, number, number] = [0, 0, 0]

function HorizontalPressureVessel({ position = defaultPosition }: HorizontalPressureVesselProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[radius, straightShellLength, 16, 48]} />
        <meshStandardMaterial color="#cfd6dc" roughness={0.38} metalness={0.42} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, shellCenterY + radius, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.55, 24]} />
        <meshStandardMaterial color="#9aa4ad" roughness={0.5} metalness={0.35} />
      </mesh>

      <mesh castShadow receiveShadow position={[-1.8, saddleHeight / 2, 0]}>
        <boxGeometry args={[0.55, saddleHeight, 1.35]} />
        <meshStandardMaterial color="#56616b" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.8, saddleHeight / 2, 0]}>
        <boxGeometry args={[0.55, saddleHeight, 1.35]} />
        <meshStandardMaterial color="#56616b" roughness={0.58} metalness={0.18} />
      </mesh>
    </group>
  )
}

export default HorizontalPressureVessel
