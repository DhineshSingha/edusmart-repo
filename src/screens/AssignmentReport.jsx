/* ============================================================
   ONE ASSIGNMENT, ONE CLASS, EVERY CHILD

   WHY THIS SCREEN EXISTS

   Clicking an assignment card in Reports used to open the
   roster dialog — the same dialog the Library and the Classes
   tab open, which answers "who has this and when is it due".
   That is the right answer on those two screens and the wrong
   one here. A teacher who has arrived via Reports → 1st Period
   → Complete Circuits is not asking who has it. She knows. She
   is asking how they did, and the honest answer has a column
   per resource, because "58% overall" and "60 on the quiz, 100
   on the reader, 14 on the student review" are different facts
   and only the second one tells her what to re-teach.

   This is the live product's own report, kept nearly whole.
   Dhinesh designed it and it was already the best screen in
   there: student down the side, resource across the top, score
   in the cell. The changes are the ones the rest of this
   redesign has been making everywhere else.

   WHAT CHANGED FROM THE ORIGINAL

   The three filter chips across the top — "5 Student(s)
   Completed / 1 Catching Up / 2 Need Attention" — are gone, and
   their job is done by the same filter row every other list in
   this product now carries: search, the red Need attention
   toggle, a select. Dhinesh's call, and the right one. Three
   counts styled as cards read as three statistics you might
   press, and when you pressed one the other two stayed lit
   looking equally pressable. A filter should look like a
   filter.

   Time spent is new. The live report shows a bare score, and a
   bare score cannot tell apart the child who got 60% in four
   minutes from the one who got 60% in forty. The first has
   guessed; the second has worked and is stuck. Those two need
   opposite things from her, so the minutes sit under every
   score.

   Selecting students and reassigning was a single orange
   Re-assign button that acted on everybody. It now acts on
   whoever is ticked, because "give it to them again" is almost
   never a thing she means about the whole class — it is a thing
   she means about the four who did badly, and the table she is
   already reading is where she can see which four.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Send,
  CalendarClock,
  X,
} from 'lucide-react'
import {
  getAssignment,
  getClass,
  getStudent,
  getStandard,
  getResource,
  reachedIn,
  progressFor,
  resourceProgressFor,
  assignmentStatsForClass,
  deliveryFor,
  windowForStudent,
  needsAttention,
  coachingPlanFor,
  onDate,
  todayISO,
  daysUntil,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  Avatar,
  Score,
  AttemptScore,
  LevelLabel,
  Sheet,
  EmptyState,
  cx,
} from '../components/ui'
import TypeBadge from '../components/TypeBadge'
import DateField from '../components/DateField'
import CoachingPlan from '../flows/CoachingPlan'
import PreviewOverlay from '../flows/PreviewOverlay'
import { useApp } from '../store'

/* ---- THE SECOND THRESHOLD IS GONE ----
   This screen used to define its own line at 65%, on the
   argument that one afternoon should not carry the same word as
   a term's evidence. Dhinesh called that out and he was right:
   the product had two numbers wearing one word, and no teacher
   could tell which one she was reading. There is one scale now,
   in mock.js, and "behind" means below Meets wherever it is
   asked. */
const BEHIND = 70

/* True when this child is not on the window the class as a whole
   was given. Set once per render from the delivery, so the row
   does not have to know how deliveries are shaped. */
function makeOffStandard(d) {
  const base = d.windows[0]
  return (w) => !!base && (w.start !== base.start || w.due !== base.due)
}

