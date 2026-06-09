export const equipmentMaterialConfig = {
  horizontalVessel: {
    shell: { color: '#b8c0c4', metalness: 0.66, roughness: 0.34 },
    rim: { color: '#d2d8dc', metalness: 0.68, roughness: 0.3 },
    panel: { color: '#a6b0b5', metalness: 0.58, roughness: 0.38 },
  },
  verticalTank: {
    shell: { color: '#59656b', metalness: 0.62, roughness: 0.36 },
    rim: { color: '#748088', metalness: 0.66, roughness: 0.32 },
    platform: { color: '#606b72', metalness: 0.5, roughness: 0.44 },
    agedHighlight: { color: '#a9b3b8', metalness: 0.5, roughness: 0.42, opacity: 0.18 },
    agedShadow: { color: '#2f383d', metalness: 0.38, roughness: 0.62, opacity: 0.2 },
  },
  heatExchanger: {
    shell: { color: '#a8672a', metalness: 0.34, roughness: 0.48 },
    rim: { color: '#7f4d23', metalness: 0.42, roughness: 0.46 },
    cap: { color: '#935924', metalness: 0.36, roughness: 0.5 },
  },
  pump: {
    motor: { color: '#2d526a', metalness: 0.36, roughness: 0.48 },
    casing: { color: '#244b5b', metalness: 0.4, roughness: 0.48 },
    base: { color: '#333f47', metalness: 0.24, roughness: 0.62 },
  },
  cabinet: {
    body: { color: '#c8d0d4', metalness: 0.14, roughness: 0.48 },
    door: { color: '#e1e6e9', metalness: 0.1, roughness: 0.46 },
    trim: { color: '#3f4b55', metalness: 0.24, roughness: 0.54 },
  },
  fittings: {
    darkMetal: { color: '#2f3a42', metalness: 0.42, roughness: 0.46 },
    bolt: { color: '#bfc8ce', metalness: 0.52, roughness: 0.36 },
    flange: { color: '#3d4951', metalness: 0.46, roughness: 0.44 },
    instrumentBlue: { color: '#28556c', metalness: 0.34, roughness: 0.46 },
  },
} as const

export const pipeMaterialConfig = {
  body: { color: '#075985', metalness: 0.24, roughness: 0.32, opacity: 0.48 },
  elbow: { color: '#064e7a', metalness: 0.26, roughness: 0.34, opacity: 0.52 },
  flow: {
    color: '#c7f7ff',
    emissive: '#06b6d4',
    emissiveIntensity: 0.66,
    opacity: 0.9,
  },
  flowGuide: {
    color: '#38bdf8',
    emissive: '#0369a1',
    emissiveIntensity: 0.22,
    opacity: 0.38,
  },
  signal: {
    color: '#a78bfa',
    emissive: '#7c3aed',
    emissiveIntensity: 0.16,
    opacity: 0.44,
  },
} as const

export const statusColorConfig = {
  normal: '#22c55e',
  warning: '#f59e0b',
  alarm: '#ef4444',
  data: '#22d3ee',
} as const

export const labelStyleConfig = {
  sizes: {
    deviceDistanceFactor: 10,
    deviceFontSize: 15,
    deviceBadgeFontSize: 12,
    instrumentDistanceFactor: 9,
    instrumentFontSize: 13,
  },
  device: {
    background: 'rgba(15, 23, 42, 0.82)',
    border: '1px solid rgba(148, 163, 184, 0.36)',
    color: '#f8fafc',
  },
  instrument: {
    background: 'rgba(15, 23, 42, 0.76)',
    border: '1px solid rgba(226, 232, 240, 0.22)',
    color: '#e5f4ff',
  },
} as const
