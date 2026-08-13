import { useMemo, useState } from 'react'
import type { Alarm } from '../hooks/useAlarms'
import Panel from './Panel'
import { EditIcon, TrashIcon } from './icons'

interface AlarmPanelProps {
  open: boolean
  alarms: Alarm[]
  onAdd: (time: string, label: string, repeat: Alarm['repeat']) => void
  onUpdate: (
    id: string,
    patch: Partial<Pick<Alarm, 'time' | 'label' | 'repeat' | 'enabled'>>,
  ) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onClose: () => void
}

interface Draft {
  id: string | null
  time: string
  label: string
  repeat: 'once' | 'daily'
}

const EMPTY_DRAFT: Draft = { id: null, time: '08:00', label: '', repeat: 'once' }

export default function AlarmPanel({
  open,
  alarms,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
  onClose,
}: AlarmPanelProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [timeError, setTimeError] = useState(false)

  const validTime = useMemo(
    () => /^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time),
    [draft.time],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validTime) {
      setTimeError(true)
      return
    }
    if (draft.id) onUpdate(draft.id, { time: draft.time, label: draft.label, repeat: draft.repeat })
    else onAdd(draft.time, draft.label, draft.repeat)
    setDraft({ ...EMPTY_DRAFT, time: draft.time })
  }

  const startEdit = (a: Alarm) =>
    setDraft({ id: a.id, time: a.time, label: a.label, repeat: a.repeat })

  return (
    <Panel
      open={open}
      title="Alarms"
      meta={`${alarms.length} set`}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3 border-b border-hairline pb-5">
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="eyebrow text-dim">Time</span>
            <input
              type="time"
              value={draft.time}
              onChange={(e) => {
                setDraft((d) => ({ ...d, time: e.target.value }))
                setTimeError(false)
              }}
              required
              className="rounded-sm border border-hairline bg-room px-3 py-2 text-lg text-phosphor outline-none transition-colors focus:border-phosphor/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-dim">Repeats</span>
            <select
              value={draft.repeat}
              onChange={(e) =>
                setDraft((d) => ({ ...d, repeat: e.target.value as Alarm['repeat'] }))
              }
              className="rounded-sm border border-hairline bg-room px-3 py-2.5 text-sm text-phosphor outline-none transition-colors focus:border-phosphor/50"
            >
              <option value="once">Once</option>
              <option value="daily">Every day</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-dim">Label</span>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            placeholder="e.g. Stand up, drink water"
            maxLength={40}
            className="rounded-sm border border-hairline bg-room px-3 py-2 text-sm text-phosphor placeholder:text-dim/70 outline-none transition-colors focus:border-phosphor/50"
          />
        </label>
        {timeError && (
          <p className="text-xs text-phosphor/80">
            Pick a real time — the browser needs HH:MM in 24-hour form.
          </p>
        )}
        <button
          type="submit"
          disabled={!validTime}
          className="mt-1 rounded-sm border border-hairline bg-hairline px-3 py-2.5 text-sm text-phosphor transition-colors hover:border-phosphor/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {draft.id ? 'Save changes' : 'Add alarm'}
        </button>
      </form>

      {alarms.length === 0 ? (
        <p className="pt-6 text-sm leading-relaxed text-dim">
          No alarms set — add one to get started. Alarms ring while this tab stays
          open.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 pt-4">
          {alarms.map((a) => (
            <li
              key={a.id}
              className={`flex items-center gap-3 rounded-sm border border-hairline px-3.5 py-3 transition-opacity ${
                a.enabled ? 'opacity-100' : 'opacity-45'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xl leading-none tracking-[0.08em] text-phosphor">
                  {a.time}
                </p>
                <p className="mt-1.5 truncate text-xs text-dim">
                  {a.label || (a.repeat === 'daily' ? 'Every day' : 'Once')}
                  {a.repeat === 'daily' && a.label ? ' · Every day' : a.repeat === 'once' && a.label ? ' · Once' : ''}
                  {a.lastFired ? ' · fired today' : ''}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={a.enabled}
                aria-label={`${a.enabled ? 'Disable' : 'Enable'} alarm ${a.time}`}
                onClick={() => onToggle(a.id)}
                className="relative inline-flex h-4 w-8 shrink-0 items-center rounded-full border border-hairline transition-colors duration-300"
                style={{
                  backgroundColor: a.enabled
                    ? 'color-mix(in srgb, var(--hex-time) 45%, var(--color-hairline))'
                    : 'var(--color-hairline)',
                }}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full bg-phosphor transition-transform duration-300 ${
                    a.enabled ? 'translate-x-[1.05rem]' : 'translate-x-[0.15rem]'
                  }`}
                />
              </button>
              <button
                aria-label={`Edit alarm ${a.time}`}
                onClick={() => startEdit(a)}
                className="rounded-sm p-1.5 text-dim transition-colors hover:text-phosphor"
              >
                <EditIcon size={15} />
              </button>
              <button
                aria-label={`Delete alarm ${a.time}`}
                onClick={() => onDelete(a.id)}
                className="rounded-sm p-1.5 text-dim transition-colors hover:text-phosphor"
              >
                <TrashIcon size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}