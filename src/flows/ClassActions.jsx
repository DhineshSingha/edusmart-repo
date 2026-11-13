/* ============================================================
   RENAME AND DELETE A CLASS
   ------------------------------------------------------------
   WHY THE TWO VERBS HAVE DIFFERENT RULES

   Rename works on everything. A name on a card is a label the
   teacher reads; the identity underneath is an id, and that is
   what assignments, reports and the district's roster sync all
   hold on to. Relabelling "3rd Period" as "Science — Block B"
   changes what she sees and nothing the district records. She
   is told exactly that, in the dialog, at the moment it matters
   — which is better than the product quietly deciding on her
   behalf that she may not.

   Delete works only on classes she made here. A timetabled
   section is the district's record of which children she
   teaches; removing it from this screen would not remove it
   from anywhere real, it would just hide a roster she is still
   responsible for. So on a district section the item is absent
   and a line says why. An explanation costs one sentence; a
   missing option with no explanation costs her the next five
   minutes looking for it.

   ------------------------------------------------------------
   WHY DELETE SAYS WHAT IT WILL DO FIRST

   A class is not a leaf. Assignments name the classes they were
   given to, so deleting one reaches into work that is already
   out. The dialog counts that up before she commits: how many
   assignments lose this class, and how many disappear entirely
   because it was the only class they were given to.

   Those are two different sentences and they get two different
   numbers. "This affects 3 assignments" is the kind of warning
   people click through; "2 of them were only given to this
   class and will be deleted with it" is the kind they read.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { canDelete, deletionImpact } from '../data/mock'
import { useApp } from '../store'
import { Button, Sheet, cx } from '../components/ui'

export default function ClassActions({ cls, onDeleted }) {
  const { renameClass, deleteClass } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [why, setWhy] = useState(false)
  const [draft, setDraft] = useState(cls.name)
  const menuRef = useRef(null)
  const inputRef = useRef(null)

  const deletable = canDelete(cls)

  useEffect(() => {
    if (!menuOpen) return
    const away = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setWhy(false)
      }
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [menuOpen])

  useEffect(() => {
    if (!renaming) return
    setDraft(cls.name)
    const t = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 60)
    return () => clearTimeout(t)
  }, [renaming, cls.name])

  /* ---- THE CARD IS A LINK, SO EVERY CLICK IN HERE IS STOPPED ----
     This control sits on top of a card that is one big <a>.
     Without `preventDefault` a click on "Rename" opens the class
     as well as the dialog; without `stopPropagation` it also
     reaches anything listening further out. Both, every time,
     rather than remembering which handler needed which. */
  const stop = (fn) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    fn?.(e)
  }

  const impact = confirming ? deletionImpact(cls.id) : null

  function saveName() {
    const next = draft.trim()
    if (!next || next === cls.name) return setRenaming(false)
    renameClass(cls.id, next)
    setRenaming(false)
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={stop(() => {
            setWhy(false)
            setMenuOpen((o) => !o)
          })}
          aria-label={`Options for ${cls.name}`}
          title="Options"
          aria-expanded={menuOpen}
          className={cx(
            'flex h-8 w-8 items-center justify-center rounded-control transition-colors',
            menuOpen
              ? 'bg-ink-100 text-ink-800'
              : 'text-ink-400 hover:bg-ink-100 hover:text-ink-800'
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="glass-panel absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-card border border-ink-300 py-1 text-left">
            <button
              onClick={stop(() => {
                setMenuOpen(false)
                setRenaming(true)
              })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] text-ink-800 transition-colors hover:bg-ink-50"
            >
              <Pencil className="h-4 w-4 shrink-0 text-ink-400" />
              Rename
            </button>

            {/* ============================================================
                DELETE IS ALWAYS LISTED — GREYED WHEN IT CAN'T RUN

                I had replaced it with a paragraph, which put the
                explanation in front of every teacher opening the
                menu for any reason, including the nine times out
                of ten she wanted Rename. Dhinesh is right: the
                menu should be two short items, and the reason
                should arrive only when somebody asks for it.

                THE ITEM IS NOT `disabled`. A disabled button
                fires no click, so it could never answer the
                question — it would just refuse, silently, which
                is the dead end we were trying to avoid in the
                first place. `aria-disabled` is the distinction
                the platform makes for exactly this: the control
                is unavailable, and it can still tell you why.
                Screen readers announce it as dimmed; the mouse
                and the keyboard still reach it.

                Listing it greyed rather than hiding it is also
                the more honest shape. An absent item reads as
                "this product cannot delete classes"; a dimmed
                one reads as "not this class" — which is the
                actual rule, and the difference between the two
                is whether she ever finds the feature on the
                class she made herself.
                ============================================================ */}
            <button
              onClick={stop(() => {
                if (!deletable) return setWhy(true)
                setMenuOpen(false)
                setConfirming(true)
              })}
              aria-disabled={!deletable}
              /* ---- THE REASON IS ATTACHED, NOT JUST REVEALED ----
                 `aria-disabled` tells assistive technology this
                 item is dimmed, and a screen reader user may
                 reasonably never try to activate it — so a
                 reason that only appears on click is a reason
                 they would never hear. Pointing the button at
                 the sentence means it is announced WITH the
                 item, in the same breath as "dimmed", while the
                 sighted teacher still gets the compact menu
                 until she asks.

                 Same information, two delivery routes, one
                 copy of the words. */
              aria-describedby={!deletable ? `why-${cls.id}` : undefined}
              className={cx(
                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] transition-colors',
                deletable
                  ? 'text-alert-700 hover:bg-alert-50'
                  : 'cursor-default text-ink-400 hover:bg-ink-50'
              )}
            >
              <Trash2
                className={cx(
                  'h-4 w-4 shrink-0',
                  deletable ? 'text-alert-500' : 'text-ink-300'
                )}
              />
              Delete class
            </button>

            {/* Always in the DOM so `aria-describedby` has
                something to point at; `sr-only` until she asks,
                so the menu stays two short items. It sits under
                the item it explains, so the sentence and the
                thing it is about are never more than a line
                apart. */}
            {!deletable && (
              <p
                id={`why-${cls.id}`}
                className={cx(
                  why
                    ? 'border-t border-ink-200 px-3 py-2 text-[12px] leading-snug text-ink-500'
                    : 'sr-only'
                )}
              >
                <span className="font-medium text-ink-700">{cls.name}</span> comes
                from your district roster — only your district can remove it.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Rename ---- */}
      <Sheet
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Rename class"
        width="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveName} disabled={!draft.trim()}>
              Save name
            </Button>
          </div>
        }
      >
        <label
          htmlFor={`rename-${cls.id}`}
          className="block text-[12px] font-semibold uppercase tracking-wide text-ink-500"
        >
          Class name
        </label>
        <input
          id={`rename-${cls.id}`}
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          maxLength={60}
          className="mt-1.5 w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {!deletable && (
          /* Said here and nowhere else. It is only true of the
             district's own sections, and it is only useful in
             the second she is changing one. */
          <p className="mt-2 text-[12px] leading-snug text-ink-500">
            Your district knows this class as{' '}
            <span className="font-medium text-ink-700">{cls.name}</span>. Renaming
            changes what you see in EduSmart only.
          </p>
        )}
      </Sheet>

      {/* ---- Delete ---- */}
      <Sheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Delete ${cls.name}?`}
        width="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button
              variant="primary"
              className="!bg-alert-600 hover:!bg-alert-700"
              onClick={() => {
                deleteClass(cls.id)
                setConfirming(false)
                /* The grid needs nothing here — the card just
                   goes. A screen ABOUT this class has to leave,
                   so it passes a handler. */
                onDeleted?.()
              }}
            >
              Delete class
            </Button>
          </div>
        }
      >
        <div className="space-y-2 text-sm text-ink-700">
          <p>
            The {cls.studentIds.length}{' '}
            {cls.studentIds.length === 1 ? 'student' : 'students'} in it stay on
            the campus roster and in their own classes. Only this grouping goes.
          </p>

          {impact?.assignments > 0 && (
            <p>
              {impact.assignments}{' '}
              {impact.assignments === 1 ? 'assignment was' : 'assignments were'}{' '}
              given to this class.
              {impact.removed > 0 && (
                <>
                  {' '}
                  <span className="font-medium text-alert-700">
                    {impact.removed} of {impact.removed === 1 ? 'them was' : 'them were'}{' '}
                    given to this class only, so {impact.removed === 1 ? 'it' : 'they'}{' '}
                    will be deleted too.
                  </span>
                </>
              )}
            </p>
          )}

          <p className="text-ink-500">This can&rsquo;t be undone.</p>
        </div>
      </Sheet>
    </>
  )
}
