import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Object3D, Quaternion, Vector3, type InstancedMesh } from 'three'

import { Flange, PipeSupport, PressureGauge, Transmitter, Valve, type PipePoint } from './ProcessFittings'

type PipeRoute = {
  points: readonly PipePoint[]
}

type PipeSegmentProps = {
  end: PipePoint
  start: PipePoint
}

type FlowParticlesProps = {
  length: number
}

type InstrumentTagProps = {
  code: string
  position: PipePoint
}

const processColor = '#0891b2'
const processHighlightColor = '#22d3ee'
const elbowColor = '#0f6f83'
const segmentRadius = 0.1
const elbowRadius = 0.145
const particleRadius = 0.034
const particleSpeed = 0.55
const yAxis = new Vector3(0, 1, 0)

const routes: readonly PipeRoute[] = [
  {
    points: [
      [4.2, 1.22, 2.3],
      [3.5, 1.22, 2.3],
      [3.5, 0.56, 1.8],
      [3.04, 0.56, 1.8],
    ],
  },
  {
    points: [
      [0.16, 0.52, 1.8],
      [-1.02, 0.72, 1.5],
    ],
  },
  {
    points: [
      [-5.42, 0.72, 1.5],
      [-7.45, 0.72, 1.5],
      [-7.45, 0.72, -3.2],
      [-7.45, 1.35, -3.2],
      [-7.2, 1.35, -3.2],
    ],
  },
  {
    points: [
      [-1.2, 1.35, -3.2],
      [-0.2, 1.35, -3.2],
      [0.8, 1.35, -3.2],
    ],
  },
  {
    points: [
      [5.62, 1.35, -3.2],
      [6.68, 1.35, -3.2],
      [6.68, 2.74, -1.05],
      [6.55, 2.74, 2.3],
      [6.2, 2.78, 2.3],
    ],
  },
]

const valvePoints: readonly PipePoint[] = [
  [3.5, 1.22, 2.3],
  [3.5, 0.56, 1.8],
  [-7.45, 0.72, 1.5],
  [-7.45, 1.35, -3.2],
  [-0.2, 1.35, -3.2],
  [6.68, 1.35, -3.2],
  [6.55, 2.74, 2.3],
]

const supportPoints: readonly PipePoint[] = [
  [3.22, 0.56, 1.8],
  [-0.43, 0.62, 1.65],
  [-7.45, 0.72, -0.9],
  [0.0, 1.35, -3.2],
  [6.68, 1.35, -2.3],
  [6.55, 2.74, 0.65],
]

const exchangerInstrumentSets: readonly {
  gaugeCode: string
  gauge: PipePoint
  transmitterCode: string
  transmitter: PipePoint
}[] = [
  {
    gaugeCode: 'PG-201',
    gauge: [-6.05, 0.82, 1.5],
    transmitterCode: 'PT-201',
    transmitter: [-5.62, 0.82, 1.5],
  },
  {
    gaugeCode: 'PG-202',
    gauge: [-0.25, 0.59, 1.7],
    transmitterCode: 'PT-202',
    transmitter: [-0.61, 0.65, 1.61],
  },
]

function pointsEqual(left: PipePoint, right: PipePoint) {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2]
}

function getSegmentFrame(start: PipePoint, end: PipePoint) {
  const startVector = new Vector3(...start)
  const endVector = new Vector3(...end)
  const direction = endVector.clone().sub(startVector)
  const length = direction.length()
  const center = startVector.clone().add(endVector).multiplyScalar(0.5)
  const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction.clone().normalize())

  return { center, direction, length, quaternion, startVector }
}

function getDirectionAtPoint(points: readonly PipePoint[], point: PipePoint) {
  const index = points.findIndex((routePoint) => pointsEqual(routePoint, point))
  const next = points[index + 1]
  const previous = points[index - 1]

  if (next) {
    return new Vector3(...next).sub(new Vector3(...point)).normalize()
  }

  if (previous) {
    return new Vector3(...point).sub(new Vector3(...previous)).normalize()
  }

  return yAxis
}

function getRouteForPoint(point: PipePoint) {
  return routes.find(({ points }) => points.some((routePoint) => pointsEqual(routePoint, point)))
}

