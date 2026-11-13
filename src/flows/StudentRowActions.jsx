/* ============================================================
   THE SECOND ACTION ON A ROSTER ROW
   ------------------------------------------------------------
   WHY A MENU RATHER THAN MORE BUTTONS

   The row already has Coach, which is what a teacher came to
   this screen to do. Everything else a roster row can offer is
   occasional, and putting each on the row would mean
   twenty-four rows carrying six controls each: a hundred and
   forty-four targets on one screen, most of them almost never
   pressed. So Coach stays visible and the rest goes behind a ⋯
   — the same shape, in the same corner, as the ⋯ on the class
   card. One menu idiom, learned once.

   ------------------------------------------------------------
   VIEW PROFILE IS GONE

   Dhinesh's call and an obviously right one: the student's name
   is a link to exactly that page, sitting two inches to the
   left of this button. A menu item for it was a second door
   into a room you can already see the door of — and worse, it
   was the item at the top, so the menu opened by offering the
   one thing the row already did.

   ------------------------------------------------------------
   WHAT IS DIMMED, AND WHY IT IS NOT ONE RULE

   Dhinesh asked for Edit, Reset password and Remove to be
   disabled on district data and enabled on records the teacher
   made. Applied literally to all three that breaks something we
   built two rounds ago, so the rule here is his rule with each
   item pointed at the data it actually touches:

     Edit details    the student RECORD — name, grade, login.
     Reset password  District-provisioned records are owned by
                     the SIS, and an edit she makes is
                     overwritten on the next sync. Gated on the
                     student.

     Remove from     the MEMBERSHIP, not the child. A district
     group           section's roster is the district's; a group
                     she assembled is hers. Gated on the class.

   Read as one sentence — "you may not change what the district
   owns" — they are the same rule. Gated the other way round,
   a teacher could not remove anyone from a pull-out group she
   built herself, because every child in it came from the
   district. That is the bug the distinction avoids.

     Print details   always available. Reading a record and
     Log in as       putting it on paper, or looking at what the
       student       child sees, changes nothing at all.

   `aria-disabled` rather than `disabled`, for the reason the
   class menu records: a disabled button fires no click, so it
   could never tell you why. One reason line at the foot of the
   menu rather than three inline — the menu stays four items
   tall until somebody actually asks a question of it.
   ============================================================ */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  KeyRound,
  MoreHorizontal,
  Pencil,
  Printer,
  UserMinus,
  Eye,
} from 'lucide-react'
import {
  canEditRoster,
  canEditStudent,
  gradeLabel,
  makeTemporaryPassword,
} from '../data/mock'
import { useApp } from '../store'
import { Button, Sheet, cx } from '../components/ui'
import StudentPrintSheet from './StudentPrintSheet'

