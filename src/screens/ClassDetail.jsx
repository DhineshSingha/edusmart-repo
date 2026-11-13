/* ============================================================
   CLASS DETAIL
   ------------------------------------------------------------
   One class, three views: who's in it, what they're doing, how
   it's going.

   In the live product this information is split across My
   Groups (the roster), Workspace (the assignments) and Reports
   (the scores) — three tabs, each showing a slice of one class,
   none of them showing the class.

   THE STUDENTS TAB IS THE IMPORTANT ONE
   The live Grade Book is a matrix: students down the side,
   assignments across the top, percentages in the cells. That's
   a fine way to store data and a poor way to answer a question.
   A teacher scanning it has to read every cell and do the
   comparison herself.

   Here the roster sorts worst-first by default and each row
   carries its own verdict. The software does the scan.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  ChevronRight,
  Check,
  Printer,
  UserMinus,
  Search,
  Undo2,
  Plus,
  UserPlus,
  X,
} from 'lucide-react'
import {
  getClass,
  studentsInClass,
  assignmentsForClass,
  progressFor,
  classStats,
  getStandard,
  getResource,
  canEditRoster,
  gradeLabel,
  deliveryFor,
  reachedIn,
  newcomersIn,
  statusForClass,
  assignmentStatsForClass,
  onDate,
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
  SectionHeader,
  Sheet,
  EmptyState,
  cx,
} from '../components/ui'
import { useApp } from '../store'
import AddStudentsDialog from '../flows/AddStudentsDialog'
import ClassActions from '../flows/ClassActions'
import StudentPrintSheet from '../flows/StudentPrintSheet'
import StudentRowActions from '../flows/StudentRowActions'
import TypeBadge from '../components/TypeBadge'
import PreviewOverlay from '../flows/PreviewOverlay'
/* ---- ONE IMPLEMENTATION, TWO SCREENS ----
   These four come from the Library's Assigned tab rather than
   being rebuilt here. Dhinesh asked for this screen to "match
   the functionality" of that one, and the only way a match
   stays a match is if there is one copy of it: a second
   roster dialog written here would agree with the first for
   about a week.

   Importing a screen module from another screen module is not
   lovely, and the honest alternative — lifting them into
   src/flows/ — is a bigger move than this change should carry.
   Noting it here so the next person knows it was a choice and
   not an accident: if a third screen needs them, that is the
   moment to move them out. */
import {
  WindowsDialog,
  UnassignConfirm,
  CatchUpDialog,
} from './Teach'

/* ---- WHAT USED TO BE HERE ----
   A trend map and a tie-break rank, both about scores. They
   went out with the scores themselves when performance moved
   to Reports. Leaving them behind would have been worse than
   untidy: the next person to read this file would have taken
   them as evidence that this screen still knows how a child is
   doing, and built on that.

   Dead code is a claim about the product that nothing in the
   product supports. */

