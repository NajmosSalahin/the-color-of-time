/**
 * Browser notifications with a graceful in-app fallback: when permission is
 * denied or unavailable, the same message is delivered as an on-screen toast
 * via a CustomEvent that App.tsx listens for.
 */

export const NOTIFICATION_EVENT = 'app-notification'

export interface AppNotification {
  id: number
  title: string
  body: string
}

let nextId = 1

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permissionState(): NotificationPermission | 'unsupported' {
  if (!canNotify()) return 'unsupported'
  return Notification.permission
}

/** Ask politely, inside a user gesture (e.g. when a panel is opened). */
export async function requestNotificationPermission(): Promise<void> {
  if (!canNotify() || Notification.permission !== 'default') return
  try {
    await Notification.requestPermission()
  } catch {
    /* permission prompts can be rejected by the browser itself — ignore */
  }
}

/** Deliver a notification; fall back to an in-app toast if it can't be shown. */
export function sendNotification(title: string, body: string): void {
  const fallback = (): void => {
    window.dispatchEvent(
      new CustomEvent<AppNotification>(NOTIFICATION_EVENT, {
        detail: { id: nextId++, title, body },
      }),
    )
  }
  if (!canNotify()) {
    fallback()
    return
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, silent: true })
      return
    } catch {
      fallback()
      return
    }
  }
  fallback()
}
