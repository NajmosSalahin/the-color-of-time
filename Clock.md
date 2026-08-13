Build a React web app centered on a massive, glowing digital clock — the kind of oversized LED-style clock you see in aesthetic study/productivity reels on Instagram and TikTok. The clock is the hero element and must dominate the screen at all times. An alarm system and a Pomodoro timer are secondary features that live alongside it without ever visually competing with it.

CORE MECHANIC — the clock's color IS the time
This is the signature feature, implement it exactly:
Take the current 24-hour time as HH:MM:SS (hours 00-23, minutes 00-59, seconds 00-59), zero-pad each to two digits, and concatenate them directly into a hex color string, reusing the decimal digits as hex characters — NOT converting the numeric values to hex.

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const hexTimeColor = `#${hh}${mm}${ss}`;

Examples: 00:00:00 -> #000000, 14:35:22 -> #143522, 23:59:59 -> #235959 (the last moment of the day). Because minutes/seconds cap at 59 and hours at 23, the letters A-F never appear and the palette stays dark and mostly teal/green — that's expected, not a bug.

This color must:
- Recompute every real second, driven off Date.now()/new Date(). Self-correct the tick loop so it doesn't drift over time rather than trusting a naive setInterval(fn, 1000).
- Drive the visual identity of the screen — the glow/shadow around the huge digits, an ambient gradient, accent borders. Animate changes with a smooth CSS transition (roughly 300-800ms ease) rather than an abrupt snap.
- Leave the digit text itself in a high-contrast color (white, or a lightened version of the hue) so it stays readable even though the raw values are always dark.
- Optionally show the literal hex code (e.g. "#143522") as a small caption near the clock — it makes the concept legible to whoever's looking at it.
- Always be computed from the true 24-hour time internally, regardless of whether the UI is displaying 12h or 24h format.

HUGE LED CLOCK (hero element)
- Enormous, center-screen, monospaced/digital-style font that reads like a real LED or nixie display — try a seven-segment font like DSEG7 (self-hosted, it's not on Google Fonts) or a techy Google Font like Orbitron or Share Tech Mono, or simulate segments with CSS if you prefer.
- Responsive sizing with clamp()/vw units so it stays huge on any screen without overflowing — something like clamp(4rem, 18vw, 14rem) as a starting point.
- Dark, near-black page background so the glow pops, like a real LED display in a dark room. Don't paint the whole background literally as hexTimeColor — at its darkest that would kill contrast — use it as an accent/glow instead.

12H / 24H TOGGLE
A small switch that changes only the displayed time format, showing AM/PM in 12h mode. It must never affect the hex-color logic above, which always runs off true 24-hour time.

ALARM SYSTEM (secondary)
- Add/edit/delete multiple alarms with custom times and optional labels.
- Enable/disable toggle per alarm; a simple repeat option (once / every day) is enough.
- Triggers an audible tone — synthesize it with the Web Audio API so no external audio files are needed — plus a browser Notification (request permission gracefully; fall back to an in-app modal if denied).
- Snooze and dismiss controls while ringing, shown as a clear full-screen or prominent modal alert.
- Persist alarms in localStorage.
- Lives in a slide-out panel or modal triggered by a small icon — never resizes or overlays the main clock by default.

POMODORO SYSTEM (secondary)
- Configurable work / short-break / long-break durations, defaulting to 25 / 5 / 15 minutes.
- Start / pause / reset, auto-advancing through the work-break cycle; every 4th work session is followed by a long break instead of a short one (classic Pomodoro rule).
- Session counter for completed pomodoros.
- Sound + Notification at each transition, reusing the alarm's audio approach.
- Progress shown as a subtle ring or thin bar — never a takeover. The huge clock stays the dominant element even mid-Pomodoro; the timer should read as a secondary accent (a slim ring behind/around the clock, or a small chip with time remaining).
- Persist current session/settings in localStorage so a refresh doesn't lose progress.

TECH STACK
- React + Vite + TypeScript, single page, no routing needed.
- Tailwind CSS for layout/utility styling, plus a bit of custom CSS for the glow/segment-display effects Tailwind can't express well.
- useState/useContext/useReducer is plenty for state — no external state library needed.
- Purely client-side, no backend. Alarms and the Pomodoro timer only run while the tab stays open, which is an expected limitation of browser apps.

SUGGESTED STRUCTURE (adjust as you see fit)
  src/components: Clock.tsx, HexBadge.tsx, FormatToggle.tsx, AlarmPanel.tsx, PomodoroPanel.tsx
  src/hooks: useClock.ts (drift-corrected 1s ticking Date), useHexTimeColor.ts, useAlarms.ts, usePomodoro.ts
  src/utils: time.ts, audio.ts (Web Audio tone generator)
  src/App.tsx

DEFINITION OF DONE
- Looks and works great on both desktop and mobile — side panels collapse to off-canvas drawers on small screens.
- No layout shift or flicker at the midnight rollover (23:59:59 -> 00:00:00) or when toggling 12h/24h.
- Digit text stays legible against both the darkest (#000000) and brightest (~#235959) hex-time colors that will actually occur.
- npm run dev runs clean, no console errors or warnings.

Use your best judgment on anything not covered above, but keep the huge central clock as the star of the show throughout — the alarm and Pomodoro features should always feel like supporting tools, never the main event.