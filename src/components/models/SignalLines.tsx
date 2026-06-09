import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'

import type { PipePoint } from './ProcessFittings'
import { pipeMaterialConfig } from './materialConfigs'

type SignalRoute = {
  points: readonly PipePoint[]
}

type SignalSegmentProps = {
  end: PipePoint
  start: PipePoint
}

const yAxis = new Vector3(0, 1, 0)

const signalRoutes: readonly SignalRoute[] = [
  { points: [[-0.9, 0.16, 5.28], [-0.61, 0.16, 5.28], [-0.61, 0.16, 1.61], [-0.61, 1.08, 1.61]] },
  { points: [[-0.9, 0.18, 5.44], [5.2, 0.18, 5.44], [5.2, 0.18, 2.3], [5.2, 3.9, 2.3]] },
  { points: [[-0.9, 0.14, 5.12], [-5.62, 0.14, 5.12], [-5.62, 0.14, 1.5], [-5.62, 1.26, 1.5]] },
  { points: [[-0.9, 0.12, 4.96], [-4.2, 0.12, 4.96], [-4.2, 0.12, -3.2], [-4.2, 2.85, -3.2]] },
  { points: [[-0.9, 0.1, 4.8], [2.6, 0.1, 4.8], [2.6, 0.1, -3.2], [2.6, 2.85, -3.2]] },
]

function getSegmentFrame(start: PipePoint, end: PipePoint) {
  const startVector = new Vector3(...start)
  const endVector = new Vector3(...end)
  const direction = endVector.clone().sub(startVector)
  const length = direction.length()
  const center = startVector.clone().add(endVector).multiplyScalar(0.5)
  const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction.clone().normalize())

  return { center, direction, length, quaternion }
}

function SignalSegment({ end, start }: SignalSegmentProps) {
  const dashParts = useMemo(() => {
    const { direction, length, quaternion } = getSegmentFrame(start, end)
    const startVector = new Vector3(...start)
    const unit = direction.clone().normalize()
    const dashLength = 0.16
    const gap = 0.13
    const count = Math.max(1, Math.floor(length / (dashLength + gap)))

    return Array.from({ length: count }, (_, index) => {
      const offset = Math.min(index * (dashLength + gap) + dashLength / 2, length)
      const center = startVector.clone().add(unit.clone().multiplyScalar(offset))

      return { center, length: Math.min(dashLength, length), quaternion }
    })
  }, [end, start])

  return (
    <group>
      {dashParts.map(({ center, length, quaternion }, index) => (
        <mesh key={`signal-dash-${index}`} castShadow receiveShadow position={center} quaternion={quaternion}>
          <cylinderGeometry args={[0.012, 0.012, length, 8]} />
          <meshStandardMaterial
            color={pipeMaterialConfig.signal.color}
            depthWrite={false}
            emissive={pipeMaterialConfig.signal.emissive}
            emissiveIntensity={pipeMaterialConfig.signal.emissiveIntensity}
            metalness={0.1}
            opacity={pipeMaterialConfig.signal.opacity}
            roughness={0.38}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

function SignalLines() {
  return (
    <group>
      {signalRoutes.map(({ points }, routeIndex) => (
        <group key={`signal-route-${routeIndex}`}>
          {points.slice(0, -1).map((point, pointIndex) => (
            <SignalSegment key={`signal-segment-${routeIndex}-${pointIndex}`} start={point} end={points[pointIndex + 1]} />
          ))}
        </group>
      ))}
    </group>
  )
}

export default SignalLines
