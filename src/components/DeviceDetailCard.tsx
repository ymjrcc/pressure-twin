import DeviceMiniPreview from '@/components/DeviceMiniPreview'
import { devices, type DeviceCode, type DeviceStatus } from '@/data/workshopDevices'

type DeviceDetailCardProps = {
  onClose: () => void
  selectedDeviceCode: DeviceCode | null
}

const statusMeta: Record<DeviceStatus, { className: string; label: string }> = {
  alarm: { className: 'bg-rose-400 text-rose-950 shadow-[0_0_16px_rgba(251,113,133,0.45)]', label: '报警' },
  normal: { className: 'bg-emerald-400 text-emerald-950 shadow-[0_0_16px_rgba(52,211,153,0.4)]', label: '正常' },
  offline: { className: 'bg-slate-400 text-slate-950', label: '离线' },
  warning: { className: 'bg-amber-300 text-amber-950 shadow-[0_0_16px_rgba(252,211,77,0.4)]', label: '预警' },
}

function parameterValueClass(status?: DeviceStatus) {
  if (status === 'alarm') {
    return 'text-rose-200'
  }

  if (status === 'warning') {
    return 'text-amber-100'
  }

  if (status === 'offline') {
    return 'text-slate-300'
  }

  return 'text-cyan-50'
}

export default function DeviceDetailCard({ onClose, selectedDeviceCode }: DeviceDetailCardProps) {
  const device = devices.find(({ code }) => code === selectedDeviceCode)

  if (!device) {
    return null
  }

  const status = statusMeta[device.status]

  return (
    <aside className="pointer-events-auto absolute bottom-5 right-5 top-5 z-10 flex w-[360px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden rounded-[8px] border border-cyan-300/18 bg-slate-950/84 text-slate-100 shadow-2xl shadow-slate-950/35 backdrop-blur opacity-90">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${status.className}`} />
            <span className="text-xs font-bold text-cyan-200">{status.label}</span>
          </div>
          <h2 className="m-0 truncate text-xl font-extrabold leading-tight text-white">{device.name}</h2>
          <div className="mt-2 inline-flex rounded-[4px] border border-cyan-300/28 bg-cyan-300/12 px-2 py-1 text-sm font-extrabold leading-none text-cyan-100">
            {device.code}
          </div>
        </div>
        <div
          aria-label="关闭设备详情"
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[6px] border border-white/12 bg-white/6 text-lg leading-none text-slate-200 hover:border-cyan-200/45 hover:bg-cyan-300/12 hover:text-white"
          onClick={onClose}
        >
          ×
        </div>
      </div>

      <div className="grid gap-4 overflow-y-auto px-4 py-4">
        <DeviceMiniPreview code={device.code} />

        <p className="m-0 text-sm leading-6 text-slate-300">{device.description}</p>

        <div className="grid grid-cols-2 gap-2">
          {device.parameters.map((parameter) => (
            <div key={parameter.label} className="rounded-[6px] border border-white/10 bg-white/6 px-3 py-3">
              <div className="text-xs font-semibold text-slate-400">{parameter.label}</div>
              <div className={`mt-2 flex items-baseline gap-1 text-lg font-extrabold ${parameterValueClass(parameter.status)}`}>
                <span className="min-w-0 truncate">{parameter.value}</span>
                {parameter.unit ? <span className="text-xs font-bold text-slate-400">{parameter.unit}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
