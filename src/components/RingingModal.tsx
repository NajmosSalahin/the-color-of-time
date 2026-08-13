import { useEffect, useRef } from 'react'
import type { RingingAlarm } from '../hooks/useAlarms'

interface RingingModalProps {
  ringing: RingingAlarm | null
  onSnooze: () => void
  onDismiss: () => void
}

/** Full-screen alert while an alarm rings. Snoozes for five minutes. */
export default function RingingModal({ ringing, onSnooze, onDismiss }: RingingModalProps) {
  const dismissRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (ringing) dismissRef.current?.focus()
  }, [ringing])

  if (!ringing) return null

  return (
    <div
      role="alertdialog"
      aria-label="Alarm ringing"
      onKeyDown={(e) => {
        // Escape snoozes rather than dismisses — a missed alarm should
        // never be silently cancelled
        if (e.key === 'Escape') onSnooze()
      }}
      className="ring-pulse fixed inset-0 z-50 flex flex-col items-center justify-center bg-room/70 px-6 text-center backdrop-blur-sm"
    >
      <p className="eyebrow text-[0.7rem] tracking-[0.4em] text-white/85">Alarm</p>
      <p
        className="mt-4 text-6xl leading-none text-white sm:text-8xl"
        style={{ fontFamily: "'DSEG7', 'IBM Plex Mono', monospace" }}
      >
        {ringing.time}
      </p>
      <p className="mt-4 text-sm text-phosphor">{ringing.title}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onSnooze}
          className="rounded-sm border border-white/25 bg-white/5 px-6 py-3 text-sm text-white transition-colors hover:border-white/50"
        >
          Snooze 5 min
        </button>
        <button
          ref={dismissRef}
          onClick={onDismiss}
          className="rounded-sm bg-white px-6 py-3 text-sm text-black transition-opacity outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-phosphor/70"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}