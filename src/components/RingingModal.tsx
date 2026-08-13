import type { RingingAlarm } from '../hooks/useAlarms'

interface RingingModalProps {
  ringing: RingingAlarm | null
  onSnooze: () => void
  onDismiss: () => void
}

/** Full-screen alert while an alarm rings. Snoozes for five minutes. */
export default function RingingModal({ ringing, onSnooze, onDismiss }: RingingModalProps) {
  if (!ringing) return null

  return (
    <div
      role="alertdialog"
      aria-label="Alarm ringing"
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
          onClick={onDismiss}
          className="rounded-sm bg-white px-6 py-3 text-sm text-black transition-opacity hover:opacity-85"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}