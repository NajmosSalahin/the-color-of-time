import type { ReactNode } from 'react'
import { CloseIcon } from './icons'

interface PanelProps {
  open: boolean
  title: string
  meta?: string
  onClose: () => void
  children: ReactNode
}

/**
 * Slide-out drawer, triggered by a small icon. Never resizes or overlays the
 * main clock by default — it stays closed until called for.
 */
export default function Panel({ open, title, meta, onClose, children }: PanelProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 ${open ? '' : 'invisible'}`}
      aria-hidden={!open}
    >
      <button
        aria-label="Close panel"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`pointer-events-auto absolute inset-0 h-full w-full bg-black/55 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label={title}
        className={`pointer-events-auto absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-hairline bg-enclosure shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-baseline gap-3">
            <h2 className="eyebrow text-phosphor">{title}</h2>
            {meta && <span className="eyebrow text-dim">{meta}</span>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            tabIndex={open ? 0 : -1}
            className="rounded-sm p-1.5 text-dim transition-colors hover:text-phosphor focus-visible:outline focus-visible:outline-1 focus-visible:outline-phosphor"
          >
            <CloseIcon size={16} />
          </button>
        </header>
        <div className="drawer-surface flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  )
}