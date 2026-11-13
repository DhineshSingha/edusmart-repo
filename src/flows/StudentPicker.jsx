/* ============================================================
   THE STUDENT PICKER
   ------------------------------------------------------------
   Lifted out of New class so that Add students could use it
   without being a copy of it. The two dialogs ask the same
   question — WHICH CHILDREN — and differ only in what they do
   with the answer, so the question gets one implementation.

   Copying it would have been quicker and the cost is easy to
   predict: the next change lands in one of them. Four lenses,
   a two-pane layout, the all-grades default, the fallback when
   a search empties the selected group, the dot that stops "21"
   and "3 chosen" reading as 213 — every one of those was a
   round of correction, and every one would have had to happen
   twice.

   WHAT IT OWNS: the lens, the search, which group is showing.
   Those are about looking, and both callers want the same
   looking. WHAT IT DOESN'T: the selection itself, which is the
   answer and therefore the caller's. A picker that held its own
   answer would have to hand it back at the end, and the moment
   it does that the caller cannot pre-fill it, cannot act on it
   while it is being made, and cannot say "8 chosen · needs a
   name" in its own footer.

   `disabled` is the one capability Add students needed that New
   class did not: children already in the class are shown,
   greyed, with a word saying why. Hiding them would have been
   easier and worse — a teacher who searches for a name she
   knows is in the class and finds nothing concludes the search
   is broken, not that she was right.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react'
import { Check, Search, Users, X } from 'lucide-react'
import {
  classes,
  gradeLabel,
  getStudent,
  needsHelp,
  students,
  unplacedStudents,
} from '../data/mock'
import { Avatar, cx } from '../components/ui'

const UNPLACED = '__unplaced'

/* Every grade at once — the Grades lens opens here. Prefixed
   like the grade ids it sits among but with a word where they
   have a number, so it can never collide with `grade-5`. */
const ALL_GRADES = 'grade-all'


