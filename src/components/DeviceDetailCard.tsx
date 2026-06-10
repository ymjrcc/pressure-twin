import DeviceMiniPreview from '@/components/DeviceMiniPreview'
import type { DeviceTelemetrySnapshot } from '@/data/deviceTelemetry'
import { devices, type DeviceCode, type DeviceStatus } from '@/data/workshopDevices'

type DeviceDetailCardProps = {
  onClose: () => void
  selectedDeviceCode: DeviceCode | null
  telemetryByDevice: DeviceTelemetrySnapshot
}

const statusMeta: Record<DeviceStatus, { className: string; label: string }> = {
  alarm: { className: 'bg-rose-400 text-rose-950 shadow-[0_0_16px_rgba(251,113,133,0.45)]', label: '报警' },
  normal: { className: 'bg-emerald-400 text-emerald-950 shadow-[0_0_16px_rgba(52,211,153,0.4)]', label: '正常' },
  offline: { className: 'bg-slate-400 text-slate-950', label: '离线' },
  warning: { className: 'bg-amber-300 text-amber-950 shadow-[0_0_16px_rgba(252,211,77,0.4)]', label: '预警' },
}

const statusCardTone: Record<DeviceStatus, { accentClassName: string; bodyClassName: string; headerClassName: string; panelClassName: string; shellClassName: string }> = {
  alarm: {
    accentClassName: 'text-rose-50',
    bodyClassName: 'from-rose-400/18 via-slate-900/90 to-slate-950/96',
    headerClassName: 'border-rose-300/24',
    panelClassName: 'border-rose-300/18 bg-rose-300/11',
    shellClassName: 'border-rose-300/22 shadow-rose-950/20',
  },
  normal: {
    accentClassName: 'text-cyan-100',
    bodyClassName: 'from-cyan-400/8 via-slate-950/90 to-slate-950/96',
    headerClassName: 'border-white/10',
    panelClassName: 'border-cyan-300/16 bg-cyan-300/8',
    shellClassName: 'border-cyan-300/18 shadow-slate-950/35',
  },
  offline: {
    accentClassName: 'text-slate-100',
    bodyClassName: 'from-slate-200/18 via-slate-900/90 to-slate-950/96',
    headerClassName: 'border-slate-200/18',
    panelClassName: 'border-slate-200/16 bg-slate-200/10',
    shellClassName: 'border-slate-200/18 shadow-slate-950/28',
  },
  warning: {
    accentClassName: 'text-amber-50',
    bodyClassName: 'from-amber-300/18 via-slate-900/90 to-slate-950/96',
    headerClassName: 'border-amber-300/22',
    panelClassName: 'border-amber-300/18 bg-amber-200/11',
    shellClassName: 'border-amber-300/22 shadow-amber-950/16',
  },
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

function rangeTrackClass(status?: DeviceStatus) {
  if (status === 'alarm') {
    return 'bg-rose-400'
  }

  if (status === 'warning') {
    return 'bg-amber-300'
  }

  if (status === 'offline') {
    return 'bg-slate-400'
  }

  return 'bg-cyan-300'
}

function formatAlarmStartedAt(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp)
}

function formatAlarmDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)
  const paddedSeconds = seconds.toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${paddedMinutes}:${paddedSeconds}`
}

export default function DeviceDetailCard({ onClose, selectedDeviceCode, telemetryByDevice }: DeviceDetailCardProps) {
  const device = devices.find(({ code }) => code === selectedDeviceCode)

  if (!device) {
    return null
  }

  const telemetry = telemetryByDevice[device.code]
  const status = statusMeta[telemetry.status]
  const cardTone = statusCardTone[telemetry.status]

  return (
    <aside className={`pointer-events-auto absolute bottom-5 right-5 top-5 z-10 flex w-[360px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden rounded-[8px] border bg-slate-950/84 text-slate-100 shadow-2xl backdrop-blur opacity-90 ${cardTone.shellClassName}`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${cardTone.bodyClassName}`} />
      <div className={`relative flex items-start justify-between gap-4 border-b px-4 py-4 ${cardTone.headerClassName}`}>
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${status.className}`} />
            <span className={`text-xs font-bold ${cardTone.accentClassName}`}>{status.label}</span>
          </div>
          <h2 className="m-0 truncate text-xl font-extrabold leading-tight text-white">{device.name}</h2>
          <div className={`mt-2 inline-flex rounded-[4px] border px-2 py-1 text-sm font-extrabold leading-none ${cardTone.panelClassName} ${cardTone.accentClassName}`}>
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

      <div className="relative grid gap-4 overflow-y-auto px-4 py-4">
        <DeviceMiniPreview code={device.code} />

        <p className="m-0 text-sm leading-6 text-slate-300">{device.description}</p>

        <section className="grid gap-2">
          <h3 className="m-0 text-sm font-bold text-slate-200">设备信息</h3>
          <div className="grid grid-cols-2 gap-2">
            {device.parameters.map((parameter) => (
              <div key={parameter.label} className={`rounded-[6px] border px-3 py-3 ${cardTone.panelClassName}`}>
                <div className="text-xs font-semibold text-slate-400">{parameter.label}</div>
                <div className={`mt-2 flex items-baseline gap-1 text-lg font-extrabold ${parameterValueClass(parameter.status)}`}>
                  <span className="min-w-0 truncate">{parameter.value}</span>
                  {parameter.unit ? <span className="text-xs font-bold text-slate-400">{parameter.unit}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <h3 className={`m-0 text-sm font-bold ${cardTone.accentClassName}`}>实时数据</h3>
            <span className="text-[11px] font-medium text-slate-400">每 2 秒更新</span>
          </div>
          <div className="grid gap-2">
            {telemetry.parameters.map((parameter) => (
              <div key={parameter.label} className={`rounded-[6px] border px-3 py-3 ${cardTone.panelClassName}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-400">{parameter.label}</div>
                    <div className={`mt-2 flex items-baseline gap-1 text-lg font-extrabold ${parameterValueClass(parameter.status)}`}>
                      <span className="min-w-0 truncate">{parameter.value}</span>
                      {parameter.unit ? <span className="text-xs font-bold text-slate-400">{parameter.unit}</span> : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] font-medium leading-5 text-slate-400">
                    <div>
                      最小 {parameter.min}
                      {parameter.unit ? ` ${parameter.unit}` : ''}
                    </div>
                    <div>
                      最大 {parameter.max}
                      {parameter.unit ? ` ${parameter.unit}` : ''}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="relative h-2 rounded-full bg-white/10">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
                    <div
                      className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950/70 shadow-[0_0_0_2px_rgba(15,23,42,0.32)] ${rangeTrackClass(parameter.status)}`}
                      style={{ left: `${parameter.normalizedRatio * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>{parameter.min}</span>
                    <span>当前 {parameter.value}</span>
                    <span>{parameter.max}</span>
                  </div>
                </div>
                {parameter.status === 'alarm' && parameter.alarmStartedAt !== undefined ? (
                  <div className="mt-3 grid gap-2 rounded-[6px] border border-rose-200/18 bg-rose-400/10 px-3 py-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold leading-5">
                      <div>
                        <div className="text-slate-400">报警时间</div>
                        <div className="text-rose-100">{formatAlarmStartedAt(parameter.alarmStartedAt)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">持续时间</div>
                        <div className="text-rose-100">{formatAlarmDuration(parameter.alarmDurationMs ?? 0)}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold leading-5 text-slate-300">
                      <span className="font-bold text-rose-100">处置建议：</span>
                      {parameter.alarmSuggestion}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  )
}
