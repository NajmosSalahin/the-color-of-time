import { useEffect, useMemo, useState } from 'react'
import { pad2, todayKey } from '../utils/time'
import { sendNotification } from '../utils/notify'
import { startAlarmRing } from '../utils/audio'

export interface Alarm {
  id: string
  /** 24-hour "HH:MM" — never display-dependent. */
  time: string
  label: string
  enabled: boolean
  repeat: 'once' | 'daily'
  /** Day key ("YYYY-MM-DD") of the last time this alarm fired. */
  lastFired: string | null
}

const STORAGE_KEY = 'big-clock.alarms.v1'
const SNOOZE_MS = 5 * 60 * 1000

export interface RingingAlarm {
  alarmId: string
  time: string
  title: string
}

function loadAlarms(): Alarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (a): a is Alarm =>
        typeof a === 'object' &&
        a !== null &&
        typeof (a as Alarm).id === 'string' &&
        typeof (a as Alarm).time === 'string' &&
        /^\d{2}:\d{2}$/.test((a as Alarm).time),
    )
  } catch {
    return []
  }
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function useAlarms(now: Date) {
  const [alarms, setAlarms] = useState<Alarm[]>(loadAlarms)
  const [ringing, setRinging] = useState<RingingAlarm | null>(null)
  /** alarmId -> timestamp until which it stays silent after a snooze. */
  const [snoozes, setSnoozes] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
    } catch {
      /* storage full or unavailable — alarms just won't persist */
    }
  }, [alarms])

  /* fire the alarm audio loop + notification while something is ringing */
  useEffect(() => {
    if (!ringing) return
    const stop = startAlarmRing()
    sendNotification('Alarm', ringing.title)
    return stop
  }, [ringing])

  /* per-second matching against true 24-hour time — derived from the tick
     during render, the same way React handles adjusting state on change */
  const hh = pad2(now.getHours())
  const mm = pad2(now.getMinutes())
  const current = `${hh}:${mm}`
  const day = todayKey(now)

  const due = alarms.find((a) => {
    if (!a.enabled || a.time !== current) return false
    if (snoozes[a.id] && snoozes[a.id] > now.getTime()) return false
    if (a.repeat === 'daily' && a.lastFired === day) return false
    if (a.repeat === 'once' && a.lastFired !== null) return false
    return true
  })

  if (due) {
    setSnoozes((s) => {
      const next = { ...s }
      delete next[due.id]
      return next
    })
    setAlarms((list) =>
      list.map((a) =>
        a.id === due.id
          ? {
              ...a,
              lastFired: day,
              enabled: a.repeat === 'once' ? false : a.enabled,
            }
          : a,
      ),
    )
    setRinging({
      alarmId: due.id,
      time: due.time,
      title: due.label || `Alarm ${due.time}`,
    })
  }

  const addAlarm = (time: string, label: string, repeat: Alarm['repeat']) =>
    setAlarms((list) => [
      ...list,
      { id: makeId(), time, label, enabled: true, repeat, lastFired: null },
    ])

  const updateAlarm = (
    id: string,
    patch: Partial<Pick<Alarm, 'time' | 'label' | 'repeat' | 'enabled'>>,
  ) => setAlarms((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const deleteAlarm = (id: string) => {
    setAlarms((list) => list.filter((a) => a.id !== id))
    setRinging((r) => (r && r.alarmId === id ? null : r))
  }

  const toggleAlarm = (id: string) =>
    setAlarms((list) =>
      list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    )

  const dismissRinging = () => setRinging(null)

  const snoozeRinging = () => {
    if (!ringing) return
    setSnoozes((s) => ({ ...s, [ringing.alarmId]: Date.now() + SNOOZE_MS }))
    setRinging(null)
  }

  const sorted = useMemo(
    () => [...alarms].sort((a, b) => a.time.localeCompare(b.time)),
    [alarms],
  )

  return {
    alarms: sorted,
    ringing,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissRinging,
    snoozeRinging,
  }
}