export default function ClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const cls = getClass(classId)

  /* ---- WHICH TAB OPENS IS IN THE URL ----
     The class card on the Classes screen now has two
     destinations — the roster, and this class's assignments —
     so the screen has to be able to open on either. Keeping
     that in the query string rather than in a prop means it
     survives a reload and a copied link: a teacher who bookmarks
     "1st Period, assignments" gets it back.

     `useState` alone could not do this, and a second route
     (/classes/c1/assignments) would have made a tab into a
     page, which it isn't — the header, the stats and the class
     itself are the same either way. */
  const { removeStudentFromClass, assignmentList } = useApp()

  /* The four things an assignment card here can open. Held on
     the screen rather than inside each card so that only one
     can be open at a time — two stacked dialogs from two
     different cards is a state nobody can back out of
     predictably. */
  const [previewing, setPreviewing] = useState(null)
  const [viewingRoster, setViewingRoster] = useState(null)
  const [unassigning, setUnassigning] = useState(null)
  const [catchingUp, setCatchingUp] = useState(null)
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'assignments' ? 'assignments' : 'students'
  const setTab = (next) =>
    setParams(next === 'assignments' ? { tab: 'assignments' } : {}, { replace: true })
  const [bulk, setBulk] = useState(null) // print | remove
  const [adding, setAdding] = useState(false)

  /* ============================================================
     SORTING AND FILTERING THE ROSTER

     WHY A HEADER ROW APPEARS AT THE SAME TIME. The columns had
     no headings at all, which is how Dhinesh ended up asking
     what the arrow and the six-digit number were: the row was
     five facts with nothing naming any of them. Sort controls
     have to live somewhere, and the only honest place is a
     heading — so adding sort finally labels the table too. The
     feature and the fix are the same edit.

     WHAT SORTS AND WHAT FILTERS, AND WHY THEY DIFFER.
       Name     sorts (A–Z), searched by name OR id
       ID       sorts (enrolment order), searched with the name
       Grade    sorts, and filters to one year
     A text column is searched, not filtered — a dropdown of 24
     names is a worse way to find Naomi than typing "nao". A
     categorical column is filtered, because its values are a
     short closed list. Sorting applies to all three.

     There was a fourth, Score, with a band filter beside it.
     Both left with the scores. Deleting a control is cheaper
     than deleting the habit it taught, so this note stays as
     the record of why the column count changed.

     THE ID SORTS TOO. I had argued it should only be searched —
     that you look an id up because you are holding one, and
     nobody reads a roster in id order. The first half is true
     and the second was me deciding what a teacher wants. Ids
     here are issued in enrolment order, so sorting by one is
     sorting by "who joined this school first", which is a
     real question with a real answer on this screen.

     The cost was never the sort anyway, it was the heading: one
     control cannot mean two things. Three headings solves that
     properly, and it made the labels better — STUDENT was a
     vague noun standing over a name, and NAME · ID · GRADE says
     exactly what each control orders by.
     ============================================================ */
  /* ---- THE DEFAULT SORT IS ALPHABETICAL NOW ----
     "Who needs you most" was a performance order, and this
     screen no longer shows the number it sorted by — a list
     ordered by a column that isn't there is a list in no
     visible order at all. A roster sorts by name, which is
     what a register is for, and the sentence we cut months ago
     for being preachy turns out to have been describing the
     right screen all along: alphabetical order IS for
     registers, and this is now a register. */
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('all')

  /* ============================================================
     SELECTING SEVERAL STUDENTS

     SELECTION IS ALWAYS ALLOWED, even on a district roster.
     Dhinesh was explicit and he is right: choosing rows is not
     changing anything. What the selection is allowed to DO
     differs — Print works on any class, Remove only on a group
     she assembled — and gating the checkbox on that would have
     stopped her printing slips for six children in 1st Period,
     which is the most ordinary thing on this page.

     THE SELECTION IS PRUNED TO WHAT IS VISIBLE. If a filter
     hides a selected student, he leaves the selection. The
     alternative is a "6 selected" that includes two rows she
     cannot see, and then a Remove that takes them — a
     destructive action reaching past the filter it is sitting
     under is exactly the fault the New class picker's select-all
     had to avoid, arriving here through a different door.
     ============================================================ */
  const [selected, setSelected] = useState([])

  /* Clicking the active column flips it; clicking a new one
     starts that column in its own natural direction — names
     read A–Z, scores read worst-first, because that is how a
     teacher asks for each of them. A single global default
     would have every other column open backwards. */
  const naturalDir = { name: 'asc', id: 'asc', grade: 'asc', score: 'asc', need: 'asc' }
  const toggleSort = (key) =>
    setSort((c) =>
      c.key === key ? { key, dir: c.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: naturalDir[key] }
    )

  if (!cls) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-500">That class doesn't exist.</p>
        <Link to="/classes" className="mt-3 inline-block text-sm text-brand-700 underline">
          Back to Classes
        </Link>
      </div>
    )
  }

  const roster = studentsInClass(cls.id)
  /* ---- THE SAME ORDER AS THE LIBRARY'S ASSIGNED TAB ----
     Live, then Upcoming, then Closed — and the order WITHIN each
     group matters as much as the order of the groups:

     · Live sorts by soonest due date, because the only useful
       question about an open assignment is which deadline lands
       next.
     · Upcoming sorts by soonest START, not by due date. These
       have not opened yet, so when they open is the thing she is
       waiting on.
     · Closed sorts most recent first, because the one she just
       finished is the one she might still be marking, and
       something that shut in August is archive.

     Three different sort keys for three groups is not an
     inconsistency; each group is answering a different question,
     and sorting all three by due date would answer none of them
     properly.

     THE DIFFERENCE FROM THE LIBRARY: every status here is read
     through THIS CLASS (`statusForClass`) rather than across all
     of them. An assignment that closed for 1st Period last week
     is Closed on this page even while five other classes still
     have it open — which is the same correction the badge
     needed, applied to the order.

     The list was previously in whatever order the data happened
     to be in, so a closed assignment from August sat above a
     live one due tomorrow. */
  const assigned = useMemo(() => {
    const all = assignmentsForClass(cls.id)
    const by = (state) => all.filter((a) => statusForClass(a, cls.id) === state)
    const dueHere = (a) => deliveryFor(a, cls.id).due
    const startHere = (a) => deliveryFor(a, cls.id).start
    return [
      ...by('live')
        .slice()
        .sort((a, b) => dueHere(a).localeCompare(dueHere(b))),
      ...by('upcoming')
        .slice()
        .sort((a, b) => startHere(a).localeCompare(startHere(b))),
      ...by('closed')
        .slice()
        .sort((a, b) => dueHere(b).localeCompare(dueHere(a))),
    ]
  }, [cls.id, assignmentList])
  const stats = classStats(cls.id)

  /* Filter first, then sort — the other order sorts rows that
     are about to be thrown away, and on a district-wide group
     that is real work for nothing.

     `.slice()` because `sort` mutates, and `roster` is the
     class's own array: sorting it in place would quietly
     reorder the roster everywhere else in the product. */
  const gradesPresent = [...new Set(roster.map((s) => s.gradeLevel))].sort((a, b) => a - b)

  const visibleRoster = (() => {
    const q = query.trim().toLowerCase()
    const rows = roster.filter((s) => {
      /* The search covers the name AND the id, because they sit
         on one line and a teacher holding either should find
         the child with it. */
      if (q && !s.name.toLowerCase().includes(q) && !s.studentId.includes(q)) return false
      if (grade !== 'all' && s.gradeLevel !== Number(grade)) return false
      /* The same rule the class cards count with, not a second
         one that happens to agree today. */
      return true
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    return rows.slice().sort((a, b) => {
      switch (sort.key) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'id':
          /* Compared as numbers, not strings. These are all six
             digits today so the two agree, but the day a
             district issues a five- or seven-digit one, string
             order puts 99999 after 1000000. */
          return dir * (Number(a.studentId) - Number(b.studentId))
        case 'grade':
          /* Ties inside a year fall back to name, so the list
             has a stable order rather than whatever the roster
             array happened to hold. */
          return dir * (a.gradeLevel - b.gradeLevel) || a.name.localeCompare(b.name)
        default:
          /* Three headings, three cases, and a default that is
             one of them rather than a fourth hidden order. The
             old default was "needs you most", which sorted by a
             score this screen no longer shows — a list ordered
             by a fact the reader cannot see is a list in no
             order at all. */
          return dir * a.name.localeCompare(b.name)
      }
    })
  })()


  const visibleIds = visibleRoster.map((s) => s.id).join(',')
  useEffect(() => {
    setSelected((cur) => {
      const keep = cur.filter((id) => visibleIds.split(',').includes(id))
      return keep.length === cur.length ? cur : keep
    })
  }, [visibleIds])

  const chosen = visibleRoster.filter((s) => selected.includes(s.id))
  const allShown = visibleRoster.length > 0 && chosen.length === visibleRoster.length

  const toggleOne = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  const toggleAll = () =>
    setSelected(allShown ? [] : visibleRoster.map((s) => s.id))

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <header>
        <Link
          to="/classes"
          className="inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Classes
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{cls.name}</h1>
            {/* No period time, no room — see the note on
                `classes` in mock.js. */}
            <p className="mt-1 text-sm text-ink-500">{roster.length} students</p>
          </div>
          {/* ---- ITEMS-CENTER, NOT THE DEFAULT STRETCH ----
              A flex row with no cross-axis alignment stretches
              its children, and the ⋯ is 32px tall where the two
              buttons are 40. Its wrapper obediently stretched
              to 40 and the button inside it stayed at the top —
              so the menu sat four pixels high and looked like a
              mistake, which it was.

              Centring is the right answer rather than making
              the ⋯ 40px tall: a bare icon in a 40px box has a
              hit area the size of a primary button and reads
              as one. It should stay the smallest thing on the
              row and simply share its middle. */}
          <div className="flex items-center gap-2">
            {/* ============================================================
                THE ONE BUTTON THAT CONNECTS THE TWO SCREENS

                Dhinesh's idea, and it is what makes stripping the
                scores out of here safe rather than merely tidy.
                Without it, a teacher who wants to know how 1st
                Period is doing has to open Reports, choose By
                class, and find 1st Period again — three steps to
                re-state something she had already told the
                product by being on this page.

                It carries the class, so it is not a navigation
                shortcut. That is the distinction that got "Assign
                something" deleted two rounds ago: a link that
                drops you at the front door of a section and
                leaves you to find your way is worth less than the
                click it costs. This one lands on the report for
                THIS class, open, with the numbers on screen.

                ---- WHY IT MOVED UP HERE ----
                I had it at the end of the tab row, level with
                Students / Assignments, and that was the wrong
                shelf. The tab row's whole job is to say WHICH
                PART OF THIS CLASS you are looking at; a control
                that leaves the class entirely does not belong on
                a line that means "pick a view of it". Up here it
                joins the other two things a teacher can do with
                the class as a whole, which is what it is.

                ORDER IS BY WHAT EACH ONE TOUCHES. View reports
                reads this class; Add student and the ⋯ change it.
                The reader comes first and the two writers travel
                together, so the row is not three unrelated
                buttons in whatever order they were built.

                ---- GHOST, LIKE "SAVE FOR LATER" ----
                Dhinesh's call, and it settles a weight problem I
                had left standing. Two bordered buttons side by
                side are a claim that the two are equals, and
                these are not: Add student changes the thing on
                the screen, View reports goes and looks at it
                somewhere else. Boxing both said "pick one of
                these two actions" when only one of them is an
                action on this page.

                Ghost is the shape the product already uses for
                exactly that — Save for later sits beside Assign
                in the playlist bar as the quieter of a pair,
                borderless, grey until you reach for it. Reusing
                it here means a teacher is not learning a new
                level of emphasis, she is recognising one.

                SAME SIZE, THOUGH. Save for later is `sm` because
                the playlist bar is a dense strip; this header
                has 40px buttons in it, and a 32px one beside
                them reads as a mistake before it reads as a
                hierarchy. The variant carries the weight — the
                height just has to agree with its neighbours. */}
            <Link
              to={`/insights?tab=classes&class=${cls.id}`}
              className={cx(buttonClass({ variant: 'ghost' }), 'gap-2')}
            >
              <BarChart3 className="h-4 w-4" />
              View reports
            </Link>
            <Button variant="secondary" icon={UserPlus} onClick={() => setAdding(true)}>
              Add student
            </Button>
            {/* ============================================================
                "ASSIGN SOMETHING" IS GONE

                It was a filled brand button — the strongest
                promise this page could make — and all it did was
                navigate to Library. Dhinesh is right that the
                promise was the problem: a primary button says a
                FLOW STARTS HERE, and when the flow turns out to
                be a tab that is already in the nav bar, the
                button has spent the teacher's attention on a
                click she could have made anyway.

                It is the same fault as the chevron I declined to
                put on the alert band, and as the hover-only
                checkbox: a control that implies more than it
                delivers. Three times now, so the rule is worth
                writing down — THE WEIGHT OF A CONTROL IS A CLAIM
                ABOUT WHAT IT DOES. A navigation shortcut dressed
                as a primary action is a claim the product cannot
                meet.

                ---- THE VERSION THAT WOULD HAVE EARNED IT ----
                There is a real feature hiding here, and it is
                worth recording rather than losing. A button that
                carried the CLASS with it — land in Library, and
                when she assigns anything, 1st Period is already
                ticked in the Assign dialog — would not be a
                shortcut, it would be context the teacher
                otherwise has to re-supply.

                I did not build it because the saving is one
                checkbox in a dialog that already lists all five
                classes, and she often wants more than one of
                them anyway. One checkbox is not worth a primary
                button on every class page. If it turns out
                teachers assign from here constantly, the handoff
                is a small piece of work and the button comes
                back meaning something.

                The header is left with no primary action, which
                is the honest shape: this page's job is to be
                READ. Nothing on it is the thing a teacher came
                to do.
                ============================================================ */}
            {/* ---- THE SAME MENU AS THE CARD ----
                Rename and Delete live here too, because this is
                where a teacher IS when she decides a group has
                the wrong name or has served its purpose — she
                has just looked at the roster. Making her go back
                to the grid to act on the thing she is already
                looking at is the kind of small tax that adds up.

                It is the same component, so the rules travel
                with it: rename works on any class, delete only
                on the ones she made, and the reason is one click
                away on the ones she didn't.

                `onDeleted` is new, and it is the whole
                difference between the two screens. On the grid,
                deleting removes a card and the teacher stays put.
                Here she is STANDING ON the thing she deleted, so
                the screen has to take her somewhere — otherwise
                the class vanishes underneath her and she is left
                on a page about nothing. */}
            <ClassActions cls={cls} onDeleted={() => navigate('/classes')} />
          </div>
        </div>
      </header>

      {/* ============================================================
          THE THREE TILES ARE GONE

          They cost about 110px of the screen a teacher opens
          this page to read, and Dhinesh is right about each one:

          ACTIVE ASSIGNMENTS was already on the tab six inches
          below it. "Assignments 6" says the same thing, in the
          control that takes you to them, and the 4-of-6 split
          belongs on that tab rather than on this one.

          CLASS AVERAGE is one number and did not need a card
          around it. It moves to the end of the tab row, where it
          sits on a line that already exists.

          NEED ATTENTION was the only one doing real work — and
          it was doing it passively. A teacher who reads "11"
          then has to go and find those eleven herself. As a
          filter beside the search it keeps the number visible
          AND hands her the eleven rows in one press, which is
          strictly more than a tile can do.

          The general lesson, which is worth keeping: a stat tile
          is what you build when a number has nowhere better to
          live. Every one of these three had somewhere better.
          ============================================================ */}

      {/* The tab row carries nothing but the tabs now. "View
          reports" used to sit at its right end; it is in the
          header with the other class-level actions, for the
          reason written there. */}
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'students', label: 'Students', count: roster.length },
          { value: 'assignments', label: 'Assignments', count: assigned.length },
        ]}
      />

      {/* ================= STUDENTS ================= */}
      {tab === 'students' && (
        <section>
          {/* ---- THE SUBTITLE NOW TELLS THE TRUTH ----
              It used to assert "sorted by who needs you most"
              unconditionally. The moment a teacher can sort by
              name, that sentence is a lie two thirds of the
              time — and a screen that explains itself wrongly is
              worse than one that doesn't explain itself, because
              she has no reason to doubt it. The claim about the
              order is made only while that order is the one in
              force; the note about the arrow is always true, so
              it always shows. */}
          {/* ---- WHAT IS LEFT TO EXPLAIN IS NOTHING ----
              The description used to carry the sort rule and
              then the arrow; both went with the scores. A line
              that explains a column the screen no longer has is
              worse than no line, and a roster sorted by name
              under a heading that says Roster does not need
              telling. The best outcome of a cut is that the
              explanation it required can go too. */}
          <SectionHeader title="Roster" />

          <RosterControls
            query={query}
            setQuery={setQuery}
            grade={grade}
            setGrade={setGrade}
            grades={gradesPresent}
            shown={visibleRoster.length}
            total={roster.length}
            sorted={sort.key !== 'name' || sort.dir !== 'asc'}
            onReset={() => {
              setQuery('')
              setGrade('all')
              setSort({ key: 'name', dir: 'asc' })
            }}
          />

          <Card className="mt-3 divide-y divide-ink-100 overflow-hidden">
            {/* ============================================================
                THE HEADER ROW — and why it is three columns again

                ---- THE HISTORY, BECAUSE IT IS NOT A U-TURN ----
                This table has had the id in a column, then
                beside the name, and now in a column again, and
                each move was right at the time.

                It started in a column and was stranded there: a
                six-digit number alone in the middle of a wide
                row with no heading over it, which is what made
                Dhinesh ask what it was. Beside the name it
                became legible, because the thing it identifies
                was the thing it touched.

                What changed since is the rest of the row. Back
                then this row also carried a score, a progress
                bar, a trend arrow and a Coach button, so the
                right-hand two thirds were full and the left was
                the only space the name and id had. Stripping
                performance out emptied all of it. The same
                left-packed cluster that read as compact next to
                four other columns now reads as a huddle with
                half a screen of nothing beside it — which is
                exactly what Dhinesh drew.

                So the lesson is not "columns beat dot
                separators". It is that A ROW'S LAYOUT IS AN
                ARGUMENT ABOUT THE ROW, NOT ABOUT ITS CELLS. The
                grouping was carrying the id's meaning only
                because nothing else could; now there is a
                heading over it, four hundred pixels of its own,
                and a column of digits lining up underneath. It
                no longer needs to borrow meaning from its
                neighbour, so it should not be crowding it.

                ---- AND THE GRADE CAME WITH IT ----
                It was on a second line under the name, which was
                the right call when the row's left third was the
                only space available and the wrong one now: a
                fact on its own line costs the row 18px of height
                on every student, twenty-four times, to avoid
                using space that is sitting empty. One line per
                student, three facts across it.

                Column widths are repeated between this header
                and the rows below rather than shared, which is
                the real cost of building a table out of flex
                rows. They have to be kept in step by hand — w-16
                / flex-1 / w-28 / w-32 / w-8, in both places.
                ============================================================ */}
            {chosen.length > 0 ? (
              <BulkBar
                chosen={chosen}
                allShown={allShown}
                onToggleAll={toggleAll}
                onClear={() => setSelected([])}
                canRemove={canEditRoster(cls)}
                clsName={cls.name}
                onPrint={() => setBulk('print')}
                onRemove={() => setBulk('remove')}
              />
            ) : (
            <div className="flex items-center gap-x-4 bg-ink-50 px-4 py-2">
              {/* 16 for the tick, 12 for the gap, 36 for the
                  avatar — the same 64px the rows spend, so every
                  tick on the page sits on one vertical line. */}
              <span className="flex w-16 shrink-0 items-center">
                <Tick checked={false} indeterminate={false} onChange={toggleAll} label="Select all shown" />
              </span>
              {/* One control per column, each sitting over the
                  data it orders. The dots that used to separate
                  these three are gone with the reason for them:
                  they were saying "this heading describes one
                  cell, not three columns", and now it does. */}
              <div className="min-w-0 flex-1">
                <SortHeader
                  label="Name"
                  active={sort.key === 'name'}
                  dir={sort.dir}
                  onClick={() => toggleSort('name')}
                />
              </div>
              <div className="min-w-0 flex-1">
                <SortHeader
                  label="ID"
                  active={sort.key === 'id'}
                  dir={sort.dir}
                  onClick={() => toggleSort('id')}
                />
              </div>
              <div className="min-w-0 flex-1">
                <SortHeader
                  label="Grade"
                  active={sort.key === 'grade'}
                  dir={sort.dir}
                  onClick={() => toggleSort('grade')}
                />
              </div>
              <span className="w-8 shrink-0" aria-hidden />
            </div>
            )}

            {visibleRoster.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink-400">
                No students match those filters.
              </p>
            ) : (
              visibleRoster.map((s) => {
                return (
                  <div
                    key={s.id}
                    /* No wrap. Every cell on this row is short —
                       a name, six digits, one or two words — and
                       the columns are fixed, so there is nothing
                       that can need a second line. Letting it
                       wrap only lets it break.

                       ---- AND THE ROW LIGHTS UP ----
                       One tint for the whole row, the same one
                       the assignment report uses. On a
                       twenty-four row table with five columns,
                       the thing a teacher loses is which line
                       her eye is on — she reads across from a
                       name to a score and arrives one row down.
                       A band of colour under the cursor is the
                       cheapest possible fix for that and the
                       only one that costs nothing to learn.

                       A ticked row stays tinted whether or not
                       the cursor is on it, in brand rather than
                       grey, because "this one is chosen" and
                       "this one is under your mouse" are
                       different facts and must not share a
                       colour. */
                    className={cx(
                      'flex items-center gap-x-4 px-4 py-3 transition-colors',
                      selected.includes(s.id) ? 'bg-brand-50/60' : 'hover:bg-ink-50/60'
                    )}
                  >
                    {/* ---- THE TICK IS ALWAYS THERE ----
                        I had it hiding inside the avatar and
                        appearing on hover, which saved 28px of
                        row and cost the whole feature: a
                        teacher who does not happen to sweep the
                        cursor across a face never learns she
                        can select anything, and on the tablet
                        this product also runs on there is no
                        hover to sweep with.

                        This is the second time the same
                        mistake: the class card's assignments
                        block announced its own destination only
                        on hover until Dhinesh caught it. The
                        rule is worth stating plainly so it
                        stops recurring — AN AFFORDANCE THAT
                        APPEARS ON HOVER IS AN AFFORDANCE THAT
                        DOES NOT EXIST. If a control is worth
                        having, it is worth its width.

                        Tick and avatar travel as one cluster so
                        the gap between them stays tight while
                        the row keeps its 16px rhythm
                        everywhere else. */}
                    <div className="flex w-16 shrink-0 items-center gap-3">
                      <Tick
                        checked={selected.includes(s.id)}
                        onChange={() => toggleOne(s.id)}
                        label={`Select ${s.name}`}
                      />
                      {/* One tone for everyone. A pink initial
                          was the last trace of the needs-help
                          rule on this screen, and a colour that
                          means something nowhere else on the
                          page is a colour nobody can read. */}
                      <Avatar initials={s.initials} />
                    </div>

                    {/* ---- COLUMN 1: THE NAME, AND ONLY THE NAME ----
                        It is the one cell that can be any
                        length, so it is the one that flexes.
                        `truncate` rather than wrapping, because
                        the moment one row is two lines tall the
                        whole table loses the even rhythm that
                        makes a roster scannable — and a name too
                        long to fit is still clickable, and still
                        reads in full on the student's own page.

                        The EB badge stays attached to the name
                        rather than earning a column of its own:
                        most students do not have it, so a column
                        would be mostly empty, and it qualifies
                        the child rather than being a fact you
                        would ever sort or scan a list by. */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-2">
                        <Link
                          to={`/students/${s.id}`}
                          className="truncate text-sm font-medium text-ink-900 hover:text-brand-700"
                        >
                          {s.name}
                        </Link>
                        {/* ---- WHAT "EB" IS ----
                            Emergent Bilingual — the current
                            Texas designation, which replaced
                            "ELL". It is on the row because it
                            changes what a teacher assigns: EB
                            students have Spanish versions of
                            most resources, and the language
                            toggle in Library exists for them.

                            Dhinesh asked what it meant, which
                            is the answer: the badge had no way
                            to say. Now it does, hover and
                            screen reader both, the same way the
                            resource type codes do. The code
                            stays short because it is the term
                            the district itself prints. */}
                        {s.eb && (
                          <Badge tone="info" title="Emergent Bilingual">
                            <span className="sr-only">Emergent Bilingual</span>
                            <span aria-hidden="true">EB</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* ---- COLUMN 2: THE ID ----
                        14px, the same as the name — Dhinesh's
                        earlier call and it still holds. Two type
                        sizes side by side read as one of them
                        sagging, and nothing here is subordinate
                        enough to need shrinking. Grey and
                        regular against the name's near-black
                        medium already says which one is the
                        subject and which is the reference.

                        Tabular figures so the digits line up
                        down the column — which is now a real
                        column, and is the whole point of one. */}
                    <div className="tnum min-w-0 flex-1 text-sm text-ink-500">
                      {s.studentId}
                    </div>

                    {/* ---- COLUMN 3: THE GRADE ----
                        ---- WHY SHARES, NOT FIXED WIDTHS ----
                        My first pass gave these two w-28 and
                        w-32. It put the headings in the right
                        place but left a six-hundred-pixel hole
                        between the name and the id, because a
                        fixed column packs right while a flexing
                        name packs left — which is the same
                        huddle Dhinesh drew, just at the other
                        end of the row.

                        Shares fix it properly. I first gave the
                        name half and these two a quarter each,
                        reasoning that the name is the longest
                        value so it should get the most room.
                        That was sizing the columns to their
                        CONTENTS, and Dhinesh is right that it
                        does not look even — because evenness is
                        not about how wide a column is, it is
                        about where the next one STARTS. Half,
                        quarter, quarter put the gaps at roughly
                        590 / 310 / 320 pixels: the eye reads the
                        first one as a hole and the other two as
                        a pair.

                        Three equal thirds put every column start
                        the same distance from the last, which is
                        what "evenly spaced" actually asks for.
                        The name gets less width than it could
                        have had and still more than it needs —
                        the longest name here is under half a
                        third — so nothing is paid for the
                        regularity. A column should be as wide as
                        the rhythm wants, not as wide as its
                        longest value allows.

                        Proportional rather than fixed so it
                        stays true at every window width. The
                        longest value in this column is
                        "Kindergarten", not "Grade 5", and a
                        third of the row swallows either. */}
                    <div className="min-w-0 flex-1 truncate text-sm text-ink-500">
                      {gradeLabel(s.gradeLevel)}
                    </div>

                    {/* ============================================================
                        NO SCORE, NO BAR, NO ARROW, NO COACH

                        All four were performance, and performance
                        is Reports' question now. The roster is
                        Name · ID · Grade and the actions that
                        maintain it — which is exactly what My
                        Groups is in the live product, and what
                        Dhinesh asked for when he listed the
                        columns.

                        COACH WAS THE HARDEST TO GIVE UP and the
                        clearest to place. Coaching is what you do
                        after reading a result; offering it beside
                        a name on an organisational screen put the
                        action two screens away from the evidence
                        for it. It now sits in the class report,
                        under the eleven children it applies to,
                        next to the score that explains why.
                        ============================================================ */}

                    {/* The ⋯ is the whole action column now.
                        Everything in it — edit, reset password,
                        print, log in as, remove — is roster
                        upkeep, which is what this screen is for. */}
                    <div className="flex shrink-0 items-center justify-end">
                      <StudentRowActions student={s} cls={cls} />
                    </div>
                  </div>
                )
              })
            )}
          </Card>
        </section>
      )}

      {/* ================= ASSIGNMENTS ================= */}
      {/* ---- THREE TO A ROW, LIKE EVERYTHING ELSE ----
            Dhinesh asked whether this would be a problem. One
            thing was: the indigo band held a bar, a ratio, a
            date range and a chip in a single row, which fits at
            full width and does not fit at a third of it. The
            band is now two lines, so it has the same content in
            a third of the space rather than a squeezed version
            of it.

            Everything else was already card-shaped and gains
            from the move. Six full-width rows made this tab a
            long scroll where the Library's identical objects sit
            in a grid, and the inconsistency was doing no work.

            The cards in a row stretch to the tallest one and the
            band is pinned to the foot (mt-auto), so the bands and
            the action rows line up straight across. I tried
            letting each card end where its content ends, and a
            row whose three bands sit at three different heights
            reads as a layout that has gone slightly wrong. The
            cost is a little white space inside the shorter card,
            which is the same trade the Library's cards already
            make, and a playlist tops out at five resources so the
            gap can never get embarrassing. */}
      {tab === 'assignments' && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assigned.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nothing assigned yet"
              /* ---- THIS PRIMARY BUTTON KEEPS ITS WEIGHT ----
                 It is the same destination the header button had
                 and it is not the same thing. On an empty tab
                 there is exactly one useful next move, and a
                 filled button saying so is the screen being
                 helpful rather than the screen overselling a
                 link. The weight is a claim about what to do
                 next, and here the claim is true.

                 "Teach" was the old name for Library and had
                 survived in two strings nobody looked at. The
                 nav has said Library for weeks. */
              description="Find material in Library and send it to this class."
              action={
                <Link to="/teach" className={buttonClass({ variant: 'primary' })}>
                  Go to Library
                </Link>
              }
            />
          ) : (
            assigned.map((a) => {
              const done = roster.filter(
                (s) => progressFor(s.id, a.id)?.state === 'completed'
              )
              const avg = done.length
                ? Math.round(
                    done.reduce((sum, s) => sum + progressFor(s.id, a.id).score, 0) /
                      done.length
                  )
                : null
              const std = getStandard(a.standardId)

              /* ---- EVERYTHING BELOW IS SCOPED TO THIS CLASS ----
                 The Library's card answers "where has this gone";
                 this one answers "what is it doing HERE", so every
                 figure is read through this class rather than
                 across all of them. Same components, different
                 question — which is the only honest way for two
                 screens to share a shape. */
              const delivery = deliveryFor(a, cls.id)
              const scoped = assignmentStatsForClass(a.id, cls.id)
              const reached = reachedIn(a, cls.id).length
              const newcomers = newcomersIn(a, cls.id)
              const state = statusForClass(a, cls.id)
              const items = a.resourceIds.map(getResource).filter(Boolean)
              const minutes = items.reduce((n, r) => n + (r.minutes ?? 0), 0)

              return (
                <Card key={a.id} className="flex h-full flex-col p-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink-900">{a.title}</h3>
                        {/* ---- THE BADGE READS THIS CLASS'S STATE ----
                            It used to read `a.status`, the assignment's
                            own rollup — which is "Live" the moment ANY
                            class still has it open. On a class whose
                            window shut last Friday that badge was
                            simply wrong, and wrong in the direction
                            that costs most: it told her there was still
                            time. */}
                        <Badge
                          tone={
                            state === 'live'
                              ? 'brand'
                              : state === 'upcoming'
                                ? 'info'
                                : 'neutral'
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
                      <Score value={scoped.avg} />
                      <p className="text-[12px] text-ink-400">average</p>
                    </div>
                  </div>

                  {/* ---- THE RESOURCES, NAMED THE WAY THEY ARE EVERYWHERE ----
                      These were grey chips carrying the resource's
                      FULL title, truncated at 40 characters — which on
                      a three-part module printed "Mixtures of Solids"
                      three times, because the three parts of a module
                      share a name and differ only by type. Three
                      identical chips look like a bug.

                      The Library's numbered list fixes it for free:
                      the type badge in front is exactly the thing
                      that tells them apart, and the number says they
                      are a sequence rather than a set. Same rows, same
                      order, same click-to-preview as every other list
                      of resources in the product. */}
                  <ol className="mt-3 space-y-1.5">
                    {items.map((r, i) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => setPreviewing(r)}
                          className="flex w-full items-center gap-2 rounded-control px-1 py-0.5 text-left transition-colors hover:bg-ink-50"
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

                  {/* ---- THE ROSTER BAND ----
                      The Library's card carries "Assigned to N classes
                      · N students" here, because that is its open
                      question. Inside one class the open question is
                      narrower — who in THIS room has it, and how far
                      have they got — so the band carries the progress
                      and the dates, and opens the same roster dialog
                      the Library's class cards open.

                      It stays the card's heaviest shape for the same
                      reason it is there: the sending is done, and what
                      is live is the people. */}
                  <button
                    type="button"
                    onClick={() => setViewingRoster(a)}
                    /* ---- ONE LINE OF FACTS, ONE BAR UNDER IT ----
                       The first version of this at card width was a
                       mess, and the mess had a cause worth naming: I
                       stacked two rows that were each HALF full and
                       aligned differently. A stretched bar with the
                       ratio flung to the right, then a date on the left
                       with a red chip flung to the right — four things,
                       four edges, no column line anywhere. The eye had
                       to start over on each row.

                       All four facts fit on ONE line at this width —
                       "13/22 finished · Sep 9 – Sep 19" is about 190px
                       and the chip another 95. So they go on one line,
                       reading left to right as a sentence, and the bar
                       becomes a thin full-width rule UNDER them.

                       That ordering is the other half of the fix. The
                       bar is not a fact, it is a picture OF a fact that
                       is already written above it in words, so it
                       belongs underneath as a measure rather than above
                       as a headline. Underneath it also spans the whole
                       band, which gives the block the single straight
                       edge it was missing. */
                    className="mt-auto flex w-full items-center gap-3 rounded-control border border-brand-200 bg-brand-50 px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-100"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-brand-800">
                        <span>
                          <span className="tnum font-semibold text-brand-900">
                            {scoped.completed}/{scoped.total}
                          </span>{' '}
                          finished
                        </span>
                        <span className="text-brand-300" aria-hidden>
                          ·
                        </span>
                        <span>
                          {delivery.multiple
                            ? `${delivery.windows.length} due dates`
                            : `${onDate(delivery.start)} – ${onDate(delivery.due)}`}
                        </span>
                        {newcomers.length > 0 && (
                          <span className="rounded-full bg-alert-100 px-2 py-0.5 font-medium text-alert-800">
                            {newcomers.length} not assigned
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block">
                        <ProgressBar
                          value={scoped.completed}
                          total={scoped.total}
                          tone={
                            scoped.total > 0 && scoped.completed === scoped.total
                              ? 'good'
                              : 'brand'
                          }
                        />
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  </button>

                  {/* ---- REPORT · UNASSIGN, AND NOTHING ELSE ----
                      This row held Report, Share and a ⋯ menu with
                      Duplicate and Unassign inside it. Dhinesh cut it to
                      two, and the cut is right for a reason worth
                      writing down: the other three were LIBRARY actions
                      standing on a class page.

                      Share sends the lesson to a colleague — nothing to
                      do with 1st Period. Duplicate makes a new
                      assignment for the same classes — also nothing to
                      do with this room, and it would have left her
                      looking at a tab that now has a "(copy)" in it with
                      no explanation. Both already live on the card in
                      Library, which is where the lesson itself lives.
                      What belongs HERE is only what is true of this
                      class: how it is doing, and whether it keeps the
                      work.

                      ---- AND UNASSIGN COMES OUT OF THE MENU ----
                      A ⋯ holding one item is a click that exists to
                      hide a thing from the person who will need it,
                      which is the opposite of what this redesign is
                      for. Out in the open it is also honest about its
                      weight: ghost, in the alert colour, sitting right
                      of the primary — findable, obviously destructive,
                      and not competing with Report.

                      Unassign here means "take it back from 1st Period",
                      not from everywhere. The confirmation says so, and
                      says what her other classes keep. */}
                  <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                    <Link
                      to={`/insights?tab=classes&class=${cls.id}&assignment=${a.id}`}
                      className={buttonClass({ variant: 'secondary', size: 'sm' })}
                    >
                      <BarChart3 className="h-4 w-4" aria-hidden />
                      Report
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Undo2}
                      className="!text-alert-700 hover:!bg-alert-50 hover:!text-alert-800"
                      onClick={() => setUnassigning(a)}
                    >
                      Unassign
                    </Button>
                  </div>
                </Card>
              )
            })
          )}
        </section>
      )}

      {/* ---- THE ASSIGNMENT DIALOGS ----
          The same four the Library's Assigned tab opens, so a
          teacher who has learned them there does not learn them
          again here. The roster one is pinned to THIS class,
          because that is the only class this screen is about. */}
      <PreviewOverlay resource={previewing} onClose={() => setPreviewing(null)} />
      <WindowsDialog
        assignment={viewingRoster}
        classId={viewingRoster ? cls.id : null}
        showClassLink={false}
        onClose={() => setViewingRoster(null)}
        onAssignNewcomers={() => {
          const target = viewingRoster
          setViewingRoster(null)
          setCatchingUp(target)
        }}
      />
      <CatchUpDialog
        open={!!catchingUp}
        assignment={catchingUp}
        classId={cls.id}
        onClose={() => setCatchingUp(null)}
      />
      {unassigning && (
        <UnassignConfirm
          assignment={unassigning}
          classId={cls.id}
          onClose={() => setUnassigning(null)}
        />
      )}

      <AddStudentsDialog open={adding} cls={cls} onClose={() => setAdding(false)} />

      <StudentPrintSheet
        open={bulk === 'print'}
        students={chosen}
        cls={cls}
        onClose={() => setBulk(null)}
      />

      {/* ---- BULK REMOVE NAMES THEM ----
          A confirmation reading "remove 6 students?" asks her to
          trust her own memory of six ticks put in one at a time,
          and the reason to confirm a destructive action at all
          is that memory is exactly what cannot be trusted at
          that moment. The list is the confirmation; the count is
          just its heading. */}
      <Sheet
        open={bulk === 'remove'}
        onClose={() => setBulk(null)}
        title={`Remove ${chosen.length} ${chosen.length === 1 ? 'student' : 'students'}?`}
        width="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setBulk(null)}>
              Keep them
            </Button>
            <Button
              variant="primary"
              className="!bg-alert-600 hover:!bg-alert-700"
              onClick={() => {
                chosen.forEach((st) => removeStudentFromClass(cls.id, st.id))
                setSelected([])
                setBulk(null)
              }}
            >
              Remove {chosen.length}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-700">
          They stay on the district roster, and in every other class on it.
          Nothing submitted is deleted — the only change is that their work stops
          counting toward{' '}
          <span className="font-medium text-ink-900">{cls.name}</span>&rsquo;s
          averages.
        </p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-control border border-ink-200 px-3 py-2">
          {chosen.map((st) => (
            <li key={st.id} className="flex justify-between gap-3 text-[12px]">
              <span className="text-ink-800">{st.name}</span>
              <span className="tnum text-ink-400">{st.studentId}</span>
            </li>
          ))}
        </ul>
      </Sheet>

      {/* The coaching plan used to open from a Coach button on
          every struggling row here. It now opens from Reports,
          where the struggling rows live — one plan, one door
          into it, and no second copy to drift. */}
    </div>
  )
}

