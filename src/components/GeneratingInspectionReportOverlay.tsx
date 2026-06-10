import { LoaderCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function GeneratingInspectionReportOverlay() {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/42 px-4 py-6 backdrop-blur-[2px]">
      <div className="grid w-[360px] max-w-[calc(100vw-2rem)] justify-items-center gap-4 rounded-[8px] border border-cyan-200/18 bg-slate-950/92 px-6 py-7 text-center text-slate-100 shadow-2xl shadow-slate-950/40">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
          <LoaderCircle aria-hidden="true" className="animate-spin text-cyan-100" size={28} strokeWidth={2.2} />
        </div>
        <div>
          <div className="text-base font-extrabold text-white">正在生成巡检报告</div>
          <div className="mt-2 text-sm font-medium leading-6 text-slate-300">请稍候</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
