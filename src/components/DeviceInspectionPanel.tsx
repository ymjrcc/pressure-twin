import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react'
import { Button } from 'antd'
import {
  inspectionChecklists,
  type DeviceCode,
  type DeviceInfo,
  type DeviceInspectionRecord,
  type InspectionItemResult,
} from '@/data/workshopDevices'

type DeviceInspectionPanelProps = {
  currentDeviceCode: DeviceCode
  currentDeviceIndex: number
  devices: DeviceInfo[]
  onGoNext: () => void
  onGoPrevious: () => void
  onSetItemResult: (deviceCode: DeviceCode, itemId: string, result: InspectionItemResult) => void
  onSetNote: (deviceCode: DeviceCode, note: string) => void
  record: DeviceInspectionRecord
  totalDevices: number
}

const resultOptions: Array<{ className: string; iconClassName: string; label: string; value: InspectionItemResult }> = [
  {
    className: 'border-emerald-300/55 bg-emerald-300/16 text-emerald-50',
    iconClassName: 'text-emerald-200',
    label: '正常',
    value: 'normal',
  },
  {
    className: 'border-rose-300/55 bg-rose-400/16 text-rose-50',
    iconClassName: 'text-rose-200',
    label: '异常',
    value: 'abnormal',
  },
]

function getCompletedCount(record: DeviceInspectionRecord, deviceCode: DeviceCode) {
  return inspectionChecklists[deviceCode].filter((item) => record.itemResults[item.id]).length
}

export default function DeviceInspectionPanel({
  currentDeviceCode,
  currentDeviceIndex,
  devices,
  onGoNext,
  onGoPrevious,
  onSetItemResult,
  onSetNote,
  record,
  totalDevices,
}: DeviceInspectionPanelProps) {
  const device = devices.find(({ code }) => code === currentDeviceCode)
  const checklist = inspectionChecklists[currentDeviceCode]
  const completedCount = getCompletedCount(record, currentDeviceCode)
  const isCurrentDeviceComplete = completedCount === checklist.length
  const isLastDevice = currentDeviceIndex === totalDevices - 1

  if (!device) {
    return null
  }

  return (
    <aside className="pointer-events-auto absolute bottom-5 right-5 top-5 z-10 flex w-[390px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden rounded-[8px] border border-emerald-300/22 bg-slate-950/88 text-slate-100 shadow-2xl shadow-slate-950/35 backdrop-blur opacity-95">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/10 via-slate-950/92 to-slate-950/98" />
      <div className="relative border-b border-emerald-300/18 px-4 py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-emerald-100">
          <ClipboardCheck aria-hidden="true" size={15} strokeWidth={2.4} />
          巡检中
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-extrabold leading-tight text-white">{device.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-emerald-300/28 bg-emerald-300/12 px-2 py-1 text-sm font-extrabold leading-none text-emerald-100">
                {device.code}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentDeviceIndex + 1} / {totalDevices}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right text-xs font-bold text-slate-400">
            <div>已完成</div>
            <div className="mt-1 text-lg font-extrabold text-emerald-100">
              {completedCount}/{checklist.length}
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.35)]"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative grid gap-3 overflow-y-auto px-4 py-4">
        {checklist.map((item) => {
          const selectedResult = record.itemResults[item.id]

          return (
            <section key={item.id} className="grid gap-3 rounded-[6px] border border-white/12 bg-white/7 px-3 py-3">
              <div>
                <h3 className="m-0 text-sm font-extrabold text-slate-100">{item.label}</h3>
                <p className="m-0 mt-1 text-xs font-medium leading-5 text-slate-400">{item.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {resultOptions.map((option) => {
                  const isSelected = selectedResult === option.value
                  const Icon = option.value === 'normal' ? CheckCircle2 : AlertTriangle

                  return (
                    <button
                      key={option.value}
                      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] border px-3 py-0 text-sm font-extrabold shadow-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200 ${
                        isSelected ? option.className : 'border-white/12 bg-white/6 text-slate-300 hover:border-emerald-200/45 hover:bg-emerald-300/10 hover:text-white'
                      }`}
                      onClick={() => onSetItemResult(currentDeviceCode, item.id, option.value)}
                      type="button"
                    >
                      <Icon aria-hidden="true" className={isSelected ? option.iconClassName : undefined} size={15} strokeWidth={2.5} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}

        <label className="grid gap-2 text-sm font-bold text-slate-200">
          备注
          <textarea
            className="min-h-24 resize-none rounded-[6px] border border-white/12 bg-white/7 px-3 py-2 text-sm font-medium leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-200/60"
            onChange={(event) => onSetNote(currentDeviceCode, event.target.value)}
            placeholder="记录现场情况、异常描述或处理建议"
            value={record.note}
          />
        </label>
      </div>

      <div className="relative grid gap-3 border-t border-white/10 px-4 py-4">
        {!isCurrentDeviceComplete ? (
          <div className="rounded-[6px] border border-amber-200/18 bg-amber-300/10 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
            请完成当前设备全部检查项后继续。
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border-white/12 bg-white/6 px-4 py-0 text-sm font-extrabold text-slate-100 shadow-none hover:!border-emerald-200/45 hover:!bg-emerald-300/12 hover:!text-white disabled:!border-white/10 disabled:!bg-white/6 disabled:!text-slate-500 disabled:opacity-100"
            disabled={currentDeviceIndex === 0}
            icon={<ArrowLeft aria-hidden="true" size={16} strokeWidth={2.4} />}
            onClick={onGoPrevious}
          >
            上一台
          </Button>
          <Button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] px-4 py-0 text-sm font-extrabold disabled:!border-emerald-300/12 disabled:!bg-emerald-300/20 disabled:!text-emerald-50/55 disabled:opacity-100"
            disabled={!isCurrentDeviceComplete}
            icon={<ArrowRight aria-hidden="true" size={16} strokeWidth={2.4} />}
            onClick={onGoNext}
            type="primary"
          >
            {isLastDevice ? '结束巡检' : '下一步'}
          </Button>
        </div>
      </div>
    </aside>
  )
}
