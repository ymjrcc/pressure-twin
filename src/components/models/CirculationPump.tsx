import type { ThreeElements } from '@react-three/fiber'

type CirculationPumpProps = {
  position?: ThreeElements['group']['position']
}

const defaultPosition: [number, number, number] = [0, 0, 0]

function CirculationPump({ position = defaultPosition }: CirculationPumpProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[1.55, 0.16, 0.86]} />
        <meshStandardMaterial color="#40505a" roughness={0.6} metalness={0.18} />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.38, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 0.7, 32]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.42} metalness={0.22} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.38, 0.52, 0]}>
        <sphereGeometry args={[0.38, 32, 18]} />
        <meshStandardMaterial color="#6d28d9" roughness={0.42} metalness={0.24} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.82, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.52, 24]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.48} metalness={0.24} />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.88, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.44, 24]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.48} metalness={0.24} />
      </mesh>

      <mesh castShadow receiveShadow position={[0.38, 0.24, 0]}>
        <boxGeometry args={[0.54, 0.28, 0.5]} />
        <meshStandardMaterial color="#4b5563" roughness={0.58} metalness={0.18} />
      </mesh>
    </group>
  )
}

export default CirculationPump
