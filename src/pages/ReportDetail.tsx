import { useEffect, useState } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { getInspectionReportDetail, parseInspectionReport } from '@/api/inspections'
import type { InspectionReportAnalysis, InspectionReportDetail } from '@/types/inspection'

import { ReportAnalysisPanel, ReportDataPanel, formatDateTime } from './reports/shared'

function ReportStatusTag({ abnormalItemCount }: { abnormalItemCount: number }) {
  return (
    <div
      className={`rounded-[999px] px-2.5 py-1 text-xs font-medium ${
        abnormalItemCount > 0
          ? 'border border-rose-200 bg-rose-100 text-rose-700'
          : 'border border-emerald-200 bg-emerald-100 text-emerald-700'
      }`}
    >
      {abnormalItemCount > 0 ? `${abnormalItemCount} 项异常` : '全部正常'}
    </div>
  )
}

export default function ReportDetail() {
  const params = useParams<{ reportId: string }>()
  const reportId = Number(params.reportId)

  const [report, setReport] = useState<InspectionReportDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<InspectionReportAnalysis | null>(null)

  useEffect(() => {
    if (!Number.isInteger(reportId) || reportId <= 0) {
      setReport(null)
      setDetailError('报告编号无效')
      setIsDetailLoading(false)
      return
    }

    let cancelled = false

    async function loadDetail() {
      try {
        setIsDetailLoading(true)
        setDetailError(null)
        setAnalysisError(null)
        setAnalysisResult(null)
        setIsAnalysisLoading(false)

        const detail = await getInspectionReportDetail(reportId)

        if (!cancelled) {
          setReport(detail)
        }
      } catch (error) {
        if (!cancelled) {
          setReport(null)
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
  }, [reportId])

  const handleAnalyzeReport = async () => {
    if (!report?.id) {
      return
    }

    try {
      setIsAnalysisLoading(true)
      setAnalysisError(null)
      setAnalysisResult(await parseInspectionReport(report.id))
    } catch (error) {
      setAnalysisResult(null)
      setAnalysisError(error instanceof Error ? error.message : 'AI 分析失败，请稍后重试')
    } finally {
      setIsAnalysisLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 px-6 py-6 md:px-8">
      <div className="mx-auto flex h-full max-w-[1480px] flex-col">
        <div className="mb-4">
          <Link
            className="inline-flex items-center gap-2 rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            to="/reports"
          >
            <ArrowLeft size={15} strokeWidth={2.2} />
            返回列表
          </Link>
        </div>

        {isDetailLoading ? (
          <section className="grid min-h-[420px] place-items-center rounded-[10px] border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
            正在加载巡检报告详情...
          </section>
        ) : null}

        {!isDetailLoading && detailError ? (
          <section className="grid min-h-[420px] place-items-center rounded-[10px] border border-rose-200 bg-white px-6 text-center shadow-sm">
            <div className="text-sm text-rose-700">详情加载失败：{detailError}</div>
          </section>
        ) : null}

        {report && !isDetailLoading && !detailError ? (
          <section className="flex min-h-0 flex-1 flex-col rounded-[10px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 px-5 pt-4 text-sm text-slate-500">
              <h2 className="text-lg my-0 font-semibold text-slate-900">巡检报告 #{report.id}</h2>
              <ReportStatusTag abnormalItemCount={report.abnormalItemCount} />
              <span>提交时间：{formatDateTime(report.submittedAt)}</span>
              <span>巡检结束：{formatDateTime(report.completedAt)}</span>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 p-4 xl:grid-cols-[minmax(0,1fr)_18px_minmax(0,1fr)]">
              <div className="min-w-0 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-4 pr-3">
                <ReportDataPanel report={report} />
              </div>

              <div className="hidden xl:flex items-stretch justify-center">
                <div className="w-px bg-slate-200" />
              </div>

              <div className="min-w-0 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-4 pr-3 mt-5 xl:mt-0">
                <ReportAnalysisPanel
                  analysisError={analysisError}
                  analysisResult={analysisResult}
                  isAnalysisLoading={isAnalysisLoading}
                  isReady={Boolean(report?.id)}
                  onAnalyze={() => void handleAnalyzeReport()}
                />
              </div>
            </div>
          </section>
        ) : null}

        {!report && !isDetailLoading && !detailError ? (
          <section className="grid min-h-[420px] place-items-center rounded-[10px] border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div>
              <FileText className="mx-auto text-slate-400" size={32} strokeWidth={2.1} />
              <div className="mt-4 text-base font-medium text-slate-700">未找到可展示的巡检报告</div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
