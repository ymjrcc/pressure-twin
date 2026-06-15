import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
} from 'lucide-react'
import { Button } from 'antd'

import { getInspectionReportDetail, listInspectionReports, parseInspectionReport } from '@/api/inspections'
import type {
  InspectionReportAnalysis,
  InspectionReportAnalysisRiskLevel,
  InspectionReportAnalysisStatus,
  InspectionReportDetail,
  InspectionReportListItem,
} from '@/types/inspection'

function formatDateTime(timestamp?: number) {
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

function DetailField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function getOverallStatusMeta(status: InspectionReportAnalysisStatus) {
  switch (status) {
    case 'normal':
      return {
        description: '本次巡检未识别出明显风险，可继续保持常规巡检节奏。',
        icon: ShieldCheck,
        label: '正常',
        panelClassName: 'border-emerald-200 bg-emerald-50/80',
        tagClassName: 'bg-emerald-100 text-emerald-700',
      }
    case 'critical':
      return {
        description: '本次巡检存在高风险信号，建议优先核查异常设备并尽快处理。',
        icon: ShieldAlert,
        label: '高风险',
        panelClassName: 'border-rose-200 bg-rose-50/80',
        tagClassName: 'bg-rose-100 text-rose-700',
      }
    case 'warning':
    default:
      return {
        description: '本次巡检存在需要关注的异常或潜在风险，建议结合原始记录进一步确认。',
        icon: ShieldQuestion,
        label: '需关注',
        panelClassName: 'border-amber-200 bg-amber-50/80',
        tagClassName: 'bg-amber-100 text-amber-700',
      }
  }
}

function getRiskLevelMeta(level: InspectionReportAnalysisRiskLevel) {
  switch (level) {
    case 'low':
      return {
        className: 'bg-emerald-100 text-emerald-700',
        label: '低风险',
      }
    case 'high':
      return {
        className: 'bg-rose-100 text-rose-700',
        label: '高风险',
      }
    case 'medium':
    default:
      return {
        className: 'bg-amber-100 text-amber-700',
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
    <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      {items.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">
          {emptyText}
        </div>
      )}
    </div>
  )
}

function ReportAnalysisPanel({
  analysisError,
  analysisResult,
  isAnalysisLoading,
}: {
  analysisError: string | null
  analysisResult: InspectionReportAnalysis | null
  isAnalysisLoading: boolean
}) {
  if (isAnalysisLoading) {
    return (
      <section className="rounded-[18px] border border-cyan-200 bg-cyan-50/70 px-5 py-5">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-cyan-600" size={20} strokeWidth={2.3} />
          <div>
            <div className="text-sm font-extrabold text-slate-900">AI 正在分析这份巡检报告</div>
            <div className="mt-1 text-sm font-medium text-slate-600">系统会基于异常项、巡检备注和设备结果生成结构化结论。</div>
          </div>
        </div>
      </section>
    )
  }

  if (analysisError) {
    return (
      <section className="rounded-[18px] border border-rose-200 bg-rose-50/80 px-5 py-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 text-rose-600" size={20} strokeWidth={2.3} />
          <div>
            <div className="text-sm font-extrabold text-rose-700">AI 分析失败</div>
            <div className="mt-1 text-sm font-medium leading-6 text-rose-700">{analysisError}</div>
            <div className="mt-2 text-sm font-medium text-rose-600">可以直接重新点击按钮再次发起分析，原始巡检报告内容不受影响。</div>
          </div>
        </div>
      </section>
    )
  }

  if (!analysisResult) {
    return (
      <section className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 text-cyan-600" size={20} strokeWidth={2.3} />
          <div>
            <div className="text-sm font-extrabold text-slate-900">AI 智能分析</div>
            <div className="mt-1 text-sm font-medium leading-6 text-slate-600">
              点击上方按钮后，系统会基于当前巡检报告生成摘要、总体风险判断、异常设备结论和处理建议。
            </div>
          </div>
        </div>
      </section>
    )
  }

  const statusMeta = getOverallStatusMeta(analysisResult.overallStatus)
  const StatusIcon = statusMeta.icon

  return (
    <section className="grid gap-4 rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.92)_0%,_rgba(255,255,255,1)_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className={`rounded-[14px] border px-4 py-4 ${statusMeta.panelClassName}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <StatusIcon className="mt-0.5 text-current" size={20} strokeWidth={2.3} />
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">AI Summary</div>
              <div className="mt-1 text-lg font-black text-slate-900">{statusMeta.label}</div>
              <div className="mt-2 text-sm font-medium leading-6 text-slate-700">{statusMeta.description}</div>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusMeta.tagClassName}`}>
            {statusMeta.label}
          </span>
        </div>
        <div className="mt-4 rounded-[12px] bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
          {analysisResult.summary}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalysisListBlock emptyText="未识别出额外全局风险" items={analysisResult.risks} title="全局风险" />
        <AnalysisListBlock emptyText="暂无额外处理建议" items={analysisResult.recommendations} title="处理建议" />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-cyan-700" size={18} strokeWidth={2.3} />
          <div className="text-sm font-extrabold text-slate-900">异常设备结论</div>
        </div>

        {analysisResult.abnormalDevices.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {analysisResult.abnormalDevices.map((device) => {
              const riskMeta = getRiskLevelMeta(device.riskLevel)

              return (
                <section key={`${device.deviceCode}-${device.deviceName}`} className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[6px] bg-cyan-100 px-2 py-1 text-xs font-extrabold text-cyan-700">
                          {device.deviceCode}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">{device.deviceName}</h3>
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-500">识别到 {device.abnormalItemCount} 项异常或风险信号</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${riskMeta.className}`}>{riskMeta.label}</span>
                  </div>

                  {device.abnormalItems.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {device.abnormalItems.map((item) => (
                        <span
                          key={`${device.deviceCode}-${item}`}
                          className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[12px] border border-slate-200 bg-white px-3 py-3">
                      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">问题概述</div>
                      <div className="mt-2 text-sm font-medium leading-6 text-slate-700">{device.issueSummary}</div>
                    </div>
                    <div className="rounded-[12px] border border-slate-200 bg-white px-3 py-3">
                      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">处理建议</div>
                      <div className="mt-2 text-sm font-medium leading-6 text-slate-700">{device.recommendation}</div>
                    </div>
                  </div>

                  {device.note ? (
                    <div className="mt-3 rounded-[12px] border border-slate-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-500">
                      <span className="font-extrabold text-slate-700">原始备注：</span>
                      {device.note}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
            本次分析未识别出异常设备。
          </div>
        )}
      </div>
    </section>
  )
}

function ReportListItemCard({
  isActive,
  onClick,
  report,
}: {
  isActive: boolean
  onClick: () => void
  report: InspectionReportListItem
}) {
  return (
    <button
      className={`grid w-full gap-2 rounded-[12px] border px-3.5 py-3 text-left transition ${
        isActive
          ? 'border-cyan-500 bg-cyan-50 shadow-[0_8px_24px_rgba(14,116,144,0.12)]'
          : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">巡检报告</div>
          <div className="mt-1 truncate text-base font-extrabold text-slate-900">
            #{report.id} · {formatDateTime(report.submittedAt)}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-extrabold ${
            report.abnormalItemCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {report.abnormalItemCount > 0 ? `${report.abnormalItemCount} 异常` : '正常'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
        <span>设备 {report.deviceCount}</span>
        <span>正常 {report.normalItemCount}</span>
        <span>异常 {report.abnormalItemCount}</span>
        <span className="truncate">完成 {formatDateTime(report.completedAt)}</span>
      </div>
    </button>
  )
}

export default function Reports() {
  const [reports, setReports] = useState<InspectionReportListItem[]>([])
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [selectedReport, setSelectedReport] = useState<InspectionReportDetail | null>(null)
  const [isListLoading, setIsListLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<InspectionReportAnalysis | null>(null)

  const loadReports = async () => {
    try {
      setIsListLoading(true)
      setListError(null)

      const data = await listInspectionReports()
      setReports(data)

      if (data.length === 0) {
        setSelectedReportId(null)
        setSelectedReport(null)
        return
      }

      setSelectedReportId((currentId) => {
        if (currentId && data.some((report) => report.id === currentId)) {
          return currentId
        }

        return data[0].id
      })
    } catch (error) {
      setListError(error instanceof Error ? error.message : '加载巡检报告列表失败')
      setReports([])
      setSelectedReportId(null)
      setSelectedReport(null)
    } finally {
      setIsListLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  useEffect(() => {
    if (selectedReportId === null) {
      setSelectedReport(null)
      setDetailError(null)
      setAnalysisError(null)
      setAnalysisResult(null)
      setIsAnalysisLoading(false)
      return
    }

    setAnalysisError(null)
    setAnalysisResult(null)
    setIsAnalysisLoading(false)

    const reportId = selectedReportId
    let cancelled = false

    async function loadDetail() {
      try {
        setIsDetailLoading(true)
        setDetailError(null)

        const detail = await getInspectionReportDetail(reportId)

        if (!cancelled) {
          setSelectedReport(detail)
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedReport(null)
          setDetailError(error instanceof Error ? error.message : '加载巡检报告详情失败')
        }
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      cancelled = true
    }
  }, [selectedReportId])

  const handleAnalyzeReport = async () => {
    if (!selectedReport?.id) {
      return
    }

    try {
      setIsAnalysisLoading(true)
      setAnalysisError(null)

      const result = await parseInspectionReport(selectedReport.id)
      setAnalysisResult(result)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'AI 分析失败，请稍后重试')
      setAnalysisResult(null)
    } finally {
      setIsAnalysisLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,_#f8fbfd_0%,_#eef4f8_100%)] px-6 py-6 md:px-8">
      <div className="mx-auto grid h-full max-w-[1480px] gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="flex min-h-0 flex-col rounded-[20px] border border-white/70 bg-white/88 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              {/* 统计总数 */}
              <div className="mt-1 text-sm font-medium text-slate-500">
                共 {reports.length} 条
              </div>
            </div>
            <Button
              className="h-10 rounded-[10px] px-3 text-sm font-extrabold"
              icon={<RefreshCcw size={15} strokeWidth={2.4} />}
              loading={isListLoading}
              onClick={() => void loadReports()}
            >
              刷新
            </Button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            {isListLoading ? (
              <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                正在加载巡检报告列表...
              </div>
            ) : null}

            {!isListLoading && listError ? (
              <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-5 text-sm font-semibold text-rose-700">
                列表加载失败：{listError}
              </div>
            ) : null}

            {!isListLoading && !listError && reports.length === 0 ? (
              <div className="grid gap-3 rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <FileText className="mx-auto text-slate-400" size={32} strokeWidth={2.2} />
                <div className="text-base font-extrabold text-slate-700">暂无已提交巡检报告</div>
                <div className="text-sm font-medium text-slate-500">请先从首页完成巡检并提交报告。</div>
              </div>
            ) : null}

            {!isListLoading && !listError ? (
              <div className="grid gap-2.5">
                {reports.map((report) => (
                  <ReportListItemCard
                    key={report.id}
                    isActive={report.id === selectedReportId}
                    onClick={() => setSelectedReportId(report.id)}
                    report={report}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-[20px] border border-slate-200/80 bg-white/90 p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          {!selectedReportId && !isListLoading && !listError ? (
            <div className="grid flex-1 place-items-center rounded-[16px] border border-slate-200 bg-slate-50 px-6 text-center">
              <div>
                <FileText className="mx-auto text-slate-500" size={36} strokeWidth={2.2} />
                <div className="mt-4 text-xl font-extrabold text-slate-900">还没有可查看的报告详情</div>
                <div className="mt-2 text-sm font-medium text-slate-500">列表中出现报告后，右侧会展示完整巡检明细。</div>
              </div>
            </div>
          ) : null}

          {selectedReportId !== null && isDetailLoading ? (
            <div className="grid flex-1 place-items-center rounded-[16px] border border-slate-200 bg-slate-50 px-6 text-center text-sm font-semibold text-slate-500">
              正在加载巡检报告详情...
            </div>
          ) : null}

          {selectedReportId !== null && !isDetailLoading && detailError ? (
            <div className="grid flex-1 place-items-center rounded-[16px] border border-rose-200 bg-rose-50 px-6 text-center">
              <div className="text-sm font-semibold text-rose-700">详情加载失败：{detailError}</div>
            </div>
          ) : null}

          {selectedReport && !isDetailLoading && !detailError ? (
            <div className="grid flex-1 gap-6 overflow-y-auto pr-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-700">Inspection Report</div>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">巡检报告 #{selectedReport.id}</h2>
                  <div className="mt-2 text-sm font-medium text-slate-500">
                    提交时间：{formatDateTime(selectedReport.submittedAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button
                    className="h-10 rounded-[10px] border-cyan-200 bg-cyan-50 px-4 text-sm font-extrabold text-cyan-700 shadow-none hover:!border-cyan-300 hover:!bg-cyan-100 hover:!text-cyan-800"
                    icon={<BrainCircuit size={16} strokeWidth={2.3} />}
                    loading={isAnalysisLoading}
                    onClick={() => void handleAnalyzeReport()}
                  >
                    {isAnalysisLoading ? '分析中...' : analysisResult ? '重新分析' : 'AI 智能分析'}
                  </Button>
                  <div
                    className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${
                      selectedReport.abnormalItemCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedReport.abnormalItemCount > 0 ? `${selectedReport.abnormalItemCount} 项异常待关注` : '本次巡检全部正常'}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <DetailField label="开始时间" value={formatDateTime(selectedReport.startedAt)} />
                <DetailField label="结束时间" value={formatDateTime(selectedReport.completedAt)} />
                <DetailField label="提交时间" value={formatDateTime(selectedReport.submittedAt)} />
                <DetailField label="设备数" value={selectedReport.deviceCount} />
                <DetailField label="正常项" value={selectedReport.normalItemCount} />
                <DetailField label="异常项" value={selectedReport.abnormalItemCount} />
              </div>

              <ReportAnalysisPanel
                analysisError={analysisError}
                analysisResult={analysisResult}
                isAnalysisLoading={isAnalysisLoading}
              />

              <div className="grid gap-4">
                {selectedReport.deviceRecords.map((deviceRecord) => (
                  <section key={`${selectedReport.id}-${deviceRecord.deviceCode}`} className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-[6px] bg-cyan-100 px-2 py-1 text-xs font-extrabold text-cyan-700">
                            {deviceRecord.deviceCode}
                          </span>
                          <h3 className="text-lg font-extrabold text-slate-900">{deviceRecord.deviceName}</h3>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-slate-500">
                          检查时间：{formatDateTime(deviceRecord.checkedAt)}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                          deviceRecord.abnormalItemCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {deviceRecord.abnormalItemCount > 0 ? `${deviceRecord.abnormalItemCount} 项异常` : '全部正常'}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {deviceRecord.itemResults.map((itemResult) => {
                        const isAbnormal = itemResult.result === 'abnormal'
                        const Icon = isAbnormal ? AlertTriangle : CheckCircle2

                        return (
                          <div
                            key={`${deviceRecord.deviceCode}-${itemResult.itemId}`}
                            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-3"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-extrabold text-slate-900">{itemResult.label}</div>
                              <div className="mt-1 text-xs font-medium text-slate-500">{itemResult.itemId}</div>
                            </div>
                            <span
                              className={`inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-xs font-extrabold ${
                                isAbnormal
                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              <Icon size={13} strokeWidth={2.5} />
                              {isAbnormal ? '异常' : '正常'}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {deviceRecord.note ? (
                      <div className="mt-4 rounded-[10px] border border-slate-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-slate-600">
                        <span className="font-extrabold text-slate-900">备注：</span>
                        {deviceRecord.note}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
