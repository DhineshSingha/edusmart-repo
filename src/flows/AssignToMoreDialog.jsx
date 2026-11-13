/* ============================================================
   ASSIGN AN EXISTING ASSIGNMENT TO MORE CLASSES
   ------------------------------------------------------------
   The live product's Workspace has an **Assign** button on
   every assignment row, and that button is the answer to the
   question Dhinesh asked: an assignment that went to three
   classes reaches a fourth by being assigned again, as the same
   assignment, rather than by being rebuilt from Library as a
   second record with the same name.

   I had put this behind a new assignment detail page. Dhinesh
   was right that it did not need one — the control belongs on
   the row, where the live product already puts it, and where a
   teacher reading her list of assignments is standing when the
   thought occurs.

   ------------------------------------------------------------
   TWO QUESTIONS, IN THE ORDER SHE CAN ANSWER THEM

   WHICH CLASSES, then WHAT WINDOW. The second is partly
   answered by the first: a class picked today needs a different
   window from the one 1st Period got three weeks ago, and she
   cannot judge that until she knows who she is adding.

   ------------------------------------------------------------
   THE DISABLED OPTION IS DHINESH'S RULE

   "The same dates as the others" is offered, and is DISABLED
   when that due date has already passed.

   Disabled rather than hidden — the same call as Delete on a
   district class. A missing option reads either as "doesn't
   apply here" or as "this product can't do that", and she has
   no way to tell which. A dimmed row with its reason attached
   answers the question she would otherwise be left holding, and
   teaches the rule: dates can be shared, and here is why this
   one can't be.

   The rule is honesty about time. Handing 4th Period a deadline
   that expired last Friday marks twenty-two children late for
   work they were given this morning, and every number
   downstream — completion, average, needs-attention — inherits
   that lie.

   `aria-disabled` rather than `disabled`, with the reason in an
   always-present sr-only paragraph: a native disabled radio is
   skipped in a screen reader's form navigation, so its user
   never meets the explanation the dimming exists for.
   ============================================================ */

import { useEffect, useState } from 'react'
import { Send, CalendarClock, Users } from 'lucide-react'
import { classes, dueLabel, canKeepDates, onDate, todayISO } from '../data/mock'
import { useApp } from '../store'
import { Button, Sheet, Badge, cx } from '../components/ui'
import DateField from '../components/DateField'

/* ---- DATEFIELD SPEAKS DATE OBJECTS, THE DATA SPEAKS ISO ----
   The mock stores '2026-09-19' because a deadline is a date
   with no time; DateField works in Date objects because a
   calendar grid has to do arithmetic. Neither is wrong, so the
   conversion lives here, at the one seam between them.

   TODAY is the prototype's today, not the machine's — every
   other surface reads lateness off `todayISO`, and a picker
   that highlighted the real calendar day would be the one
   screen disagreeing with the rest. */
const TODAY = new Date(todayISO)

