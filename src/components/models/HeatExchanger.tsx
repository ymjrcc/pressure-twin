import type { ThreeElements } from '@react-three/fiber'

type HeatExchangerProps = {
  position?: ThreeElements['group']['position']
}

const diameter = 0.8
const length = 2.8
const radius = diameter / 2
const saddleHeight = 0.22
const shellCenterY = radius + saddleHeight
const defaultPosition: [number, number, number] = [0, 0, 0]

function HeatExchanger({ position = defaultPosition }: HeatExchangerProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, length, 36]} />
        <meshStandardMaterial color="#b9c5cc" roughness={0.4} metalness={0.44} />
      </mesh>

      <mesh castShadow receiveShadow position={[-length / 2 - 0.08, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.16, 36]} />
        <meshStandardMaterial color="#8fa0aa" roughness={0.45} metalness={0.36} />
      </mesh>
      <mesh castShadow receiveShadow position={[length / 2 + 0.08, shellCenterY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.16, 36]} />
        <meshStandardMaterial color="#8fa0aa" roughness={0.45} metalness={0.36} />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.75, shellCenterY + radius, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.36, 20]} />
        <meshStandardMaterial color="#6e7d86" roughness={0.52} metalness={0.32} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.75, shellCenterY + radius, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.36, 20]} />
        <meshStandardMaterial color="#6e7d86" roughness={0.52} metalness={0.32} />
      </mesh>

      <mesh castShadow receiveShadow position={[-0.9, saddleHeight / 2, 0]}>
        <boxGeometry args={[0.28, saddleHeight, 0.72]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.9, saddleHeight / 2, 0]}>
        <boxGeometry args={[0.28, saddleHeight, 0.72]} />
        <meshStandardMaterial color="#596771" roughness={0.58} metalness={0.18} />
      </mesh>
    </group>
  )
}

export default HeatExchanger
