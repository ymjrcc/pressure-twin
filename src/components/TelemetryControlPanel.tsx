import { AlertTriangle, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  telemetryMetricConfigs,
  type DeviceTelemetryOverrides,
  type DeviceTelemetrySnapshot,
  type TelemetryOverrideStatus,
} from '@/data/deviceTelemetry'
import type { DeviceCode, DeviceInfo } from '@/data/workshopDevices'
import { Button } from 'antd'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type TelemetryControlPanelProps = {
  clearAllOverrides: () => void
  clearOverride: (deviceCode: DeviceCode, parameterKey?: string) => void
  devices: DeviceInfo[]
  overrides: DeviceTelemetryOverrides
  renderTrigger?: (options: { openPanel: () => void }) => ReactNode
  selectedDeviceCode: DeviceCode | null
  setDeviceOverride: (deviceCode: DeviceCode, status: TelemetryOverrideStatus) => void
  setParameterOverride: (deviceCode: DeviceCode, parameterKey: string, status: TelemetryOverrideStatus) => void
  telemetryByDevice: DeviceTelemetrySnapshot
}

type OverrideMode = 'device' | 'parameter'

type ActiveOverride = {
  deviceCode: DeviceCode
  label: string
  parameterKey?: string
  status: TelemetryOverrideStatus
}

const overrideStatusOptions: Array<{ className: string; label: string; value: TelemetryOverrideStatus }> = [
  { className: 'border-amber-300/50 bg-amber-300/15 text-amber-100', label: '预警', value: 'warning' },
  { className: 'border-rose-300/55 bg-rose-400/16 text-rose-100', label: '报警', value: 'alarm' },
  { className: 'border-slate-300/45 bg-slate-300/14 text-slate-100', label: '离线', value: 'offline' },
]

const statusLabel: Record<TelemetryOverrideStatus, string> = {
  alarm: '报警',
  offline: '离线',
  warning: '预警',
}

function getDeviceName(devices: DeviceInfo[], deviceCode: DeviceCode) {
  return devices.find((device) => device.code === deviceCode)?.name ?? deviceCode
}

function getParameterLabel(deviceCode: DeviceCode, parameterKey: string) {
  return telemetryMetricConfigs[deviceCode].find((parameter) => parameter.key === parameterKey)?.label ?? parameterKey
}

