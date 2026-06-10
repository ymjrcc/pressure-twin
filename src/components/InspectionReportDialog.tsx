import { AlertTriangle, CheckCircle2, ClipboardList, RotateCcw, X } from 'lucide-react'
import { Button } from 'antd'
import {
  devices,
  inspectionChecklists,
  type DeviceCode,
  type InspectionSession,
} from '@/data/workshopDevices'

type InspectionReportDialogProps = {
  onClose: () => void
  onRestart: () => void
  session: InspectionSession
}

function formatReportTime(timestamp?: number) {
  if (!timestamp) {
    return '-'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric',
  }).format(timestamp)
}

function getReportStats(session: InspectionSession) {
  return devices.reduce(
    (stats, device) => {
      const record = session.records[device.code]
      inspectionChecklists[device.code].forEach((item) => {
        const result = record?.itemResults[item.id]

        if (result === 'normal') {
          stats.normal += 1
        }

        if (result === 'abnormal') {
          stats.abnormal += 1
        }
      })

      return stats
    },
    { abnormal: 0, normal: 0 },
  )
}

function getDeviceName(deviceCode: DeviceCode) {
  return devices.find((device) => device.code === deviceCode)?.name ?? deviceCode
}

export default function InspectionReportDialog({ onClose, onRestart, session }: InspectionReportDialogProps) {
  const stats = getReportStats(session)

  return (
    <div className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/38 px-4 py-6 backdrop-blur-[2px]">
      <section className="grid max-h-[calc(100vh-3rem)] w-[760px] max-w-[calc(100vw-2rem)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[8px] border border-white/20 bg-slate-950/94 text-white shadow-2xl shadow-slate-950/45">
        <div className="border-b border-white/12 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-emerald-100">
                <ClipboardList aria-hidden="true" size={15} strokeWidth={2.4} />
                巡检报告
              </div>
              <h2 className="m-0 text-xl font-extrabold leading-tight text-white">设备巡检已完成</h2>
            </div>
            <button
              aria-label="关闭巡检报告"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border border-white/12 bg-white/6 p-0 text-slate-200 shadow-none hover:border-emerald-200/45 hover:bg-emerald-300/12 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={16} strokeWidth={2.4} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="rounded-[6px] border border-white/12 bg-white/7 px-3 py-3">
              <div className="text-xs font-bold text-slate-400">设备数</div>
              <div className="mt-1 text-xl font-extrabold text-white">{devices.length}</div>
            </div>
            <div className="rounded-[6px] border border-emerald-300/18 bg-emerald-300/10 px-3 py-3">
              <div className="text-xs font-bold text-emerald-100">正常项</div>
              <div className="mt-1 text-xl font-extrabold text-emerald-100">{stats.normal}</div>
            </div>
            <div className="rounded-[6px] border border-rose-300/18 bg-rose-400/10 px-3 py-3">
              <div className="text-xs font-bold text-rose-100">异常项</div>
              <div className="mt-1 text-xl font-extrabold text-rose-100">{stats.abnormal}</div>
            </div>
            <div className="rounded-[6px] border border-white/12 bg-white/7 px-3 py-3">
              <div className="text-xs font-bold text-slate-400">完成时间</div>
              <div className="mt-1 text-sm font-extrabold leading-6 text-slate-100">{formatReportTime(session.completedAt)}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-400">
            <div>开始：{formatReportTime(session.startedAt)}</div>
            <div>结束：{formatReportTime(session.completedAt)}</div>
          </div>
        </div>

        <div className="grid gap-3 overflow-y-auto px-5 py-4">
          {devices.map((device) => {
            const record = session.records[device.code]
            const checklist = inspectionChecklists[device.code]
            const abnormalCount = checklist.filter((item) => record?.itemResults[item.id] === 'abnormal').length

            return (
              <section key={device.code} className="grid gap-3 rounded-[6px] border border-white/12 bg-white/7 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-[4px] border border-sky-300/40 bg-sky-300/14 px-2 py-1 text-[11px] font-extrabold leading-none text-sky-100">
                        {device.code}
                      </span>
                      <h3 className="m-0 truncate text-sm font-extrabold text-slate-100">{getDeviceName(device.code)}</h3>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-[4px] border px-2 py-1 text-[11px] font-extrabold leading-none ${
                    abnormalCount > 0
                      ? 'border-rose-300/28 bg-rose-400/12 text-rose-100'
                      : 'border-emerald-300/28 bg-emerald-300/12 text-emerald-100'
                  }`}
                  >
                    {abnormalCount > 0 ? `${abnormalCount} 项异常` : '全部正常'}
                  </span>
                </div>

                <div className="grid gap-2">
                  {checklist.map((item) => {
                    const result = record?.itemResults[item.id]
                    const isAbnormal = result === 'abnormal'
                    const Icon = isAbnormal ? AlertTriangle : CheckCircle2

                    return (
                      <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[6px] border border-white/10 bg-slate-950/38 px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-extrabold text-slate-100">{item.label}</div>
                          <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{item.description}</div>
                        </div>
                        <span className={`inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2 text-[11px] font-extrabold ${
                          isAbnormal
                            ? 'border-rose-300/28 bg-rose-400/12 text-rose-100'
                            : 'border-emerald-300/28 bg-emerald-300/12 text-emerald-100'
                        }`}
                        >
                          <Icon aria-hidden="true" size={13} strokeWidth={2.5} />
                          {isAbnormal ? '异常' : '正常'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {record?.note ? (
                  <div className="rounded-[6px] border border-white/10 bg-slate-950/38 px-3 py-2 text-xs font-medium leading-5 text-slate-300">
                    <span className="font-extrabold text-slate-100">备注：</span>
                    {record.note}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/12 px-5 py-4">
          <Button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] px-4 py-0 text-sm font-extrabold"
            icon={<RotateCcw aria-hidden="true" size={16} strokeWidth={2.4} />}
            onClick={onRestart}
          >
            重新巡检
          </Button>
          <Button className="h-10 rounded-[6px] px-4 py-0 text-sm font-extrabold" onClick={onClose} type="primary">
            关闭报告
          </Button>
        </div>
      </section>
    </div>
  )
}