export default function StudentPicker({
  picked,
  setPicked,
  /* Ids that may not be chosen, and the word shown on their
     rows. Both or neither. */
  disabledIds = EMPTY,
  disabledNote = 'Already in',
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | flagged | grades | picked
  const [activeId, setActiveId] = useState(UNPLACED)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()

    const visible = (list) =>
      list
        .filter(Boolean)
        .filter((s) => (q ? s.name.toLowerCase().includes(q) : true))
        .filter((s) => {
          if (filter === 'flagged') return needsHelp(s)
          if (filter === 'picked') return picked.includes(s.id)
          return true
        })

    const unplaced = unplacedStudents()

    /* ============================================================
       THE GRADES VIEW  —  the same roster, stacked by year

       Every other chip narrows the list and leaves the periods
       where they are. This one re-stacks it: the left column
       stops listing her classes and lists the district's grade
       levels instead, Kindergarten through Grade 12.

       WHY A GRADE 5 SCIENCE TEACHER NEEDS THE OTHER TWELVE.
       Because the groups she builds herself routinely cross a
       year boundary and her timetabled sections never do. A
       pull-out for four Grade 4 children who are ready to move
       up, a catch-up block for Grade 6 students who missed the
       matter unit — neither of those children appears anywhere
       in her five periods, so without this lens she cannot
       reach them at all. Her sections come from the district
       and stay Grade 5; what she assembles is hers, and it can
       be mixed.

       NOTHING WARNS HER ABOUT MIXING. Dhinesh's call, and it is
       the right one: a teacher who deliberately picks a Grade 4
       child does not need the product to ask whether she meant
       it. The grade is on the row she clicked.

       KINDERGARTEN FIRST, THEN 1 TO 12 — the order the district
       thinks in, and the order she reads. Empty grades never
       appear: a district with nobody in Grade 11 does not get a
       row saying so.

       ---- "ALL GRADES" SITS ABOVE THEM ----
       Dhinesh's call, and it fixes something I had left broken
       without noticing. Switching to this lens used to land her
       in Kindergarten — the first row, chosen by the fallback
       rather than by anyone's intent — so the lens opened on
       the grade furthest from the one she teaches, and a
       teacher looking for a name had to know which year the
       child was in before she could start.

       "All grades" makes the default answer the honest one:
       here is the roster, and the years are underneath if you
       want to narrow it. It also gives search somewhere to run
       from, since a name typed with All grades selected
       searches the whole district instead of one year of it.
       ============================================================ */
    if (filter === 'grades') {
      const byGrade = new Map()
      students.forEach((s) => {
        if (!byGrade.has(s.gradeLevel)) byGrade.set(s.gradeLevel, [])
        byGrade.get(s.gradeLevel).push(s)
      })
      return [
        {
          id: ALL_GRADES,
          name: 'All grades',
          note: 'Kindergarten to Grade 12',
          students: visible(students),
        },
        ...[...byGrade.keys()]
          .sort((a, b) => a - b)
          .map((level) => ({
            id: `grade-${level}`,
            name: gradeLabel(level),
            /* The one grade that carries real TEKS and real
               assignments in this prototype says so, rather than
               letting a demo audience assume Grade 9 is just as
               complete. */
            note: level === 5 ? 'The grade you teach' : undefined,
            students: visible(byGrade.get(level)),
          })),
      ]
    }

    /* ============================================================
       NEEDS HELP OPENS ON THE FIRST CLASS

       It used to open on "Not in one of your classes", which
       was both useless and quietly wrong. Useless because that
       group is always empty under this lens — and wrong
       because a teacher reading "0" next to it would take it as
       "none of those children are struggling", when the truth
       is that the rule does not apply to them at all: no class,
       no work recorded, nothing to judge. A zero that means
       "not measured" sitting beside zeros that mean "nobody" is
       the kind of number that gets quoted back at you in a
       meeting.

       So under this lens the group is not listed, and the first
       of her own classes takes the selection. Her classes stay
       listed even at zero, because there the zero is a real
       finding: nobody in 6th Period needs help is worth
       knowing.
       ============================================================ */
    const classGroups = classes
      .filter((c) => !c.createdHere)
      .map((c) => ({
        id: c.id,
        name: c.name,
        students: visible(c.studentIds.map(getStudent)),
      }))

    if (filter === 'flagged') return classGroups

    return [
      {
        id: UNPLACED,
        /* ---- THE NAME CHANGED WITH THE ROSTER ----
           It was "Not in a class yet", which was true when this
           list was one campus of Grade 5 children awaiting
           placement. On a district roster it stopped being
           true: most of the people in this group are Grade 9s
           who are not waiting for anything — they are simply
           not hers. The heading now says the fact that is
           actually shared by everyone in it, and the note
           carries both reasons so neither population reads as
           a problem. */
        name: 'Not in one of your classes',
        note: 'Other grades, and students not timetabled yet',
        students: visible(unplaced),
      },
      ...classGroups,
    ]
  }, [query, filter, picked])

  const flaggedTotal = useMemo(() => students.filter(needsHelp).length, [])

  /* ---- WHICH GROUP IS SHOWING ----
     One id, not a set of open ones. The panel beside it always
     has exactly one group in it, so there is no state where
     nothing is showing and none where everything is.

     A search can empty the group she is standing in — type
     "mar" while 4th Period is selected and there may be no
     Marias in it. Rather than showing her an empty panel and
     letting her conclude the search found nothing, the
     selection moves to the first group that does have matches.
     She is never left looking at a blank column with results
     sitting one click away. */
  const active =
    groups.find((g) => g.id === activeId && g.students.length > 0) ??
    groups.find((g) => g.students.length > 0) ??
    null

  function toggle(id) {
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    )
  }

  /* Select-all on a group acts on what is VISIBLE in it, not on
     its full roster. If she has typed "mar" and hits select-all
     on 2nd Period, she means the Marias she can see — not the
     twenty-one behind the filter. A control that quietly reaches
     past the filter it is sitting under is how a teacher ends up
     with a group she did not build. */
  function toggleGroup(group) {
    /* Children who cannot be chosen are not "all" — a select-all
       that silently failed on three of twenty would leave her
       counting rows to find out why. */
    const ids = group.students.map((s) => s.id).filter((id) => !disabledIds.has(id))
    const allIn = ids.every((id) => picked.includes(id))
    setPicked((current) =>
      allIn
        ? current.filter((id) => !ids.includes(id))
        : [...current, ...ids.filter((id) => !current.includes(id))]
    )
  }


  return (
    /* One root, not a comment and a div — the "Who's in it"
       label that used to sit here belonged to New class's
       layout, and the picker no longer knows what it is being
       asked for. */
    <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-500">
              Students
            </p>
            {/* ============================================================
                THE ORDER IS WIDEST FIRST

                Grades, Everyone, Needs help, Chosen — Dhinesh's
                order, and it reads as one movement inward:
                every child in the district, then the ones in
                her rooms, then the ones in trouble, then the
                ones she has picked. Each chip is a smaller
                circle inside the one before it.

                I had built it the other way round, leading with
                Everyone because it was the default state. But
                where the default SITS and what the row MEANS
                are different questions, and a row of filters
                that neither widens nor narrows as you read it
                is a row you have to check one at a time. This
                one you can read once.
                ============================================================ */}
            <div className="flex items-center gap-1">
              {/* ---- I BUILT THIS AS SCORE BANDS FIRST ----
                  Worth recording, because the mistake was mine
                  and it was avoidable. "Grades" is ambiguous in
                  American schooling — the mark on a paper, or
                  the year a child is in — and I picked the
                  wrong one, then talked myself further into it
                  by noticing that this product already uses
                  "grade" for the year and deciding Dhinesh must
                  have meant the other thing.

                  The tell was right there: the product owning
                  the word for year-in-school made his reading
                  MORE likely, not less. Reasoning from the
                  product's vocabulary to override the person
                  who is defining the product is the wrong
                  direction. Ask, or read the word the way the
                  domain reads it.

                  The score-band version is gone rather than
                  kept alongside: he asked for one segment, and
                  a control nobody requested is a control
                  somebody has to learn. */}
              <FilterChip active={filter === 'grades'} onClick={() => setFilter('grades')}>
                Grades
              </FilterChip>
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
                Everyone
              </FilterChip>
              <FilterChip
                active={filter === 'flagged'}
                onClick={() => setFilter('flagged')}
              >
                Needs help · {flaggedTotal}
              </FilterChip>
              <FilterChip
                active={filter === 'picked'}
                onClick={() => setFilter('picked')}
                disabled={picked.length === 0}
              >
                Chosen · {picked.length}
              </FilterChip>
            </div>
          </div>

          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              aria-label="Search students by name"
              className="w-full rounded-control border border-ink-300 py-2 pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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

          {/* A fixed-height scroller, so the dialog is the same
              size whatever the filter is doing. A panel that
              grows and shrinks under a filter makes the footer
              move while she is reading it. */}
          {/* ============================================================
              TWO PANES, NOT AN ACCORDION

              THE THIRD ATTEMPT AT THIS, AND THE FIRST ONE THAT
              ISN'T ABOUT OPENING AND CLOSING.

              Everything expanded: the class name scrolled away
              and you lost track of whose period you were in.
              Everything collapsed: you could see the whole
              campus but the box looked empty. Unplaced expanded,
              rest collapsed: the twelve new arrivals fill the
              panel and the five periods underneath are invisible
              — no way to know they are there, let alone that
              collapsing is what reveals them.

              Three problems, one cause. An accordion makes the
              list of groups and the contents of a group compete
              for the same strip of screen, so whatever you do,
              one of them is hidden by the other. No amount of
              choosing better defaults gets out of that, because
              the defaults were never the problem.

              So they stop competing. The groups live in their
              own column and never scroll away; the students of
              whichever one is selected fill the column beside
              them. Both are visible at all times. There is no
              open state to track, no collapse to discover, and
              no moment where a teacher has to guess what a
              closed row is hiding — the answer is always on
              screen next to it.

              WHAT THE LEFT COLUMN CARRIES. Each group's name,
              how many are in it, and how many of them she has
              chosen. That last one is what makes a long pick
              safe: eight students chosen across three periods
              used to be a footer count that named nobody, and it
              is now three numbers sitting beside the three
              periods they came from.
              ============================================================ */}
          <div className="mt-2 flex h-72 overflow-hidden rounded-control border border-ink-200">
            {/* ---- The groups. Fixed column, always visible. ---- */}
            <div className="w-56 shrink-0 overflow-y-auto border-r border-ink-200 bg-ink-50">
              {groups.map((group) => {
                const chosen = group.students.filter((s) => picked.includes(s.id)).length
                /* ---- COMPARED AGAINST `active`, NOT `activeId` ----
                   A bug the default-selection work exposed.
                   `activeId` is what she last CLICKED; `active`
                   is what the panel is actually showing, and
                   they differ every time the fallback steps in
                   — switching lens, or searching until her
                   group empties out.

                   Checking the click meant that in exactly
                   those cases the panel showed one group's
                   students and the column highlighted nothing
                   at all: 482 names on the right, and no row on
                   the left saying where they came from. The
                   highlight now follows the panel, so the two
                   halves of this control can never disagree. */
                const on = group.id === active?.id
                const empty = group.students.length === 0
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveId(group.id)}
                    disabled={empty}
                    /* Two lines cover every name the widened
                       column can't fit on one, so truncation is
                       now the rare third case rather than the
                       second. The title keeps even that
                       readable, one hover away — a name she
                       can't finish reading is a name she can't
                       be sure of. */
                    title={group.name}
                    aria-current={on}
                    className={cx(
                      /* The transparent left border on every
                         row, not just the selected one, is what
                         stops the names jumping sideways by two
                         pixels as the selection moves. */
                      'block w-full border-b border-l-2 border-ink-200 px-3 py-1.5 text-left last:border-b-0',
                      empty && 'opacity-40',
                      on
                        ? 'border-l-brand-600 bg-white'
                        : cx('border-l-transparent', !empty && 'hover:bg-ink-100')
                    )}
                  >
                    {/* White fill and a brand bar: the selected
                        row is continuous with the panel beside
                        it, which is the whole point — this row
                        and those students are one thing. */}
                    <span
                      className={cx(
                        'line-clamp-2 text-[12px] font-semibold leading-tight',
                        on ? 'text-brand-700' : 'text-ink-700'
                      )}
                    >
                      {/* A dot in the band's own colour, so the
                          three bands read as a scale before a
                          word is read. It is decoration on top
                          of a label that already says the
                          range — never the only thing carrying
                          the meaning, which is the rule for
                          colour everywhere in this product. */}
                      {group.tone && (
                        <span
                          aria-hidden
                          className={cx(
                            'mr-1.5 inline-block h-2 w-2 rounded-full align-middle',
                            group.tone === 'good' && 'bg-good-500',
                            group.tone === 'watch' && 'bg-watch-500',
                            group.tone === 'alert' && 'bg-alert-500',
                            group.tone === 'neutral' && 'bg-ink-300'
                          )}
                        />
                      )}
                      {group.name}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-tight text-ink-400">
                      {group.students.length}
                      {/* The dot is load-bearing. Without it
                          "21" and "3 chosen" sat flush and read
                          as the number 213. */}
                      {chosen > 0 && (
                        <span className="font-medium text-brand-700"> · {chosen} chosen</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ---- The students of the selected group ---- */}
            <div className="flex min-w-0 flex-1 flex-col">
              {!active || active.students.length === 0 ? (
                <p className="px-3 py-8 text-center text-[12px] text-ink-400">
                  {filter === 'picked'
                    ? 'Nobody chosen yet.'
                    : filter === 'flagged'
                      ? 'Nobody in this group needs help.'
                      : 'No students match that search.'}
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-3 py-2">
                    {/* The count was being REPLACED by the note
                        rather than joined to it, so selecting
                        Grade 5 read "The grade you teach" and
                        dropped the 122. The size of the group
                        is the fact she is most likely to want;
                        the note is context on top of it, never
                        instead of it. */}
                    <p className="min-w-0 truncate text-[12px] text-ink-500">
                      {active.students.length}{' '}
                      {active.students.length === 1 ? 'student' : 'students'}
                      {active.note && ` · ${active.note}`}
                    </p>
                    <button
                      onClick={() => toggleGroup(active)}
                      className="shrink-0 rounded-control px-1.5 py-0.5 text-[12px] font-medium text-brand-700 hover:bg-brand-50"
                    >
                      {active.students.every((s) => picked.includes(s.id))
                        ? 'Clear'
                        : 'Select all'}
                    </button>
                  </div>
                  <ul className="min-h-0 flex-1 overflow-y-auto">
                    {active.students.map((s) => {
                      const on = picked.includes(s.id)
                      const off = disabledIds.has(s.id)
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => !off && toggle(s.id)}
                            aria-pressed={on}
                            aria-disabled={off}
                            className={cx(
                              'flex w-full items-center gap-2.5 px-3 py-1.5 text-left',
                              off
                                ? 'cursor-default opacity-50'
                                : on
                                  ? 'bg-brand-50'
                                  : 'hover:bg-ink-50'
                            )}
                          >
                            {/* The tick box is drawn rather than
                                a native checkbox so it can carry
                                the brand colour and match its
                                size to 12px type. */}
                            <span
                              className={cx(
                                'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                off
                                  ? 'border-ink-200 bg-ink-100'
                                  : on
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-ink-300 bg-white'
                              )}
                            >
                              {!off && on && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <Avatar
                              initials={s.initials}
                              size="sm"
                              tone={needsHelp(s) ? 'alert' : 'neutral'}
                              className="!h-6 !w-6 !text-[12px]"
                            />
                            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-800">
                              {s.name}
                            </span>
                            {/* Said in words, not as a score. A
                                bare number here would be a third
                                measure on a screen that already
                                has two, and she is picking
                                people, not comparing them.

                                Suppressed under the Needs help
                                filter, where every row would
                                carry it: a label that appears on
                                everything has stopped labelling
                                anything. */}
                            {/* THE REASON COMES BEFORE THE
                                JUDGEMENT. A row reading both
                                "Already in" and "Needs help" is
                                offering her a choice she cannot
                                make, and the first of the two is
                                the one that answers why the row
                                is greyed. */}
                            {off ? (
                              <span className="shrink-0 text-[12px] text-ink-500">
                                {disabledNote}
                              </span>
                            ) : (
                              filter !== 'flagged' &&
                              needsHelp(s) && (
                                <span className="shrink-0 text-[12px] font-medium text-alert-600">
                                  Needs help
                                </span>
                              )
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* The line was "Students come from the classes you
              already teach", which stopped being true the moment
              the list opened up to the campus. Saying the size
              of the pool is more use anyway: it tells her the
              scroll has an end, and that a name she can't find
              isn't hiding behind a filter. */}
          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink-400">
            <Users className="h-3.5 w-3.5" />
            Everyone on the district roster — {students.length} students.
          </p>
        </div>
  )
}

const EMPTY = new Set()

function FilterChip({ active, disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cx(
        'rounded-control px-2 py-1 text-[12px] font-medium transition-colors',
        disabled && 'cursor-not-allowed opacity-40',
        active
          ? 'bg-brand-600 text-white'
          : 'text-ink-600 hover:bg-ink-100 disabled:hover:bg-transparent'
      )}
    >
      {children}
    </button>
  )
}