export default function StudentRowActions({ student, cls }) {
  const { removeStudentFromClass, updateStudent } = useApp()
  const [open, setOpen] = useState(false)
  const [why, setWhy] = useState(null)
  const [dialog, setDialog] = useState(null) // edit | password | print | login | remove
  const ref = useRef(null)
  const btnRef = useRef(null)
  const [at, setAt] = useState(null)

  /* ============================================================
     THE MENU IS PORTALLED OUT OF THE ROW

     The roster Card carries `overflow-hidden`, which it needs:
     it is what clips the row dividers to the card's rounded
     corners. A menu absolutely positioned inside it is clipped
     by exactly the same rule — and on the last row of a filtered
     list, where there is no card left below the button, most of
     the menu simply was not drawn.

     So it renders into <body>, the way Sheet does, and is placed
     from the button's own rectangle. `position: fixed` rather
     than absolute, because the coordinates come from
     getBoundingClientRect and those are viewport coordinates;
     mixing the two is how a menu ends up correct at the top of a
     page and a hundred pixels adrift at the bottom.

     It flips above the button when there isn't room below, and
     follows on scroll rather than closing — a menu that vanishes
     because the page moved two pixels feels broken, not tidy.
     ============================================================ */
  useLayoutEffect(() => {
    if (!open) return setAt(null)
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect()
      if (!r) return
      const H = 232 /* five items plus the padding around them */
      const below = window.innerHeight - r.bottom
      setAt({
        right: window.innerWidth - r.right,
        top: below < H + 12 ? r.top - H - 6 : r.bottom + 6,
      })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  const ownsRecord = canEditStudent(student)
  const ownsRoster = canEditRoster(cls)

  useEffect(() => {
    if (!open) return
    const away = (e) => {
      /* Two containers now, not one: the button still lives in
         the row and the menu lives in <body>. Checking only the
         menu would close it the instant she pressed the button
         that opens it. */
      if (ref.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
      setOpen(false)
      setWhy(null)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])

  const items = [
    {
      key: 'edit',
      icon: Pencil,
      label: 'Edit details',
      enabled: ownsRecord,
      reason: `${student.name}'s record comes from your district — their name and grade are kept there.`,
    },
    {
      key: 'password',
      icon: KeyRound,
      label: 'Reset password',
      enabled: ownsRecord,
      reason: `${student.name} signs in with a district account, so the district resets that password.`,
    },
    { key: 'print', icon: Printer, label: 'Print details', enabled: true },
    { key: 'login', icon: Eye, label: 'Log in as student', enabled: true },
    {
      key: 'remove',
      icon: UserMinus,
      label: 'Remove from group',
      enabled: ownsRoster,
      danger: true,
      reason: `${cls.name} comes from your district roster — only your district can change who is in it.`,
    },
  ]

  function choose(item) {
    if (!item.enabled) return setWhy(item.reason)
    setOpen(false)
    setWhy(null)
    setDialog(item.key)
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          ref={btnRef}
          onClick={() => {
            setWhy(null)
            setOpen((o) => !o)
          }}
          aria-label={`More for ${student.name}`}
          title="More"
          aria-expanded={open}
          className={cx(
            'flex h-8 w-8 items-center justify-center rounded-control transition-colors',
            open ? 'bg-ink-100 text-ink-800' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-800'
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open && at &&
          createPortal(
            <div
              ref={ref}
              style={{ position: 'fixed', top: at.top, right: at.right }}
              className="glass-panel z-50 w-60 overflow-hidden rounded-card border border-ink-300 py-1 text-left">
            {items.map((item, i) => (
              <div key={item.key}>
                {/* Remove is separated by a rule rather than
                    just by colour: it is the only item here
                    that takes something away, and a hairline
                    costs nothing to read. */}
                {item.danger && <div className="my-1 border-t border-ink-200" />}
                <button
                  onClick={() => choose(item)}
                  aria-disabled={!item.enabled}
                  aria-describedby={!item.enabled ? `why-${student.id}` : undefined}
                  className={cx(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] transition-colors',
                    !item.enabled
                      ? 'cursor-default text-ink-400 hover:bg-ink-50'
                      : item.danger
                        ? 'text-alert-700 hover:bg-alert-50'
                        : 'text-ink-800 hover:bg-ink-50'
                  )}
                >
                  <item.icon
                    className={cx(
                      'h-4 w-4 shrink-0',
                      !item.enabled
                        ? 'text-ink-300'
                        : item.danger
                          ? 'text-alert-500'
                          : 'text-ink-400'
                    )}
                  />
                  {item.label}
                </button>
              </div>
            ))}

            {/* One slot, holding whichever reason was last
                asked for. Always in the DOM so `aria-describedby`
                has a target — a screen reader hears "dimmed"
                and may never press the item to find out why. */}
            <p
              id={`why-${student.id}`}
              className={cx(
                why
                  ? 'border-t border-ink-200 px-3 py-2 text-[12px] leading-snug text-ink-500'
                  : 'sr-only'
              )}
            >
              {why ??
                items
                  .filter((it) => !it.enabled)
                  .map((it) => it.reason)
                  .join(' ')}
            </p>
            </div>,
            document.body
          )}
      </div>

      <EditDialog
        open={dialog === 'edit'}
        student={student}
        onClose={() => setDialog(null)}
        onSave={(patch) => updateStudent(student.id, patch)}
      />
      <PasswordDialog
        open={dialog === 'password'}
        student={student}
        onClose={() => setDialog(null)}
      />
      {/* The same sheet the roster's bulk Print uses, with a
          list of one. Two code paths printing the same slip is
          two chances for them to disagree about what is on it. */}
      <StudentPrintSheet
        open={dialog === 'print'}
        students={[student]}
        cls={cls}
        onClose={() => setDialog(null)}
      />
      <LoginDialog open={dialog === 'login'} student={student} onClose={() => setDialog(null)} />

      <Sheet
        open={dialog === 'remove'}
        onClose={() => setDialog(null)}
        title={`Remove ${student.name}?`}
        width="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Keep them
            </Button>
            <Button
              variant="primary"
              className="!bg-alert-600 hover:!bg-alert-700"
              onClick={() => {
                removeStudentFromClass(cls.id, student.id)
                setDialog(null)
              }}
            >
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-700">
          {student.name} stays on the district roster, and in every other class on
          it. Nothing submitted is deleted — the only change is that this work
          stops counting toward{' '}
          <span className="font-medium text-ink-900">{cls.name}</span>&rsquo;s
          averages.
        </p>
      </Sheet>
    </>
  )
}

/* ---- EDIT ----
   Name and grade only. An id is the district's key even on an
   account she made — it is how the two records get matched up
   when the SIS finally sends one — so it is shown and not
   editable. */
function EditDialog({ open, student, onClose, onSave }) {
  const [first, setFirst] = useState(student.firstName)
  const [last, setLast] = useState(student.lastName)
  const [grade, setGrade] = useState(student.gradeLevel)

  useEffect(() => {
    if (!open) return
    setFirst(student.firstName)
    setLast(student.lastName)
    setGrade(student.gradeLevel)
  }, [open, student])

  const field =
    'mt-1.5 w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'
  const label = 'block text-[12px] font-semibold uppercase tracking-wide text-ink-500'

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit details"
      subtitle="You created this account, so you can change it here."
      width="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!first.trim() || !last.trim()}
            onClick={() => {
              onSave({
                firstName: first.trim(),
                lastName: last.trim(),
                gradeLevel: Number(grade),
              })
              onClose()
            }}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor={`first-${student.id}`}>
              First name
            </label>
            <input
              id={`first-${student.id}`}
              className={field}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor={`last-${student.id}`}>
              Last name
            </label>
            <input
              id={`last-${student.id}`}
              className={field}
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor={`grade-${student.id}`}>
            Grade
          </label>
          <select
            id={`grade-${student.id}`}
            className={field}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            {Array.from({ length: 13 }, (_, g) => (
              <option key={g} value={g}>
                {gradeLabel(g)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className={label}>Student ID</p>
          <p className="tnum mt-1.5 text-sm text-ink-500">{student.studentId}</p>
          <p className="mt-1 text-[12px] text-ink-400">
            Issued by the district. It stays the same so their record can be
            matched up when the district&rsquo;s own copy arrives.
          </p>
        </div>
      </div>
    </Sheet>
  )
}

/* ---- RESET PASSWORD ----
   Two steps, because the second one can't be undone by reading
   it again: once the dialog closes, the password is gone. The
   first screen says that before she commits, rather than the
   second screen saying it after. */
function PasswordDialog({ open, student, onClose }) {
  const [issued, setIssued] = useState(null)
  useEffect(() => {
    if (open) setIssued(null)
  }, [open])

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={issued ? 'New password' : `Reset ${student.name}'s password?`}
      width="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          {issued ? (
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIssued(makeTemporaryPassword())}>
                Reset password
              </Button>
            </>
          )}
        </div>
      }
    >
      {issued ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-700">
            Give this to {student.firstName}. They&rsquo;ll be asked to choose
            their own the first time they sign in.
          </p>
          <p className="rounded-control border border-ink-200 bg-ink-50 px-3 py-3 text-center font-mono text-lg tracking-wide text-ink-900">
            {issued}
          </p>
          {/* Said here rather than in a toast afterwards: this is
              the last moment it is true. */}
          <p className="text-[12px] text-ink-500">
            This is the only time it&rsquo;s shown. If it&rsquo;s lost, reset it
            again — nothing is harmed by doing that twice.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-700">
          Their current password stops working immediately, and a new one is
          shown here once. Their work and their scores are untouched.
        </p>
      )}
    </Sheet>
  )
}

/* ---- LOG IN AS STUDENT ----
   Honest about where the prototype stops. The student
   experience is a real part of this project and has not been
   built yet, so this says that rather than opening something
   that pretends to be it. A demo that admits an edge is more
   convincing than one that gets caught at it. */
function LoginDialog({ open, student, onClose }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log in as student"
      width="sm"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-700">
        This opens EduSmart as {student.firstName} sees it — the same
        assignments, in the student&rsquo;s own view — so you can check what a
        task actually looks like before you set it.
      </p>
      <p className="mt-2 text-sm text-ink-500">
        The student experience is the next part of this prototype, so there
        isn&rsquo;t a view to open yet.
      </p>
    </Sheet>
  )
}
