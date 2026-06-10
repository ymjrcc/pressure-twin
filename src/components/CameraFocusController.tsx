import { useEffect, useMemo, useRef, type ComponentRef, type RefObject } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import type { DeviceCode } from '@/data/workshopDevices'

type SceneFocusTarget = {
  distance: number
  target: [number, number, number]
}

type CameraAnimation = {
  duration: number
  elapsed: number
  fromPosition: Vector3
  fromTarget: Vector3
  toPosition: Vector3
  toTarget: Vector3
}

type CameraFocusControllerProps = {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
  controlInteractionVersion: number
  selectedDeviceCode: DeviceCode | null
}

const defaultCameraPosition = new Vector3(-8, 6.6, 15)
const defaultControlsTarget = new Vector3(0.5, 1, -0.2)
const deviceFocusTargets: Record<DeviceCode, SceneFocusTarget> = {
  'CC-101': { distance: 10.5, target: [-0.9, 1.5, 5.55] },
  'E-101': { distance: 11.5, target: [-3.4, 1.25, 1.5] },
  'PU-101': { distance: 10.5, target: [1.6, 1, 1.8] },
  'T-201': { distance: 12, target: [5.2, 2.3, 2.3] },
  'V-101': { distance: 13, target: [-4.2, 1.85, -3.2] },
  'V-102': { distance: 13, target: [2.6, 1.85, -3.2] },
}

export default function CameraFocusController({
  controlsRef,
  controlInteractionVersion,
  selectedDeviceCode,
}: CameraFocusControllerProps) {
  const focusTarget = selectedDeviceCode ? deviceFocusTargets[selectedDeviceCode] : null
  const animationRef = useRef<CameraAnimation | null>(null)
  const previousSelectedDeviceRef = useRef<DeviceCode | null>(null)
  const cameraTarget = useMemo(() => new Vector3(), [])
  const controlsTarget = useMemo(() => new Vector3(), [])

  useEffect(() => {
    animationRef.current = null
  }, [controlInteractionVersion])

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current
    const selectedDeviceChanged = previousSelectedDeviceRef.current !== selectedDeviceCode

    if (selectedDeviceChanged) {
      previousSelectedDeviceRef.current = selectedDeviceCode

      if (focusTarget) {
        controlsTarget.fromArray(focusTarget.target)
        const direction = camera.position.clone().sub(controlsTarget).normalize()
        cameraTarget.copy(controlsTarget).addScaledVector(direction, focusTarget.distance)
      } else {
        controlsTarget.copy(defaultControlsTarget)
        cameraTarget.copy(defaultCameraPosition)
      }

      animationRef.current = {
        duration: 0.82,
        elapsed: 0,
        fromPosition: camera.position.clone(),
        fromTarget: controls?.target.clone() ?? defaultControlsTarget.clone(),
        toPosition: cameraTarget.clone(),
        toTarget: controlsTarget.clone(),
      }
    }

    const animation = animationRef.current

    if (!animation) {
      return
    }

    animation.elapsed = Math.min(animation.elapsed + delta, animation.duration)
    const progress = animation.elapsed / animation.duration
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    camera.position.lerpVectors(animation.fromPosition, animation.toPosition, easedProgress)

    if (controls) {
      controls.target.lerpVectors(animation.fromTarget, animation.toTarget, easedProgress)
      controls.update()
    }

    camera.updateProjectionMatrix()

    if (progress >= 1) {
      animationRef.current = null
    }
  })

  return null
}
