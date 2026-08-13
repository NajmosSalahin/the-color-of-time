interface HexBadgeProps {
  hex: string
}

/**
 * The literal hex code as an engraved label — makes the concept legible.
 * The swatch is the time itself; there is no other accent here.
 */
export default function HexBadge({ hex }: HexBadgeProps) {
  return (
    <span className="eyebrow inline-flex items-center gap-2 rounded-sm border border-hairline bg-enclosure/60 px-2.5 py-1.5 text-phosphor">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-[1px]"
        style={{
          background: hex,
          boxShadow: `0 0 6px 1px color-mix(in srgb, ${hex} 55%, transparent)`,
          transition: 'background 600ms ease',
        }}
      />
      {hex.toUpperCase()}
    </span>
  )
}