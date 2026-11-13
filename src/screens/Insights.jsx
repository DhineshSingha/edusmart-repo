/* ============================================================
   INSIGHTS  (replaces Reports)
   ------------------------------------------------------------
   THE ONE STRUCTURAL CHANGE

   The live Reports section opens on a Grade Book — a table of
   assignments with completion counts and averages. It's
   accurate, and it answers a question nobody urgently has.

   A teacher doesn't open reports to find out that the class
   averaged 72%. She opens them to find out WHO to help and WITH
   WHAT. Today that answer is derivable but never stated: you
   read "2 Student(s) Need Attention", click in, scan a table,
   spot the red numbers, and only then reach the Coaching Plan
   button.

   So this screen opens on the people, not the percentages. The
   numbers are still here — second tab, unchanged in substance.
   They're just no longer the thing standing between a teacher
   and the reason she came.

   WHAT I DIDN'T CHANGE
   Item Analysis stays. It's specialist, it's used after a big
   assessment rather than weekly, and the people who want it
   really want it. Specialist tools should be findable, not
   prominent.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  Search,
  TrendingDown,
  CircleAlert,
  BarChart3,
  BookOpen,
  Users,
  CheckCircle2,
} from 'lucide-react'
import {
  studentsNeedingAttention,
  myStudents,
  weakestAssignmentFor,
  pickWeakestStandard,
  classes,
  getClass,
  progressFor,
  deliveryFor,
  statusForClass,
  onDate,
  classStats,
  classBands,
  assignments,
  assignmentStatsForClass,
  getStandard,
  getResource,
  allStandards,
  students,
  studentsInClass,
  needsAttention,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  buttonClass,
  Avatar,
  ProgressBar,
  Segmented,
  Score,
  LevelLabel,
  BandRows,
  scoreTone,
  SectionHeader,
  EmptyState,
  cx,
} from '../components/ui'
import CoachingPlan from '../flows/CoachingPlan'
import NewClassDialog from '../flows/NewClassDialog'
import TypeBadge from '../components/TypeBadge'
import PreviewOverlay from '../flows/PreviewOverlay'
/* ============================================================
   ONE CLASS, READ PROPERLY

   This is where the performance that used to live on the
   Classes screen now lives — and it can say more here, because
   the screen's whole job is the question it answers.

   THE ORDER IS THE ARGUMENT. The three numbers first, because
   they are what a teacher came to check. Then the children who
   need her, because that is what she will act on. Then the
   assignments, because that is where she looks to find out
   WHY — and it is the only one of the three she might not need
   at all.

   Every number on this page is scoped to this class. The
   assignment rows use `assignmentStatsForClass` rather than the
   all-classes average, because "72%" meaning "72% across the
   five periods I gave this to" is a different fact from "72% in
   1st Period", and a teacher reading a page headed 1st Period
   will take it for the second one.
   ============================================================ */
/* ============================================================
   THE STUDENT TABLE
   ------------------------------------------------------------
   One row design for a student, used in both places this screen
   lists them: the full roster under By students, and the
   children needing attention inside a class report.

   It replaces a card that carried the same facts in a different
   shape. Two layouts for one object is the duplication this
   redesign keeps removing — a teacher should learn what a
   student row looks like once.

   WHY A ROW AND NOT A CARD, now that the list can run to a
   hundred: cards are for a handful of things you are choosing
   between. A hundred and three children is not a choice, it is
   a worklist, and a worklist is read by running the eye down a
   column. Columns only align in a table.

   `showClass` is off inside a class report, where the column
   would print the same class name on every row — a fact
   repeated on every line is the heading in the wrong place.
   ============================================================ */
/* ============================================================
   WHAT SHE DOES WITH THE CHILDREN SHE HAS FOUND

   Dhinesh's third point: the end of the funnel had one verb.
   The whole product leads a teacher to a list of children who
   are behind, and then the only thing she can do is coach them
   one at a time.

   That is not how the work goes. Six children below Meets on
   the same TEKS are a group — she pulls them to a table, gives
   them something, and keeps them together for a fortnight. Pear
   Assessment calls this "Plan intervention" and reaches it from
   a standard; the band is not a label there, it is the thing
   you select with.

   So: tick the children, then act on them. Two verbs rather
   than one, and both of them are things the product already
   knows how to do — the group becomes a class (the picker
   opens with them chosen), or the weakest TEKS between them
   opens in the Library so she can pick the work. Coaching stays
   per-child, because a coaching plan about six children at once
   would be about none of them.
   ============================================================ */
