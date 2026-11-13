/* ============================================================
   DATE FIELD
   ------------------------------------------------------------
   WHY THIS EXISTS AT ALL

   Two reasons, and the first one is a plain bug.

   1. `<input type="date">` only opens its picker when you hit
      the little icon at the right end. Click the text and
      nothing happens. Dhinesh hit that immediately, and every
      teacher will — the field looks like one target and behaves
      like two. That alone is enough to replace it.

   2. The popup that input produces is the browser's, not ours.
      It can't be restyled, it looks different on every machine
      in a school district, and it is the same grey month grid
      everyone has seen a thousand times. Dhinesh's word was
      "generic", and he's right — it's the one piece of this
      product that arrived with no thought in it.

   ------------------------------------------------------------
   THE THREE OPTIONS ARE NOT THREE SKINS

   It would be easy to produce three month grids in different
   colours and call that a choice. That's decoration wearing the
   costume of a decision, and it would waste the comparison.

   So each one is built on a different claim about what a
   teacher is actually doing when she picks an assignment date.
   Pick between them by watching someone use them, not by
   looking at them.

     MONTH    "She needs to find a date."
              The month grid, done properly in our own system.
              The one everyone can already use, with the things
              a school actually cares about marked on it: today,
              weekends dimmed, and the start→end span shaded so
              the two fields stop being independent puzzles.
              Safest. Least interesting.

     DAYS     "She needs a date in the next fortnight."
              No grid. A vertical run of the next 21 days, each
              one a line saying what day of the week it is. It
              matches the truth of the task — almost every
              assignment is due inside two weeks — and it is
              read rather than navigated: no month to change,
              no mental mapping from a number in a square to a
              weekday. Weekends are struck through because you
              cannot teach on them.

     WEEKS    "She thinks in school weeks, not in dates."
              Rows named This week / Next week, Mon–Fri only.

   ------------------------------------------------------------
   AND THEN THE DECISION GOT MADE

   Dhinesh picked Month and asked for the other two to go, so
   they have gone — code, switch and all. Two unused calendars
   sitting in this file waiting to be chosen again would be dead
   weight that reads like a live option to the next person who
   opens it, and an alternative nobody can reach is not an
   alternative, it's clutter. They're recoverable from the
   published prototype's history (versions 51–56) if the
   question ever reopens.

   What survives from all three is the behaviour that started
   this: the WHOLE field opens the calendar, not a small icon at
   one end of it.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from './ui'

/* ---- Date helpers. No library: these are twenty lines and a
   date library is two hundred kilobytes. ---- */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function addDays(d, n) {
  const x = startOfDay(d)
  x.setDate(x.getDate() + n)
  return x
}
function sameDay(a, b) {
  return a && b && startOfDay(a).getTime() === startOfDay(b).getTime()
}
function isWeekend(d) {
  return d.getDay() === 0 || d.getDay() === 6
}
function longLabel(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
function shortLabel(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/* ============================================================
   THE FIELD
   ============================================================ */
export default function DateField({
  label,
  value,
  onChange,
  min,
  /* The other end of the range, so a calendar can shade the span
     between the two fields instead of showing one date in
     isolation. Optional — this component works alone. */
  rangeOther,
  rangeRole, // 'start' | 'end'
  today = new Date(),
  className,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const popRef = useRef(null)
  const btnRef = useRef(null)

  /* ---- The popover is rendered into <body>, positioned `fixed` ----
     It has to be. This field lives inside the Assign dialog,
     whose body scrolls — and an absolutely-positioned popover
     inside a scrolling box gets sliced off at the box's edge.
     The first build of this did exactly that: open the Start date
     calendar and the last row of the month was cut in half.

     Same lesson, and the same fix, as the Assign dialog itself
     when it was painting underneath the resource cards. A thing
     that needs to escape its container cannot be drawn by its
     container. */
  const [rect, setRect] = useState(null)

  function toggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    const away = (e) => {
      if (wrapRef.current?.contains(e.target)) return
      if (popRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    /* A popover pinned to a point on screen has to close when the
       page moves under it, or it floats away from its field. */
    const move = () => setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    window.addEventListener('resize', move)
    document.addEventListener('scroll', move, true)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
      window.removeEventListener('resize', move)
      document.removeEventListener('scroll', move, true)
    }
  }, [open])

  function pick(d) {
    onChange?.(d)
    setOpen(false)
  }

  /* Opens downward unless there isn't room, then upward. */
  const flip = rect ? rect.bottom + 340 > window.innerHeight : false

  return (
    <div className={cx('relative', className)} ref={wrapRef}>
      {label && (
        <span className="mb-1 block text-[12px] font-medium text-ink-600">{label}</span>
      )}

      {/* THE WHOLE CONTROL IS THE BUTTON. That's the fix — one
          target, and it is the size of the thing you see. */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cx(
          'flex w-full items-center justify-between gap-2 rounded-control border px-3 py-2',
          'text-left text-[14px] transition-colors',
          open
            ? 'border-brand-500 bg-white text-ink-900'
            : 'border-ink-300 bg-white text-ink-800 hover:border-ink-400'
        )}
      >
        <span className="truncate">{value ? longLabel(value) : 'Pick a date'}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-ink-400" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label={label || 'Choose a date'}
            style={{
              position: 'fixed',
              left: Math.min(rect.left, window.innerWidth - 380),
              ...(flip
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
            }}
            className="glass-panel z-[60] rounded-card border border-ink-300 animate-[dropIn_120ms_ease-out]"
          >
            <MonthGrid
              value={value}
              onPick={pick}
              min={min}
              today={startOfDay(today)}
              rangeOther={rangeOther}
              rangeRole={rangeRole}
            />
            <style>{`@keyframes dropIn{from{transform:translateY(-4px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          </div>,
          document.body
        )}
    </div>
  )
}

/* Is this day inside the start→end span the two fields describe?
   The single most useful thing a date picker in this dialog can
   show is how long the assignment is open for. */
function inSpan(d, value, rangeOther, rangeRole) {
  if (!value || !rangeOther) return false
  const a = rangeRole === 'end' ? rangeOther : value
  const b = rangeRole === 'end' ? value : rangeOther
  return d > startOfDay(a) && d < startOfDay(b)
}

/* ============================================================
   THE MONTH GRID
   The familiar shape, rebuilt in our own system so it stops
   looking like a browser part that wandered in.
   ============================================================ */
function MonthGrid({ value, onPick, min, today, rangeOther, rangeRole }) {
  const [cursor, setCursor] = useState(() => {
    const d = startOfDay(value || today)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const lead = first.getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++)
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i))

  return (
    <div className="w-[300px] p-3">
      <header className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
          title="Previous month"
          className="rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[14px] font-semibold text-ink-900">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
          title="Next month"
          className="rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </header>

      <div className="grid grid-cols-7 gap-y-0.5">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="pb-1 text-center text-[12px] font-semibold uppercase text-ink-400"
          >
            {w[0]}
          </span>
        ))}

        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />
          const disabled = min && d < startOfDay(min)
          const selected = sameDay(d, value)
          const span = inSpan(d, value, rangeOther, rangeRole)
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={cx(
                'tnum relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition-colors',
                'disabled:cursor-default disabled:text-ink-200',
                selected && 'bg-brand-600 font-semibold text-white',
                !selected && span && 'bg-brand-50 text-brand-800',
                !selected && !span && !disabled && isWeekend(d) && 'text-ink-300',
                !selected && !span && !disabled && !isWeekend(d) && 'text-ink-800',
                !selected && !disabled && 'hover:bg-ink-100'
              )}
            >
              {d.getDate()}
              {/* Today is a dot under the number, not a ring around
                  it. A ring competes with the selected state and
                  they end up meaning the same amount. */}
              {sameDay(d, today) && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-600" />
              )}
            </button>
          )
        })}
      </div>

      <Footnote today={today} onPick={onPick} min={min} />
    </div>
  )
}

/* One line under the grid: the shortcut back to today, which is
   otherwise a hunt through the month if she has paged away. */
function Footnote({ today, onPick, min }) {
  const disabled = min && today < startOfDay(min)
  return (
    <div className="mt-2 border-t border-ink-100 pt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPick(today)}
        className="text-[12px] font-medium text-brand-700 transition-colors hover:text-brand-800 disabled:text-ink-300"
      >
        Today · {shortLabel(today)}
      </button>
    </div>
  )
}