function FlowParticles({ length }: FlowParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const particleCount = useMemo(() => Math.max(2, Math.floor(length / 0.42)), [length])
  const offsets = useMemo(
    () => Array.from({ length: particleCount }, (_, index) => (index / particleCount) * length),
    [length, particleCount],
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current

    if (!mesh) {
      return
    }

    const travel = clock.getElapsedTime() * particleSpeed

    offsets.forEach((offset, index) => {
      const localY = ((offset + travel) % length) - length / 2
      const scale = index % 3 === 0 ? 1.12 : 0.92

      dummy.position.set(0, localY, 0)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]} frustumCulled={false}>
      <sphereGeometry args={[particleRadius, 12, 8]} />
      <meshStandardMaterial
        color="#ecfeff"
        emissive="#22d3ee"
        emissiveIntensity={0.8}
        roughness={0.18}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  )
}

function PipeSegment({ end, start }: PipeSegmentProps) {
  const { center, length, quaternion } = useMemo(() => getSegmentFrame(start, end), [end, start])

  if (length <= 0) {
    return null
  }

  return (
    <group position={center} quaternion={quaternion}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[segmentRadius, segmentRadius, length, 28]} />
        <meshStandardMaterial
          color={processColor}
          depthWrite={false}
          emissive="#036475"
          emissiveIntensity={0.18}
          metalness={0.28}
          opacity={0.36}
          roughness={0.2}
          transparent
        />
      </mesh>
      <FlowParticles length={length} />
    </group>
  )
}

function PipeElbow({ position }: { position: PipePoint }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[elbowRadius, 28, 18]} />
        <meshStandardMaterial color={elbowColor} depthWrite={false} opacity={0.38} roughness={0.26} metalness={0.3} transparent />
      </mesh>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[segmentRadius * 0.75, 18, 12]} />
        <meshStandardMaterial
          color={processHighlightColor}
          depthWrite={false}
          emissive="#06b6d4"
          emissiveIntensity={0.28}
          opacity={0.48}
          roughness={0.24}
          metalness={0.2}
          transparent
        />
      </mesh>
    </group>
  )
}

function PipeRoute({ points }: PipeRoute) {
  return (
    <group>
      {points.slice(0, -1).map((point, index) => (
        <PipeSegment key={`pipe-segment-${index}`} start={point} end={points[index + 1]} />
      ))}
      {points.slice(1, -1).map((point, index) => (
        <PipeElbow key={`pipe-elbow-${index}`} position={point} />
      ))}
      {[points[0], points[points.length - 1]].map((point, index) => (
        <Flange key={`pipe-flange-${index}`} position={point} direction={getDirectionAtPoint(points, point).toArray() as PipePoint} />
      ))}
    </group>
  )
}

function InstrumentTag({ code, position }: InstrumentTagProps) {
  return (
    <group position={position}>
      <Html center distanceFactor={8} occlude>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(226, 232, 240, 0.28)',
            borderRadius: 4,
            color: '#f8fafc',
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1,
            padding: '4px 7px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {code}
        </div>
      </Html>
    </group>
  )
}

function ProcessPipeline() {
  return (
    <group>
      {routes.map((route, index) => (
        <PipeRoute key={`process-route-${index}`} points={route.points} />
      ))}
      {valvePoints.map((point, index) => {
        const route = getRouteForPoint(point)
        const direction = route ? getDirectionAtPoint(route.points, point) : yAxis

        return <Valve key={`pipe-valve-${index}`} position={point} direction={direction.toArray() as PipePoint} />
      })}
      {supportPoints.map((point, index) => (
        <PipeSupport key={`pipe-support-${index}`} position={point} />
      ))}
      {exchangerInstrumentSets.map(({ gauge, gaugeCode, transmitter, transmitterCode }, index) => (
        <group key={`exchanger-pipe-instruments-${index}`}>
          <PressureGauge position={gauge} />
          <InstrumentTag code={gaugeCode} position={[gauge[0], gauge[1] + 0.76, gauge[2] + 0.1]} />
          <Transmitter position={transmitter} />
          <InstrumentTag code={transmitterCode} position={[transmitter[0], transmitter[1] + 0.66, transmitter[2] + 0.1]} />
        </group>
      ))}
    </group>
  )
}

export default ProcessPipeline
