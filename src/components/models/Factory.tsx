import { useMemo } from 'react'

const floorWidth = 18
const floorDepth = 14
const gridStep = 1
const wallHeight = 6
const wallThickness = 0.18
const halfFloorWidth = floorWidth / 2
const halfFloorDepth = floorDepth / 2
const windowWidth = 2.8
const windowHeight = 1.5
const windowCenterY = 3.55
const windowBottomY = windowCenterY - windowHeight / 2
const windowTopY = windowCenterY + windowHeight / 2
const leftWindowX = -3
const rightWindowX = 3
const leftWindowLeft = leftWindowX - windowWidth / 2
const leftWindowRight = leftWindowX + windowWidth / 2
const rightWindowLeft = rightWindowX - windowWidth / 2
const rightWindowRight = rightWindowX + windowWidth / 2

function WallMaterial() {
  return <meshStandardMaterial color="#c7d0d6" roughness={0.78} transparent opacity={0.5} />
}

function RectangularGrid() {
  const positions = useMemo(() => {
    const points: number[] = []
    const halfWidth = floorWidth / 2
    const halfDepth = floorDepth / 2
    const y = 0.012

    for (let x = -halfWidth; x <= halfWidth; x += gridStep) {
      points.push(x, y, -halfDepth, x, y, halfDepth)
    }

    for (let z = -halfDepth; z <= halfDepth; z += gridStep) {
      points.push(-halfWidth, y, z, halfWidth, y, z)
    }

    return new Float32Array(points)
  }, [])

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#67727c" />
    </lineSegments>
  )
}

function FactoryFloor() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[floorWidth, floorDepth]} />
        <meshStandardMaterial color="#767f86" roughness={0.9} metalness={0.04} />
      </mesh>

      <RectangularGrid />
    </group>
  )
}

function FactoryShell() {
  return (
    <group>
      <BackWall />
      <mesh receiveShadow position={[-halfFloorWidth, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, floorDepth]} />
        <WallMaterial />
      </mesh>
      <mesh receiveShadow position={[halfFloorWidth, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, floorDepth]} />
        <WallMaterial />
      </mesh>

      <FactoryRoof />
      <FactoryWindows />
      <FactoryFrame />
      <CeilingLights />
    </group>
  )
}