export default function AssignmentReport() {
  const { assignmentId } = useParams()
  const [params] = useSearchParams()
  const classId = params.get('class')

  const a = getAssignment(assignmentId)
  const cls = getClass(classId)

  const [query, setQuery] = useState('')
  const [needsOnly, setNeedsOnly] = useState(false)
  const [status, setStatus] = useState('all')
  const [picked, setPicked] = useState([])
  const [reassigning, setReassigning] = useState(false)
  const [coaching, setCoaching] = useState(null)
  /* ---- THE ROWS HAVE TO BE REBUILT AFTER A PLAN GOES OUT ----
     `rows` is a useMemo keyed on the assignment and the class,
     neither of which changes when a plan is sent — so without
     this the table would go on showing the scores from before
     the send, underneath a panel that had just told her they had
     moved. The same class of bug as the shadow switch that would
     not switch: the write happened, and the thing reading it was
     holding a stale copy. */
  const [planTick, setPlanTick] = useState(0)
  const [previewing, setPreviewing] = useState(null)

  /* Every row is a student plus his resource scores. Built once
     per render rather than inside the map, because the filter,
     the counts and the selection all read the same list and
     three slightly different versions of it is how a table
     starts disagreeing with its own header. */
  const rows = useMemo(() => {
    if (!a || !cls) return []
    return reachedIn(a, cls.id)
      .map((sid) => {
        const student = getStudent(sid)
        if (!student) return null
        const overall = progressFor(sid, a.id)
        const cells = resourceProgressFor(sid, a.id)
        const minutes = cells.reduce((n, c) => n + c.minutes, 0)
        /* His own window, not the class's. Everything the row
           says about being late or not yet open is measured
           against this. */
        const win = windowForStudent(a, cls.id, sid)
        const plan = coachingPlanFor(sid, a.id)
        return { student, overall, cells, minutes, win, plan }
      })
      .filter(Boolean)
  }, [a?.id, cls?.id, planTick])

  if (!a || !cls) {
    return (
      <div className="py-10">
        <EmptyState
          icon={Search}
          title="That report is not here"
          description="The assignment or the class in the address does not exist. Reports has the list."
          action={
            <Link to="/insights" className="text-sm font-medium text-brand-700">
              Back to Reports
            </Link>
          }
        />
      </div>
    )
  }

  const items = a.resourceIds.map(getResource).filter(Boolean)
  const std = getStandard(a.standardId)
  const stats = assignmentStatsForClass(a.id, cls.id)
  const d = deliveryFor(a, cls.id)
  /* Everyone not on the window the class as a whole was given.
     `windows[0]` is that window — see deliveryFor. */
  const otherWindowCount = d.windows
    .slice(1)
    .reduce((n, w) => n + w.studentIds.length, 0)
  const offStandard = makeOffStandard(d)

  const flaggedCount = rows.filter(
    (r) => r.overall?.state === 'completed' && needsAttention(r.overall.score)
  ).length

  /* ---- THE CHILDREN WHO HAVE HAD A SECOND GO ----
     Counted from the rows rather than stored on the assignment,
     because a re-assign is per student: this assignment was sent
     back to six of them and not to the class. */
  const retaken = rows.filter((r) => r.overall?.retaken)

  /* ---- MEASURE THE GAIN ON WHAT WAS ACTUALLY RE-TAUGHT ----
     The first version of this averaged the movement in the
     OVERALL column and printed "+6", which made the re-teach
     look like it had barely worked — and it was arithmetic, not
     truth. A child who was sent two of five pieces back and went
     56 to 82 on one of them moves his own five-piece average by
     five points, because the three pieces nobody touched are
     still sitting in the mean dragging it flat.

     So the figure is the gain on the pieces that were sent, over
     all of them, which is the only number that answers "did the
     re-teach work". The sentence says which pieces it is
     measuring, because a bare "+19" next to a column of overalls
     that moved by 6 is a screen contradicting itself. */
  /* `c.retaken`, not `c.firstScore != null`. Once coaching plans
     started writing a `firstScore` too, the looser test quietly
     swept their cells into the re-attempt count and this line
     jumped from 10 pieces to 16 — the same arithmetic reported
     under the wrong cause. Each clause counts its own
     intervention. */
  const retakenCells = rows.flatMap((r) => r.cells.filter((c) => c.retaken))

  /* ---- THE DATE BELONGS TO THE SENDING, NOT TO EACH CHILD ----
     It was on every re-taught row, beside that child's window,
     and it was the same date twenty-four times over because one
     re-assign sent one batch on one day. Repeating a fact per
     row does not make it more available. It began as its own
     block in the Overall cell, where it made exactly the six
     rows she most wants to compare against their neighbours
     thirty pixels TALLER — a difference that means nothing.
     Moving it onto the date line fixed the height and widened
     the student column instead. Both are the same mistake: a
     fact that belongs to the sending was being paid for by
     every row on the screen.

     So it is said once, in the sentence that already says the
     sending happened. If a later re-assign ever goes out on a
     different day this falls back to saying so rather than
     picking one of them, because a single date would then be a
     lie on half the rows.

     (It stays on the student's own page, where the list is read
     as a history and "he was given it again" is the point rather
     than a repeated footnote.) */
  const sentDates = [...new Set(retaken.map((r) => r.overall.retakenOn))]

  /* ---- AND THE PLANS, COUNTED THE SAME WAY ----
     Two interventions, two clauses, measured identically so she
     can weigh one against the other. A plan costs more than a
     re-assign — it carries support material and sends several
     pieces at once — so the only honest way to show it is beside
     the cheaper thing, in the same units. */
  const coachedRows = rows.filter((r) => r.plan)
  const coachedCells = rows.flatMap((r) => r.cells.filter((c) => c.coached))
  const coachedGain = coachedCells.length
    ? Math.round(
        coachedCells.reduce((n, c) => n + (c.score - c.firstScore), 0) / coachedCells.length
      )
    : 0
  const gained = retakenCells.length
    ? Math.round(
        retakenCells.reduce((n, c) => n + (c.score - c.firstScore), 0) / retakenCells.length
      )
    : 0

  const q = query.trim().toLowerCase()
  const visible = rows.filter((r) => {
    if (needsOnly && !(r.overall?.state === 'completed' && needsAttention(r.overall.score))) {
      return false
    }
    if (status !== 'all' && r.overall?.state !== status) return false
    if (q && !r.student.name.toLowerCase().includes(q) && !String(r.student.studentId).includes(q)) {
      return false
    }
    return true
  })

  const visibleIds = visible.map((r) => r.student.id)
  const allShown = visibleIds.length > 0 && visibleIds.every((id) => picked.includes(id))

  /* No bottom padding of its own. The shell already puts
     breathing room under every page and adds the tray's height
     on top of it; a second allowance here was 64px of nothing,
     charged only on this screen. */
  return (
    <div>
      {/* ================= WHERE SHE IS =================
          The product's detail-screen header, to the letter:
          back link alone at the top left, then the name as the
          heading, then one line of context. This used to be a
          single breadcrumb line with the assignment's name
          tucked inside it at 14px — readable, but it made the
          screen's subject look like the tail of a trail rather
          than the thing the page is about.

          The arrow goes to this class's report, the one place
          in the product she can have arrived from. */}
      <header>
        <Link
          to={`/insights?tab=classes&class=${cls.id}&assignment=${a.id}`}
          className="inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {cls.name}
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{a.title}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {std?.id} {std?.title} · {cls.name}
            </p>
          </div>
          {/* ---- ALWAYS HERE, NOT ONLY ONCE SHE HAS TICKED ----
              Re-assign used to appear only in the bar that shows
              up after selecting rows, which means a teacher who
              has never selected a row has never seen that the
              product can do this at all. A control that only
              exists once you have guessed it exists is a feature
              nobody finds. It sits in the header beside the
              assignment's name, because it acts on the whole
              assignment; ticking rows first is a shortcut into
              it, not the way in. */}
          <Button
            variant="secondary"
            icon={RotateCcw}
            className="shrink-0"
            onClick={() => setReassigning(true)}
          >
            Re-assign
          </Button>
        </div>
      </header>

      {/* ---- THE TWO NUMBERS SHE CAME FOR ----
          A sentence rather than a row of stat cards. The live
          report put "Average Score (Students Completed): 72%" on
          its own band and three counts in boxes beside it; four
          figures competing for the same glance is four figures
          none of which lands. The average is the headline, the
          rest is the clause after it. */}
      <p className="mt-4 text-[14px] text-ink-700">
        <Score value={stats.avg} size="lg" className="align-middle" />{' '}
        {/* The band says what the number means. "67%" is a fact;
            "67%, Approaches" is the fact a Texas teacher can act
            on without converting it in her head first. */}
        <LevelLabel value={stats.avg} className="align-middle" />
        <span className="align-middle">
          {' '}· average across the {stats.completed} who have finished
        </span>
        <span className="text-ink-300" aria-hidden>
          {' '}
          ·{' '}
        </span>
        {/* ---- "2 DUE DATES" WAS A FLAG, NOT AN ANSWER ----
            It told her something differed and made her go and
            find out what. The class's own window is named, and
            the exception is counted beside it — which is the
            shape she can act on without opening anything, and
            the per-student dates in the table below say the
            rest. */}
        <span className="align-middle text-ink-500">
          {stats.completed}/{stats.total} finished
          {' · '}
          {onDate(d.start)} – {onDate(d.due)}
          {d.multiple && (
            <>
              {' · '}
              <span className="text-ink-700">
                {otherWindowCount} {otherWindowCount === 1 ? 'student' : 'students'} on a
                different date
              </span>
            </>
          )}
        </span>
      </p>

      {/* ---- WHAT THE RE-TEACH DID ----
          One line, under the average, and only when somebody was
          actually sent work back. It answers the question the
          arrows in the table raise and cannot answer on their
          own: not "did these six improve" — the table says that
          — but "was it worth doing", which is an average of the
          gaps and takes one line.

          It sits as plain ink rather than in a green box. A
          result worth celebrating is still a result she has to
          weigh: +14 across six children may be the best hour she
          spent this week or evidence that the re-teach missed,
          and a box with a tick in it would be the screen making
          that judgment for her. */}
      {retaken.length > 0 && (
        <p className="mt-1.5 text-[14px] text-ink-600">
          <RotateCcw className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-brand-600" aria-hidden />
          <span className="tnum font-semibold text-ink-900">{retaken.length}</span>{' '}
          {retaken.length === 1 ? 'student was' : 'students were'} sent pieces of this back{' '}
          {sentDates.length === 1 ? `on ${onDate(sentDates[0])}` : 'on different days'}. On
          those pieces they came up{' '}
          <span className="tnum font-semibold text-good-700">+{gained}</span> on average
          <span className="text-ink-400">
            {' '}
            ({retakenCells.length} {retakenCells.length === 1 ? 'piece' : 'pieces'} in all)
          </span>
          .
        </p>
      )}

      {coachedRows.length > 0 && (
        <p className="mt-1.5 text-[14px] text-ink-600">
          <Sparkles className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-brand-600" aria-hidden />
          <span className="tnum font-semibold text-ink-900">{coachedRows.length}</span>{' '}
          {coachedRows.length === 1 ? 'student is' : 'students are'} on a coaching plan,
          covering{' '}
          <span className="tnum font-semibold text-ink-900">{coachedCells.length}</span>{' '}
          {coachedCells.length === 1 ? 'piece' : 'pieces'} between them. Those came up{' '}
          <span className="tnum font-semibold text-good-700">+{coachedGain}</span> on
          average.
        </p>
      )}

      {/* ---- WHAT IS IN IT ----
          The same numbered list as the card she clicked, so the
          column headings below have something to be headings OF.
          Without it the table's "SR" column is an abbreviation
          she has to decode from the card on the previous
          screen. */}
      {/* ---- AND THESE OPEN, LIKE EVERY OTHER RESOURCE ROW ----
          They were static text. Dhinesh spotted it: the same
          numbered row, with the same badge and the same title,
          opens a preview on the Library card, on the Classes
          card and on the card he clicked to get here — and then
          arrives on this screen dead.

          That is the worst kind of inconsistency, because
          nothing signals it. A row that looks identical to three
          clickable rows IS a clickable row as far as a teacher
          is concerned; she presses it, nothing happens, and what
          she learns is not "this one is different" but "this
          product is unreliable".

          Same hover, same padding, same preview. One object, one
          behaviour, wherever it appears. */}
      <ol className="-mx-1 mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((r, i) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setPreviewing(r)}
              className="flex items-center gap-2 rounded-control px-1 py-0.5 text-left transition-colors hover:bg-ink-50"
            >
              <span className="tnum text-[12px] text-ink-400">{i + 1}</span>
              <TypeBadge type={r.type} />
              <span className="text-[14px] text-ink-800">{r.shortTitle}</span>
              {r.minutes ? (
                <span className="text-[12px] text-ink-400">{r.minutes} min</span>
              ) : null}
            </button>
          </li>
        ))}
      </ol>

      {/* ================= THE FILTER ROW ================= */}
      {/* Identical in shape to By students: search, the red
          toggle, a select. Three screens, one row, nothing new
          to learn. */}
      <div className="mt-6 mb-3 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search students</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name or ID"
            className="h-10 w-full rounded-control border border-ink-300 bg-white pl-9 pr-3 text-[14px] text-ink-900 placeholder:text-ink-400"
          />
        </label>

        <button
          type="button"
          aria-pressed={needsOnly}
          onClick={() => setNeedsOnly((v) => !v)}
          className={cx(
            'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control border px-3 text-[14px] font-medium transition-colors',
            needsOnly
              ? 'border-alert-300 bg-alert-50 text-alert-800'
              : 'border-ink-300 bg-white text-alert-700 hover:border-alert-300 hover:bg-alert-50'
          )}
        >
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          Need attention
          <span className="tnum font-normal">{flaggedCount}</span>
        </button>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 shrink-0 rounded-control border border-ink-300 bg-white px-2.5 text-[14px] text-ink-800"
        >
          <option value="all">Everyone</option>
          <option value="completed">Finished</option>
          <option value="in-progress">Still working</option>
          <option value="not-started">Not started</option>
        </select>
      </div>

      {/* ---- THE SELECTION BAR ----
          Only once something is ticked. A permanently visible
          "0 selected · Reassign" bar is a control that spends
          its life disabled, which teaches a teacher to stop
          looking at that strip of the screen. */}
      {picked.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-control border border-brand-200 bg-brand-50 px-3 py-2">
          <span className="text-[14px] text-brand-900">
            <span className="tnum font-semibold">{picked.length}</span>{' '}
            {picked.length === 1 ? 'student' : 'students'} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            {/* The same door as the header button. It opens with
                these children already ticked against every piece,
                which is what the selection was for. */}
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setReassigning(true)}
            >
              Re-assign these
            </Button>
            <Button variant="ghost" size="sm" icon={X} onClick={() => setPicked([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ================= THE TABLE ================= */}
      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nobody here matches that"
          description="Clear the search or the filters to see the whole class again."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {/* ---- THE FLOOR GROWS WITH THE PLAYLIST ----
                `min-w-[720px]` was written when three resources
                was the most anything carried. At five it let the
                columns squeeze instead of letting the table
                scroll, which is the wrong trade: a cramped
                column of percentages is unreadable, a sideways
                scrollbar is merely a scrollbar. The floor is now
                the student column plus a readable width per
                resource plus the two end columns. */}
            <table
              className="w-full border-collapse"
              style={{ minWidth: 420 + items.length * 140 }}
            >
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/60">
                  <th className="w-10 px-3 py-2.5">
                    {/* Ticks exactly what is on screen, which is
                        why the label says "shown" rather than
                        "all". A filtered table whose header box
                        silently selects the hidden rows too is
                        how someone reassigns work to a child she
                        cannot see. */}
                    <input
                      type="checkbox"
                      aria-label="Select the students shown"
                      checked={allShown}
                      onChange={() =>
                        setPicked((cur) =>
                          allShown
                            ? cur.filter((id) => !visibleIds.includes(id))
                            : [...new Set([...cur, ...visibleIds])]
                        )
                      }
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 accent-brand-600"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    Student
                  </th>
                  {items.map((r, i) => (
                    <th
                      key={r.id}
                      className="px-3 py-2.5 text-left text-[12px] font-semibold text-ink-400"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="tnum font-normal text-ink-300">{i + 1}</span>
                        <TypeBadge type={r.type} />
                      </span>
                      <span className="mt-1 block max-w-[140px] truncate font-normal normal-case text-ink-500">
                        {r.shortTitle}
                      </span>
                    </th>
                  ))}
                  <th className="w-[108px] px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    Overall
                  </th>
                  {/* Narrow and fixed. It holds one small button
                      on a minority of rows, and every pixel it
                      reserves comes out of the score columns. */}
                  <th className="w-[92px] px-3 py-2.5 text-right text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ student, overall, cells, minutes, win, plan }) => {
                  const on = picked.includes(student.id)
                  const behind = overall?.state === 'completed' && overall.score < BEHIND
                  return (
                    <tr
                      key={student.id}
                      className={cx(
                        'border-b border-ink-100 last:border-0 transition-colors',
                        on ? 'bg-brand-50/60' : 'hover:bg-ink-50/60'
                      )}
                    >
                      <td className="px-3 py-3 align-top">
                        <input
                          type="checkbox"
                          aria-label={`Select ${student.name}`}
                          checked={on}
                          onChange={() =>
                            setPicked((cur) =>
                              cur.includes(student.id)
                                ? cur.filter((x) => x !== student.id)
                                : [...cur, student.id]
                            )
                          }
                          className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600"
                        />
                      </td>

                      <td className="px-3 py-3 align-top">
                        <Link
                          to={`/students/${student.id}`}
                          className="flex items-start gap-2.5 group/name"
                        >
                          <Avatar
                            initials={student.initials}
                            size="sm"
                            tone={behind ? 'alert' : 'neutral'}
                          />
                          <span className="min-w-0">
                            {/* ---- THE ID TOUCHES THE NAME ----
                                It sat on its own line underneath,
                                which is how the roster used to
                                carry it — and the roster moved it
                                into a labelled column precisely
                                because six bare digits with no
                                heading over them are a number
                                nobody can name. That fix is not
                                available here: this cell has a
                                table of scores to its right and
                                no room for a column of its own,
                                and with the window added it had
                                become three stacked lines.

                                So it goes back to the other
                                answer, the one that worked before
                                the roster had space for a column:
                                the thing it identifies is the
                                thing it touches. Beside the name
                                it reads as that child's number
                                without a heading having to say
                                so, and the cell drops from three
                                lines to two — eighteen pixels
                                back on every row, twenty-four
                                times. */}
                            <span className="flex min-w-0 items-center gap-x-2">
                              {/* The name truncates and the id
                                  does not. Putting them on one
                                  line only helps while they stay
                                  on one line — allowed to wrap,
                                  the cell went straight back to
                                  three stacked rows. A shortened
                                  name beside a whole id is still
                                  a child she can identify; half
                                  an id is not a number at all. */}
                              <span className="truncate text-[14px] font-medium text-ink-900 transition-colors group-hover/name:text-brand-700">
                                {student.name}
                              </span>
                              <span className="tnum shrink-0 text-[12px] text-ink-400">
                                {student.studentId}
                              </span>
                              {student.eb && (
                                <span className="shrink-0">
                                  <Badge tone="info">EB</Badge>
                                </span>
                              )}
                            </span>
                            {/* ---- HIS OWN WINDOW, UNDER HIS OWN NAME ----
                                This is the live product's answer
                                and it was the right one: the
                                dates sit where she is already
                                looking, so two deadlines in one
                                room need no legend, no grouping
                                and no second screen to explain
                                them. I dropped it when I rebuilt
                                the table and Dhinesh caught it
                                by asking the question it
                                answers.

                                Coloured only when it differs
                                from the class's own window. A
                                date on every row in the same
                                grey is a column of noise; a date
                                that changes colour on four rows
                                out of twenty-four is the thing
                                she is looking for. */}
                            {win && (
                              <span
                                className={cx(
                                  'mt-0.5 flex items-center gap-1 whitespace-nowrap text-[12px]',
                                  offStandard(win)
                                    ? 'font-medium text-info-700'
                                    : 'text-ink-400'
                                )}
                              >
                                <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                                {onDate(win.start)} → {onDate(win.due)}
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>

                      {/* ---- SCORE, AND WHAT IT COST HIM ----
                          The minutes are the second half of the
                          fact. 60% in four minutes is a guess;
                          60% in forty is a child who tried and
                          is stuck, and she owes those two
                          different afternoons. */}
                      {cells.map((c) => (
                        <td key={c.resource.id} className="px-3 py-3 align-top">
                          {c.state === 'completed' ? (
                            <>
                              <AttemptScore
                                first={c.firstScore}
                                value={c.score}
                                size="sm"
                              />
                              <span className="mt-0.5 block text-[12px] text-ink-400">
                                {/* ---- THE MINUTES ARE BOTH SITTINGS ----
                                    Said as "×2" rather than "both
                                    goes" for width: spelt out, it
                                    set the width of every column
                                    that had one re-taught cell in
                                    it and pushed the table 130px
                                    past the page into a sideways
                                    scroll that every row paid for.
                                    The arrow above it has already
                                    established that there were two
                                    attempts; this only has to say
                                    that the figure covers both. */}
                                {/* ---- WHICH INTERVENTION MOVED THIS CELL ----
                                    Leila's row carries five
                                    arrows: two from a re-assign
                                    and three from a coaching
                                    plan. Without a word under
                                    them they are the same event
                                    five times, and the teacher
                                    cannot tell what she did from
                                    what she is deciding to do
                                    next. "×2" is a second
                                    sitting of the same piece;
                                    "coached" is a piece that
                                    went back inside a plan with
                                    support material around it. */}
                                {c.minutes} min{c.retaken && ' ×2'}
                                {c.coached && ' · coached'}
                              </span>
                            </>
                          ) : c.state === 'in-progress' ? (
                            <>
                              <span className="text-[14px] text-ink-600">Working</span>
                              <span className="mt-0.5 block text-[12px] text-ink-400">
                                {c.minutes} min
                              </span>
                            </>
                          ) : (
                            <span className="text-[14px] text-ink-300">—</span>
                          )}
                        </td>
                      ))}

                      <td className="px-3 py-3 align-top">
                        {overall?.state === 'completed' ? (
                          <>
                            <AttemptScore first={overall.firstScore} value={overall.score} />
                            <span className="mt-0.5 block text-[12px] text-ink-400">
                              {minutes} min
                            </span>
                          </>
                        ) : overall?.state === 'in-progress' ? (
                          /* Not "NA". A child who is still
                             working has a state, and naming it
                             costs nothing. */
                          <span className="whitespace-nowrap text-[14px] text-ink-500">
                            Still working
                          </span>
                        ) : win && daysUntil(win.start) >= 0 ? (
                          /* ---- NOT OPEN YET IS NOT NOT STARTED ----
                             Both print nothing in the score
                             column, which is exactly why they
                             have to be told apart in words. One
                             child has had the work and ignored
                             it; the other has not been given it
                             yet, and a report that calls them the
                             same thing is handing her a list of
                             names to chase that is partly wrong.
                             It only arises once a class holds
                             two windows, which is why it never
                             showed until now. */
                          <span className="whitespace-nowrap text-[14px] text-ink-500">
                            Opens {onDate(win.start)}
                          </span>
                        ) : (
                          <span className="whitespace-nowrap text-[14px] text-ink-500">
                            Not started
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right align-top">
                        {/* ---- ONE CONTROL, TWO STATES ----
                            Coach asks a question; "Plan sent"
                            answers one. It is the same button in
                            the same place and it opens the same
                            panel — which now shows the plan and
                            what came of it rather than a blank
                            form, because a teacher pressing it
                            twice is asking "how is that going",
                            not "shall I send one".

                            It goes quiet when it flips: indigo,
                            no icon prompt, no hover invitation to
                            act. A row that has already been dealt
                            with should stop asking for her.

                            It also survives the child coming back
                            over the line — `behind` goes false the
                            moment the plan works, and with the
                            button keyed on `behind` alone the
                            evidence that anyone had taught him
                            would vanish at exactly the moment it
                            became the useful thing on the row. */}
                        {plan ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Check}
                            className="!text-brand-700 hover:!bg-brand-50"
                            onClick={() => setCoaching(student)}
                          >
                            Plan sent
                          </Button>
                        ) : behind ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Sparkles}
                            onClick={() => setCoaching(student)}
                          >
                            Coach
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ReassignDialog
        open={reassigning}
        assignment={a}
        classId={cls.id}
        rows={rows}
        items={items}
        seedStudentIds={picked}
        onClose={() => setReassigning(false)}
        onDone={() => {
          setReassigning(false)
          setPicked([])
        }}
      />

      <PreviewOverlay resource={previewing} onClose={() => setPreviewing(null)} />

      {/* ---- THE COACH BUTTON NEVER OPENED ANYTHING ----
          This was passing `student` and nothing else. CoachingPlan
          needs a STANDARD as well — it is built out of the
          remedial material for one TEKS — and it guards that with
          `if (!student || !std) return null`. So every press of
          Coach on this screen mounted the panel, hit the guard,
          rendered nothing, and threw no error. Dhinesh found it
          the only way anyone finds a silent null: by pressing the
          button and watching nothing happen.

          The other three call sites all pass it. This one was
          written last and I never checked it against them, which
          is the whole fault — the component asks for four props
          and I supplied two, and nothing in between would say so.

          Which standard is not a question here: the report is one
          assignment, and an assignment is one TEKS. The class
          goes with it so the panel's subtitle can say whose room
          this is. */}
      <CoachingPlan
        open={!!coaching}
        student={coaching}
        standard={a.standardId}
        assignmentId={a.id}
        className={cls}
        onSent={() => setPlanTick((n) => n + 1)}
        onClose={() => setCoaching(null)}
      />
    </div>
  )
}

/* ============================================================
   RE-ASSIGN — BY PIECE OF WORK, NOT BY ASSIGNMENT

   This is Dhinesh's design and it is a better model than the one
   I built, for a reason worth stating plainly.

   My version re-assigned THE ASSIGNMENT to the children who had
   done badly on it. That is the right grain only if a child
   failed the whole thing. Look at a real row: Bob Smith has 60%
   on the quiz, 100% on the reader and 14% on the student review.
   Handing him the whole playlist again makes him sit through a
   reader he has already aced to get back to the one piece he
   actually needs. It is the same mistake as re-teaching a unit
   because of one standard.

   So the dialog is organised the way the decision is: one
   section per resource, the children listed inside it with
   THEIR SCORE ON THAT RESOURCE, and a tick against each. She is
   not choosing people and then work; she is reading a column of
   scores and ticking the ones that are wrong. The per-resource
   scores we added for the report are what make this possible —
   this is the screen they were really for.

   WHAT I ADDED TO THE SKETCH, AND WHY

   The sketch lists five children per section in no particular
   order. A real section is twenty-four, so each one sorts
   worst-first: the children she is looking for are the first
   ones she sees, and she can stop reading when the numbers get
   healthy. And each header carries "Pick the N under 65%",
   because ticking six boxes in five sections is thirty clicks
   for a decision she made before she opened the dialog.

   Sections start collapsed except the first, and each header
   says how many are already ticked — so a collapsed section is
   never hiding a choice she has made.

   WHAT THE PROTOTYPE CANNOT YET DO
   The mock stores an assignment per student, not a resource per
   student, so what actually persists is "these children get this
   assignment again" with the new window. The per-resource grain
   is real in the interface and would need a field on the
   delivery to survive a reload. Worth saying out loud rather
   than letting the demo imply otherwise.
   ============================================================ */
function ReassignDialog({
  open,
  assignment: a,
  classId,
  rows,
  items,
  seedStudentIds,
  onClose,
  onDone,
}) {
  const { assignStudentsToAssignment } = useApp()
  /* { [resourceId]: string[] } — who redoes which piece. */
  const [picks, setPicks] = useState({})
  const [openSection, setOpenSection] = useState(null)
  const [when, setWhen] = useState('new')
  const [start, setStart] = useState(new Date(todayISO))
  const [due, setDue] = useState(addDaysLocal(new Date(todayISO), 7))

  /* Opening is the only moment the seed applies. Ticking rows in
     the table and pressing Re-assign should arrive with those
     children already chosen everywhere; re-seeding on every
     render would undo her unticking them. */
  useEffect(() => {
    if (!open) return
    const seeded = {}
    for (const r of items) seeded[r.id] = [...(seedStudentIds ?? [])]
    setPicks(seeded)
    setOpenSection(items[0]?.id ?? null)
    setWhen('new')
    setStart(new Date(todayISO))
    setDue(addDaysLocal(new Date(todayISO), 7))
  }, [open, a?.id, classId])

  if (!open || !a) return null
  const d = deliveryFor(a, classId)
  const cls = getClass(classId)
  const stillOpen = daysUntil(d.due) >= 0

  /* One list per resource: every child the delivery reached,
     carrying his score on THAT piece, worst first. A child with
     nothing to show sinks to the bottom — there is no evidence
     he needs it again, so he is not what she is here to find. */
  const sections = items.map((r, i) => {
    const entries = rows
      .map(({ student, cells }) => {
        const cell = cells.find((c) => c.resource.id === r.id)
        return { student, score: cell?.score ?? null, state: cell?.state ?? 'not-started' }
      })
      .sort((x, y) => {
        if (x.score == null && y.score == null) return x.student.name.localeCompare(y.student.name)
        if (x.score == null) return 1
        if (y.score == null) return -1
        return x.score - y.score
      })
    return { resource: r, index: i + 1, entries }
  })

  const chosenFor = (rid) => picks[rid] ?? []
  const totalPieces = Object.values(picks).reduce((n, list) => n + list.length, 0)
  const totalStudents = new Set(Object.values(picks).flat()).size

  const toggle = (rid, sid) =>
    setPicks((cur) => {
      const list = cur[rid] ?? []
      return {
        ...cur,
        [rid]: list.includes(sid) ? list.filter((x) => x !== sid) : [...list, sid],
      }
    })

  const ready = totalPieces > 0 && (when === 'new' ? !!start && !!due : stillOpen)

  return (
    <Sheet
      open
      onClose={onClose}
      title="Re-assign"
      subtitle={`${a.title} · ${cls?.name}`}
      /* ---- THE SAME WIDTH AS ASSIGN ----
         `lg` is 672px, which was fine when this dialog was a row
         of name chips and two date fields. It is now five
         sections of a three-column grid, each cell carrying a
         name and a score — denser than Assign, which the note on
         `widths` already calls the densest dialog in the product
         and which sits at 896px for exactly this reason. At 672
         the student cells were narrow enough that a long name
         pushed its score onto the next line, which is the
         specific failure that note warns about.

         Width is the cheap fix for density; shrinking the type
         is not. */
      width="2xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          {/* The count says what she has actually built, in both
              its dimensions — four children is not the same
              decision as four pieces of work. */}
          <p className="text-[12px] text-ink-500">
            {totalPieces === 0
              ? 'Tick the pieces each student should do again.'
              : `${totalStudents} ${totalStudents === 1 ? 'student' : 'students'} · ${totalPieces} ${totalPieces === 1 ? 'piece' : 'pieces'} of work`}
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
                assignStudentsToAssignment(a.id, [...new Set(Object.values(picks).flat())], {
                  start: when === 'keep' ? d.start : isoLocal(start),
                  due: when === 'keep' ? d.due : isoLocal(due),
                })
                onDone()
              }}
            >
              Re-assign
            </Button>
          </div>
        </div>
      }
    >
      <p className="text-sm text-ink-700">
        Give back only the parts they got wrong. Their earlier scores stay on the report.
      </p>

      {/* ================= ONE SECTION PER PIECE ================= */}
      <div className="mt-4 space-y-2">
        {sections.map(({ resource: r, index, entries }) => {
          const chosen = chosenFor(r.id)
          const isOpen = openSection === r.id
          const weak = entries.filter((e) => e.score != null && needsAttention(e.score))
          return (
            <div key={r.id} className="overflow-hidden rounded-card border border-ink-200">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenSection(isOpen ? null : r.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-ink-50"
              >
                <span className="tnum w-3 shrink-0 text-[12px] text-ink-400">{index}</span>
                <TypeBadge type={r.type} />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-900">
                  {r.shortTitle}
                </span>
                {/* A collapsed section must never hide a choice
                    she has already made, so the count rides on
                    the header whether it is open or shut. */}
                {chosen.length > 0 && (
                  <span className="tnum shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[12px] font-medium text-brand-800">
                    {chosen.length}
                  </span>
                )}
                <ChevronDown
                  className={cx(
                    'h-4 w-4 shrink-0 text-ink-400 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="border-t border-ink-100 p-3">
                  {weak.length > 0 && (
                    <div className="mb-2 flex items-center gap-3">
                      {/* Thirty clicks for a decision she made
                          before she opened the dialog. */}
                      <button
                        type="button"
                        onClick={() =>
                          setPicks((cur) => ({
                            ...cur,
                            [r.id]: [
                              ...new Set([
                                ...(cur[r.id] ?? []),
                                ...weak.map((e) => e.student.id),
                              ]),
                            ],
                          }))
                        }
                        className="text-[12px] font-medium text-brand-700 hover:underline"
                      >
                        Pick the {weak.length} below Meets
                      </button>
                      {chosen.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPicks((cur) => ({ ...cur, [r.id]: [] }))}
                          className="text-[12px] text-ink-500 hover:text-ink-800"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}

                  {/* Worst first, so the children she is looking
                      for are the first ones she reads. */}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {entries.map(({ student, score, state }) => {
                      const on = chosen.includes(student.id)
                      return (
                        <label
                          key={student.id}
                          className={cx(
                            'flex cursor-pointer items-center gap-2.5 rounded-control border px-2.5 py-2 transition-colors',
                            on
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-ink-200 bg-white hover:border-ink-300'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(r.id, student.id)}
                            className="h-4 w-4 shrink-0 accent-brand-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] text-ink-900">
                              {student.name}
                            </span>
                            {score != null ? (
                              <Score value={score} size="sm" />
                            ) : (
                              <span className="text-[12px] text-ink-400">
                                {state === 'in-progress' ? 'Still working' : 'Not started'}
                              </span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ================= THE WINDOW ================= */}
      <div className="mt-5 space-y-2">
        <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          <CalendarClock className="h-3.5 w-3.5" />
          When they get it
        </h3>

        {/* ---- NEW DATES COME FIRST HERE ----
            Catch-up defaults to the class's window, because a
            child who joined on Monday is joining work the rest
            hand in on Friday. A second attempt is the opposite
            case: the original deadline is usually the thing he
            already missed, so the sensible default is a fresh
            window and the class's own is the exception. */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-control border border-ink-200 p-3 transition-colors hover:border-ink-300">
          <input
            type="radio"
            name="reassign-when"
            checked={when === 'new'}
            onChange={() => setWhen('new')}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            <span className="block text-sm font-medium text-ink-900">A new window</span>
            <span className="mt-1 flex flex-wrap gap-2">
              <DateField label="Opens" value={start} onChange={setStart} />
              <DateField label="Due" value={due} onChange={setDue} />
            </span>
          </span>
        </label>

        <label
          className={cx(
            'flex items-start gap-2.5 rounded-control border p-3 transition-colors',
            stillOpen
              ? 'cursor-pointer border-ink-200 hover:border-ink-300'
              : 'cursor-not-allowed border-ink-100 opacity-60'
          )}
        >
          <input
            type="radio"
            name="reassign-when"
            disabled={!stillOpen}
            checked={when === 'keep'}
            onChange={() => setWhen('keep')}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            <span className="block text-sm font-medium text-ink-900">
              The window the class is on
            </span>
            <span className="mt-0.5 block text-[12px] text-ink-500">
              {onDate(d.start)} – {onDate(d.due)}
            </span>
            {!stillOpen && (
              <span className="mt-1 block text-[12px] text-ink-500">
                That deadline has passed, so there is nothing left to join.
              </span>
            )}
          </span>
        </label>
      </div>
    </Sheet>
  )
}

/* The same two helpers the Assign and Catch-up dialogs use.
   Local in both places rather than shared, because they are
   four lines each and a utils module whose only job is to hold
   two four-line functions is a file nobody opens twice. */
function addDaysLocal(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function isoLocal(d) {
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
