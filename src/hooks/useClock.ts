import { useEffect, useState } from 'react'

/**
 * Drift-corrected one-second ticker. Rather than trusting setInterval(fn, 1000),
 * every tick schedules the next one for the exact next second boundary, and the
 * loop re-syncs whenever the tab becomes visible again (sleep, tab switch).
 */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number | undefined

    const schedule = (): void => {
      const untilBoundary = 1000 - (Date.now() % 1000)
      timer = window.setTimeout(tick, untilBoundary)
    }

    const tick = (): void => {
      setNow(new Date())
      schedule()
    }

    const onVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timer)
        tick()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    schedule()

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return now
}