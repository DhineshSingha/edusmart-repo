/* ============================================================
   GRADE SELECTOR
   ------------------------------------------------------------
   WHY IT MOVED OUT OF THE HEADER ENTIRELY

   I originally put this in the top-right corner, reasoning that
   a teacher sets her grade in August and never touches it.
   That reasoning was half right and led to the wrong place.

   The half that was right: it's low-frequency, so it shouldn't
   dominate a screen the way the old navy bar did.

   The half that was wrong: I treated it as app chrome, and it
   isn't. Ask what the control actually DOES. Changing the grade
   changes which TEKS and which resources you can see — and
   nothing else. Your classes are your classes whatever grade
   you're browsing. Your reports are about your own students.

   So it only governs the Library. A control that affects one
   screen but sits in the global header is lying about its own
   scope: it looks like it changes the whole app, and it
   doesn't. Worse, it's furthest from the thing it controls.

   Now it sits where it works — immediately left of the search
   box, same height, same baseline, reading as one instrument:

       [ Grade 5 Science ▾ ] [ 🔍 Search … ]

   Read left to right that's a sentence: "in Grade 5 Science,
   find…". That's the actual mental model, and the layout now
   matches it instead of fighting it.

   ABOUT THE OTHER GRADES
   Only Grade 5 carries real TEKS data in this prototype. The
   other grades are listed and visibly marked as not loaded,
   rather than being hidden or — worse — selectable and quietly
   showing Grade 5 content under a Grade 4 label. Somebody in a
   demo would click it, and a prototype that lies gets caught.
   Loading a real grade is a contained job: TEA publishes the
   same side-by-side document for every grade.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, GraduationCap } from 'lucide-react'
import { cx } from './ui'

const GRADES = [
  { id: 'g3', label: 'Grade 3 Science', loaded: false },
  { id: 'g4', label: 'Grade 4 Science', loaded: false },
  { id: 'g5', label: 'Grade 5 Science', loaded: true },
  { id: 'g6', label: 'Grade 6 Science', loaded: false },
  { id: 'g7', label: 'Grade 7 Science', loaded: false },
  { id: 'g8', label: 'Grade 8 Science', loaded: false },
]

export default function GradeSelector({ value = 'g5', onChange, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = GRADES.find((g) => g.id === value) ?? GRADES[2]

  useEffect(() => {
    if (!open) return
    const onClickAway = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClickAway)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickAway)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={cx('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          /* h-full so it matches the search box exactly rather
             than approximately. Two controls side by side that
             are 2px different in height look like a bug even to
             people who can't say why. */
          'flex h-full w-full items-center gap-2.5 rounded-card border bg-white px-4 py-3.5',
          'text-sm transition-colors',
          open ? 'border-brand-500' : 'border-ink-300 hover:border-ink-400'
        )}
      >
        <GraduationCap className="h-4.5 w-4.5 shrink-0 text-ink-400" />
        <span className="min-w-0 flex-1 truncate text-left font-medium text-ink-900">
          {selected.label}
        </span>
        <span className="shrink-0 text-[12px] text-ink-400">TX</span>
        <ChevronDown
          className={cx(
            'h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          /* w-max, not w-full: the menu sizes to its own
             contents. Inheriting the trigger's width clipped
             "Grade 3 Science" to "Grade 3 S…", which is the
             one thing a selector must never do — truncate the
             option you're being asked to choose. */
          className="glass-panel absolute left-0 top-full z-30 mt-1.5 w-max min-w-full max-w-[22rem] overflow-hidden rounded-card border border-ink-300"
        >
          {GRADES.map((g) => {
            const isSelected = g.id === selected.id
            return (
              <button
                key={g.id}
                role="option"
                aria-selected={isSelected}
                disabled={!g.loaded}
                onClick={() => {
                  onChange?.(g.id)
                  setOpen(false)
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] transition-colors',
                  g.loaded
                    ? 'text-ink-900 hover:bg-ink-50'
                    : 'cursor-not-allowed text-ink-400',
                  isSelected && 'bg-brand-50'
                )}
              >
                <span className="w-4 shrink-0">
                  {isSelected && <Check className="h-4 w-4 text-brand-600" />}
                </span>
                <span className="flex-1 whitespace-nowrap font-medium">{g.label}</span>
                {!g.loaded && (
                  <span className="shrink-0 whitespace-nowrap pl-6 text-[12px] uppercase tracking-wide text-ink-300">
                    not loaded
                  </span>
                )}
              </button>
            )
          })}

          <p className="border-t border-ink-200 bg-ink-50 px-4 py-2.5 text-[12px] leading-relaxed text-ink-500">
            Only Grade 5 carries real TEKS in this build. The rest are shown so the
            control reads honestly rather than being faked.
          </p>
        </div>
      )}
    </div>
  )
}