function GroupActions({ picked, rows, onClear, onMakeGroup }) {
  if (picked.length === 0) return null

  /* The TEKS most of them share. Not an average or a guess —
     the most common weakest standard among the chosen, which is
     the one a single re-teach would reach furthest. */
  const counts = {}
  for (const r of rows) {
    if (!picked.includes(r.student.id)) continue
    const id = r.weak?.id
    if (id) counts[id] = (counts[id] ?? 0) + 1
  }
  const [topStandard, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? []

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-control border border-brand-200 bg-brand-50 px-3 py-2">
      <span className="text-[14px] text-brand-900">
        <span className="tnum font-semibold">{picked.length}</span>{' '}
        {picked.length === 1 ? 'student' : 'students'} selected
      </span>
      {topStandard && (
        <span className="text-[12px] text-brand-800">
          {topCount} of them weakest on {topStandard}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        {topStandard && (
          <Link
            to={`/teach/${topStandard}`}
            className={buttonClass({ variant: 'primary', size: 'sm' })}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Find work on {topStandard}
          </Link>
        )}
        <Button variant="secondary" size="sm" icon={Users} onClick={onMakeGroup}>
          Make a group
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}

/* Unscored last, whichever way the column is pointing. */
function byScore(a, b, dir) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * dir
}

function StudentTable({
  rows,
  showClass = true,
  sortKey,
  sortDir,
  onSort,
  onCoach,
  picked = [],
  onTogglePick,
  onToggleAll,
}) {
  const ids = rows.map((r) => r.student.id)
  const allShown = ids.length > 0 && ids.every((id) => picked.includes(id))
  return (
    <Card className="overflow-hidden">
      {/* ---- THE HEADINGS SORT ----
          Same control, same arrow, same behaviour as the roster
          inside a class. Every column sorts, including "Weakest
          on" — sorting by TEKS gathers the children stuck on the
          same standard together, which is the group she would
          pull for a re-teach. */}
      <div className="flex items-center gap-x-4 bg-ink-50/60 px-4 py-1.5">
        {/* Ticks exactly what is on screen, which is why the
            label says "shown". A filtered list whose header box
            quietly selects the hidden rows too is how somebody
            makes a group out of children she cannot see. */}
        <input
          type="checkbox"
          aria-label="Select the students shown"
          checked={allShown}
          onChange={onToggleAll}
          className="h-4 w-4 shrink-0 accent-brand-600"
        />
        <SortHeader
          label="Student"
          active={sortKey === 'name'}
          dir={sortDir}
          onClick={() => onSort('name')}
          className="min-w-0 flex-[2]"
        />
        {showClass && (
          <SortHeader
            label="Class"
            active={sortKey === 'class'}
            dir={sortDir}
            onClick={() => onSort('class')}
            className="hidden min-w-0 flex-1 sm:flex"
          />
        )}
        <SortHeader
          label="Weakest on"
          active={sortKey === 'teks'}
          dir={sortDir}
          onClick={() => onSort('teks')}
          className="hidden min-w-0 flex-[2] lg:flex"
        />
        <SortHeader
          label="Score"
          active={sortKey === 'score'}
          dir={sortDir}
          onClick={() => onSort('score')}
          className="w-48 shrink-0"
        />
        <span className="w-24 shrink-0" aria-hidden />
      </div>

      {/* The same row tint as the assignment report and the class
          roster. Four columns wide and two hundred and twenty-eight
          rows long is exactly where an eye loses its line. */}
      <ul className="divide-y divide-ink-100 border-t border-ink-100">
        {rows.map(({ student, cls, weak, worst }) => (
          <li
            key={student.id}
            className={cx(
              'flex items-center gap-x-4 px-4 py-2.5 transition-colors',
              picked.includes(student.id) ? 'bg-brand-50/60' : 'hover:bg-ink-50/60'
            )}
          >
            <input
              type="checkbox"
              aria-label={`Select ${student.name}`}
              checked={picked.includes(student.id)}
              onChange={() => onTogglePick?.(student.id)}
              className="h-4 w-4 shrink-0 accent-brand-600"
            />
            <span className="flex min-w-0 flex-[2] items-center gap-2.5">
              <Avatar
                initials={student.initials}
                size="sm"
                tone={needsAttention(student.mastery) ? 'alert' : 'neutral'}
              />
              <span className="min-w-0">
                {/* Same move as the assignment report: the id
                    sits beside the name rather than under it, so
                    it reads as that child's number without a
                    heading having to say so — and the row stops
                    spending a second line on six digits. */}
                {/* One line, and the name is the part that gives
                    way. Wrapping would put the id on a row of its
                    own again, which is the stacked shape this
                    move was undoing. */}
                <span className="flex min-w-0 items-center gap-x-2">
                  <Link
                    to={`/students/${student.id}`}
                    className="truncate text-[14px] font-medium text-ink-900 hover:text-brand-700"
                  >
                    {student.name}
                  </Link>
                  <span className="tnum shrink-0 text-[12px] text-ink-400">
                    {student.studentId}
                  </span>
                  {student.eb && (
                    <span className="shrink-0">
                      <Badge tone="info">EB</Badge>
                    </span>
                  )}
                </span>
              </span>
            </span>

            {showClass && (
              <Link
                to={`/classes/${cls?.id}`}
                className="hidden min-w-0 flex-1 truncate text-[14px] text-ink-600 hover:text-brand-700 sm:block"
              >
                {cls?.name}
              </Link>
            )}

            {/* ---- THE TEKS, AND THE WORK HE ACTUALLY FAILED ----
                Two lines in one column, the way the name carries
                its district ID underneath. The TEKS names the
                part of the curriculum he is behind on; the
                second line names a specific piece of work with a
                mark, which is the one she can open and re-teach
                tomorrow. The card carried both and the first
                version of this table dropped the second. */}
            <span className="hidden min-w-0 flex-[2] lg:block">
              <Link
                to={`/teach/${weak.id}`}
                className="block truncate text-[14px] text-ink-600 hover:text-brand-700"
              >
                {weak.id} {weak.title}
              </Link>
              {worst && (
                <span className="block truncate text-[12px] text-ink-400">
                  Lowest {worst.score}% on {worst.assignment.title}
                </span>
              )}
            </span>

            {/* Wider than it was, because the band now sits under
                the number and the bar still has to be long enough
                to compare. 128px held a bar and a figure; it does
                not hold a bar, a figure and a word. */}
            <span className="flex w-48 shrink-0 items-center gap-2">
              <span className="min-w-0 flex-1">
                {/* No bar for a child with no score. An empty
                    track would read as zero, which is the one
                    thing it must not say. */}
                {student.mastery == null ? (
                  <span className="block h-1.5 w-full rounded-full bg-ink-100" aria-hidden />
                ) : (
                  <ProgressBar
                    value={student.mastery}
                    total={100}
                    tone={scoreTone(student.mastery)}
                  />
                )}
              </span>
              <span className="w-[88px] text-right">
                {/* Number first, band under it. The percentage is
                    what she compares; the band is what she says
                    out loud in a planning meeting. */}
                <Score value={student.mastery} size="sm" className="block" />
                {student.mastery == null ? (
                  <span className="whitespace-nowrap text-[12px] text-ink-400">
                    Nothing finished
                  </span>
                ) : (
                  <LevelLabel value={student.mastery} className="block" />
                )}
              </span>
              {/* ---- WHY SHE IS FLAGGED, AS A GLYPH ----
                  The card said it in a sentence — "Slipped from
                  82% to 73%". A column of sentences has to be
                  read line by line, which is the one thing a
                  table is supposed to save her. A falling arrow
                  beside the score says the same thing in a shape
                  the eye can run down, and the score's own colour
                  already says "below the line". */}
              <span className="w-3.5 shrink-0">
                {student.trend === 'down' && (
                  <TrendingDown
                    className="h-3.5 w-3.5 text-alert-600"
                    aria-label="trending down"
                  />
                )}
              </span>
            </span>

            {/* Coaching is offered on every row rather than only
                the failing ones. A plan for a child at 71% is a
                legitimate thing to want, and a button that
                appears and disappears down a column is a column
                you have to read line by line. */}
            <span className="w-24 shrink-0 text-right">
              <Button
                size="sm"
                variant="ghost"
                icon={Sparkles}
                onClick={() => onCoach({ student, cls, standard: weak })}
              >
                Coach
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ClassReport({ cls, onCoach, focusAssignment, initialLens }) {
  /* The roster dialog used to open from these cards. It does not
     any more: the card goes to the assignment's own report,
     which answers everything that dialog answered and more. The
     import and its state went with it — a component wired to
     state nothing can set is worse than no component, because
     the next person to read the file believes it is reachable. */
  /* And the same resource preview the Library and the Classes
     tab open. A resource row that looks clickable on two screens
     and is dead on a third is worse than no row at all. */
  const [previewing, setPreviewing] = useState(null)

  /* Assignments first, because that is what the report is for.
     The exception is arriving with ?lens=attention, which is how
     "11 need attention" on a class card gets her straight to the
     children rather than to the work — the label promised the
     children, so the label should deliver them. */
  const [lens, setLens] = useState(initialLens === 'attention' ? 'attention' : 'assignments')
  const [lensPicked, setLensPicked] = useState([])
  const [makingGroup, setMakingGroup] = useState(false)
  const stats = classStats(cls.id)
  const roster = studentsInClass(cls.id)
  const flaggedSet = new Set(stats.flaggedIds)
  /* ---- ONLY SCROLL IF IT IS NOT ALREADY THERE ----
     This scrolls the focused card into view on arrival, which is
     right when she has come from a link to a card halfway down a
     long list. It was wrong in the commonest case of all: coming
     BACK from that card's own report. The card she just left is
     almost always the first one on screen, and `scrollIntoView`
     centred it anyway — so the page landed nudged down by forty
     or fifty pixels with the back link half cut off at the top.
     Dhinesh caught it on video, and it is the kind of thing that
     reads as the page being slightly broken without anyone being
     able to say why.

     The rule the code was missing is that scrolling is a way of
     SHOWING her something, not a ritual to perform on arrival.
     If the card is already fully on screen there is nothing to
     show, so there is nothing to do. The check is a plain
     rectangle test against the window.

     `block: center` is kept for the case that survives, because
     a card pinned to the very top of the viewport reads as the
     top of a list rather than as one card singled out of one. */
  const focusRef = useRef(null)
  useEffect(() => {
    const el = focusRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const fullyVisible = r.top >= 0 && r.bottom <= window.innerHeight
    if (fullyVisible) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [focusAssignment])

  const assigned = assignments
    .filter((a) => a.classIds.includes(cls.id))
    .slice()
    .sort((a, b) => b.due.localeCompare(a.due))

  const struggling = [...roster].filter((s) => flaggedSet.has(s.id))

  /* ---- SORTED LOWEST FIRST, NOT ALPHABETICALLY ----
     The opposite default from By students, and deliberately so.
     That list is a place to FIND a child, so it opens in name
     order. This one is a worklist for a single room — she is
     not looking anybody up, she is working down — so it opens
     with the lowest score at the top. Same table, same controls,
     different opening question. */
  const [lensSortKey, setLensSortKey] = useState('score')
  const [lensSortDir, setLensSortDir] = useState('asc')
  const toggleLensSort = (key) => {
    if (key === lensSortKey) setLensSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setLensSortKey(key)
      setLensSortDir('asc')
    }
  }

  const flaggedStandards = studentsNeedingAttention()
  const strugglingRows = struggling
    .map((s) => ({
      student: s,
      cls,
      weak:
        flaggedStandards.find((x) => x.student.id === s.id)?.standard ?? allStandards[0],
      worst: weakestAssignmentFor(s.id),
    }))
    .sort((a, b) => {
      const dir = lensSortDir === 'asc' ? 1 : -1
      if (lensSortKey === 'name')
        return a.student.name.localeCompare(b.student.name) * dir
      if (lensSortKey === 'teks') return a.weak.id.localeCompare(b.weak.id) * dir
      /* No score sorts to the bottom in BOTH directions. A null
         treated as zero would put the children nobody has marked
         at the top of "worst first", which is the same accusation
         the fabricated number used to make. */
      return byScore(a.student.mastery, b.student.mastery, dir)
    })

  return (
    <section className="space-y-6">
      {/* ---- THE DETAIL-SCREEN HEADER ----
          The same three lines as Classes, Students and the
          assignment report: back link on its own at the top
          left, then the name as the page's heading, then one
          line of context under it. Nothing above the back link,
          because the first thing on a detail screen should be
          the way out of it.

          Back to every class, not back to the class — a teacher
          deep in one report is comparing, and the useful step
          sideways is the other reports. */}
      <header>
        <Link
          to="/insights?tab=classes"
          className="inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All classes
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{cls.name}</h1>
            <p className="mt-1 text-sm text-ink-500">{roster.length} students</p>
          </div>
          <Link
            to={`/classes/${cls.id}`}
            className="text-[12px] font-medium text-brand-700 hover:underline"
          >
            Open the roster
          </Link>
        </div>
      </header>

      {/* ---- THE AVERAGE IS A SENTENCE, NOT A TILE ----
          Three stat tiles sat here. Two of them were counts that
          are now printed on the segments below — a tile saying
          "ASSIGNMENTS 6" above a tab saying "Assignments 6" is
          the same number twice, with the tab being the one that
          actually does something.

          The third, the average, is the one figure this screen
          exists to report and the one no tab can carry. It does
          not need a box: a box is for separating a number from
          its neighbours, and this number has no neighbours now.
          Written as a line it also gets to say what it means in
          the same breath, which the tile needed a caption for. */}
      <p className="text-sm text-ink-600">
        <Score value={stats.avg} size="lg" /> <LevelLabel value={stats.avg} /> · average
        across completed assignments
      </p>

      {/* ---- TWO VIEWS OF ONE CLASS, SWITCHED ----
          These were two stacked sections, so a teacher opening a
          class report got a grid of struggling children and then,
          below the fold, the assignments she came for. Dhinesh
          moved the children behind a segment and made assignments
          the landing view, which is right on both counts: the
          work is what the report is about, and a list she did not
          ask for pushing the one she did off the screen is the
          same fault the old Reports front page had.

          A Segmented rather than two sections because they answer
          the same question from two sides — how is this class
          doing, by task or by child — and a control that says
          "6" and "11" tells her the size of each before she
          chooses. Nothing is hidden: both labels are visible and
          both carry their count. */}
      <Segmented
        value={lens}
        onChange={setLens}
        options={[
          { value: 'assignments', label: 'Assignments', count: assigned.length },
          /* "Students need attention", not "Students to act on".
             I rewrote the label to a noun phrase for balance
             against "Assignments" and in doing so quietly swapped
             the product's word for this. "Need attention" is the
             term — it is on the class cards, in the class-card
             button, and in the stat a teacher has been reading
             all along. Consistency of vocabulary beats grammatical
             tidiness: she learns one phrase for one idea, and a
             synonym introduced for the sake of symmetry is a
             second thing to learn for no gain.

             The word "Students" is the whole change, and it earns
             its place — beside "Assignments", a bare "Need
             attention" left her to infer what needed it. */
          { value: 'attention', label: 'Students need attention', count: struggling.length },
        ]}
      />

      {lens === 'attention' && (
        <div>
          {struggling.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nobody in this class is falling behind"
              description="Everyone is at or above the threshold this week."
            />
          ) : (
            <>
              {/* No heading here any more: the segment above is
                  the heading, and printing it twice six pixels
                  apart is the kind of repetition that makes a
                  screen feel padded. The sentence stays, because
                  it says something the label cannot. */}
              <p className="mb-3 text-sm text-ink-500">
                Press a column to sort. Coaching opens a plan built from what they have
                actually missed.
              </p>
              {/* The same table as By students, without the Class
                  column — she is already inside one class. Eleven
                  children would have fitted as cards, and that is
                  exactly the trap: a card here and a row there
                  means two layouts for one object, decided by how
                  many of it there happen to be. */}
              <GroupActions
                picked={lensPicked}
                rows={strugglingRows}
                onClear={() => setLensPicked([])}
                onMakeGroup={() => setMakingGroup(true)}
              />
              <StudentTable
                rows={strugglingRows}
                showClass={false}
                sortKey={lensSortKey}
                sortDir={lensSortDir}
                onSort={toggleLensSort}
                onCoach={onCoach}
                picked={lensPicked}
                onTogglePick={(id) =>
                  setLensPicked((cur) =>
                    cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
                  )
                }
                onToggleAll={() => {
                  const ids = strugglingRows.map((r) => r.student.id)
                  setLensPicked((cur) =>
                    ids.every((id) => cur.includes(id)) ? [] : ids
                  )
                }}
              />
            </>
          )}
        </div>
      )}

      {lens === 'assignments' && (
      <div>
        {/* Same here. The segment says "Assignments"; this line
            says what the list is sorted by and what the scores
            count, which is the part worth keeping. */}
        <p className="mb-3 text-sm text-ink-500">
          Everything given to {cls.name}, newest first. Scores count only the students who
          have finished.
        </p>
        {/* ---- THE SAME ASSIGNMENT CARD AS THE CLASSES TAB ----
            These were table rows, then a cut-down card. I had
            left the resource list off on the argument that this
            screen answers "how did they do" rather than "what is
            this", so a list of contents under a score was noise.

            Dhinesh called it, and the argument was wrong in a way
            worth writing down. A report tells her 7 of 24 are
            struggling on Complete Circuits. Her very next thought
            is "struggling with WHAT, exactly" — and the answer is
            the lab and the student review sitting inside it. The
            contents are not noise next to the score; they are the
            only thing on the card she can actually act on. Taking
            them away made her leave the report to find out what
            the assignment she is reading about even contains.

            So it is now the identical card, in both senses: same
            numbered list with the type badge in front, same
            "2 resources · 47 min · Created Sep 1" line, same
            click-to-preview, same indigo band. One assignment,
            one card, wherever she meets it.

            The one thing this card has that the Classes tab's
            does not is the struggling count, which is the whole
            reason this screen exists. It sits between the
            contents and the band — after what the work is,
            before who has done it. */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assigned.map((a) => {
            const st = assignmentStatsForClass(a.id, cls.id)
            const std = getStandard(a.standardId)
            const d = deliveryFor(a, cls.id)
            const state = statusForClass(a, cls.id)
            const items = a.resourceIds.map(getResource).filter(Boolean)
            const minutes = items.reduce((n, r) => n + (r.minutes ?? 0), 0)
            return (
              <Card
                key={a.id}
                id={`assignment-${a.id}`}
                ref={a.id === focusAssignment ? focusRef : undefined}
                interactive
                className={cx(
                  'group relative flex h-full flex-col p-4',
                  a.id === focusAssignment && 'ring-2 ring-brand-500 ring-offset-2'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Turns brand on card hover — the signal
                          that the whole card is the way in. It
                          holds its resting colour while a
                          resource row is hovered, because that
                          row goes somewhere else. */}
                      <h3 className="text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-700 group-has-[button.res-row:hover]:!text-ink-900">
                        {a.title}
                      </h3>
                      <Badge
                        tone={
                          state === 'live' ? 'brand' : state === 'upcoming' ? 'info' : 'neutral'
                        }
                      >
                        {state === 'live'
                          ? 'Live'
                          : state === 'upcoming'
                            ? 'Upcoming'
                            : 'Closed'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      {std?.id} {std?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <Score value={st.avg} />
                    <p className="text-[12px] text-ink-400">average</p>
                  </div>
                </div>

                {/* ---- WHAT IS ACTUALLY IN IT ----
                    Lifted wholesale from the Classes tab's card,
                    down to the numbered rows and the type badge
                    in front. The badge is what tells apart the
                    three parts of a module that share a name, and
                    the number says they are a sequence rather
                    than a set. Clicking a row opens the same
                    preview it opens everywhere else. */}
                <ol className="mt-3 space-y-1.5">
                  {items.map((r, i) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setPreviewing(r)}
                        className="res-row relative z-20 flex w-full items-center gap-2 rounded-control px-1 py-0.5 text-left transition-colors hover:bg-ink-50"
                      >
                        <span className="tnum w-3 shrink-0 text-[12px] text-ink-400">
                          {i + 1}
                        </span>
                        <TypeBadge type={r.type} />
                        <span className="min-w-0 flex-1 truncate text-[14px] text-ink-800">
                          {r.shortTitle}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <p className="mt-3 text-[12px] text-ink-400">
                  {items.length} {items.length === 1 ? 'resource' : 'resources'}
                  {minutes > 0 && ` · ${minutes} min`} · Created{' '}
                  {onDate(a.created ?? a.start)}
                </p>

                {/* ---- THE VERDICT AND THE BAND TRAVEL TOGETHER ----
                    The band was pinned to the bottom with
                    `mt-auto` and the verdict pill was not, so the
                    pill floated wherever the resource list left
                    it — three rows down on one card, two on the
                    next. Across a row of three that reads as
                    sloppiness, and worse, it costs the pills the
                    one thing that makes a row of them useful:
                    being able to compare them at a glance,
                    because they sit on a line.

                    So the pill and the band are one bottom block
                    now, pinned together. The variable-height part
                    of the card (the contents) absorbs the
                    difference, which is what it should do — it is
                    the part that genuinely differs. */}
                <div className="mt-auto pt-3">
                  {/* "6 need attention", not "6 struggling". The
                      product has one word for a child who is
                      behind, and this card was quietly using a
                      second.

                      "All clear" used to print on an assignment
                      nobody had started, because nought children
                      behind and nought children finished are the
                      same number and the badge could not tell
                      them apart. Not started is not all clear; it
                      is no information at all. */}
                  <p>
                    {st.completed === 0 ? (
                      <Badge tone="neutral">Nobody has finished it yet</Badge>
                    ) : st.needAttention > 0 ? (
                      <Badge tone="alert">{st.needAttention} need attention</Badge>
                    ) : (
                      <Badge tone="good">All clear</Badge>
                    )}
                  </p>

                {/* ---- THE BAND IS INFORMATION, NOT A DOOR ----
                    It used to be the only thing on this card you
                    could press, which made the card a poster with
                    one button stuck to the bottom of it. On a
                    screen whose every card goes to exactly one
                    place, that is a smaller target than it needs
                    to be and a worse one: a teacher aiming at
                    "Complete Circuits" and hitting the title got
                    nothing.

                    So the band keeps its figures and loses its
                    chevron and its hover. A chevron is a promise
                    that pressing THIS goes somewhere, and with
                    the whole card live that promise would be
                    pointing at the wrong thing. The band now just
                    says how far they have got, in the place it
                    always said it. */}
                <div className="mt-3 flex w-full items-center rounded-control border border-brand-200 bg-brand-50 px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-brand-800">
                      <span>
                        <span className="tnum font-semibold text-brand-900">
                          {st.completed}/{st.total}
                        </span>{' '}
                        finished
                      </span>
                      <span className="text-brand-300" aria-hidden>
                        ·
                      </span>
                      {/* Same correction as the report header:
                          name the class's window and count the
                          exception, rather than printing "2 due
                          dates" and making her open something to
                          find out which two. */}
                      <span>
                        {onDate(d.start)} – {onDate(d.due)}
                      </span>
                      {d.multiple && (
                        <>
                          <span className="text-brand-300" aria-hidden>
                            ·
                          </span>
                          <span className="font-medium text-brand-900">
                            {d.windows.slice(1).reduce((n, w) => n + w.studentIds.length, 0)} on
                            a different date
                          </span>
                        </>
                      )}
                    </span>
                    <span className="mt-2 block">
                      <ProgressBar value={st.completed} total={st.total} tone="brand" />
                    </span>
                  </span>
                </div>
                </div>

                {/* ---- THE WHOLE CARD IS THE TARGET ----
                    A transparent layer over the entire card,
                    carrying the click. It sits at z-10, under the
                    resource rows at z-20, so those still open
                    their own preview — the one rule this pattern
                    has is to raise the CONTROL, never the row or
                    box the control sits in, because a raised
                    container is a transparent sheet over the
                    overlay and kills the click everywhere along
                    its width.

                    A button rather than a link because the
                    destination is a dialog, not a page. The
                    screen-reader label names the assignment,
                    since "button" on its own tells nobody what
                    they are about to open. */}
                <Link
                  to={`/insights/assignment/${a.id}?class=${cls.id}`}
                  className="absolute inset-0 z-10 rounded-card"
                >
                  <span className="sr-only">Open the {a.title} report</span>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
      )}

      <PreviewOverlay resource={previewing} onClose={() => setPreviewing(null)} />

      <NewClassDialog
        open={makingGroup}
        seedStudentIds={lensPicked}
        onClose={() => setMakingGroup(false)}
        onCreated={() => setLensPicked([])}
      />
    </section>
  )
}

/* A sortable column heading. Same component as the roster
   inside a class — copied rather than imported only because
   ClassDetail does not export it; if a third table needs one,
   that is the moment to lift all three into ui.jsx. */
function SortHeader({ label, active, dir, onClick, className }) {
  return (
    <button
      onClick={onClick}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cx(
        'flex items-center gap-1 text-left text-[12px] font-semibold uppercase tracking-wide transition-colors',
        active ? 'text-brand-700' : 'text-ink-400 hover:text-ink-700',
        className
      )}
    >
      {label}
      {active && (
        <ArrowUp className={cx('h-3 w-3 shrink-0', dir === 'desc' && 'rotate-180')} />
      )}
    </button>
  )
}

export default function Insights() {
  /* The tab lives in the URL rather than in component state
     alone, so other screens can send a teacher to the RIGHT tab
     instead of to the front door of Reports.

     That distinction matters more than it sounds. A link that
     drops you on a page and leaves you to find the tab yourself
     is the "buried features" problem in miniature — you arrive
     having already decided what you wanted to see, and the
     product makes you decide again. It also means the browser
     back button and a pasted link both behave the way anyone
     would expect. */
  const [params, setParams] = useSearchParams()
  /* ---- BY CLASS IS THE FRONT DOOR NOW ----
     "Who needs help" used to open first, on the argument that
     the most urgent thing should be the first thing. Dhinesh
     moved it to the end and the new order is better for a
     reason the old one missed: a teacher arrives at Reports
     thinking about a ROOM, not about a league table of a hundred
     and nine children. By class is where she already is in her
     head, and every other tab is reachable from it in one click.

     It also puts the four tabs in order of how wide a net they
     cast — one class, then all her students, then the curriculum,
     then the flagged few. That is a shape she can learn, where
     "urgent first" was a shape she had to be told. */
  /* ---- AN UNKNOWN TAB FALLS BACK, IT DOES NOT BLANK ----
     This read the parameter straight, so ?tab=standards — a
     bookmark, a pasted link, anything saved before By TEKS was
     removed — selected no tab and rendered no section. A blank
     page under a working nav bar is the worst failure a URL can
     produce, because nothing on screen tells her what went
     wrong or what to do.

     Anything this screen does not recognise now lands on By
     class, which is also what a bare /insights does. A removed
     tab should degrade to the front door, not to nothing. */
  const TABS = ['classes', 'students']
  const requested = params.get('tab')
  const tab = TABS.includes(requested) ? requested : 'classes'
  const setTab = (value) => setParams(value === 'classes' ? {} : { tab: value })

  /* ---- AND A SECOND: WHICH CLASS ----
     Classes no longer carries scores, so the one thing it owes
     a teacher is a way to reach them. "View reports" on a class
     lands here, on this tab, already looking at that class —
     which is the difference between a link and a shortcut. She
     arrived having decided what she wanted to see; making her
     pick the class again would be asking her to decide twice.

     The back button works, the link can be pasted, and switching
     tabs drops it because she has moved on to a different
     question.

     There used to be a `teks` parameter beside this one, feeding
     a per-class breakdown of one standard at the top of the By
     TEKS tab. It went out with that tab. Dead parameters are
     worse than no parameters: the next person to read this would
     have taken it as evidence the screen still answers questions
     about a standard. */
  const focusClass = classes.find((c) => c.id === params.get('class'))

  const [coaching, setCoaching] = useState(null)


  /* The roster tab's own search and filter. Separate from the
     one on "Who needs help" on purpose: they answer different
     questions, and a filter that followed her between tabs would
     mean arriving at a list already narrowed by a decision she
     made for something else. */
  const [studentQuery, setStudentQuery] = useState('')
  const [studentClass, setStudentClass] = useState('all')
  const [needsOnly, setNeedsOnly] = useState(false)
  const [picked, setPicked] = useState([])
  const [makingGroup, setMakingGroup] = useState(false)
  const togglePick = (id) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  const toggleAllShown = (shown) => {
    const ids = shown.map((r) => r.student.id)
    setPicked((cur) => (ids.every((id) => cur.includes(id)) ? [] : ids))
  }
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  /* Pressing the active column reverses it; pressing a new one
     starts that column ascending. Starting a NEW sort descending
     because the last one happened to be descending is the thing
     that makes a table feel like it has a mind of its own. */
  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const mine = myStudents()
  const attention = studentsNeedingAttention()

  /* ---- ALPHABETICAL BY DEFAULT ----
     I had this lowest-score-first, arguing that a roster sorted
     alphabetically is a register and sorted by score it is a
     report. Dhinesh overruled it and the reason is in the tab's
     own name: "By students" is the one view here that is NOT a
     ranking. "Who needs help" ranks by urgency, "By TEKS" ranks
     by weakness, "By class" ranks nothing because twelve classes
     fit on a screen. This tab exists to let her find a child —
     and you find a name alphabetically, not by guessing what
     they scored.

     The score sort is still one press away, which is the whole
     point of making the headings sort rather than picking an
     order for her.

     ---- THE FILTERS NEST, AND THE COUNTS FOLLOW ----
     Class first, then "needs attention", then the search. The
     order matters for what the Segmented says: its two counts
     are the size of each half AFTER the class filter but BEFORE
     the search, so narrowing to 3rd Period moves them, and
     typing a name does not. A count that twitched with every
     keystroke would be unreadable; one that ignored the class
     filter would be a lie. */
  const flaggedIds = new Set(attention.map((r) => r.student.id))

  const inClass = mine
    .map((student) => ({
      student,
      cls: classes.find((c) => c.studentIds.includes(student.id)),
      weak: pickWeakestStandard(student),
      worst: weakestAssignmentFor(student.id),
    }))
    .filter((r) => (studentClass === 'all' ? true : r.cls?.id === studentClass))

  const inClassFlagged = inClass.filter((r) => flaggedIds.has(r.student.id)).length

  const roster = inClass
    .filter((r) => (needsOnly ? flaggedIds.has(r.student.id) : true))
    .filter((r) => {
      const q = studentQuery.trim().toLowerCase()
      if (!q) return true
      return (
        r.student.name.toLowerCase().includes(q) ||
        String(r.student.studentId).includes(q)
      )
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'score') return byScore(a.student.mastery, b.student.mastery, dir)
      if (sortKey === 'class')
        return (a.cls?.name ?? '').localeCompare(b.cls?.name ?? '') * dir
      if (sortKey === 'teks') return a.weak.id.localeCompare(b.weak.id) * dir
      return a.student.name.localeCompare(b.student.name) * dir
    })

  /* ---- ONE CLASS OPEN IS A DIFFERENT SCREEN ----
     Dhinesh's note that back navigation belongs at the top left
     turned out to be about more than a position. The page title
     and the two tabs are the LIST's furniture — they say "you
     are choosing among twelve classes". They were still drawn
     while one class was open, which pushed its back link down
     below them into the middle of the page, where a back link
     is the one thing it must never be: something you hunt for.

     So when a class is open the list's chrome stands down and
     the page takes the shape every other detail screen in the
     product has — back link top left, then the name as the
     heading. Classes, Students and the assignment report all
     read this way already; this was the only one that did not,
     and the odd one out was the one with two levels on it. */
  const inClassReport = tab === 'classes' && !!focusClass

  return (
    <div className="space-y-6">
      {!inClassReport && (
        <>
          {/* Still called "Reports" — the familiar word. What
              changed is what it opens on: people, not
              percentages. */}
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">Reports</h1>
            <p className="mt-1 text-sm text-ink-500">
              Who needs help, and where the class as a whole is stuck.
            </p>
          </header>

          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'classes', label: 'By class', count: classes.length },
              { value: 'students', label: 'By students', count: mine.length },
              /* The count follows the filter. A tab reading 109
                 beside a list of 9 is the tab telling her the
                 screen is lying to her. */
            ]}
          />
        </>
      )}

      {/* ================= BY STUDENTS ================= */}
      {tab === 'students' && (
        <section>
          {/* ---- ONE LIST OF STUDENTS, WITH A FILTER ON IT ----
              "Who needs help" used to be a third tab carrying the
              same students in a different layout. Dhinesh folded
              it in here, and it is the right call: the two views
              differed only in WHO was included, never in what a
              student is, so they were one list and a filter
              pretending to be two screens.

              The filter is a Segmented rather than a checkbox
              because it is switching between two views of the
              same thing, which is what that control is for — and
              because it can carry both counts. "All 228 /
              Needs attention 103" tells her the size of each
              before she picks, which a checkbox cannot. The
              question the old tab was proud of answering is
              still on screen in its own words; it is just not
              pretending to be a different kind of thing.

              SEARCH FIRST, because the honest primary use of a
              roster is "where is Priya". The class filter is for
              the other one: "show me 3rd Period". */}
          <SectionHeader
            title="Every student you teach"
            description="Search for a name, narrow to one class, or press a column to sort by it."
          />

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[220px] flex-1">
              <span className="sr-only">Search students</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Search a name or ID"
                className="h-10 w-full rounded-control border border-ink-300 bg-white pl-9 pr-3 text-[14px] text-ink-900 placeholder:text-ink-400"
              />
            </label>
            {/* ---- A FILTER, NOT A CHOICE BETWEEN TWO LISTS ----
                This was a Segmented — "All 228 | Needs attention
                103" — which presented them as two equal views.
                They are not. The list is every student she
                teaches; needing attention is a condition laid
                over it. A segmented control makes her pick one of
                two things every time she arrives, when the honest
                default is "show me everyone" and the filter is
                something she reaches for.

                So: one toggle, off by default, in the alert
                colour it filters by. `aria-pressed` rather than a
                checkbox, because it is a button whose state
                matters — and the colour stays even when it is off
                so she can see what it would do before pressing
                it. It fills in when active, which is how she
                tells at a glance that the list in front of her is
                narrowed.

                The count rides on it either way, so she knows the
                size of the problem without having to apply the
                filter to find out. */}
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
              {/* ---- THE COUNT SITS ON THE LABEL'S BASELINE ----
                  This number was 12px against a 14px label. In a
                  flex row every child is centred on the box
                  independently, so a smaller number does not
                  share the label's baseline — it floats a hair
                  high, and the whole button reads as crooked even
                  though nothing is misaligned by the box model.

                  It is the same size as the label now, carried
                  only by colour weight, which is exactly what the
                  Segmented counts elsewhere in the product do.
                  Same trick, same result: one line of text that
                  happens to end in a number. */}
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
              Needs attention
              {/* The count carries no colour of its own. A third
                  red — lighter than the label — read as faded
                  rather than quiet, which is the failure mode of
                  tinting a number inside an already-coloured
                  control. Inheriting means weight alone separates
                  it, and it follows the button between its off
                  and on states without a second rule. */}
              <span className="tnum font-normal">{inClassFlagged}</span>
            </button>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="h-10 shrink-0 rounded-control border border-ink-300 bg-white px-2.5 text-[14px] text-ink-800"
            >
              <option value="all">All my classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <GroupActions
            picked={picked}
            rows={roster}
            onClear={() => setPicked([])}
            onMakeGroup={() => setMakingGroup(true)}
          />

          {roster.length === 0 ? (
            <EmptyState
              icon={needsOnly ? CheckCircle2 : Search}
              title={
                needsOnly && !studentQuery.trim()
                  ? 'Nobody here is falling behind'
                  : 'No student matches that'
              }
              description={
                needsOnly && !studentQuery.trim()
                  ? 'Everyone in view is at or above the threshold this week.'
                  : 'Try part of a name, or widen the filters.'
              }
            />
          ) : (
            <StudentTable
              rows={roster}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
              onCoach={setCoaching}
              picked={picked}
              onTogglePick={togglePick}
              onToggleAll={() => toggleAllShown(roster)}
            />
          )}
        </section>
      )}


      {/* ---- WHAT USED TO BE HERE: WHO NEEDS HELP ----
          A third tab listing the flagged children as cards,
          three to a row, with the reason each was flagged
          written out in a sentence.

          It is now the "Needs attention" filter on By students,
          because that is what it always was: the same children,
          in the same roster, with a condition applied. Two tabs
          for one list meant two layouts for one object, and the
          card version could not be sorted, could not be searched
          and ran to eight thousand pixels.

          The one thing the cards said that a row cannot is WHY
          each child is flagged, in words. That moved into the
          score column as a falling arrow beside a red number —
          see StudentTable. A sentence per row is the thing a
          table exists to avoid. */}


      {/* ================= BY CLASS ================= */}
      {tab === 'classes' && focusClass && (
        <ClassReport
          cls={focusClass}
          onCoach={setCoaching}
          focusAssignment={params.get('assignment')}
          initialLens={params.get('lens')}
        />
      )}

      {tab === 'classes' && !focusClass && (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {classes.map((c) => {
              const stats = classStats(c.id)
              /* Everything this class has been given, open or
                 closed. Not "4 still open", which is what the old
                 stat tile said: a closed assignment is still work
                 she set and still carries a score, and a count
                 that quietly drops them makes the card disagree
                 with the report it opens. */
              const assignmentCount = assignments.filter((a) =>
                a.classIds.includes(c.id)
              ).length
              const bandSplit = classBands(c.id)
              return (
                /* ---- THE CARD OPENS THE REPORT, NOT THE CLASS ----
                   It used to link to /classes/:id, which sent a
                   teacher who had come to Reports to read a score
                   back to the screen that no longer has any. A
                   card inside Reports should go deeper into
                   Reports. */
                /* ---- TWO TARGETS, AND NO NESTED LINKS ----
                   The card is NOT a link. It is a positioned box
                   with a full-size invisible link laid over it,
                   and the one control that goes somewhere else —
                   the red button — sits above that overlay. Two
                   real, separate targets, neither inside the
                   other. The overlay carries its own label for
                   screen readers, since an invisible link with no
                   text is a link nobody can use.

                   ---- THE DEAD STRIP, AND WHY IT WAS DEAD ----
                   First version raised the whole bottom ROW above
                   the overlay to get the button on top. That put
                   a full-width transparent div over the overlay,
                   and a div is not a link: everything along that
                   strip — the gap between the button and the
                   chevron, the chevron itself — swallowed the
                   click and did nothing. Dhinesh felt it as "the
                   card is not clickable properly", which is
                   exactly what it was.

                   Only the BUTTON is raised now. Every other
                   pixel, including the row it sits in, is the
                   card's own target. The rule this cost me:
                   raise the control, never the container the
                   control is in. */
                <Card
                  key={c.id}
                  interactive
                  /* `group` so the class name can react to a hover
                     anywhere on the CARD, not just on itself. The
                     card's target is an invisible overlay, so
                     without this the name would only light up when
                     the cursor happened to be over the name — on a
                     card where the whole surface is the link. */
                  className="group relative flex h-full flex-col p-4"
                >
                  {/* ---- THE SCORE GOES WHERE EVERY OTHER SCORE GOES ----
                      It was bottom-left for one version, and
                      Dhinesh asked the right question about it:
                      every other card in this product puts the
                      score top-right with "average" underneath —
                      the assignment cards on the Classes tab, the
                      assignment cards in this report, the student
                      cards, the student page. Four card types
                      agreeing is not a coincidence, it is the
                      pattern, and this card was the only thing
                      breaking it.

                      A consistent position is worth more than a
                      clever one. Twelve cards in a grid are read
                      by running the eye down a column, and a
                      teacher who has learned that scores live in
                      the top-right corner should not have to
                      re-learn it on the one screen whose whole
                      job is scores.

                      ---- AND THE ARROW GOES ----
                      It was only in the top-right because the
                      corner was free. With the score back there
                      it has nowhere to be that does not make it
                      look like it belongs to something else — and
                      it was never carrying much: the Card is
                      `interactive`, so the whole surface lifts on
                      hover and the cursor turns, and the class
                      cards on the Classes screen have worked as
                      whole-card links without a chevron since the
                      first version. */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {/* ---- 16px, MATCHING THE CLASSES SCREEN ----
                          The same class named on two screens is
                          now set the same way: 16px semibold here
                          and on the Classes card. The assignment
                          and student cards stay at 14px, which
                          makes size mean something rather than
                          nothing — a card about a CLASS carries a
                          16px title, a card about a task or a
                          child carries 14px. */}
                      {/* ---- THE NAME IS THE HOVER SIGNAL ----
                          The card lifts and the cursor turns, but
                          neither says WHAT it opens. The name
                          turning brand does: it points at the one
                          word on the card that names the
                          destination, so the feedback and the
                          target are the same thing.

                          It is also the signal the Classes screen
                          has used on its class cards since the
                          first version — same gesture, same
                          response, on the two cards that stand for
                          the same object. */}
                      <h3 className="truncate text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700 group-has-[a.attn-link:hover]:!text-ink-900">
                        {c.name}
                      </h3>
                      <p className="text-[12px] text-ink-500">{stats.size} students</p>
                    </div>
                    {/* ---- AND THE SAME SIZE AS EVERY OTHER SCORE ----
                        It was `lg` — 18px — against the 14px the
                        assignment cards use, so moving it into
                        the matching corner only made the mismatch
                        easier to see. Measured rather than
                        guessed: 18px here, 14px on the Classes
                        assignment card and on this report's own
                        assignment cards.

                        14px is also the size of the class name
                        opposite it, which is the real argument.
                        This card carries two facts of equal
                        standing — what the class averages and how
                        many need her — so the score should sit
                        level with the name rather than looming
                        over it. The student cards keep `lg`
                        because there the score IS the subject of
                        the card; here it is one of two. */}
                    <div className="shrink-0 text-right">
                      <Score value={stats.avg} size="base" />
                      {/* The band, where "average" used to sit
                          alone. "68%" is a number she still has to
                          convert; "68% Approaches" is the sentence
                          she would say in a planning meeting. */}
                      <p className="text-[12px] text-ink-400">
                        <LevelLabel value={stats.avg} /> average
                      </p>
                    </div>
                  </div>

                  {/* ---- THE SHAPE, UNDER THE AVERAGE ----
                      Dhinesh: these cards look flat beside the
                      rest of the product. They did, and the reason
                      was not decoration — it was that the card
                      carried one fact where the others carry
                      three. The honest thing to put in the gap is
                      the one the average is actively hiding.

                      Two classes both reading 68% can be a room
                      bunched at 68 and a room where ten children
                      are failing and ten are flying. Those need
                      opposite responses, and the mean says nothing
                      about which she is looking at. The strip
                      does, in one glance, and the counts under it
                      say it in words so nothing is hidden behind a
                      hover. */}
                  <BandRows
                    bands={bandSplit.bands}
                    total={bandSplit.total}
                    unscored={bandSplit.unscored}
                    className="mt-3.5"
                  />

                  {/* The card's own target. Drawn over everything
                      static; only the red button is given a layer
                      above it. */}
                  <Link
                    to={`/insights?tab=classes&class=${c.id}`}
                    className="absolute inset-0 z-10 rounded-card"
                  >
                    <span className="sr-only">Open the {c.name} report</span>
                  </Link>

                  {/* ---- WHAT THE CLASS HAS, AND WHAT IT NEEDS ----
                      Bottom-left is a count, bottom-right is the
                      one thing asking for her. They are
                      deliberately different kinds of thing and
                      look it: the count is 12px grey, the same
                      treatment as "24 students" directly above it,
                      because it is context rather than news.

                      It is NOT a control, and it sits under the
                      card's click overlay rather than above it —
                      so it reads as information and clicking it
                      opens the report like any other part of the
                      card. The only thing on this card with a
                      destination of its own stays the red one. */}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <p className="text-[12px] text-ink-500">
                      {assignmentCount} {assignmentCount === 1 ? 'assignment' : 'assignments'}
                    </p>
                    {stats.flagged > 0 ? (
                      /* Built like Unassign on the Classes tab: a
                         ghost button in the alert colour with its
                         own icon. `relative z-20` on the LINK
                         ITSELF — raising the row instead puts a
                         transparent div over the card's own
                         target and kills the click everywhere
                         along it. */
                      <Link
                        to={`/insights?tab=classes&class=${c.id}&lens=attention`}
                        className={cx(
                          buttonClass({ variant: 'ghost', size: 'sm' }),
                          /* ---- ONE HOVER AT A TIME ----
                             `attn-link` is a hook, not a style.
                             The class name lights up on a hover
                             anywhere on the card, and this button
                             is ON the card, so hovering it lit the
                             name up too — the card promising to
                             open the report while the cursor sat
                             on a control that goes somewhere else.
                             Two destinations signalling at once is
                             worse than neither.

                             The h3 carries a `group-has-` rule
                             that watches for this class being
                             hovered and holds the name at its
                             resting colour. The button's own
                             hover still fires, so the thing under
                             the cursor is the only thing that
                             reacts. */
                          'attn-link relative z-20 -mr-1 !px-2 !text-alert-700 hover:!bg-alert-50 hover:!text-alert-800'
                        )}
                      >
                        <CircleAlert className="h-4 w-4" aria-hidden />
                        {stats.flagged} need attention
                      </Link>
                    ) : (
                      <span className="px-2 text-[14px] font-medium text-good-700">
                        Everyone keeping up
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* ---- WHAT USED TO BE HERE, AND WHY IT IS NOT ----
              A cross-class "Assignment results" list: every
              assignment she has ever set, ranked by how many
              students are struggling, with a dialog breaking each
              one down class by class.

              It answered a real question — "which of the things I
              set went worst" — and it sat on a tab called BY
              CLASS, under a grid of classes, belonging to none of
              them. Dhinesh caught it: a tab cannot promise one
              organising idea and then end in a list organised by
              a different one. Whatever the section was worth, it
              was teaching a teacher that the tab labels do not
              mean anything.

              The flow this screen commits to instead is the one
              the live product already uses and the one a teacher
              already has in her head: pick the room, then look at
              what you gave it. Every assignment on this screen is
              now reached through a class, and carries that
              class's numbers rather than an average across twelve
              rooms that were taught it on different days.

              The cross-class question is not gone from the
              product — Library's Assigned tab lists every
              assignment with its full class breakdown. What it
              does not carry is scores. If that view is ever
              wanted back, it belongs on a tab of its own with an
              honest name, not stapled under the classes. */}

        </section>
      )}

      <NewClassDialog
        open={makingGroup}
        seedStudentIds={picked}
        onClose={() => setMakingGroup(false)}
        onCreated={() => setPicked([])}
      />

      <CoachingPlan
        open={!!coaching}
        onClose={() => setCoaching(null)}
        student={coaching?.student}
        standard={coaching?.standard}
        className={coaching?.cls}
      />
    </div>
  )
}
