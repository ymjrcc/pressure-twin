import { Html } from '@react-three/drei'
import type { DeviceInfo } from '@/data/workshopDevices'
import { labelStyleConfig } from './materialConfigs'

type DeviceLabelProps = Pick<DeviceInfo, 'code' | 'position'>

export default function DeviceLabel({ code, position }: DeviceLabelProps) {
  return (
    <group position={position}>
      <Html center distanceFactor={labelStyleConfig.sizes.deviceDistanceFactor} occlude>
        <div
          style={{
            alignItems: 'center',
            background: labelStyleConfig.device.background,
            border: labelStyleConfig.device.border,
            borderRadius: 5,
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.24), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            color: labelStyleConfig.device.color,
            display: 'flex',
            gap: 5,
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: labelStyleConfig.sizes.deviceFontSize,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1,
            padding: '5px 8px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              background: 'rgba(34, 211, 238, 0.18)',
              border: '1px solid rgba(34, 211, 238, 0.28)',
              borderRadius: 999,
              color: '#a5f3fc',
              fontSize: labelStyleConfig.sizes.deviceBadgeFontSize,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            设备
          </span>
          {code}
        </div>
      </Html>
    </group>
  )
}
