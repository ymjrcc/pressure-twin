import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react'

import type {
  InspectionReportAnalysis,
  InspectionReportAnalysisRiskLevel,
  InspectionReportAnalysisStatus,
  InspectionReportDetail,
} from '@/types/inspection'

export function formatDateTime(timestamp?: number) {
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

function formatPercent(value: number, total: number) {
  if (total <= 0) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}

function ReportSummaryStats({ report }: { report: InspectionReportDetail }) {
  const totalItemCount = report.normalItemCount + report.abnormalItemCount
  const normalWidth = totalItemCount > 0 ? `${(report.normalItemCount / totalItemCount) * 100}%` : '0%'
  const abnormalWidth = totalItemCount > 0 ? `${(report.abnormalItemCount / totalItemCount) * 100}%` : '0%'

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">报告总览</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-3xl font-semibold leading-none text-slate-900">{report.deviceCount}</div>
            <div className="pb-0.5 text-sm font-medium text-slate-500">台设备</div>
          </div>
        </div>
        <div className="text-right text-xs leading-5 text-slate-500">
          <div>总检查项：{totalItemCount}</div>
          <div>异常设备：{report.abnormalItemCount > 0 ? '存在异常项' : '未发现异常项'}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-emerald-900">正常项</div>
            <div className="text-sm font-semibold text-emerald-700">
              {report.normalItemCount} / {totalItemCount}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: normalWidth }} />
          </div>
          <div className="mt-2 text-xs text-emerald-700">占比 {formatPercent(report.normalItemCount, totalItemCount)}</div>
        </div>

        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-rose-900">异常项</div>
            <div className="text-sm font-semibold text-rose-700">
              {report.abnormalItemCount} / {totalItemCount}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-rose-500 transition-[width]" style={{ width: abnormalWidth }} />
          </div>
          <div className="mt-2 text-xs text-rose-700">占比 {formatPercent(report.abnormalItemCount, totalItemCount)}</div>
        </div>
      </div>
    </section>
  )
}

function getOverallStatusMeta(status: InspectionReportAnalysisStatus) {
  switch (status) {
    case 'normal':
      return {
        description: '本次巡检未识别出明显风险，可继续保持常规巡检节奏。',
        icon: ShieldCheck,
        label: '正常',
        panelClassName: 'border-emerald-200 bg-emerald-50',
        tagClassName: 'border border-emerald-200 bg-emerald-100 text-emerald-700',
      }
    case 'critical':
      return {
        description: '本次巡检存在高风险信号，建议优先核查异常设备并尽快处理。',
        icon: ShieldAlert,
        label: '高风险',
        panelClassName: 'border-rose-200 bg-rose-50',
        tagClassName: 'border border-rose-200 bg-rose-100 text-rose-700',
      }
    case 'warning':
    default:
      return {
        description: '本次巡检存在需要关注的异常或潜在风险，建议结合原始记录进一步确认。',
        icon: ShieldQuestion,
        label: '需关注',
        panelClassName: 'border-amber-200 bg-amber-50',
        tagClassName: 'border border-amber-200 bg-amber-100 text-amber-700',
      }
  }
}

function getRiskLevelMeta(level: InspectionReportAnalysisRiskLevel) {
  switch (level) {
    case 'low':
      return {
        className: 'border border-emerald-200 bg-emerald-100 text-emerald-700',
        label: '低风险',
      }
    case 'high':
      return {
        className: 'border border-rose-200 bg-rose-100 text-rose-700',
        label: '高风险',
      }
    case 'medium':
    default:
      return {
        className: 'border border-amber-200 bg-amber-100 text-amber-700',
        label: '中风险',
      }
  }
}

function AnalysisListBlock({
  emptyText,
  items,
  title,
}: {
  emptyText: string
  items: string[]
  title: string
}) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-4 py-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {items.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[6px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
          {emptyText}
        </div>
      )}
    </div>
  )
}

