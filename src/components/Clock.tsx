import { useEffect, useMemo, useState } from 'react'
import { formattedTime } from '../utils/time'
import type { PomodoroMode } from '../hooks/usePomodoro'
import { MODE_LABELS } from '../hooks/usePomodoro'
import HexBadge from './HexBadge'

interface PomodoroView {
  active: boolean
  mode: PomodoroMode
  remaining: string
}

interface ClockProps {
  now: Date
  use12h: boolean
  hexTime: string
  pomodoro?: PomodoroView
}

/** Rough luminance of the hex time — used to keep the bloom honest near #000000. */
function isNearBlack(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 6
}

export default function Clock({ now, use12h, hexTime, pomodoro }: ClockProps) {
  const [powering, setPowering] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setPowering(false), 750)
    return () => window.clearTimeout(t)
  }, [])

  const { text, suffix } = formattedTime(now, use12h)
  const [hh, mm, ss] = text.split(':')
  const darkHour = useMemo(() => isNearBlack(hexTime), [hexTime])

  return (
    <div className="pointer-events-none flex select-none flex-col items-center">
      <div className="relative">
        {/* phosphor bloom behind the digits */}
        <div
          aria-hidden
          className={`led-bloom absolute -inset-x-[16%] -inset-y-[26%] ${darkHour ? 'is-off' : ''}`}
        />

        {/* the digits */}
        <div
          className="led-display power-on relative z-10 flex items-start text-[clamp(3.25rem,15vw,13rem)] leading-none tracking-[-0.02em]"
          role="timer"
          aria-label={`Current time, ${use12h ? '12 hour' : '24 hour'} format`}
        >
          <span className="tabular-nums">
            {hh}
            <span className="led-colon" aria-hidden>
              :
            </span>
            {mm}
            <span className="led-colon" aria-hidden>
              :
            </span>
            {ss}
          </span>
          <span
            aria-hidden
            className="mt-[0.14em] w-[2.4em] shrink-0 pl-[0.35em] font-mono text-[0.2em] font-medium tracking-[0.28em] text-phosphor"
          >
            {suffix || '\u00a0'}
          </span>
        </div>

        {/* one scanline as the segments wake */}
        {powering && (
          <div
            aria-hidden
            className="scanline pointer-events-none absolute inset-x-[-8%] top-0 h-[22%] bg-gradient-to-b from-transparent via-white/10 to-transparent"
          />
        )}
      </div>

      <div className="relative z-10 mt-[0.9em] flex flex-col items-center gap-2">
        <HexBadge hex={hexTime} />
        {pomodoro?.active && (
          <span
            data-testid="phase-chip"
            className="eyebrow rounded-sm border border-hairline bg-enclosure/70 px-2.5 py-1 text-dim"
          >
            {MODE_LABELS[pomodoro.mode].toUpperCase()} · {pomodoro.remaining}
          </span>
        )}
      </div>
    </div>
  )
}