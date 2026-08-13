import { useEffect, type RefObject } from 'react'
import type { PomodoroStatus } from './usePomodoro'

/**
 * Negative offset so the gap grows clockwise from the 12 o'clock seam while
 * the lit tip marches clockwise — one unambiguous drain direction.
 */
const toOffset = (p: number): string =>
  String(-(100 * (1 - Math.min(1, Math.max(0, p)))))

/**
 * Drives the pomodoro ring straight from the wall clock via rAF — the arc's
 * position is a pure function of (endAt, durationMs), so it drains smoothly
 * and is always exactly in sync with the countdown, with no per-second steps.
 */
export function useContinuousRing(
  ringRef: RefObject<SVGElement | null>,
  status: PomodoroStatus,
  endAt: number | null,
  durationMs: number,
  progressFallback: number,
) {
  useEffect(() => {
    const el = ringRef.current
    if (!el || status === 'running') return
    el.setAttribute('stroke-dashoffset', toOffset(progressFallback))
  }, [ringRef, status, progressFallback])

  useEffect(() => {
    const el = ringRef.current
    if (!el || status !== 'running' || endAt === null || durationMs <= 0) return
    let raf = 0
    const tick = () => {
      el.setAttribute('stroke-dashoffset', toOffset((endAt - Date.now()) / durationMs))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ringRef, status, endAt, durationMs])
}