export function ReportDataPanel({ report }: { report: InspectionReportDetail }) {
  return (
    <section className="grid gap-4">
      <div className="flex min-h-9 items-center gap-2 border-b border-slate-200 text-sm font-semibold text-slate-900">
        <ClipboardList className="text-slate-700" size={18} strokeWidth={2.2} />
        巡检报告详情
      </div>

      <ReportSummaryStats report={report} />

      <div className="grid gap-4">
        {report.deviceRecords.map((deviceRecord) => (
          <section
            key={`${report.id}-${deviceRecord.deviceCode}`}
            className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_2px_6px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-[6px] border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {deviceRecord.deviceCode}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{deviceRecord.deviceName}</h3>
                </div>
                <div className="mt-2 text-xs text-slate-500">检查时间：{formatDateTime(deviceRecord.checkedAt)}</div>
              </div>
              <div
                className={`rounded-[999px] px-3 py-1 text-xs font-semibold ${
                  deviceRecord.abnormalItemCount > 0
                    ? 'border border-rose-200 bg-rose-100 text-rose-700'
                    : 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                }`}
              >
                {deviceRecord.abnormalItemCount > 0 ? `${deviceRecord.abnormalItemCount} 项异常` : '全部正常'}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-500">检查项结果</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {deviceRecord.itemResults.map((itemResult) => {
                  const isAbnormal = itemResult.result === 'abnormal'
                  const Icon = isAbnormal ? AlertTriangle : CheckCircle2

                  return (
                    <div
                      key={`${deviceRecord.deviceCode}-${itemResult.itemId}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{itemResult.label}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{itemResult.itemId}</div>
                      </div>
                      <span
                        className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] border px-2.5 text-xs font-semibold ${
                          isAbnormal
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <Icon size={12} strokeWidth={2.4} />
                        {isAbnormal ? '异常' : '正常'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-xs uppercase tracking-[0.08em] text-slate-500">设备概况</div>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>检查项数量</span>
                    <span className="font-medium text-slate-900">{deviceRecord.itemResults.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>异常项数量</span>
                    <span className="font-medium text-slate-900">{deviceRecord.abnormalItemCount}</span>
                  </div>
                </div>
              </div>

              {deviceRecord.note ? (
                <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
                  <div className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-500">备注</div>
                  {deviceRecord.note}
                </div>
              ) : (
                <div className="rounded-[6px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  <div className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-500">备注</div>
                  本设备无巡检备注。
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

export function ReportAnalysisPanel({
  analysisError,
  analysisResult,
  isAnalysisLoading,
  isReady,
  onAnalyze,
}: {
  analysisError: string | null
  analysisResult: InspectionReportAnalysis | null
  isAnalysisLoading: boolean
  isReady: boolean
  onAnalyze: () => void
}) {
  const actionLabel = isAnalysisLoading ? '生成中...' : analysisResult ? '重新生成 AI 解读' : '生成 AI 解读'

  function AnalysisActionButton() {
    return (
      <button
        className="rounded-[6px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isReady || isAnalysisLoading}
        onClick={onAnalyze}
        type="button"
      >
        {actionLabel}
      </button>
    )
  }

  function AnalysisHeader() {
    return (
      <div className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BrainCircuit className="text-slate-700" size={18} strokeWidth={2.2} />
          AI 智能解读
        </div>
        <AnalysisActionButton />
      </div>
    )
  }

  if (isAnalysisLoading) {
    return (
      <section className="grid gap-4">
        <AnalysisHeader />
        <div className="rounded-[8px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-slate-700" size={18} strokeWidth={2.2} />
            <div>
              <div className="text-sm font-semibold text-slate-900">AI 智能解读生成中</div>
              <div className="mt-1 text-sm text-slate-600">系统正在结合异常项和巡检备注生成结构化结论。</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (analysisError) {
    return (
      <section className="grid gap-4">
        <AnalysisHeader />
        <div className="rounded-[8px] border border-rose-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-rose-600" size={18} strokeWidth={2.2} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-rose-700">AI 智能解读生成失败</div>
              <div className="mt-1 text-sm leading-6 text-rose-700">{analysisError}</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!analysisResult) {
    return (
      <section className="grid gap-4">
        <AnalysisHeader />
        <div className="flex min-h-[280px] flex-col justify-between rounded-[8px] border border-dashed border-slate-300 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <div className="text-sm font-semibold text-slate-900">尚未生成 AI 智能解读</div>
            <div className="mt-2 text-sm text-slate-500">点击右上角按钮后展示摘要、风险判断和处理建议。</div>
          </div>
        </div>
      </section>
    )
  }

  const statusMeta = getOverallStatusMeta(analysisResult.overallStatus)
  const StatusIcon = statusMeta.icon

  return (
    <section className="grid gap-4">
      <AnalysisHeader />
      <div className={`rounded-[8px] border px-4 py-4 ${statusMeta.panelClassName}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <StatusIcon className="mt-0.5 text-current" size={18} strokeWidth={2.2} />
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">AI Summary</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{statusMeta.label}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{statusMeta.description}</div>
            </div>
          </div>
          <span className={`rounded-[999px] px-3 py-1 text-xs font-semibold ${statusMeta.tagClassName}`}>
            {statusMeta.label}
          </span>
        </div>
        <div className="mt-4 rounded-[6px] border border-white/70 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
          {analysisResult.summary}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalysisListBlock emptyText="未识别出额外全局风险" items={analysisResult.risks} title="全局风险" />
        <AnalysisListBlock emptyText="暂无额外处理建议" items={analysisResult.recommendations} title="处理建议" />
      </div>

      <div className="rounded-[8px] border border-slate-200 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-slate-700" size={18} strokeWidth={2.2} />
          <div className="text-sm font-semibold text-slate-900">异常设备结论</div>
        </div>

        {analysisResult.abnormalDevices.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {analysisResult.abnormalDevices.map((device) => {
              const riskMeta = getRiskLevelMeta(device.riskLevel)

              return (
                <section key={`${device.deviceCode}-${device.deviceName}`} className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[6px] border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          {device.deviceCode}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900">{device.deviceName}</h3>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">识别到 {device.abnormalItemCount} 项异常或风险信号</div>
                    </div>
                    <span className={`rounded-[999px] px-3 py-1 text-xs font-semibold ${riskMeta.className}`}>{riskMeta.label}</span>
                  </div>

                  {device.abnormalItems.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {device.abnormalItems.map((item) => (
                        <span
                          key={`${device.deviceCode}-${item}`}
                          className="rounded-[999px] border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[6px] border border-slate-200 bg-white px-3 py-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">问题概述</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">{device.issueSummary}</div>
                    </div>
                    <div className="rounded-[6px] border border-slate-200 bg-white px-3 py-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">处理建议</div>
                      <div className="mt-2 text-sm leading-6 text-slate-700">{device.recommendation}</div>
                    </div>
                  </div>

                  {device.note ? (
                    <div className="mt-3 rounded-[6px] border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-500">
                      <span className="font-medium text-slate-700">原始备注：</span>
                      {device.note}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[6px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            本次分析未识别出异常设备。
          </div>
        )}
      </div>
    </section>
  )
}
