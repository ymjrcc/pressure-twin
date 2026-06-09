import { X } from 'lucide-react'

import { processFlowSteps, type DeviceStatus } from '@/data/workshopDevices'

type WorkshopProcessFlowProps = {
  onClose: () => void
}

const statusMeta: Record<DeviceStatus, { dotClassName: string; label: string }> = {
  alarm: { dotClassName: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.5)]', label: '报警' },
  normal: { dotClassName: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]', label: '正常' },
  offline: { dotClassName: 'bg-slate-400', label: '离线' },
  warning: { dotClassName: 'bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.45)]', label: '预警' },
}

function getCardClassName(variant?: string) {
  if (variant === 'return') {
    return 'border-cyan-300/35 bg-cyan-300/12'
  }

  return 'border-white/14 bg-white/7'
}

export default function WorkshopProcessFlow({ onClose }: WorkshopProcessFlowProps) {
  return (
    <section className="pointer-events-auto grid max-h-[calc(100vh-7rem)] w-[460px] max-w-[calc(100vw-2rem)] gap-3 overflow-y-auto rounded-[8px] border border-white/20 bg-slate-900/90 px-4 py-4 text-white shadow-2xl shadow-slate-950/35 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase text-cyan-300">工艺流程</div>
          <h2 className="m-0 mt-1 text-base font-extrabold leading-tight text-white">闭路循环路径</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[4px] border border-cyan-300/28 bg-cyan-300/12 px-2 py-1 text-[11px] font-extrabold leading-none text-cyan-100">
            介质主线
          </span>
          <button
            aria-label="关闭工艺流程"
            className="grid h-8 w-8 place-items-center rounded-[6px] border border-white/12 bg-white/6 p-0 text-slate-200 shadow-none hover:border-cyan-200/45 hover:bg-cyan-300/12 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {processFlowSteps.map((step, index) => {
          const status = step.status ? statusMeta[step.status] : null

          return (
            <div key={`${step.code}-${step.title}`} className="grid gap-2">
              <div className={`rounded-[6px] border px-3 py-2 ${getCardClassName(step.variant)}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-[4px] border border-sky-300/50 bg-sky-300/18 px-2 py-1 text-[11px] font-extrabold leading-none text-sky-100">
                      {step.code}
                    </span>
                    <span className="min-w-0 truncate text-xs font-bold text-slate-200">
                      {step.deviceName}
                    </span>
                  </div>
                  {status ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-slate-300">
                      <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                      {status.label}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm font-extrabold leading-tight text-white">{step.title}</div>
                <p className="m-0 mt-1 text-xs leading-5 text-slate-300">{step.description}</p>
              </div>

              {index < processFlowSteps.length - 1 ? (
                <div className="flex h-4 items-center justify-center text-sm font-extrabold leading-none text-cyan-200">
                  ↓
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 rounded-[6px] border border-violet-300/28 bg-violet-300/10 px-3 py-2">
        <span className="rounded-[4px] border border-violet-300/40 bg-violet-300/16 px-2 py-1 text-[11px] font-extrabold leading-none text-violet-100">
          CC-101
        </span>
        <span className="text-xs font-semibold leading-5 text-slate-200">
          控制柜采集仪表信号，执行监测联锁
        </span>
      </div>
    </section>
  )
}
