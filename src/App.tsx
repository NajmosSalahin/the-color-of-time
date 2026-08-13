import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useClock } from './hooks/useClock'
import { useHexTimeColor } from './hooks/useHexTimeColor'
import { useAlarms } from './hooks/useAlarms'
import { usePomodoro } from './hooks/usePomodoro'
import { unlockAudio } from './utils/audio'
import {
  NOTIFICATION_EVENT,
  requestNotificationPermission,
  type AppNotification,
} from './utils/notify'
import Clock from './components/Clock'
import FormatToggle from './components/FormatToggle'
import AlarmPanel from './components/AlarmPanel'
import PomodoroPanel from './components/PomodoroPanel'
import RingingModal from './components/RingingModal'
import { BellIcon, TimerIcon } from './components/icons'

const FORMAT_KEY = 'big-clock.format.v1'

function loadFormat(): boolean {
  try {
    return localStorage.getItem(FORMAT_KEY) === '12h'
  } catch {
    return false
  }
}

export default function App() {
  const now = useClock()
  const hexTime = useHexTimeColor(now)
  const [use12h, setUse12h] = useState(loadFormat)
  const [panel, setPanel] = useState<'alarm' | 'pomodoro' | null>(null)
  const [toasts, setToasts] = useState<AppNotification[]>([])

  const alarms = useAlarms(now)
  const pomodoro = usePomodoro(now)

  useEffect(() => {
    try {
      localStorage.setItem(FORMAT_KEY, use12h ? '12h' : '24h')
    } catch {
      /* not persisted — fine */
    }
  }, [use12h])

  /* in-app notifications when browser notifications can't be shown */
  useEffect(() => {
    const onNotify = (e: Event) => {
      const detail = (e as CustomEvent<AppNotification>).detail
      setToasts((t) => [...t, detail])
      window.setTimeout(
        () => setToasts((t) => t.filter((n) => n.id !== detail.id)),
        6000,
      )
    }
    window.addEventListener(NOTIFICATION_EVENT, onNotify)
    return () => window.removeEventListener(NOTIFICATION_EVENT, onNotify)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openPanel = useCallback((which: 'alarm' | 'pomodoro') => {
    unlockAudio()
    void requestNotificationPermission()
    setPanel((p) => (p === which ? null : which))
  }, [])

  const pomodoroView = useMemo(
    () => ({
      active: pomodoro.status !== 'idle',
      mode: pomodoro.mode,
      remaining: pomodoro.remaining,
    }),
    [pomodoro.status, pomodoro.mode, pomodoro.remaining],
  )

  return (
    <div
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-room text-phosphor"
      style={{ '--hex-time': hexTime } as CSSProperties}
    >
      {/* the lit floor — the only ambient light in the room */}
      <div
        aria-hidden
        className="light-pool pointer-events-none absolute bottom-[-8%] left-1/2 h-[46vh] w-[150vw] -translate-x-1/2"
      />

      {/* status bar */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden className="led-dot inline-block h-1.5 w-1.5 rounded-full" />
          <span className="eyebrow text-phosphor">The Color of Time</span>
        </div>
        <div className="flex items-center gap-2">
          <FormatToggle use12h={use12h} onChange={setUse12h} />
          <div className="mx-1 hidden h-6 w-px bg-hairline sm:block" />
          <button
            aria-label="Alarms"
            aria-expanded={panel === 'alarm'}
            onClick={() => openPanel('alarm')}
            className={`rounded-sm border border-hairline p-2.5 transition-colors ${
              panel === 'alarm' ? 'bg-hairline text-white' : 'text-dim hover:text-phosphor'
            }`}
          >
            <BellIcon size={17} />
          </button>
          <button
            aria-label="Focus timer"
            aria-expanded={panel === 'pomodoro'}
            onClick={() => openPanel('pomodoro')}
            className={`rounded-sm border border-hairline p-2.5 transition-colors ${
              panel === 'pomodoro'
                ? 'bg-hairline text-white'
                : 'text-dim hover:text-phosphor'
            }`}
          >
            <TimerIcon size={17} />
          </button>
        </div>
      </header>

      {/* the hero */}
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-[6vh]">
        <Clock now={now} use12h={use12h} hexTime={hexTime} pomodoro={pomodoroView} />
      </main>

      <AlarmPanel
        open={panel === 'alarm'}
        alarms={alarms.alarms}
        onAdd={alarms.addAlarm}
        onUpdate={alarms.updateAlarm}
        onDelete={alarms.deleteAlarm}
        onToggle={alarms.toggleAlarm}
        onClose={() => setPanel(null)}
      />
      <PomodoroPanel
        open={panel === 'pomodoro'}
        mode={pomodoro.mode}
        status={pomodoro.status}
        settings={pomodoro.settings}
        remaining={pomodoro.remaining}
        completed={pomodoro.completed}
        cycle={pomodoro.cycle}
        cycleLength={pomodoro.cycleLength}
        onStart={pomodoro.start}
        onPause={pomodoro.pause}
        onReset={pomodoro.reset}
        onSkip={pomodoro.skip}
        onSetDuration={pomodoro.setDuration}
        onSetCycleLength={pomodoro.setCycleLength}
        onClose={() => setPanel(null)}
      />
      <RingingModal
        ringing={alarms.ringing}
        onSnooze={alarms.snoozeRinging}
        onDismiss={alarms.dismissRinging}
      />

      {/* in-app notification fallbacks */}
      <div className="pointer-events-none fixed right-4 top-16 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="border border-hairline bg-enclosure/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            style={{ borderLeft: `2px solid ${hexTime}` }}
          >
            <p className="eyebrow text-phosphor">{t.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-dim">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}