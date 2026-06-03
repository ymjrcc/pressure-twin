import type { ThreeElements } from '@react-three/fiber'

type ScalePersonProps = {
  position?: ThreeElements['group']['position']
}

const defaultPosition: [number, number, number] = [-5.1, 0, -5.1]

function ScalePerson({ position = defaultPosition }: ScalePersonProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.9, 18]} />
        <meshStandardMaterial color="#26323d" roughness={0.62} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.12, 0]}>
        <capsuleGeometry args={[0.22, 0.56, 8, 18]} />
        <meshStandardMaterial color="#2563eb" roughness={0.48} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshStandardMaterial color="#f0c7a1" roughness={0.52} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.03, 0.04]}>
        <boxGeometry args={[0.44, 0.06, 0.24]} />
        <meshStandardMaterial color="#1f2933" roughness={0.68} />
      </mesh>
    </group>
  )
}

export default ScalePerson