export default function TelemetryControlPanel({
  clearAllOverrides,
  clearOverride,
  devices,
  overrides,
  renderTrigger,
  selectedDeviceCode,
  setDeviceOverride,
  setParameterOverride,
  telemetryByDevice,
}: TelemetryControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<OverrideMode>('device')
  const [deviceCode, setDeviceCode] = useState<DeviceCode>(selectedDeviceCode ?? 'T-201')
  const resolvedDeviceCode = devices.some((device) => device.code === deviceCode)
    ? deviceCode
    : selectedDeviceCode ?? devices[0]?.code ?? 'T-201'
  const [parameterKey, setParameterKey] = useState(telemetryMetricConfigs[resolvedDeviceCode][0].key)
  const [status, setStatus] = useState<TelemetryOverrideStatus>('alarm')
  const activeOverrides = useMemo<ActiveOverride[]>(
    () =>
      devices.flatMap((device) => {
        const override = overrides[device.code]
        const deviceOverride = override?.device
          ? [{ deviceCode: device.code, label: '整机', status: override.device }]
          : []
        const parameterOverrides = Object.entries(override?.parameters ?? {}).map(([key, parameterStatus]) => ({
          deviceCode: device.code,
          label: getParameterLabel(device.code, key),
          parameterKey: key,
          status: parameterStatus,
        }))

        return [...deviceOverride, ...parameterOverrides]
      }),
    [overrides],
  )
  const selectedParameters = telemetryByDevice[resolvedDeviceCode].parameters
  const selectedParameterKey = selectedParameters.some((parameter) => parameter.key === parameterKey)
    ? parameterKey
    : selectedParameters[0].key

  const applyOverride = () => {
    if (mode === 'device') {
      setDeviceOverride(resolvedDeviceCode, status)
      return
    }

    setParameterOverride(resolvedDeviceCode, selectedParameterKey, status)
  }

  const openPanel = () => {
    setDeviceCode(selectedDeviceCode ?? resolvedDeviceCode)
    setIsOpen(true)
  }

  if (devices.length === 0) {
    return renderTrigger ? renderTrigger({ openPanel: () => undefined }) : null
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ openPanel })
      ) : (
        <button
          aria-label="打开异常模拟"
          className="pointer-events-auto absolute left-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-[6px] border border-rose-300/35 bg-slate-950/78 p-0 text-rose-100 shadow-lg shadow-slate-950/25 backdrop-blur hover:border-rose-200/60 hover:bg-rose-400/18 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200"
          onClick={openPanel}
          title="异常模拟"
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={2.4} />
        </button>
      )}

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[2147483647] grid place-items-center bg-slate-950/24 px-4 py-6 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
            >
              <section
                className="pointer-events-auto grid max-h-[calc(100vh-7rem)] w-[520px] max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto rounded-[8px] border border-white/20 bg-slate-900/92 px-4 py-4 text-white shadow-2xl shadow-slate-950/35 backdrop-blur"
                onClick={(event) => event.stopPropagation()}
              >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase text-rose-300">异常模拟</div>
                <h2 className="m-0 mt-1 text-base font-extrabold leading-tight text-white">手动运行状态</h2>
              </div>
              <button
                aria-label="关闭异常模拟"
                className="grid h-8 w-8 place-items-center rounded-[6px] border border-white/12 bg-white/6 p-0 text-slate-200 shadow-none hover:border-rose-200/45 hover:bg-rose-300/12 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="grid gap-3 rounded-[6px] border border-white/12 bg-white/7 px-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                  设备
                  <select
                    className="h-9 rounded-[6px] border border-white/14 bg-slate-950/70 px-2 text-sm font-bold text-white outline-none focus:border-cyan-200"
                    onChange={(event) => setDeviceCode(event.target.value as DeviceCode)}
                    value={resolvedDeviceCode}
                  >
                    {devices.map((device) => (
                      <option key={device.code} value={device.code}>
                        {device.code} {device.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                  级别
                  <select
                    className="h-9 rounded-[6px] border border-white/14 bg-slate-950/70 px-2 text-sm font-bold text-white outline-none focus:border-rose-200"
                    onChange={(event) => setStatus(event.target.value as TelemetryOverrideStatus)}
                    value={status}
                  >
                    {overrideStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['device', 'parameter'] as const).map((nextMode) => (
                  <button
                    key={nextMode}
                    className={`h-9 rounded-[6px] border px-3 py-0 text-sm font-extrabold shadow-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 ${
                      mode === nextMode
                        ? 'border-cyan-200 bg-cyan-300/18 text-cyan-50'
                        : 'border-white/12 bg-white/6 text-slate-300 hover:border-cyan-200/45 hover:bg-cyan-300/10 hover:text-white'
                    }`}
                    onClick={() => setMode(nextMode)}
                    type="button"
                  >
                    {nextMode === 'device' ? '整机异常' : '单参数异常'}
                  </button>
                ))}
              </div>

              {mode === 'parameter' ? (
                <label className="grid gap-1.5 text-xs font-bold text-slate-300">
                  参数
                  <select
                    className="h-9 rounded-[6px] border border-white/14 bg-slate-950/70 px-2 text-sm font-bold text-white outline-none focus:border-cyan-200"
                    onChange={(event) => setParameterKey(event.target.value)}
                    value={selectedParameterKey}
                  >
                    {selectedParameters.map((parameter) => (
                      <option key={parameter.key} value={parameter.key}>
                        {parameter.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {overrideStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 py-0 text-xs font-extrabold shadow-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200 ${
                      status === option.value ? option.className : 'border-white/12 bg-white/6 text-slate-300 hover:border-white/28 hover:text-white'
                    }`}
                    onClick={() => setStatus(option.value)}
                    type="button"
                  >
                    <AlertTriangle aria-hidden="true" size={14} strokeWidth={2.4} />
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <Button
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] px-4 py-0 text-sm font-extrabold text-white"
                  onClick={applyOverride}
                  type="primary"
                >
                  <AlertTriangle aria-hidden="true" size={16} strokeWidth={2.4} />
                  确认
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 text-sm font-bold text-slate-200">当前模拟项</h3>
                <button
                  className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-white/12 bg-white/6 px-3 py-0 text-xs font-extrabold text-slate-200 shadow-none hover:border-cyan-200/45 hover:bg-cyan-300/12 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={activeOverrides.length === 0}
                  onClick={clearAllOverrides}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" size={14} strokeWidth={2.4} />
                  全部恢复
                </button>
              </div>

              {activeOverrides.length > 0 ? (
                <div className="grid gap-2">
                  {activeOverrides.map((override) => (
                    <div
                      key={`${override.deviceCode}-${override.parameterKey ?? 'device'}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[6px] border border-white/12 bg-white/7 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 rounded-[4px] border border-sky-300/50 bg-sky-300/18 px-2 py-1 text-[11px] font-extrabold leading-none text-sky-100">
                            {override.deviceCode}
                          </span>
                          <span className="min-w-0 truncate text-xs font-bold text-slate-200">
                            {getDeviceName(devices, override.deviceCode)} / {override.label}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] font-bold text-rose-200">{statusLabel[override.status]}</div>
                      </div>
                      <button
                        aria-label={`恢复 ${override.deviceCode} ${override.label}`}
                        className="grid h-8 w-8 place-items-center rounded-[6px] border border-white/12 bg-white/6 p-0 text-slate-200 shadow-none hover:border-cyan-200/45 hover:bg-cyan-300/12 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                        onClick={() => clearOverride(override.deviceCode, override.parameterKey)}
                        type="button"
                      >
                        <RotateCcw aria-hidden="true" size={14} strokeWidth={2.4} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[6px] border border-white/10 bg-white/6 px-3 py-3 text-sm font-semibold text-slate-400">
                  暂无手动异常
                </div>
              )}
            </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
