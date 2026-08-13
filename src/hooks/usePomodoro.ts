import { useCallback, useEffect, useRef, useState } from 'react'
import { minutesToLabel } from '../utils/time'
import { sendNotification } from '../utils/notify'
import { playChime } from '../utils/audio'

export type PomodoroMode = 'work' | 'short' | 'long'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

export interface PomodoroSettings {
  work: number
  short: number
  long: number
}

export interface PomodoroState {
  settings: PomodoroSettings
  mode: PomodoroMode
  status: PomodoroStatus
  /** Absolute timestamp the current phase ends at (drift-free). */
  endAt: number | null
  /** Remaining ms frozen when the phase was paused, so pause truly stops time. */
  pausedRemaining: number | null
  /** Completed work sessions, all time. */
  completed: number
  /** Work sessions finished in the current 4-session cycle (0-3). */
  cycle: number
}

const STORAGE_KEY = 'big-clock.pomodoro.v1'
export const DEFAULT_SETTINGS: PomodoroSettings = { work: 25, short: 5, long: 15 }

export const MODE_LABELS: Record<PomodoroMode, string> = {
  work: 'Work',
  short: 'Short break',
  long: 'Long break',
}

const clampMinutes = (n: number): number => Math.min(120, Math.max(1, Math.round(n)))

function loadState(): PomodoroState {
  const fresh: PomodoroState = {
    settings: DEFAULT_SETTINGS,
    mode: 'work',
    status: 'idle',
    endAt: null,
    pausedRemaining: null,
    completed: 0,
    cycle: 0,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fresh
    const parsed = JSON.parse(raw) as Partial<PomodoroState> & {
      settings?: Partial<PomodoroSettings>
    }
    if (parsed.mode === 'work' || parsed.mode === 'short' || parsed.mode === 'long') {
      fresh.mode = parsed.mode
    }
    if (parsed.status === 'running' || parsed.status === 'paused') {
      fresh.status = parsed.status
    }
    if (typeof parsed.endAt === 'number') fresh.endAt = parsed.endAt
    if (typeof parsed.completed === 'number') fresh.completed = parsed.completed
    if (typeof parsed.cycle === 'number') fresh.cycle = parsed.cycle
    fresh.settings = {
      work: clampMinutes(parsed.settings?.work ?? DEFAULT_SETTINGS.work),
      short: clampMinutes(parsed.settings?.short ?? DEFAULT_SETTINGS.short),
      long: clampMinutes(parsed.settings?.long ?? DEFAULT_SETTINGS.long),
    }
    if (typeof parsed.pausedRemaining === 'number') {
      fresh.pausedRemaining = Math.min(
        fresh.settings[fresh.mode] * 60_000,
        Math.max(0, parsed.pausedRemaining),
      )
    }
    // a phase that should already have ended while the tab was closed
    if (fresh.status === 'running' && fresh.endAt !== null && fresh.endAt < Date.now()) {
      fresh.status = 'idle'
      fresh.endAt = null
    }
    return fresh
  } catch {
    return fresh
  }
}

export function usePomodoro(now: Date) {
  const [state, setState] = useState<PomodoroState>(loadState)
  const { settings, mode, status, endAt } = state
  const durationMs = settings[mode] * 60_000

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* persistence unavailable — session just won't survive a refresh */
    }
  }, [state])

  /* auto-advance when the phase ends — adjust state during render, so the
     update is derived from the tick rather than tucked away in an effect */
  if (status === 'running' && endAt !== null && now.getTime() >= endAt) {
    setState((s) => {
      let completed = s.completed
      let cycle = s.cycle
      let nextMode: PomodoroMode = 'work'
      if (s.mode === 'work') {
        completed += 1
        cycle = (cycle + 1) % 4
        nextMode = cycle === 0 ? 'long' : 'short'
      }
      return {
        ...s,
        mode: nextMode,
        status: 'running',
        pausedRemaining: null,
        completed,
        cycle,
        endAt: Date.now() + s.settings[nextMode] * 60_000,
      }
    })
  }

  /* sound + notification at each transition */
  const prevModeRef = useRef<PomodoroMode | null>(null)
  useEffect(() => {
    const prev = prevModeRef.current
    prevModeRef.current = mode
    if (prev === null || prev === mode) return
    const finishedWork = prev === 'work'
    playChime()
    sendNotification(
      finishedWork ? 'Session complete' : 'Break over',
      finishedWork
        ? mode === 'long'
          ? 'Long break — you earned it.'
          : 'Take a short break.'
        : 'Back to work.',
    )
  }, [mode])

  const start = useCallback(() => {
    setState((s) => {
      const resumeFrom =
        s.status === 'paused' && s.pausedRemaining !== null
          ? Date.now() + s.pausedRemaining
          : null
      return {
        ...s,
        status: 'running',
        pausedRemaining: null,
        endAt: resumeFrom ?? s.endAt ?? Date.now() + s.settings[s.mode] * 60_000,
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((s) => {
      if (s.status !== 'running' || s.endAt === null) return s
      return {
        ...s,
        status: 'paused',
        pausedRemaining: Math.max(0, s.endAt - Date.now()),
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      mode: 'work',
      status: 'idle',
      endAt: null,
      pausedRemaining: null,
      cycle: 0,
    }))
  }, [])

  const skip = useCallback(() => {
    setState((s) => {
      const nextMode: PomodoroMode = s.mode === 'work' ? 'short' : 'work'
      return {
        ...s,
        mode: nextMode,
        status: 'running',
        pausedRemaining: null,
        endAt: Date.now() + s.settings[nextMode] * 60_000,
      }
    })
  }, [])

  const setDuration = useCallback((which: keyof PomodoroSettings, minutes: number) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, [which]: clampMinutes(minutes) },
    }))
  }, [])

  const remainingSeconds =
    status === 'running' && endAt !== null
      ? Math.max(0, endAt - now.getTime()) / 1000
      : status === 'paused'
        ? (state.pausedRemaining ?? durationMs) / 1000
        : durationMs / 1000
  const progress =
    durationMs > 0
      ? Math.min(1, Math.max(0, remainingSeconds / (durationMs / 1000)))
      : 0

  return {
    state,
    mode,
    status,
    settings,
    completed: state.completed,
    cycle: state.cycle,
    endAt,
    durationMs,
    remaining: minutesToLabel(remainingSeconds),
    progress,
    start,
    pause,
    reset,
    skip,
    setDuration,
  }
}