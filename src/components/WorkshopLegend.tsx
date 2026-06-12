import type { DeviceCode, DeviceInfo, InstrumentInfo } from '@/data/workshopDevices'

type WorkshopLegendProps = {
  devices: DeviceInfo[]
  instruments: InstrumentInfo[]
  selectedDeviceCode: DeviceCode | null
}

export default function WorkshopLegend({ devices, instruments, selectedDeviceCode }: WorkshopLegendProps) {
  return (
    <div className="pointer-events-none grid max-h-full min-w-[320px] gap-3 overflow-hidden rounded-[8px] border border-white/20 bg-slate-900/82 px-4 py-3 text-[13px] leading-tight text-white shadow-lg backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="inline-block h-[3px] w-13 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.45)]" />
        <span>工艺介质流向</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-block w-13 border-t-[3px] border-dashed border-violet-400" />
        <span>信号/数据连接</span>
      </div>
      <div className="h-px bg-white/12" />
      <div className="grid gap-2">
        <div className="text-[11px] font-bold uppercase text-sky-300">设备</div>
        {devices.map((device) => (
          <div key={device.code} className="grid grid-cols-[76px_1fr] items-center gap-3">
            <span
              className={
                device.code === selectedDeviceCode
                  ? 'rounded-[4px] border border-sky-300 bg-sky-300 px-2 py-1 text-[11px] font-extrabold leading-none text-slate-950'
                  : 'rounded-[4px] border border-sky-300/50 bg-sky-300/18 px-2 py-1 text-[11px] font-extrabold leading-none text-sky-100'
              }
            >
              {device.code}
            </span>
            <span className="text-slate-100">{device.name}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-white/12" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="col-span-2 text-[11px] font-bold uppercase text-cyan-300">仪表</div>
        {instruments.map((instrument) => (
          <div key={instrument.code} className="grid grid-cols-[64px_1fr] items-center gap-2">
            <span className="rounded-[4px] border border-white/20 bg-white/8 px-2 py-1 text-[11px] font-extrabold leading-none text-white">
              {instrument.code}
            </span>
            <span className="text-slate-200">{instrument.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
