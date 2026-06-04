import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'

type PipePoint = readonly [number, number, number]

type PipeSegmentProps = {
  color: string
  end: PipePoint
  radius: number
  start: PipePoint
}

type PipeRouteProps = {
  connectorColor?: string
  points: readonly PipePoint[]
  pipeColor?: string
  radius?: number
}

const pipeColor = '#22c7b8'
const connectorColor = '#334155'
const segmentRadius = 0.085
const connectorRadius = 0.135
const yAxis = new Vector3(0, 1, 0)

const routes: readonly PipePoint[][] = [
  [
    [3.25, 1.2, 3],
    [3.25, 1.8, 3],
    [0.65, 1.8, 2.4],
    [0.65, 0.55, 2.4],
  ],
  [
    [-1.1, 0.55, 2.4],
    [-1.1, 1.45, 2.4],
    [-2.75, 1.45, 1.8],
    [-2.75, 0.75, 1.8],
  ],
  [
    [-5.25, 1.25, 1.8],
    [-5.25, 2.1, 1.8],
    [-3.5, 2.1, -3.8],
    [-3.5, 2.35, -3.8],
  ],
  [
    [-0.55, 1.35, -3.8],
    [0.55, 1.35, -3.8],
  ],
]

function PipeSegment({ color, end, radius, start }: PipeSegmentProps) {
  const { center, length, quaternion } = useMemo(() => {
    const startVector = new Vector3(...start)
    const endVector = new Vector3(...end)
    const direction = endVector.clone().sub(startVector)
    const length = direction.length()
    const center = startVector.clone().add(endVector).multiplyScalar(0.5)
    const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction.normalize())

    return { center, length, quaternion }
  }, [end, start])

  if (length <= 0) {
    return null
  }

  return (
    <mesh castShadow receiveShadow position={center} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 24]} />
      <meshStandardMaterial color={color} roughness={0.36} metalness={0.32} />
    </mesh>
  )
}

function PipeConnector({ color, position }: { color: string; position: PipePoint }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <sphereGeometry args={[connectorRadius, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.28} />
    </mesh>
  )
}

function PipeRoute({
  connectorColor: routeConnectorColor = connectorColor,
  pipeColor: routePipeColor = pipeColor,
  points,
  radius = segmentRadius,
}: PipeRouteProps) {
  return (
    <group>
      {points.slice(0, -1).map((point, index) => (
        <PipeSegment
          key={`pipe-segment-${index}`}
          color={routePipeColor}
          end={points[index + 1]}
          radius={radius}
          start={point}
        />
      ))}

      {points.map((point, index) => (
        <PipeConnector key={`pipe-connector-${index}`} color={routeConnectorColor} position={point} />
      ))}
    </group>
  )
}

function ProcessPipeline() {
  return (
    <group>
      {routes.map((points, index) => (
        <PipeRoute key={`process-route-${index}`} points={points} />
      ))}
    </group>
  )
}

export default ProcessPipeline