/* A drawn tick box rather than a native checkbox, for the same
   reason the New class picker draws its own: a native one
   cannot carry the brand colour or be sized to 12px type, and
   these two lists should not look like two different products.
   The real <input> is still underneath, so the keyboard and
   screen readers get a checkbox and not a div pretending. */
function Tick({ checked, indeterminate, onChange, label }) {
  return (
    <label className="relative flex cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => el && (el.indeterminate = Boolean(indeterminate && !checked))}
        onChange={onChange}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        className={cx(
          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200',
          checked || indeterminate
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-ink-400 bg-white hover:border-ink-500'
        )}
      >
        {checked ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : indeterminate ? (
          <span className="h-0.5 w-2 rounded-full bg-white" />
        ) : null}
      </span>
    </label>
  )
}

/* ============================================================
   THE BULK BAR

   It REPLACES the column headings rather than appearing above
   them. Two reasons, and the second is the one that decided it:

   Nothing moves. A bar that pushes the table down by forty
   pixels the moment a tick goes in makes the row she is
   reaching for slide out from under the cursor, which is how a
   teacher selects the wrong child.

   And it belongs to the same object. The headings describe the
   rows; the bar acts on some of them. Both are the strip
   immediately above the list, and only one of them can be
   useful at a time — while she is choosing students, sorting
   them is not what she is doing.

   REMOVE IS GATED ON THE CLASS, print on nothing. Same split as
   the row menu: printing reads, removing changes, and what may
   be changed is the district's business. The reason is one
   press away rather than sitting there permanently, because
   most of the time she is here to print.
   ============================================================ */
