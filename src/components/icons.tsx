import type { ReactElement, ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (props: IconProps, children: ReactNode): ReactElement => {
  const { size = 16, ...rest } = props
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const BellIcon = (p: IconProps) =>
  base(p, (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ))

export const TimerIcon = (p: IconProps) =>
  base(p, (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
    </>
  ))

export const CloseIcon = (p: IconProps) => base(p, <path d="M18 6 6 18M6 6l12 12" />)

export const PlusIcon = (p: IconProps) => base(p, <path d="M12 5v14M5 12h14" />)

export const MinusIcon = (p: IconProps) => base(p, <path d="M5 12h14" />)

export const EditIcon = (p: IconProps) =>
  base(p, (
    <>
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </>
  ))

export const TrashIcon = (p: IconProps) =>
  base(p, (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </>
  ))

export const CheckIcon = (p: IconProps) => base(p, <path d="M20 6 9 17l-5-5" />)