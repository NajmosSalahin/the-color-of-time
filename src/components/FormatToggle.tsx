interface FormatToggleProps {
  use12h: boolean
  onChange: (use12h: boolean) => void
}

/**
 * Display-only switch: changes how the digits read, never the hex color,
 * which is always computed from true 24-hour time.
 */
export default function FormatToggle({ use12h, onChange }: FormatToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={use12h}
      aria-label="Time format: 24 hour or 12 hour"
      tabIndex={0}
      onClick={() => onChange(!use12h)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onChange(!use12h)
        }
      }}
      className="flex cursor-pointer items-center gap-2 rounded-sm border border-hairline bg-enclosure/70 px-2.5 py-2"
    >
      <span
        className={`eyebrow transition-colors duration-300 ${use12h ? 'text-dim' : 'text-phosphor'}`}
      >
        24H
      </span>
      <span
        aria-hidden
        className="switch-track relative inline-flex h-4 w-8 items-center rounded-full border border-hairline"
        style={{
          backgroundColor: use12h
            ? 'color-mix(in srgb, var(--hex-time) 45%, var(--color-hairline))'
            : 'var(--color-hairline)',
        }}
      >
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full bg-phosphor transition-transform duration-300 ${
            use12h ? 'translate-x-[1.1rem]' : 'translate-x-[0.15rem]'
          }`}
        />
      </span>
      <span
        className={`eyebrow transition-colors duration-300 ${use12h ? 'text-phosphor' : 'text-dim'}`}
      >
        12H
      </span>
    </div>
  )
}