function BulkBar({ chosen, allShown, onToggleAll, onClear, canRemove, clsName, onPrint, onRemove }) {
  const [why, setWhy] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-brand-200 bg-brand-50 px-4 py-2">
      <span className="flex w-16 shrink-0 items-center">
        <Tick
          checked={allShown}
          indeterminate={!allShown}
          onChange={onToggleAll}
          label={allShown ? 'Clear selection' : 'Select all shown'}
        />
      </span>

      <p className="text-[12px] font-semibold text-brand-800">
        {chosen.length} selected
      </p>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 rounded-control border border-ink-300 bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 hover:bg-ink-50"
        >
          <Printer className="h-3.5 w-3.5" />
          Print details
        </button>

        <button
          onClick={() => (canRemove ? onRemove() : setWhy(true))}
          aria-disabled={!canRemove}
          aria-describedby={!canRemove ? 'bulk-remove-why' : undefined}
          className={cx(
            'flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-[12px] font-medium',
            canRemove
              ? 'border-alert-200 bg-white text-alert-700 hover:bg-alert-50'
              : 'cursor-default border-ink-200 bg-white text-ink-400'
          )}
        >
          <UserMinus className="h-3.5 w-3.5" />
          Remove from group
        </button>

        <button
          onClick={onClear}
          className="rounded-control px-2 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-100"
        >
          Clear
        </button>
      </div>

      <p
        id="bulk-remove-why"
        className={cx('w-full text-[12px] text-ink-500', !why && 'sr-only')}
      >
        {clsName} comes from your district roster — only your district can change
        who is in it.
      </p>
    </div>
  )
}