function toISO(d) {
  if (!d) return ''
  /* From the local parts, not toISOString(), which shifts to
     UTC and hands back yesterday for anyone west of Greenwich.
     DateField returns local midnight. */
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function plusDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export default function AssignToMoreDialog({ open, assignment, onClose }) {
  const { addClassesToAssignment } = useApp()
  const [picked, setPicked] = useState([])
  /* 'keep' | 'new'. Defaults to the shared window when that is
     allowed, because the common case is a class she missed in
     the original assign and the rest are still working to it.
     When it isn't allowed the default is the only live option —
     never a dimmed one, which would open the dialog in a state
     it will not accept. */
  const [when, setWhen] = useState('keep')
  const [start, setStart] = useState(TODAY)
  const [due, setDue] = useState(plusDays(TODAY, 7))

  const canKeep = assignment ? canKeepDates(assignment) : false

  useEffect(() => {
    if (!open) return
    setPicked([])
    setWhen(canKeep ? 'keep' : 'new')
    setStart(TODAY)
    /* Seeded a week out rather than left empty. An empty field
       in a dialog whose Assign button waits on it makes her do
       clerical work to reach the thing she came for, and a week
       is the shape of almost every assignment here. */
    setDue(plusDays(TODAY, 7))
  }, [open, canKeep])

  if (!assignment) return null

  const already = new Set(assignment.classIds)
  const n = picked.length
  const ready = n > 0 && (when === 'keep' ? canKeep : !!due)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Assign this to another class"
      subtitle={assignment.title}
      width="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* The whole decision in one sentence, in the words of
              what will happen. She reads this last, and it is
              the only place both halves of the dialog appear
              together. */}
          <p className="text-[12px] text-ink-500">
            {n === 0
              ? 'No classes chosen yet'
              : `${n} ${n === 1 ? 'class' : 'classes'}, due ${
                  when === 'keep'
                    ? dueLabel(assignment.due).text.replace(/^due /, '')
                    : dueLabel(toISO(due)).text.replace(/^due /, '')
                }`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Send}
              disabled={!ready}
              onClick={() => {
                addClassesToAssignment(
                  assignment.id,
                  picked,
                  /* null means "inherit the shared window" — see
                     addClassesToAssignment. Writing a copy of
                     the shared dates instead would quietly
                     detach these classes from a later change to
                     them. */
                  when === 'new' ? { start: toISO(start), due: toISO(due) } : null
                )
                onClose()
              }}
            >
              Assign {n > 0 ? `to ${n}` : ''}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ================= WHICH CLASSES ================= */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
            <Users className="h-3.5 w-3.5" />
            Which classes
          </h3>

          {/* The classes that already have it are SHOWN, dimmed,
              not filtered out — the same call as the student
              picker. A teacher who opens this looking for 3rd
              Period and cannot find it concludes the list is
              broken, not that she was right. The list answers
              the question she asked. */}
          <ul className="mt-3 space-y-2">
            {classes.map((c) => {
              const has = already.has(c.id)
              const on = picked.includes(c.id)
              const reasonId = `assign-${c.id}-reason`
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-disabled={has || undefined}
                    aria-describedby={has ? reasonId : undefined}
                    onClick={() =>
                      !has &&
                      setPicked((cur) =>
                        cur.includes(c.id) ? cur.filter((x) => x !== c.id) : [...cur, c.id]
                      )
                    }
                    className={cx(
                      'flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left transition-colors',
                      has
                        ? 'cursor-default border-ink-200 bg-ink-50 opacity-60'
                        : on
                          ? 'border-brand-300 bg-brand-50'
                          : 'border-ink-200 bg-white hover:bg-ink-50'
                    )}
                  >
                    <Tick on={on} dimmed={has} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {c.name}
                      </span>
                      <span className="block text-[12px] text-ink-500">
                        {c.studentIds.length} students
                      </span>
                    </span>
                    {/* The reason beats the status. On a row she
                        cannot act on, "Already has it" is the
                        only thing worth saying. */}
                    {has && <Badge tone="neutral">Already has it</Badge>}
                  </button>
                  {has && (
                    <p id={reasonId} className="sr-only">
                      {c.name} already has this assignment.
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* ================= THE WINDOW ================= */}
        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
            <CalendarClock className="h-3.5 w-3.5" />
            When they get it
          </h3>

          <div className="mt-3 space-y-2">
            <Choice
              name="window"
              value="keep"
              current={when}
              onChange={setWhen}
              disabled={!canKeep}
              reasonId="keep-window-reason"
              /* ---- A DEAD DATE IS NAMED, NOT COUNTED ----
                 `dueLabel` phrases a past date as "11 days
                 overdue", which is right on work in flight and
                 wrong here: nothing is overdue, the window
                 simply expired. On the dimmed option the fact
                 she needs is WHEN, so she can judge how stale it
                 is. */
              title={
                canKeep
                  ? `The same dates as the others — due ${dueLabel(assignment.due).text.replace(/^due /, '')}`
                  : `The same dates as the others — closed ${onDate(assignment.due)}`
              }
              detail={
                canKeep
                  ? 'Everyone works to one deadline, and this class joins it.'
                  : 'That date has already passed, so it cannot be given to a class starting now.'
              }
            />
            <Choice
              name="window"
              value="new"
              current={when}
              onChange={setWhen}
              title="Give them their own dates"
              detail="The classes that already have it keep the window they were given."
            />

            {/* The fields appear under the option they belong to
                rather than sitting greyed out beside it. A
                disabled date field next to a selected radio is
                two controls arguing about which one is live. */}
            {when === 'new' && (
              <div className="grid gap-3 pl-8 pt-1 sm:grid-cols-2">
                <DateField
                  label="Starts"
                  value={start}
                  onChange={(d) => {
                    setStart(d)
                    if (d > due) setDue(plusDays(d, 7))
                  }}
                  min={TODAY}
                  today={TODAY}
                  rangeOther={due}
                  rangeRole="start"
                />
                <DateField
                  label="Due"
                  value={due}
                  onChange={(d) => {
                    setDue(d)
                    if (d < start) setStart(d)
                  }}
                  min={start}
                  today={TODAY}
                  rangeOther={start}
                  rangeRole="end"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </Sheet>
  )
}

/* ---- A RADIO ROW THAT SAYS WHY IT IS DIMMED ----
   `aria-disabled` rather than `disabled`, paired with a reason
   that is always in the DOM. A native disabled radio is skipped
   in a screen reader's form navigation, so its user never meets
   the explanation that is the whole point of showing the option
   at all. This way the row is reachable, announced as dimmed,
   and followed by the sentence saying what would make it
   available. */
function Choice({ name, value, current, onChange, disabled, title, detail, reasonId }) {
  const on = current === value
  return (
    <>
      <button
        type="button"
        role="radio"
        name={name}
        aria-checked={on}
        aria-disabled={disabled || undefined}
        aria-describedby={disabled ? reasonId : undefined}
        onClick={() => !disabled && onChange(value)}
        className={cx(
          'flex w-full items-start gap-3 rounded-control border px-3 py-2.5 text-left transition-colors',
          disabled
            ? 'cursor-default border-ink-200 bg-ink-50 opacity-60'
            : on
              ? 'border-brand-300 bg-brand-50'
              : 'border-ink-200 bg-white hover:bg-ink-50'
        )}
      >
        <span
          className={cx(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
            on && !disabled ? 'border-brand-600' : 'border-ink-300'
          )}
          aria-hidden
        >
          {on && !disabled && <span className="h-2 w-2 rounded-full bg-brand-600" />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink-900">{title}</span>
          <span className="mt-0.5 block text-[12px] text-ink-500">{detail}</span>
        </span>
      </button>
      {disabled && (
        <p id={reasonId} className="sr-only">
          {detail}
        </p>
      )}
    </>
  )
}

/* The same drawn tick the roster and the student picker use —
   see the note in ClassDetail about why it is not a native
   checkbox. */
function Tick({ on, dimmed }) {
  return (
    <span
      aria-hidden
      className={cx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
        dimmed
          ? 'border-ink-300 bg-ink-100'
          : on
            ? 'border-brand-600 bg-brand-600'
            : 'border-ink-300 bg-white'
      )}
    >
      {on && !dimmed && (
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
          <path
            d="M2.5 6.5l2.5 2.5 4.5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
