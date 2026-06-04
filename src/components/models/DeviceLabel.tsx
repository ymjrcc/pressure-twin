import { Html } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'

type DeviceLabelProps = {
  index: number
  code?: string
  name: string
  model?: string
  position: ThreeElements['group']['position']
}

function DeviceLabel({ index, code, name, model, position }: DeviceLabelProps) {
  return (
    <group position={position}>
      <Html center distanceFactor={10} occlude>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 16,
            // minWidth: 148,
            padding: '8px 16px',
            border: '1px solid rgba(226, 232, 240, 0.2)',
            borderRadius: 8,
            background: 'rgba(15, 23, 42, 0.78)',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.28)',
            color: '#f8fafc',
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 13,
            lineHeight: 1.25,
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            textAlign: 'left',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              background: '#facc15',
              borderRadius: 999,
              color: '#172033',
              display: 'flex',
              flex: '0 0 auto',
              fontSize: 14,
              fontWeight: 800,
              height: 26,
              justifyContent: 'center',
              width: 26,
            }}
          >
            {index}
          </div>
          <div>
            {code ? <div style={{ fontSize: 14, fontWeight: 800 }}>{code}</div> : null}
            <div style={{ marginTop: code ? 2 : 0, fontSize: 13, fontWeight: code ? 600 : 800 }}>{name}</div>
            {model ? <div style={{ marginTop: 2, color: '#cbd5e1', fontSize: 12 }}>{model}</div> : null}
          </div>
        </div>
      </Html>
    </group>
  )
}

export default DeviceLabel