function BackWall() {
  return (
    <group>
      {[
        { x: (-halfFloorWidth + leftWindowLeft) / 2, width: leftWindowLeft + halfFloorWidth },
        { x: (leftWindowRight + rightWindowLeft) / 2, width: rightWindowLeft - leftWindowRight },
        { x: (rightWindowRight + halfFloorWidth) / 2, width: halfFloorWidth - rightWindowRight },
      ].map(({ x, width }) => (
        <mesh key={`back-wall-full-${x}`} receiveShadow position={[x, wallHeight / 2, -halfFloorDepth]}>
          <boxGeometry args={[width, wallHeight, wallThickness]} />
          <WallMaterial />
        </mesh>
      ))}
      {[leftWindowX, rightWindowX].map((x) => (
        <group key={`back-window-wall-${x}`}>
          <mesh receiveShadow position={[x, windowBottomY / 2, -halfFloorDepth]}>
            <boxGeometry args={[windowWidth, windowBottomY, wallThickness]} />
            <WallMaterial />
          </mesh>
          <mesh receiveShadow position={[x, windowTopY + (wallHeight - windowTopY) / 2, -halfFloorDepth]}>
            <boxGeometry args={[windowWidth, wallHeight - windowTopY, wallThickness]} />
            <WallMaterial />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FactoryRoof() {
  return (
    <mesh receiveShadow position={[0, wallHeight + 0.08, 0]}>
      <boxGeometry args={[floorWidth, 0.16, floorDepth]} />
      <meshStandardMaterial color="#b8c1c8" roughness={0.72} metalness={0.04} transparent opacity={0.32} />
    </mesh>
  )
}

function FactoryWindows() {
  return (
    <group>
      {[leftWindowX, rightWindowX].map((x) => (
        <FactoryWindow key={`back-window-${x}`} position={[x, windowCenterY, -halfFloorDepth + 0.12]} />
      ))}
    </group>
  )
}

function FactoryWindow({ position }: { position: [number, number, number] }) {
  const frameColor = '#7d8b95'

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.42, 1.16, 0.035]} />
        <meshStandardMaterial color="#9bd3e6" roughness={0.12} metalness={0.04} transparent opacity={0.36} />
      </mesh>
      <mesh position={[0, 0.69, 0.025]}>
        <boxGeometry args={[2.78, 0.12, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, -0.69, 0.025]}>
        <boxGeometry args={[2.78, 0.12, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[-1.36, 0, 0.025]}>
        <boxGeometry args={[0.12, 1.5, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[1.36, 0, 0.025]}>
        <boxGeometry args={[0.12, 1.5, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.1, 1.38, 0.075]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[2.66, 0.09, 0.075]} />
        <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.18} />
      </mesh>
    </group>
  )
}

function FactoryFrame() {
  return (
    <group>
      {[-7.6, 7.6].map((x) => (
        <mesh key={`back-column-${x}`} castShadow receiveShadow position={[x, wallHeight / 2, -halfFloorDepth + 0.18]}>
          <boxGeometry args={[0.22, wallHeight, 0.32]} />
          <meshStandardMaterial color="#9aa6ae" roughness={0.5} metalness={0.12} />
        </mesh>
      ))}
      {[-5.8, 6].map((z) => (
        <mesh key={`side-column-${z}`} castShadow receiveShadow position={[-halfFloorWidth + 0.18, wallHeight / 2, z]}>
          <boxGeometry args={[0.32, wallHeight, 0.22]} />
          <meshStandardMaterial color="#9aa6ae" roughness={0.5} metalness={0.12} />
        </mesh>
      ))}
      {[-5.8, 6].map((z) => (
        <mesh key={`right-column-${z}`} castShadow receiveShadow position={[halfFloorWidth - 0.18, wallHeight / 2, z]}>
          <boxGeometry args={[0.32, wallHeight, 0.22]} />
          <meshStandardMaterial color="#9aa6ae" roughness={0.5} metalness={0.12} />
        </mesh>
      ))}

      <mesh castShadow receiveShadow position={[0, 5.75, -halfFloorDepth + 0.28]}>
        <boxGeometry args={[floorWidth, 0.28, 0.36]} />
        <meshStandardMaterial color="#a8b2b9" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[-halfFloorWidth + 0.28, 5.75, 0]}>
        <boxGeometry args={[0.36, 0.28, floorDepth]} />
        <meshStandardMaterial color="#a8b2b9" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[halfFloorWidth - 0.28, 5.75, 0]}>
        <boxGeometry args={[0.36, 0.28, floorDepth]} />
        <meshStandardMaterial color="#a8b2b9" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 5.55, 0]}>
        <boxGeometry args={[0.3, 0.22, floorDepth]} />
        <meshStandardMaterial color="#a8b2b9" roughness={0.5} metalness={0.12} />
      </mesh>
    </group>
  )
}

function CeilingLights() {
  return (
    <group>
      {[-4.8, 0, 4.8].map((x) => (
        <group key={`ceiling-light-${x}`} position={[x, 5.25, -1.2]}>
          <mesh>
            <boxGeometry args={[2.2, 0.12, 0.36]} />
            <meshStandardMaterial color="#f8fafc" emissive="#fff7c2" emissiveIntensity={1.6} roughness={0.2} />
          </mesh>
          <pointLight position={[0, -0.1, 0]} intensity={1.25} distance={7} color="#fff3bd" />
        </group>
      ))}
    </group>
  )
}

function Factory() {
  return (
    <>
      <FactoryFloor />
      <FactoryShell />
    </>
  )
}

export default Factory
