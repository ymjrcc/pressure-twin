# 承压类特种设备数字孪生监测与巡检系统

基于 React、TypeScript、Vite 和 Three.js 的工业数字孪生前端项目，包含 3D 场景、设备监测、异常模拟、工艺流程和巡检报告等能力。

## 功能说明

### 3D 场景

- 基于 `@react-three/fiber` 和 `@react-three/drei` 构建车间场景。
- 包含立式储罐 `T-201`、循环泵 `PU-101`、换热器 `E-101`、卧式压力容器 `V-101 / V-102`、控制柜 `CC-101`。
- 支持设备点击选中、高亮、标签展示和视角交互。

### 设备监测

- 内置遥测数据模拟，默认每 2 秒刷新一次。
- 支持液位、压力、温度、流量、振动、PLC 负载、网络延迟等参数。
- 自动计算 `正常 / 预警 / 报警 / 离线` 状态。
- 报警状态下展示报警时间、持续时长和处置建议。

### 异常模拟

- 支持按设备整机设置预警、报警、离线状态。
- 支持按单个参数设置异常状态。
- 支持恢复单项异常或全部恢复。

### 工艺流程

- 展示闭路循环工艺路径。
- 展示各流程步骤对应设备、状态和说明。

### 巡检流程

- 支持按设备顺序启动巡检。
- 每台设备内置标准巡检项，支持记录“正常 / 异常”和备注。
- 巡检完成后自动生成统计报告。

## 技术栈

- React 19
- TypeScript
- Vite 7
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- Ant Design
- UnoCSS
- Zustand

## 操作手册

### 安装依赖

```bash
pnpm install
```

### 本地构建

```bash
pnpm build
```

构建结果默认输出到 `dist/` 目录。

### 代码检查

```bash
pnpm lint
```

### 页面交互说明

1. 在 3D 车间场景中拖拽、缩放和旋转视角，查看整体布局。
2. 点击设备查看详情和实时数据。
3. 点击左下角“工艺流程”，查看闭路循环的流程步骤说明。
4. 点击左下角“模拟预警”，设置整机或单参数异常。
5. 点击左下角“开始巡检”，按顺序完成各设备检查项并填写备注。
6. 全部巡检结束后，查看自动生成的巡检报告。

## 巡检设备与内容概览

当前系统内置 6 台设备及对应巡检项：

- `T-201` 立式储罐：液位状态、压力监测、阀门状态、泄漏检查、联锁报警
- `PU-101` 循环泵：出口压力、振动噪声、轴承温度、密封泄漏、电机状态
- `E-101` 换热器：进出口温度、壳程压力、管程压力、泄漏检查、保温外观
- `V-101` 卧式压力容器：外观防腐、压力仪表、安全阀、泄漏检查、支座管口
- `V-102` 卧式压力容器：外观防腐、压力仪表、安全阀、泄漏检查、支座管口
- `CC-101` 控制柜：供电状态、信号采集、报警指示、接线端子、柜体环境

## 项目结构

```text
src/
  components/
    models/                     3D 设备模型与材质配置
    DeviceDetailCard.tsx        设备详情卡片
    DeviceInspectionPanel.tsx   巡检执行面板
    InspectionReportDialog.tsx  巡检报告弹窗
    TelemetryControlPanel.tsx   异常模拟面板
    WorkshopLegend.tsx          图例面板
    WorkshopProcessFlow.tsx     工艺流程弹窗
    WorkshopScene.tsx           3D 车间主场景
  data/
    workshopDevices.ts          设备、巡检项、工艺流程等静态配置
    deviceTelemetry.ts          遥测参数配置与状态计算逻辑
  hooks/
    useDeviceTelemetry.ts       遥测刷新与手动异常覆盖
    useInspectionSession.ts     巡检流程状态管理
  pages/
    Home.tsx                    主页面入口
```
