import type { PomodoroSettings } from '../hooks/usePomodoro'
import { MODE_LABELS } from '../hooks/usePomodoro'
import Panel from './Panel'
import { MinusIcon, PlusIcon } from './icons'

interface PomodoroPanelProps {
  open: boolean
  mode: keyof typeof MODE_LABELS
  status: 'idle' | 'running' | 'paused'
  settings: PomodoroSettings
  remaining: string
  completed: number
  cycle: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onSetDuration: (which: keyof PomodoroSettings, minutes: number) => void
  onClose: () => void
}

const DURATION_ROWS: { key: keyof PomodoroSettings; label: string }[] = [
  { key: 'work', label: 'Work' },
  { key: 'short', label: 'Short break' },
  { key: 'long', label: 'Long break' },
]

export default function PomodoroPanel({
  open,
  mode,
  status,
  settings,
  remaining,
  completed,
  cycle,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSetDuration,
  onClose,
}: PomodoroPanelProps) {
  const running = status === 'running'

  return (
    <Panel open={open} title="Focus timer" meta={`${completed} done`} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <section className="border-b border-hairline pb-5">
          <p className="eyebrow text-dim">Now</p>
          <p className="mt-2 text-sm text-phosphor">{MODE_LABELS[mode]}</p>
          <p className="mt-1 text-4xl tracking-[0.1em] text-white">{remaining}</p>
          <div className="mt-4 flex gap-1.5" aria-label={`${cycle} of 4 sessions in this cycle`}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-500"
                style={{
                  backgroundColor:
                    i < cycle ? 'color-mix(in srgb, var(--hex-time) 60%, var(--color-hairline))' : 'var(--color-hairline)',
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-dim">
            Every 4th session is a long break. The timer runs while this tab is open.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          {running ? (
            <button
              onClick={onPause}
              className="rounded-sm border border-hairline bg-hairline px-4 py-2.5 text-sm text-phosphor transition-colors hover:border-phosphor/40 hover:text-white"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              className="rounded-sm border border-hairline bg-hairline px-4 py-2.5 text-sm text-phosphor transition-colors hover:border-phosphor/40 hover:text-white"
            >
              Start
            </button>
          )}
          <button
            onClick={onSkip}
            className="rounded-sm border border-hairline px-4 py-2.5 text-sm text-dim transition-colors hover:text-phosphor"
          >
            Skip phase
          </button>
          <button
            onClick={onReset}
            className="rounded-sm border border-hairline px-4 py-2.5 text-sm text-dim transition-colors hover:text-phosphor"
          >
            Reset
          </button>
        </section>

        <section className="border-t border-hairline pt-5">
          <p className="eyebrow text-dim">Durations</p>
          <ul className="mt-3 flex flex-col gap-2">
            {DURATION_ROWS.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between rounded-sm border border-hairline px-3 py-2"
              >
                <span className="text-sm text-phosphor">{row.label}</span>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Decrease ${row.label} duration`}
                    onClick={() => onSetDuration(row.key, settings[row.key] - 1)}
                    className="rounded-sm p-1.5 text-dim transition-colors hover:text-phosphor"
                  >
                    <MinusIcon size={13} />
                  </button>
                  <span className="w-10 text-center text-sm text-white">
                    {settings[row.key]}<span className="text-dim">m</span>
                  </span>
                  <button
                    aria-label={`Increase ${row.label} duration`}
                    onClick={() => onSetDuration(row.key, settings[row.key] + 1)}
                    className="rounded-sm p-1.5 text-dim transition-colors hover:text-phosphor"
                  >
                    <PlusIcon size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Panel>
  )
}