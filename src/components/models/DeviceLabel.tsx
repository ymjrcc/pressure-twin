import { Html } from '@react-three/drei'
import type { DeviceInfo } from '@/data/workshopDevices'

type DeviceLabelProps = Pick<DeviceInfo, 'code' | 'position'>

export default function DeviceLabel({ code, position }: DeviceLabelProps) {
  return (
    <group position={position}>
      <Html center distanceFactor={8} occlude>
        <div
          style={{
            alignItems: 'center',
            background: 'rgba(186, 230, 253, 0.96)',
            border: '1px solid rgba(14, 116, 144, 0.42)',
            borderRadius: 6,
            boxShadow: '0 6px 18px rgba(14, 116, 144, 0.24), 0 0 0 2px rgba(255, 255, 255, 0.18)',
            color: '#172033',
            display: 'flex',
            gap: 5,
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 12,
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
              background: 'rgba(23, 32, 51, 0.9)',
              borderRadius: 999,
              color: '#7dd3fc',
              fontSize: 10,
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
