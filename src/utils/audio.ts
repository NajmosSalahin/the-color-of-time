/**
 * Web Audio tone generator — no audio files, everything is synthesized.
 * The AudioContext is created lazily and only unlocked inside a user gesture,
 * which is required for sound to be allowed on most browsers.
 */

let ctx: AudioContext | null = null

export function unlockAudio(): void {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return
    ctx = new AC()
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
): void {
  if (!ctx || ctx.state !== 'running') return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const t0 = ctx.currentTime + startAt
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** Soft two-tone "chime" for Pomodoro transitions. */
export function playChime(): void {
  if (!ctx || ctx.state !== 'running') return
  tone(880, 0, 0.5, 0.12)
  tone(1174.66, 0.14, 0.7, 0.1)
}

/** Loud, repeating two-tone alarm ring. Returns a stop function. */
export function startAlarmRing(): () => void {
  unlockAudio()
  let stopped = false
  const playPattern = (): void => {
    if (stopped || !ctx) return
    tone(740, 0, 0.22, 0.22)
    tone(740, 0.28, 0.22, 0.22)
    tone(932.33, 0.56, 0.26, 0.2)
    tone(932.33, 0.84, 0.26, 0.2)
  }
  playPattern()
  const timer = window.setInterval(playPattern, 1150)
  return () => {
    stopped = true
    window.clearInterval(timer)
  }
}

export function playTick(): void {
  tone(1250, 0, 0.03, 0.02)
}
