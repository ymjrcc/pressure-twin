import { devices, type DeviceCode } from '@/data/workshopDevices'

type DeviceSelectionHaloProps = {
  selectedDeviceCode: DeviceCode | null
}

export default function DeviceSelectionHalo({ selectedDeviceCode }: DeviceSelectionHaloProps) {
  const selectedDevice = devices.find((device) => device.code === selectedDeviceCode)

  if (!selectedDevice) {
    return null
  }

  const { haloPosition, haloRadius } = selectedDevice
  const ignoreRaycast = () => undefined

  return (
    <group position={haloPosition} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh renderOrder={2} raycast={ignoreRaycast}>
        <circleGeometry args={[haloRadius, 48]} />
        <meshBasicMaterial color="#38bdf8" depthWrite={false} opacity={0.12} transparent />
      </mesh>
      <mesh renderOrder={3} position={[0, 0, 0.006]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.82, haloRadius, 64]} />
        <meshBasicMaterial color="#7dd3fc" depthWrite={false} opacity={0.78} transparent />
      </mesh>
      <mesh renderOrder={4} position={[0, 0, 0.012]} raycast={ignoreRaycast}>
        <ringGeometry args={[haloRadius * 0.56, haloRadius * 0.62, 48]} />
        <meshBasicMaterial color="#ecfeff" depthWrite={false} opacity={0.28} transparent />
      </mesh>
    </group>
  )
}
