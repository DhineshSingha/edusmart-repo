/* ============================================================
   ASSIGN
   ------------------------------------------------------------
   The highest-frequency action in the product, so it gets the
   most care.

   FOUR THINGS CHANGED FROM THE CURRENT MODAL

   1. The three tabs at the top are gone.
      Today the first thing you see is a choice between "Assign
      on EduSmart" / "Copy Assignment URL" / "Share on Google
      Classroom", given equal weight. But the first option is
      what a teacher wants ~95% of the time. Putting a rare
      decision in front of the common one costs everybody a
      moment of reading, every single time. Those two now sit
      at the bottom as secondary actions.

   2. The dates start filled in.
      Today: two empty fields, From and To, and every assignment
      begins by picking both from a calendar. Here the start is
      today and the end is this Friday before she touches
      anything — the two answers that are right most of the
      time — so the common case costs nothing and the fields are
      there when she needs to change them.

   3. Classes show their state, and sort by it.
      The current picker lists every group with a + button and
      no memory. Here each class says how much of THIS stack it
      already has — fully assigned, partially assigned, or
      nothing at all — and the ones with nothing sit at the top,
      so the classes she can act on are one block rather than
      five scattered reads. Classes also carry their student
      count, so "how many kids is this actually going to?" is
      answerable before she commits.

   4. The summary is always visible.
      "3 classes · 22 students · due Fri 19 Sep" sits above the
      button, so the last thing you read before committing is
      what you're committing to.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Users,
  User,
  CalendarDays,
  Link2,
  GraduationCap,
  ListOrdered,
  AlertTriangle,
  CircleCheck,
  Bookmark,
  Tag,
  GripVertical,
} from 'lucide-react'
import {
  classes,
  getResource,
  studentsInClass,
  reachedIn,
  assignments,
} from '../data/mock'
import { Sheet, Button, Badge, Avatar, cx } from '../components/ui'
import TypeBadge from '../components/TypeBadge'
import DateField from '../components/DateField'
import { useApp } from '../store'

/* Date helpers. Kept local because nothing else needs them. */
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function nextFriday(from) {
  const d = new Date(from)
  const delta = (5 - d.getDay() + 7) % 7 || 7
  return addDays(d, delta)
}
function fmt(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
function iso(d) {
  return d.toISOString().slice(0, 10)
}

export default function AssignSheet({
  open,
  onClose,
  resourceIds = [],
  onAssigned,
  /* ---- THE DIALOG REPORTS BOTH OUTCOMES, NOT ONE ----
     `onAssigned` existed from the start; this did not, and its
     absence was the bug Dhinesh hit. Saving for later from
     inside this dialog resolves the caller's stack just as
     finally as assigning does — but the dialog closed itself
     and said nothing, so the playlist bar went on holding a
     lesson that was already on the shelf, offering to save it
     a second time.

     A dialog that can end the caller's work in two different
     ways owes the caller two callbacks. One of them was
     missing, so exactly one of the two exits worked. */
  onSaved,
  /* Set when this dialog was opened from a saved playlist card.
     Assigning it takes the whole playlist off the shelf, not just
     the resources inside it. */
  savedPlaylistId,
  /* ============================================================
     ASSIGNING SOMETHING THAT ALREADY EXISTS
     ------------------------------------------------------------
     Passed when this dialog is opened from the Assign button on
     an assignment in Library › Assigned. Dhinesh's call, and it
     is the right one: I had built a second, smaller dialog for
     "give this to another class", which meant two different
     screens answered the same question depending on where she
     started. The Assign dialog is the Assign dialog.

     What changes when it is set:

       THE CLASSES THAT ALREADY HAVE IT ARE LOCKED. Shown,
       dimmed, labelled, and unselectable — not hidden. A
       teacher who opens this looking for 3rd Period and cannot
       find it concludes the list is broken, not that she was
       right. The list answers the question she asked.

       THE NAME IS THE ASSIGNMENT'S and cannot be edited, because
       this is not a new assignment. Renaming here would rename
       the copy the other four classes are already working to.

       THE WINDOW IS NEW. Start and due default to today and
       next Friday exactly as they do for a fresh assign, which
       is also the honest answer to "what dates do these classes
       get": whatever she picks now. The dates she cannot pick
       are the ones already in the past, and `min` on the field
       has always handled that.

     Everything else — the resource list, the ordering, the
     instructions, the student mode — behaves identically,
     because it is identical.
     ============================================================ */
  assignment,
}) {
  const today = new Date('2026-09-16')
  const {
    isSaved,
    toggleSaved,
    removeSaved,
    savePlaylist,
    removeSavedPlaylist,
    addClassesToAssignment,
    assignStudentsToAssignment,
  } = useApp()

  /* The classes this assignment has already gone to. Empty for
     a fresh assign, which is why every expression below reads
     the same in both cases. */
  const locked = useMemo(
    () => new Set(assignment?.classIds ?? []),
    [assignment?.id, assignment?.classIds?.join('|')]
  )

  /* ---- THE SAME RULE, ONE LEVEL DOWN ----
     Whole classes lock when the class has it. Named children
     lock when THAT CHILD has it, which is a different question
     and a finer one: a class can hold this assignment while two
     of its children do not, because they enrolled after it went
     out. Locking the whole class in students mode would hide
     exactly the people she opened this mode to reach.

     So it reads the delivery's own population — `reached` —
     rather than the class's membership. Same source the
     completion ratio and the newcomers nudge use, so the three
     can never disagree about who has what. */
  const lockedStudents = useMemo(() => {
    if (!assignment) return new Set()
    const ids = new Set()
    for (const cid of assignment.classIds) {
      for (const sid of reachedIn(assignment, cid)) ids.add(sid)
    }
    return ids
    /* Recomputed when the dialog opens as well as when the
       assignment changes: `reached` is mutated in place inside
       the mock, so the id alone would not notice a child caught
       up since the last time this ran. */
  }, [assignment?.id, assignment?.classIds?.join('|'), open])

  const [selectedClasses, setSelectedClasses] = useState([])
  const [mode, setMode] = useState('classes') // 'classes' | 'students'
  const [selectedStudents, setSelectedStudents] = useState([])
  const [due, setDue] = useState(() => nextFriday(today))
  /* Starts today by default, which is what almost every
     assignment wants — she can change it, but she never has to. */
  const [start, setStart] = useState(today)
  const [ordered, setOrdered] = useState(true)
  const [name, setName] = useState('')

  /* ---- The order lives HERE, not in the playlist ----
     Dhinesh's case: a teacher opens Assign, looks at the six
     things she's about to send, and realises the lab should come
     before the reader. Until now her only route was cancel, go
     back to the playlist bar, drag, reopen the dialog, re-pick
     the classes, re-type the name. Five steps to undo a thought
     she had two seconds ago — and the likelier outcome is that
     she sends it in the wrong order rather than pay that.

     So the list is draggable in place. It keeps its own copy of
     the order rather than reaching back into the playlist,
     which matters for two reasons: this dialog is opened from
     four different places (a card, the playlist bar, a saved
     playlist, a collection) and only one of them HAS a playlist
     to write to — and a rearrangement she makes while assigning
     one class shouldn't silently rewrite a playlist she may
     still want in its original order. Cancel leaves everything
     as it was. */
  const [order, setOrder] = useState(resourceIds)
  const [dragId, setDragId] = useState(null)
  const [instructions, setInstructions] = useState('')
  const [done, setDone] = useState(false)

  const resources = order.map(getResource).filter(Boolean)
  const totalMinutes = resources.reduce((s, r) => s + (r.forStudents ? r.minutes : 0), 0)

  /* Whether this is a sequence or a single thing. Several parts
     of the dialog are only meaningful in the first case. */
  const many = resources.length > 1

  /* How many actual children this reaches. The current UI makes
     you add up group sizes in your head. */
  const reach = useMemo(() => {
    if (mode === 'students') return selectedStudents.length
    return selectedClasses.reduce(
      (sum, cid) => sum + (classes.find((c) => c.id === cid)?.studentIds.length ?? 0),
      0
    )
  }, [mode, selectedClasses, selectedStudents])

  /* ---- The assignment's name ----
     Missing entirely until Dhinesh asked for it, and its absence
     was hiding behind the single-resource case: assign one module
     and the assignment can just be called what the module is
     called, so nobody notices there was a question. Assign a
     playlist of six and there is no name anywhere — the teacher
     sees "Assignment" in her list, the student sees it too, and a
     week later nobody can tell which one this was.

     So the field is always there, and the work it costs depends
     on whether the product can answer it:

       one resource   pre-filled with the resource's own title.
                      She reads it, it's right, she moves on. She
                      can still change it.
       a playlist     empty and REQUIRED — Assign stays disabled
                      until it has a name.

     Requiring it is a real cost and worth paying exactly here. A
     sequence she spent twenty minutes building is the thing most
     likely to be reused, reopened and talked about, and it is the
     one thing the product genuinely cannot name for her. Guessing
     ("Classification of Matter + 5 more") would produce a list of
     assignments that all look alike, which is the problem we are
     trying to avoid, wearing a helpful face.

     The field resets each time the dialog opens, because the
     dialog is reused for whatever card you pressed. */
  useEffect(() => {
    if (!open) return
    setOrder(resourceIds)
    const list = resourceIds.map(getResource).filter(Boolean)
    setName(assignment ? assignment.title : list.length === 1 ? list[0].title : '')
  }, [open, resourceIds.join('|'), assignment?.id])

  function moveTo(fromId, toIndex) {
    setOrder((current) => {
      const from = current.indexOf(fromId)
      if (from < 0 || from === toIndex) return current
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const named = name.trim().length > 0
  const canAssign = reach > 0 && named

  /* ---- Save for later, from inside Assign ----
     The dialog is exactly where a teacher changes her mind: she
     opens Assign, sees the class list, realises she hasn't taught
     the prerequisite yet. "Not now, but don't lose it" is a real
     answer to the question this dialog asks, so it offers it.

     WHAT IT SAVES DEPENDS ON WHAT SHE'S HOLDING, and my first
     version got this wrong. It bookmarked each resource
     individually, so a six-resource lesson went onto the shelf as
     six loose cards — Dhinesh built a playlist, saved it, and
     found it shattered.

     That is the one thing Saved must never do. The sequence IS
     the work: assembling it takes twenty minutes, and the order
     is the part that can't be reconstructed from the pieces. Six
     cards in a grid are not a lesson, they're the wreckage of
     one, and the teacher has to do the twenty minutes again.

       one resource   bookmark it. There's no sequence to keep.
       several        save it as a PLAYLIST, in this order,
                      under the name she has already typed at the
                      top of this dialog.

     Reusing the assignment name is the reason this costs her
     nothing. The name is already required for a multi-resource
     assignment, so by the time she reaches this button she has
     named the thing — asking again, in a second dialog stacked
     on this one, would be asking a question she has already
     answered. */
  const single = resources.length === 1
  const alreadySaved = single ? isSaved(order[0]) : Boolean(savedPlaylistId)
  /* Saving a sequence needs the name for the same reason
     assigning it does: an unnamed playlist in the Saved grid is
     a card she has to open to identify. */
  /* ============================================================
     SAVE FOR LATER IS OFF WHEN THIS ALREADY EXISTS
     ------------------------------------------------------------
     Dhinesh's call. Re-assigning an assignment is not a moment
     where "I'll decide about this material later" is a thought
     anybody is having — she decided, she sent it, and she is
     here to send it to one more class.

     Worse, the button is ambiguous in exactly the wrong
     direction. Next to an assignment that exists, "Save as
     playlist" reads as if it would save THE ASSIGNMENT, and
     what it would actually do is put its three resources on the
     Saved shelf as a new lesson — a different object with the
     same name, which is precisely the duplicate-record problem
     this whole flow was built to avoid.

     The shelf also has a rule of its own, from Library: things
     leave Saved when they are assigned, because "later" has
     arrived. Offering to put something back on it from a screen
     about work already in children's hands argues with that.
     ============================================================ */
  const canSaveForLater = !assignment && !alreadySaved && (single || named)

  /* Why it is dimmed, in the order the reasons apply. Shown on
     hover and always present for a screen reader — a dimmed
     control that cannot say why is just a broken one, and a
     natively disabled button is skipped in a screen reader's
     tab order before its user ever reaches the explanation. */
  const saveBlockedReason = assignment
    ? 'This assignment already exists — Save for later is for material you have not sent yet.'
    : alreadySaved
      ? 'Already on your Saved shelf.'
      : !single && !named
        ? 'Name it first — a playlist needs a name to be findable later.'
        : null

  function saveForLater() {
    if (single) {
      if (!isSaved(order[0])) toggleSaved(order[0])
    } else {
      savePlaylist({
        name: name.trim(),
        note: `${resources.length} resources, in this order.`,
        resourceIds: order,
      })
    }
    /* Told BEFORE the close, so the caller's confirmation is
       already running when the dialog lifts off it. The tray
       underneath is then revealed reading "Saved" rather than
       reappearing unchanged and having to catch up. */
    onSaved?.()
    onClose?.()
  }

  /* The two dates are not independent, and the dialog should not
     let a teacher build an assignment that closes before it opens.
     Dragging the start past the end carries the end with it,
     keeping the gap she had already chosen; pulling the end back
     behind the start pulls the start with it. Neither needs an
     error message, because neither state is reachable. */
  function pickStart(date) {
    setStart(date)
    if (date > due) setDue(addDays(date, 7))
  }
  function pickDue(date) {
    setDue(date)
    if (date < start) setStart(date)
  }

  /* ---- HOW MUCH OF THIS ASSIGNMENT A CLASS ALREADY HAS ----
     The old check was `some` — does this class already have ANY
     of these resources — and it painted the same amber warning
     whether the class had one of six or all six. Those are
     completely different situations and Dhinesh is right that
     they need different words.

       Fully assigned      it has everything in this stack.
                           Nothing to do here. GREEN, because
                           green is "this is finished", not
                           "well done".
       Partially assigned  it has some of it. AMBER, because
                           this is the one that actually needs a
                           decision — send the rest, or leave it.
       (nothing)           it has none of it. The common case,
                           and the common case says nothing.

     Note which colour the ambiguous state gets. Amber is the
     louder of the two and it goes to the class she might need
     to think about, not to the one she's already finished with.
     A green badge is information; an amber badge is a question. */
  function coverageOf(classId) {
    const has = new Set()
    assignments.forEach((a) => {
      if (a.status === 'closed' || !a.classIds.includes(classId)) return
      a.resourceIds.forEach((rid) => {
        if (order.includes(rid)) has.add(rid)
      })
    })
    if (has.size === 0) return null
    return has.size >= order.length ? 'full' : 'partial'
  }

  /* ---- Clean classes first ----
     The list used to be in period order, which meant the
     classes she can act on immediately were scattered among the
     ones she can't. Sorting by state puts every available class
     in one block at the top, so choosing "the ones that haven't
     had this yet" is one glance rather than five reads.

     Within the assigned half, PARTIAL comes before FULL — same
     logic one level down. A part-finished class is still a
     decision; a finished one is just a fact.

     Period order survives inside each group, because that IS
     how a teacher names her classes and nothing should scramble
     that any more than necessary. */
  const RANK = { null: 0, partial: 1, full: 2 }
  const orderedClasses = useMemo(() => {
    return classes
      .map((c, i) => ({ c, i, cov: coverageOf(c.id) }))
      .sort((a, b) => RANK[String(a.cov)] - RANK[String(b.cov)] || a.i - b.i)
  }, [order.join('|')])

  function toggleClass(id) {
    if (locked.has(id)) return
    setSelectedClasses((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }
  function toggleStudent(id) {
    if (lockedStudents.has(id)) return
    setSelectedStudents((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function handleAssign() {
    setDone(true)

    /* ---- RE-ASSIGNING WRITES TO THE RECORD THAT EXISTS ----
       The only branch in this function. A fresh assign still
       behaves exactly as it did; an assign of something that
       already exists adds the chosen classes to it, with the
       window she just picked, so they appear on the assignment
       with their own dates and a "Newly assigned" mark rather
       than inheriting a deadline that may have passed.

       Students mode records the children themselves rather
       than rounding them up to their class — the delivery
       snapshot that exists for the newcomers nudge carries
       exactly who was picked, so six children out of 1st Period
       are recorded as six. That was the one overstatement left
       in this model and it is gone. */
    if (assignment) {
      const dates = { start: iso(start), due: iso(due) }
      if (mode === 'students') {
        assignStudentsToAssignment(assignment.id, selectedStudents, dates)
      } else {
        addClassesToAssignment(assignment.id, selectedClasses, dates)
      }
    }

    /* ---- ASSIGNING TAKES IT OFF THE SHELF ----
       Dhinesh's logic and it's right. "Save for later" is a
       promise about a decision she hasn't made yet; assigning it
       IS the decision. Leaving it saved afterwards would mean
       Saved slowly fills with things she has already done, which
       is how every read-it-later list in the world dies — the
       shelf stops meaning "still to do" and becomes a log, and
       then she stops looking at it.

       So it comes off automatically, and the bookmark on the card
       goes back to hollow. She doesn't have to tidy up after
       herself, which is the point: the product knows what just
       happened.

       The same applies to a saved playlist assigned from the
       Saved tab — the whole card goes, not just its contents.

       The one case this gets wrong is a teacher who assigns to
       3rd Period today and means to keep it around for 5th
       Period next week. She can press the bookmark again. That's
       one press for the rare case, against a press every time
       for the common one. */
    removeSaved(order)
    if (savedPlaylistId) removeSavedPlaylist(savedPlaylistId)

    /* A real build would POST here. The pause is deliberate —
       a confirmation that flashes past teaches nothing. */
    setTimeout(() => {
      setDone(false)
      setSelectedClasses([])
      setSelectedStudents([])
      onAssigned?.()
    }, 1400)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      width="2xl"
      title="Assign to your classes"
      subtitle={`${resources.length} ${
        resources.length === 1 ? 'resource' : 'resources'
      } · about ${totalMinutes} min of class time`}
      footer={
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 text-[14px]">
            {canAssign ? (
              <p className="text-ink-700">
                <span className="font-semibold text-ink-900">
                  {mode === 'students'
                    ? `${reach} ${reach === 1 ? 'student' : 'students'}`
                    : `${selectedClasses.length} ${
                        selectedClasses.length === 1 ? 'class' : 'classes'
                      } · ${reach} students`}
                </span>
                <span className="text-ink-500">
                  {iso(start) !== iso(today) && ` · starts ${fmt(start)}`} · due{' '}
                  {fmt(due)}
                </span>
              </p>
            ) : (
              <p className="text-ink-500">
                {!named ? 'Give this assignment a name' : 'Choose who this goes to'}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* GHOST, not a bordered secondary — the same button
                the playlist bar uses, so the two read as one
                control that happens to appear in two places.

                It also fixes a weighting problem I had created:
                a bordered button beside the filled Assign button
                is two boxes competing at the same size, which
                makes the escape look as important as the goal.
                Dropping the border leaves Assign as the only
                object in the footer and Save for later as the
                quiet way out beside it. */}
            <Button
              variant="ghost"
              size="lg"
              icon={alreadySaved ? Check : Bookmark}
              aria-disabled={!canSaveForLater || done || undefined}
              aria-describedby={saveBlockedReason ? 'save-blocked' : undefined}
              onClick={() => canSaveForLater && !done && saveForLater()}
              title={saveBlockedReason ?? undefined}
              className={cx((!canSaveForLater || done) && 'opacity-40')}
            >
              {/* The label says what she'll GET, not what she's
                  doing. "Save as playlist" is the difference
                  between finding one card in Saved next month and
                  finding six. */}
              {alreadySaved ? 'Saved' : single ? 'Save for later' : 'Save as playlist'}
            </Button>
            {saveBlockedReason && (
              <p id="save-blocked" className="sr-only">
                {saveBlockedReason}
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              icon={done ? Check : undefined}
              disabled={!canAssign || done}
              onClick={handleAssign}
            >
              {done ? 'Assigned' : 'Assign'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-7">
        {/* ---- What you're assigning ----
            ORDER ONLY EXISTS IF THERE IS MORE THAN ONE THING.
            Dhinesh caught the checkbox offering to sequence a
            single resource, which is a question with no second
            answer — whichever box she ticks, the student does
            the same one thing.

            A control that cannot change the outcome is worse
            than a missing one. It costs a read, it invites a
            decision, and the first time a teacher notices it
            made no difference she learns to distrust the other
            controls beside it.

            So with one resource the checkbox goes, the "· in
            this order" qualifier goes, and the numbered bullet
            goes with them — a list of one doesn't need to be
            counted either. */}
        <section>
          <SheetLabel icon={ListOrdered}>
            What you're assigning
            {many && ordered && (
              <span className="font-normal text-ink-500"> · drag to reorder</span>
            )}
          </SheetLabel>
          <ol className="mt-2 divide-y divide-ink-100 overflow-hidden rounded-card border border-ink-200">
            {resources.map((r, i) => (
              <li
                key={r.id}
                draggable={many}
                onDragStart={(e) => {
                  setDragId(r.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragEnter={() => dragId && dragId !== r.id && moveTo(dragId, i)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={() => setDragId(null)}
                className={cx(
                  'flex items-center gap-3 bg-white px-3.5 py-2.5 transition-opacity',
                  dragId === r.id && 'opacity-40'
                )}
              >
                {/* Same grip, same live reordering, same keyboard
                    fallback as the playlist bar. Deliberately
                    identical: a teacher who has learned to drag in
                    one place should not have to discover that it
                    works differently in the other. */}
                {many && (
                  <button
                    type="button"
                    aria-label={`Reorder ${r.shortTitle} — drag, or use the arrow keys`}
                    title="Drag to reorder"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        moveTo(r.id, Math.max(0, i - 1))
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        moveTo(r.id, Math.min(resources.length - 1, i + 1))
                      }
                    }}
                    className="-ml-1 shrink-0 cursor-grab rounded p-1 text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-600 active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                )}
                {many && (
                  <span className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[12px] font-semibold text-ink-600">
                    {i + 1}
                  </span>
                )}
                {/* The code sits BEFORE the title here now, in
                    its own colour, matching the tray row and
                    the saved card exactly. It was a grey badge
                    on the right — which read fine on its own
                    and made this the third different way of
                    drawing the same list. The minutes stay on
                    the right, where a column of numbers is
                    easier to total by eye. */}
                <TypeBadge type={r.type} />
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink-800">
                  {r.title}
                </span>
                <span className="tnum shrink-0 text-[12px] text-ink-500">{r.minutes}m</span>
              </li>
            ))}
          </ol>

          {many && (
            <label className="mt-2.5 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={ordered}
                onChange={(e) => setOrdered(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-[14px] leading-snug text-ink-700">
                Students work through these in order
                <span className="block text-[12px] text-ink-500">
                  Turn this off to let them choose where to start.
                </span>
              </span>
            </label>
          )}
        </section>

        {/* ---- What it's called ---- */}
        <section>
          <SheetLabel icon={Tag}>
            Assignment name
            {!assignment && !many && (
              <span className="font-normal text-ink-500"> · edit if you like</span>
            )}
          </SheetLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            /* ---- LOCKED WHEN THIS ALREADY EXISTS ----
               There is one assignment and one name. Editing it
               here would rename the copy the other classes are
               already working to, which is a change she did not
               ask for and would not see. `readOnly` rather than
               `disabled` so the text is still selectable and
               still announced — it is information, it is just
               not a question. */
            readOnly={!!assignment}
            placeholder={
              many
                ? 'Sinking and floating — full lesson'
                : 'What your students will see'
            }
            aria-invalid={!named}
            className={cx(
              'mt-2 w-full rounded-control border px-3 py-2 text-[14px]',
              'placeholder:text-ink-400 focus:border-brand-500 border-ink-300',
              assignment ? 'bg-ink-50 text-ink-600' : 'text-ink-800'
            )}
          />
          <p className="mt-1 text-[12px] text-ink-500">
            {assignment
              ? 'These classes join the assignment you already have, under its own name.'
              : many
                ? 'This is how the assignment appears in your list and in theirs. Several resources go out together, so it needs a name of its own.'
                : 'This is how the assignment appears in your list and in theirs.'}
          </p>
        </section>

        {/* ---- Assign to ---- */}
        <section>
          <div className="flex items-center justify-between gap-3">
            <SheetLabel icon={Users} className="mb-0">
              Assign to
            </SheetLabel>
            <div className="inline-flex rounded-control bg-ink-100 p-0.5">
              {[
                { key: 'classes', label: 'Whole classes', icon: Users },
                { key: 'students', label: 'Specific students', icon: User },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setMode(o.key)}
                  className={cx(
                    'flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors',
                    mode === o.key
                      ? 'bg-white text-ink-900 shadow-card'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  <o.icon className="h-3.5 w-3.5" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'classes' ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {orderedClasses.map(({ c, cov }) => {
                const has = locked.has(c.id)
                const selected = !has && selectedClasses.includes(c.id)
                const reasonId = `${c.id}-has-it`
                return (
                  <button
                    key={c.id}
                    /* ---- aria-disabled, NOT disabled ----
                       A natively disabled button is skipped in a
                       screen reader's tab order, so its user
                       never reaches the sentence explaining why
                       it is dimmed — which is the one thing a
                       dimmed control exists to say. Reachable,
                       announced as unavailable, with the reason
                       attached. The same pattern as Delete on a
                       district class. */
                    aria-disabled={has || undefined}
                    aria-describedby={has ? reasonId : undefined}
                    onClick={() => toggleClass(c.id)}
                    className={cx(
                      'flex items-center gap-3 rounded-card border px-3.5 py-3 text-left transition-all',
                      has
                        ? 'cursor-default border-ink-200 bg-ink-50 opacity-60'
                        : selected
                          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                          : 'border-ink-200 bg-white hover:border-ink-300'
                    )}
                  >
                    <span
                      className={cx(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors',
                        has
                          ? 'border-ink-300 bg-ink-100 text-ink-400'
                          : selected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-ink-300 bg-white'
                      )}
                    >
                      {has && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink-900">
                        {c.name}
                      </span>
                      {/* The class's start time used to sit here —
                          "24 students · 08:15". Dhinesh asked what
                          it was, which is the answer: if the person
                          who designed the screen has to explain a
                          number on it, it isn't carrying its weight.

                          It also fails the test we've been applying
                          everywhere else. These cards are already
                          named 1st Period, 2nd Period, 3rd Period —
                          the name alone tells her which class this
                          is, so the clock time distinguishes nothing
                          she couldn't already see. The student count
                          stays, because that genuinely differs and
                          it answers the question she is actually
                          asking here: how many children is this
                          going to?

                          The time is still on Today and on the class
                          pages, where the running order of the day
                          IS the subject. */}
                      <span className="block text-[12px] text-ink-500">
                        {c.studentIds.length} students
                      </span>
                    </span>
                    {/* ---- THE REASON BEATS THE JUDGEMENT ----
                        On a row she cannot act on, "Already has
                        it" is the only thing worth saying; the
                        coverage badge would be answering a
                        question she can no longer ask. */}
                    {has ? (
                      <Badge tone="neutral">Already has it</Badge>
                    ) : (
                      <>
                        {cov === 'full' && (
                          <Badge tone="good" icon={CircleCheck}>
                            Fully assigned
                          </Badge>
                        )}
                        {cov === 'partial' && (
                          <Badge tone="watch" icon={AlertTriangle}>
                            Partially assigned
                          </Badge>
                        )}
                      </>
                    )}
                    {has && (
                      <span id={reasonId} className="sr-only">
                        {c.name} already has this assignment.
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {classes.map((c) => {
                const left = assignment
                  ? studentsInClass(c.id).filter((s) => !lockedStudents.has(s.id)).length
                  : null
                return (
                <div key={c.id}>
                  <p className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    {c.name}
                    {/* Said once per class, where it saves her
                        reading twenty-two dimmed chips to find
                        out there is nothing here for her. */}
                    {assignment && (
                      <span className="font-normal normal-case tracking-normal text-ink-400">
                        {left === 0
                          ? 'everyone already has it'
                          : `${left} ${left === 1 ? 'student' : 'students'} without it`}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {studentsInClass(c.id).map((s) => {
                      const has = lockedStudents.has(s.id)
                      const on = !has && selectedStudents.includes(s.id)
                      return (
                        <button
                          key={s.id}
                          /* aria-disabled, not disabled — a
                             natively disabled chip is skipped in
                             a screen reader's tab order, so its
                             user never hears why it is dimmed.
                             The title carries the reason on
                             hover; the sr-only span carries it
                             everywhere else. */
                          aria-disabled={has || undefined}
                          title={has ? 'Already has this assignment' : undefined}
                          onClick={() => toggleStudent(s.id)}
                          className={cx(
                            'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[12px] transition-colors',
                            has
                              ? 'cursor-default border-ink-200 bg-ink-50 text-ink-400 opacity-70'
                              : on
                                ? 'border-brand-500 bg-brand-50 text-brand-800'
                                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                          )}
                        >
                          <Avatar
                            initials={s.initials}
                            size="sm"
                            tone={on ? 'brand' : 'neutral'}
                            className={cx('!h-6 !w-6 !text-[12px]', has && 'opacity-60')}
                          />
                          {s.name}
                          {/* A tick rather than a word. At chip
                             size there is no room for "already
                             has it", and twenty-two of them
                             repeating it would drown the names
                             that are the point of this list. */}
                          {has && <Check className="h-3 w-3 shrink-0" strokeWidth={3} />}
                          {has && <span className="sr-only">already has this</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ---- Dates ----
            START AND END, BOTH VISIBLE. Dhinesh's call, and it's
            the simpler shape: two labelled fields, side by side,
            no reveal, nothing to discover.

            I had argued for hiding the start behind a line that
            said "Opens today", on the grounds that the answer is
            "now" almost every time and a second question on every
            assignment is a real cost. He chose plain over clever,
            and plain has one thing going for it that my version
            didn't: both dates are readable at a glance, always,
            including a week later when she comes back wondering
            what she set.

            The shortcut row that used to sit under these two
            fields ("Tomorrow · This Friday · In a week") has gone
            with them. It earned its place when the due date was
            the ONLY date and a calendar was the only other way to
            set it. Beside a visible End date field it became a
            second control doing the same job — the exact problem
            we took out of the header with the grade selector, and
            out of the card with the 5E phase. Two ways to set one
            value is not twice the convenience; it's one more thing
            to read and a moment spent working out whether they
            disagree.

            The two fields stay consistent with each other: an end
            date can't land before the start, and moving the start
            past the end carries the end with it. */}
        <section>
          <SheetLabel icon={CalendarDays}>Dates</SheetLabel>

          {/* `<input type="date">` is gone. It only opened its
              picker from the small icon at the right end — the
              field looked like one target and behaved like two —
              and the popup it produced was the browser's, which
              we cannot style and which looks different on every
              machine in a district. DateField fixes both: the
              whole control opens it, and what opens is ours. */}
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <DateField
              label="Start date"
              value={start}
              onChange={pickStart}
              min={today}
              today={today}
              rangeOther={due}
              rangeRole="start"
            />
            <DateField
              label="End date"
              value={due}
              onChange={pickDue}
              min={start}
              today={today}
              rangeOther={start}
              rangeRole="end"
            />
          </div>
        </section>

        {/* ---- Optional note ---- */}
        <section>
          <SheetLabel>A note for students (optional)</SheetLabel>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Watch the module before Thursday's lab."
            className="mt-2 w-full rounded-control border border-ink-300 px-3 py-2 text-[14px] text-ink-800 placeholder:text-ink-400 focus:border-brand-500"
          />
        </section>

        {/* ---- The rare paths, kept out of the way ---- */}
        <section className="border-t border-ink-200 pt-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
            Or share it another way
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={Link2}>
              Copy assignment link
            </Button>
            <Button size="sm" variant="secondary" icon={GraduationCap}>
              Send to Google Classroom
            </Button>
          </div>
        </section>
      </div>
    </Sheet>
  )
}

function SheetLabel({ icon: Icon, className, children }) {
  return (
    <h3
      className={cx(
        'flex items-center gap-1.5 text-[14px] font-semibold text-ink-900',
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-ink-400" />}
      {children}
    </h3>
  )
}
