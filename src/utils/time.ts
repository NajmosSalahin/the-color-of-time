export const pad2 = (n: number): string => String(n).padStart(2, '0')

export interface ClockDigits {
  hh: string
  mm: string
  ss: string
}

/** True 24-hour digits, zero-padded — the hex color is always built from these. */
export function digitsFromDate(date: Date): ClockDigits {
  return {
    hh: pad2(date.getHours()),
    mm: pad2(date.getMinutes()),
    ss: pad2(date.getSeconds()),
  }
}

/** #HHMMSS — decimal digits reused as hex characters, never converted. */
export function hexFromDate(date: Date): string {
  const { hh, mm, ss } = digitsFromDate(date)
  return `#${hh}${mm}${ss}`
}

export function formattedTime(
  date: Date,
  use12h: boolean,
): { text: string; suffix: string } {
  const { hh, mm, ss } = digitsFromDate(date)
  if (!use12h) {
    return { text: `${hh}:${mm}:${ss}`, suffix: '' }
  }
  const hour = Number(hh)
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour < 12 ? 'AM' : 'PM'
  return { text: `${pad2(hour12)}:${mm}:${ss}`, suffix }
}

export function formatHM(hh: string, mm: string): string {
  return `${hh}:${mm}`
}

export function minutesToLabel(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${pad2(m)}:${pad2(r)}`
}

export function todayKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}