import { useEffect, useState } from 'react'
import { FileText, RefreshCcw } from 'lucide-react'
import { Button, Table } from 'antd'
import type { TableProps } from 'antd'
import { Link } from 'react-router-dom'

import { listInspectionReports } from '@/api/inspections'
import type { InspectionReportListItem } from '@/types/inspection'

import { formatDateTime } from './reports/shared'

function ReportStatusTag({ abnormalItemCount }: { abnormalItemCount: number }) {
  const isAbnormal = abnormalItemCount > 0

  return (
    <span
      className={`inline-flex rounded-[999px] px-2.5 py-1 text-xs font-medium ${
        isAbnormal
          ? 'border border-rose-200 bg-rose-100 text-rose-700'
          : 'border border-emerald-200 bg-emerald-100 text-emerald-700'
      }`}
    >
      {isAbnormal ? '有异常' : '正常'}
    </span>
  )
}

export default function Reports() {
  const [reports, setReports] = useState<InspectionReportListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setReports(await listInspectionReports())
    } catch (loadError) {
      setReports([])
      setError(loadError instanceof Error ? loadError.message : '加载巡检报告列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const columns: TableProps<InspectionReportListItem>['columns'] = [
    {
      dataIndex: 'id',
      key: 'id',
      render: (value: number) => <span className="font-medium text-slate-900">#{value}</span>,
      title: '报告编号',
      width: 120,
    },
    {
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (value: number) => formatDateTime(value),
      title: '提交时间',
      width: 180,
    },
    {
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (value: number) => formatDateTime(value),
      title: '巡检时间',
      width: 180,
    },
    {
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      title: '设备数',
      width: 100,
    },
    {
      dataIndex: 'normalItemCount',
      key: 'normalItemCount',
      title: '正常项',
      width: 100,
    },
    {
      dataIndex: 'abnormalItemCount',
      key: 'abnormalItemCount',
      title: '异常项',
      width: 100,
    },
    {
      key: 'status',
      render: (_, record) => <ReportStatusTag abnormalItemCount={record.abnormalItemCount} />,
      title: '状态',
      width: 120,
    },
    {
      fixed: 'right',
      key: 'action',
      render: (_, record) => (
        <Button className="px-0 text-sm font-medium" color="default" type="link">
          <Link to={`/reports/${record.id}`}>查看详情</Link>
        </Button>
      ),
      title: '操作',
      width: 120,
    },
  ]

  return (
    <div className="min-h-full bg-slate-100 px-6 py-6 md:px-8">
      <div className="mx-auto max-w-[1920px]">
        <section className="rounded-[10px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 pt-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 my-0">巡检报告</h2>
              <div className="mt-1 text-sm text-slate-500">共 {reports.length} 条报告记录</div>
            </div>
            <Button
              className="h-9 rounded-[6px] border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-none hover:!border-slate-400 hover:!text-slate-900"
              icon={<RefreshCcw size={15} strokeWidth={2.2} />}
              loading={isLoading}
              onClick={() => void loadReports()}
            >
              刷新
            </Button>
          </div>

          <div className="p-5">
            {error ? (
              <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                列表加载失败：{error}
              </div>
            ) : null}

            {!error ? (
              <Table
                className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:tracking-[0.08em] [&_.ant-table-thead>tr>th]:text-slate-500 [&_.ant-table-tbody>tr>td]:text-sm [&_.ant-table-tbody>tr:hover>td]:bg-slate-50 [&_.ant-table-cell-fix-right]:bg-white"
                columns={columns}
                dataSource={reports}
                loading={isLoading}
                locale={{
                  emptyText: (
                    <div className="grid gap-3 rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                      <FileText className="mx-auto text-slate-400" size={28} strokeWidth={2} />
                      <div className="text-base font-medium text-slate-700">暂无已提交巡检报告</div>
                      <div className="text-sm text-slate-500">请先从首页完成巡检并提交报告。</div>
                    </div>
                  ),
                }}
                pagination={false}
                rowKey="id"
                scroll={{ x: 1100 }}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