/* ============================================================
   A SORTABLE COLUMN HEADING

   The arrow appears only on the column doing the sorting, and
   it points the way the data runs. A row of headings each
   wearing a faint double-chevron "you could sort by me" is the
   pattern most tables use and it makes every heading look
   half-active; here the plain ones are plainly plain, and the
   one carrying the order is unmistakable.

   `aria-sort` is what a screen reader reads out, and it is the
   only way a non-sighted user learns the list has an order at
   all — the arrow tells nobody anything.
   ============================================================ */
function SortHeader({ label, active, dir, onClick, className }) {
  return (
    <button
      onClick={onClick}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cx(
        'flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wide transition-colors',
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

/* ============================================================
   SEARCH, TWO FILTERS, AND A WAY BACK

   ---- WHY SEARCH FOR ONE COLUMN AND DROPDOWNS FOR THE OTHERS ----
   A dropdown of twenty-four names is a worse way to find Naomi
   than typing "nao", and it gets monotonically worse as the
   class grows. A text column is searched. Grade and Score have
   short closed lists of values, so they are filtered. The
   difference is in the data, not in a preference.

   ---- THE COUNT IS NOT DECORATION ----
   The tab above says "Students 24". The moment a filter bites,
   the list disagrees with it, and a teacher who has forgotten
   she typed something has a class that appears to have lost
   eighteen children. "Showing 6 of 24" and a Clear that undoes
   everything at once are what stop a filter becoming a bug
   report. It only appears when something is actually narrowing
   the list — a permanent "Showing 24 of 24" is noise.
   ============================================================ */
function RosterControls({
  query, setQuery, grade, setGrade, grades, shown, total, sorted, onReset,
}) {
  const narrowed = shown !== total
  const touched = narrowed || sorted || query.trim() !== ''

  const select =
    'rounded-control border border-ink-300 bg-white py-1.5 pl-2.5 pr-7 text-[12px] text-ink-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or ID"
          aria-label="Search the roster by student name or ID"
          className="w-full rounded-control border border-ink-300 py-1.5 pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* The Needs attention toggle went with the scores. It
          filtered by a judgement this screen no longer makes,
          and the place to act on that judgement is the class
          report, which opens with those students listed. */}

      {/* One year only shows a disabled control rather than
          hiding it: a filter that appears and disappears
          depending on the class is a filter she cannot learn.
          It says what it is and why it has nothing to offer. */}
      <select
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        aria-label="Filter by grade"
        disabled={grades.length < 2}
        className={cx(select, grades.length < 2 && 'cursor-not-allowed opacity-50')}
        title={grades.length < 2 ? 'Everyone in this class is in the same grade' : undefined}
      >
        <option value="all">All grades</option>
        {grades.map((g) => (
          <option key={g} value={g}>
            {gradeLabel(g)}
          </option>
        ))}
      </select>

      {/* The score filter went with the scores it filtered. A
          roster narrows by who someone IS — their year, their
          name, their id — not by how they are doing. */}

      {touched && (
        <div className="flex items-center gap-2">
          {narrowed && (
            <span className="text-[12px] text-ink-500">
              Showing {shown} of {total}
            </span>
          )}
          <button
            onClick={onReset}
            className="rounded-control px-2 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-50"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, hint }) {
  return (
    <Card className="p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="mt-1.5">{value}</div>
      <p className="mt-0.5 text-[12px] text-ink-500">{hint}</p>
    </Card>
  )
}
