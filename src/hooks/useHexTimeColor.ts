import { useMemo } from 'react'
import { hexFromDate } from '../utils/time'

/**
 * The signature mechanic: the live 24-hour clock IS the color.
 * Always computed from the true 24-hour time — the 12h/24h display toggle
 * never touches it.
 */
export function useHexTimeColor(now: Date): string {
  return useMemo(() => hexFromDate(now), [now])
}