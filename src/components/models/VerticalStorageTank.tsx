import type { ThreeElements } from '@react-three/fiber'

type VerticalStorageTankProps = {
  position?: ThreeElements['group']['position']
}

const diameter = 2.5
const height = 4
const radius = diameter / 2
const defaultPosition: [number, number, number] = [0, 0, 0]

function VerticalStorageTank({ position = defaultPosition }: VerticalStorageTankProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial color="#d8dde2" roughness={0.42} metalness={0.36} />
      </mesh>
    </group>
  )
}

export default VerticalStorageTank
