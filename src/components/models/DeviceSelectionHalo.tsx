import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'

import type { DeviceCode, DeviceInfo, DeviceStatus } from '@/data/workshopDevices'

type AbnormalDeviceStatuses = Partial<Record<DeviceCode, Exclude<DeviceStatus, 'normal'>>>

type DeviceSelectionHaloProps = {
  abnormalDeviceStatuses: AbnormalDeviceStatuses
  devices: DeviceInfo[]
  selectedDeviceCode: DeviceCode | null
}

const statusHaloStyle: Record<Exclude<DeviceStatus, 'normal'>, { color: string; fillOpacity: number; rippleOpacity: number; rippleScale: number; speed: number }> = {
  alarm: {
    color: '#ef4444',
    fillOpacity: 0.11,
    rippleOpacity: 0.22,
    rippleScale: 0.3,
    speed: 0.42,
  },
  offline: {
    color: '#dbeafe',
    fillOpacity: 0.11,
    rippleOpacity: 0.17,
    rippleScale: 0.18,
    speed: 0.28,
  },
  warning: {
    color: '#fbbf24',
    fillOpacity: 0.1,
    rippleOpacity: 0.19,
    rippleScale: 0.24,
    speed: 0.36,
  },
}

function getDisplayHaloRadius(deviceCode: DeviceCode, haloRadius: number) {
  if (deviceCode === 'T-201') {
    return haloRadius * 1.18
  }

  return haloRadius
}

function SelectedHalo({
  haloPosition,
  haloRadius,
}: {
  haloPosition: [number, number, number]
  haloRadius: number
}) {
  const ignoreRaycast = () => undefined

  return (
    <group position={haloPosition} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh renderOrder={2} raycast={ignoreRaycast}>
        <circleGeometry args={[haloRadius, 48]} />
        <meshBasicMaterial color="#7dd3fc" depthWrite={false} opacity={0.18} transparent />
      </mesh>
      <mesh renderOrder={3} position={[0, 0, 0.006]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.82, haloRadius, 64]} />
        <meshBasicMaterial color="#7dd3fc" depthWrite={false} opacity={0.92} transparent />
      </mesh>
      <mesh renderOrder={4} position={[0, 0, 0.012]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.56, haloRadius * 0.62, 48]} />
        <meshBasicMaterial color="#bae6fd" depthWrite={false} opacity={0.42} transparent />
      </mesh>
    </group>
  )
}

function StatusHalo({
  haloPosition,
  haloRadius,
  status,
}: {
  haloPosition: [number, number, number]
  haloRadius: number
  status: Exclude<DeviceStatus, 'normal'>
}) {
  const ignoreRaycast = () => undefined
  const fillRef = useRef<Mesh>(null)
  const rippleRefA = useRef<Mesh>(null)
  const rippleRefB = useRef<Mesh>(null)
  const rippleRefC = useRef<Mesh>(null)
  const style = statusHaloStyle[status]
  const rippleConfigs = useMemo(
    () => [
      { offset: 0, ref: rippleRefA },
      { offset: 0.33, ref: rippleRefB },
      { offset: 0.66, ref: rippleRefC },
    ],
    [],
  )

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime * style.speed

    if (fillRef.current) {
      const material = fillRef.current.material
      const fillPulse = (Math.sin(clock.elapsedTime * style.speed * Math.PI * 1.6) + 1) / 2

      if (!Array.isArray(material)) {
        material.opacity = style.fillOpacity + fillPulse * style.fillOpacity * 0.38
      }
    }

    rippleConfigs.forEach((rippleConfig) => {
      if (!rippleConfig.ref.current) {
        return
      }

      const phase = (elapsed + rippleConfig.offset) % 1
      const material = rippleConfig.ref.current.material
      const nextScale = 0.72 + phase * style.rippleScale

      rippleConfig.ref.current.scale.setScalar(nextScale)

      if (!Array.isArray(material)) {
        material.opacity = (1 - phase) * style.rippleOpacity
      }
    })
  })

  return (
    <group position={haloPosition} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={fillRef} renderOrder={0} raycast={ignoreRaycast}>
        <circleGeometry args={[haloRadius * 0.9, 48]} />
        <meshBasicMaterial color={style.color} depthWrite={false} opacity={style.fillOpacity} transparent />
      </mesh>
      <mesh ref={rippleRefA} renderOrder={1} position={[0, 0, 0.004]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.76, haloRadius * 0.9, 64]} />
        <meshBasicMaterial color={style.color} depthWrite={false} opacity={style.rippleOpacity} transparent />
      </mesh>
      <mesh ref={rippleRefB} renderOrder={1} position={[0, 0, 0.007]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.76, haloRadius * 0.9, 64]} />
        <meshBasicMaterial color={style.color} depthWrite={false} opacity={style.rippleOpacity} transparent />
      </mesh>
      <mesh ref={rippleRefC} renderOrder={1} position={[0, 0, 0.01]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.76, haloRadius * 0.9, 64]} />
        <meshBasicMaterial color={style.color} depthWrite={false} opacity={style.rippleOpacity} transparent />
      </mesh>
    </group>
  )
}

export default function DeviceSelectionHalo({ abnormalDeviceStatuses, devices, selectedDeviceCode }: DeviceSelectionHaloProps) {
  const selectedDevice = devices.find((device) => device.code === selectedDeviceCode)

  return (
    <>
      {devices.map((device) => {
        const status = abnormalDeviceStatuses[device.code]

        if (!status) {
          return null
        }

        const haloRadius = getDisplayHaloRadius(device.code, device.haloRadius)

        return (
          <StatusHalo
            key={`status-halo-${device.code}`}
            haloPosition={device.haloPosition}
            haloRadius={haloRadius}
            status={status}
          />
        )
      })}
      {selectedDevice ? (
        <SelectedHalo
          haloPosition={selectedDevice.haloPosition}
          haloRadius={getDisplayHaloRadius(selectedDevice.code, selectedDevice.haloRadius)}
        />
      ) : null}
    </>
  )
}
