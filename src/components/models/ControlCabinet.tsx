import type { ThreeElements } from '@react-three/fiber'

type ControlCabinetProps = {
  position?: ThreeElements['group']['position']
}

const defaultPosition: [number, number, number] = [0, 0, 0]

function ControlCabinet({ position = defaultPosition }: ControlCabinetProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[1.05, 2.1, 0.42]} />
        <meshStandardMaterial color="#23656f" roughness={0.5} metalness={0.16} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 1.12, 0.215]}>
        <boxGeometry args={[0.88, 1.55, 0.035]} />
        <meshStandardMaterial color="#e7edf2" roughness={0.46} metalness={0.08} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 1.62, 0.24]}>
        <boxGeometry args={[0.58, 0.26, 0.04]} />
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.1} />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.26, 1.13, 0.25]}>
        <sphereGeometry args={[0.07, 18, 12]} />
        <meshStandardMaterial color="#22c55e" roughness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.13, 0.25]}>
        <sphereGeometry args={[0.07, 18, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.26, 1.13, 0.25]}>
        <sphereGeometry args={[0.07, 18, 12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[1.16, 0.1, 0.5]} />
        <meshStandardMaterial color="#18434a" roughness={0.62} metalness={0.18} />
      </mesh>
    </group>
  )
}

export default ControlCabinet
