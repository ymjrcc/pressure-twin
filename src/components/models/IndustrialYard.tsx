import { useEffect, useMemo, useRef } from 'react'
import { Object3D, type InstancedMesh } from 'three'

type GroundPanelProps = {
  color: string
  opacity?: number
  position: [number, number, number]
  size: [number, number]
}

type YardLineProps = {
  color?: string
  position: [number, number, number]
  size: [number, number]
}

type YardBoxProps = {
  color: string
  position: [number, number, number]
  size: [number, number, number]
}

const ignoreRaycast = () => undefined

const treeInstances = [
  [-13.6, -11.4, 3.0, 0.78],
  [-17.2, -4.8, 3.35, 0.88],
  [-15.4, 5.5, 3.12, 0.82],
  [-12.8, 11.6, 3.28, 0.86],
  [13.6, -12.2, 3.18, 0.84],
  [17.2, -5.9, 3.04, 0.78],
  [16.0, 5.2, 3.42, 0.9],
  [12.9, 11.2, 3.14, 0.82],
  [-6.4, -18.0, 3.08, 0.8],
  [0.6, -19.2, 3.36, 0.88],
  [7.4, -17.8, 3.18, 0.84],
  [18.4, 14.8, 3.26, 0.86],
] as const

function GroundPanel({ color, opacity, position, size }: GroundPanelProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={ignoreRaycast}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} opacity={opacity} roughness={0.88} transparent={opacity !== undefined} />
    </mesh>
  )
}

function YardLine({ color = '#f8fafc', position, size }: YardLineProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} raycast={ignoreRaycast}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function YardBox({ color, position, size }: YardBoxProps) {
  return (
    <mesh position={position} receiveShadow raycast={ignoreRaycast}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.76} metalness={0.04} />
    </mesh>
  )
}

function InstancedTrees() {
  const trunkRef = useRef<InstancedMesh>(null)
  const crownRef = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])

  useEffect(() => {
    const trunks = trunkRef.current
    const crowns = crownRef.current

    if (!trunks || !crowns) {
      return
    }

    treeInstances.forEach(([x, z, height, crownRadius], index) => {
      const trunkHeight = height * 0.42
      const crownHeight = height * 0.7

      dummy.position.set(x, trunkHeight / 2, z)
      dummy.scale.set(1, trunkHeight, 1)
      dummy.updateMatrix()
      trunks.setMatrixAt(index, dummy.matrix)

      dummy.position.set(x, trunkHeight + crownHeight / 2 - 0.12, z)
      dummy.scale.set(crownRadius, crownHeight, crownRadius)
      dummy.updateMatrix()
      crowns.setMatrixAt(index, dummy.matrix)
    })

    trunks.instanceMatrix.needsUpdate = true
    crowns.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, treeInstances.length]} raycast={ignoreRaycast}>
        <cylinderGeometry args={[0.08, 0.11, 1, 8]} />
        <meshStandardMaterial color="#6b4b32" roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, treeInstances.length]} raycast={ignoreRaycast}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#3f7a55" roughness={0.86} />
      </instancedMesh>
    </group>
  )
}

function RoadMarkings() {
  return (
    <group>
      <YardLine color="#d9dee2" position={[0, -0.006, 13.9]} size={[13.8, 0.12]} />
      <YardLine color="#d9dee2" position={[0, -0.006, 17.8]} size={[13.8, 0.12]} />
      {[-5.8, -3.5, -1.2, 1.1, 3.4, 5.7].map((x) => (
        <YardLine key={`parking-line-${x}`} color="#e5e7eb" position={[x, -0.005, 15.85]} size={[0.1, 3.55]} />
      ))}
      <YardLine color="#facc15" position={[-9.4, -0.004, 0]} size={[0.12, 13.4]} />
      <YardLine color="#facc15" position={[9.4, -0.004, 0]} size={[0.12, 13.4]} />
      <YardLine color="#eab308" position={[0, -0.004, -7.35]} size={[18.2, 0.12]} />
    </group>
  )
}

function DistantBuildings() {
  return (
    <group>
      <YardBox color="#a7b3bb" position={[-22.5, 1.95, -23.2]} size={[10.6, 3.9, 3.4]} />
      <YardBox color="#83909a" position={[-22.5, 4.02, -23.2]} size={[11.1, 0.28, 3.7]} />
      <YardBox color="#b8c2c9" position={[21.2, 1.65, -22.4]} size={[8.8, 3.3, 3.0]} />
      <YardBox color="#7d8a94" position={[21.2, 3.42, -22.4]} size={[9.3, 0.26, 3.3]} />
      <YardBox color="#8f9aa2" position={[0, 0.7, -25.8]} size={[34, 1.4, 0.34]} />
      <YardBox color="#8f9aa2" position={[-27.5, 0.7, -4]} size={[0.34, 1.4, 24]} />
      <YardBox color="#8f9aa2" position={[27.5, 0.7, -4]} size={[0.34, 1.4, 24]} />
    </group>
  )
}

export default function IndustrialYard() {
  return (
    <group>
      <GroundPanel color="#9aa3aa" position={[0, -0.025, 0]} size={[64, 48]} />
      <GroundPanel color="#6f777e" position={[0, -0.018, 15.85]} size={[25, 5.2]} />
      <GroundPanel color="#7f878e" opacity={0.72} position={[0, -0.016, -8.2]} size={[20.5, 2.25]} />
      <RoadMarkings />
      <DistantBuildings />
      <InstancedTrees />
    </group>
  )
}
