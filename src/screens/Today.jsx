/* ============================================================
   TODAY
   ------------------------------------------------------------
   REWRITTEN AFTER THE FIRST REVIEW — and the note is worth
   keeping, because the mistake is a common one.

   Version 1 had five things on it: Up next, Needs you, Due this
   week, Your day, and Pick up where you left off. Every one of
   them was defensible on its own. Together they were a wall.

   The failure wasn't that any section was bad. It was that I
   designed for completeness instead of for a decision. A screen
   that shows you five things asks you to choose between five
   things, and choosing is the work. Between classes, a teacher
   has about ninety seconds and no appetite for choosing.

   So Today now answers exactly two questions, in this order:

     1. What's happening next?     →  one card, one button
     2. Is anyone in trouble?      →  three names, one button each

   Plus a small schedule in the margin, which orients without
   demanding anything.

   WHAT I REMOVED AND WHERE IT WENT
   - "Due this week"  → Classes already shows what each class is
     working on, with dates. It was the same information twice.
   - "Pick up where you left off" → the Library's Recent tab,
     which is where you'd go looking for it anyway.

   Nothing was lost. It was just being shown twice, and the
   second time cost more than it gave.

   THE TEST THIS SCREEN HAS TO PASS
   A teacher who has never seen it should know what to do in
   about three seconds, without anyone explaining. That's why
   there is exactly one teal button above the fold: teal means
   "this is the thing to press". Two primary buttons would be
   two decisions.
   ============================================================ */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import {
  teacher,
  classes,
  assignments,
  studentsNeedingAttention,
  getStandard,
  studentsInClass,
  progressFor,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  buttonClass,
  Avatar,
  ProgressBar,
  SectionHeader,
  cx,
} from '../components/ui'
import CoachingPlan from '../flows/CoachingPlan'

export default function Today() {
  const [coaching, setCoaching] = useState(null)

  const now = new Date('2026-09-16T09:42:00')

  /* ---- NO CLOCK ANY MORE ----
     This screen used to be built on one: a hard-coded "09:42",
     a class picked because its period started after it, and a
     margin that greyed out the periods already taught. All of
     it rested on a timetable the product does not have, which
     is the rule Dhinesh set — EduSmart is one of several tools
     a teacher uses, and it has no idea what time her second
     period runs or whether she is even at school right now.

     What replaces it is a date the teacher set herself: the
     assignment due soonest. "The work closing next" is a real
     fact about her own decisions, where "the class starting
     next" was an invention.

     THIS IS A PATCH, NOT A DESIGN. Two sections here — Up next
     and Your day — were built around a schedule and now point
     at something else. They read honestly, but the concept
     deserves rethinking when Today comes up properly; a
     screen called Today that cannot say what day it is for the
     teacher is worth a conversation of its own. */

  /* Three, not four. A list of four reads as a list; a list of
     three reads as "these are the ones". */
  const attention = studentsNeedingAttention().slice(0, 3)
  const totalFlagged = studentsNeedingAttention().length

  const soonest = [...assignments]
    .filter((a) => a.status === 'active')
    .sort((a, b) => new Date(a.due) - new Date(b.due))[0]
  const next = classes.find((c) => soonest?.classIds.includes(c.id)) ?? classes[0]
  const nextAssignment = soonest
  const nextStandard = getStandard(nextAssignment?.standardId ?? 'SC.5.P.8.1')

  const roster = studentsInClass(next.id)
  const done = nextAssignment
    ? roster.filter((s) => progressFor(s.id, nextAssignment.id)?.state === 'completed')
        .length
    : 0

  return (
    /* This used to cap itself narrower than every other screen,
       on the theory that two sections stretched across a 1400px
       monitor would read as unfinished. That was the wrong
       trade and Dhinesh caught it: the header stays at the full
       width regardless, so the narrower content below it didn't
       read as restraint, it read as misalignment — and then the
       page appeared to jump when he moved to Library.

       Consistency wins. The restraint now comes from the column
       proportions below, not from a second page width. */
    <div className="space-y-8">
      <header>
        <p className="text-[14px] text-ink-500">
          {now.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink-900">
          Good morning, {teacher.firstName}
        </h1>
      </header>

      {/* The rail gets a FIXED 340px, not a third of whatever
          the monitor happens to be. A list of five class times
          doesn't get more useful at 600px wide, it just gets
          emptier — which is what made the old thirds split look
          stretched once the page went full width. The main
          column absorbs the difference instead.
          minmax(0,1fr) rather than plain 1fr so a long lesson
          title can't push the column wider than the page. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          {/* ================= 1. WHAT'S NEXT =================
              The biggest thing on the page, with the only
              primary button above the fold. On a good day this
              is the whole visit. */}
          <section>
            <SectionHeader title="Up next" />
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-5 p-5">
                <div className="min-w-0">
                  <Badge tone="brand" icon={CalendarClock}>
                    Due{' '}
                    {new Date(nextAssignment.due).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Badge>
                  <h3 className="mt-2.5 text-xl font-semibold text-ink-900">
                    {next.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-600">
                    <span className="font-medium text-ink-800">{nextStandard.id}</span>{' '}
                    {nextStandard.title}
                  </p>
                  <p className="mt-0.5 text-[14px] text-ink-500">
                    {roster.length} students
                  </p>
                </div>

                <Button variant="primary" size="lg" iconRight={ArrowRight}>
                  Start lesson
                </Button>
              </div>

              {nextAssignment && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-100 bg-ink-50 px-5 py-3">
                  <span className="text-[12px] text-ink-600">
                    {nextAssignment.title}
                  </span>
                  <span className="flex min-w-[140px] flex-1 items-center gap-2.5">
                    <ProgressBar value={done} total={roster.length} />
                    <span className="tnum shrink-0 text-[12px] font-medium text-ink-700">
                      {done}/{roster.length}
                    </span>
                  </span>
                  <Link
                    to={`/classes/${next.id}`}
                    className="text-[12px] font-medium text-brand-700 hover:underline"
                  >
                    Open class
                  </Link>
                </div>
              )}
            </Card>
          </section>

          {/* ================= 2. WHO NEEDS HELP =================
              One row per student, one action per row. The row
              says who, and why, and nothing else — the detail
              lives inside the coaching plan, which is where
              you'd act on it. */}
          <section>
            <SectionHeader
              title="Needs you"
              description="The three furthest behind right now."
              action={
                <Link
                  to="/insights"
                  className={cx(buttonClass({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
                >
                  All {totalFlagged}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <Card className="divide-y divide-ink-100 overflow-hidden">
              {attention.map(({ student, cls, reason, standard }) => (
                <div
                  key={student.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5"
                >
                  <Avatar initials={student.initials} tone="alert" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {student.name}
                      <span className="ml-2 text-[12px] font-normal text-ink-400">
                        {cls?.name}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      {reason} · stuck on {standard.id}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setCoaching({ student, cls, standard })}
                  >
                    Coaching plan
                  </Button>
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* ================= MARGIN =================
            One block, not three. It orients you and asks for
            nothing. */}
        <section>
          <SectionHeader title="Your classes" />
          <Card className="divide-y divide-ink-100 overflow-hidden">
            {classes.map((c) => {
              const isNext = c.id === next.id
              return (
                <Link
                  key={c.id}
                  to={`/classes/${c.id}`}
                  className={cx(
                    /* Same row tint as every other list. The
                       next class keeps its own brand fill and
                       does not change under the cursor, because
                       "this is the one coming up" is a fact
                       about the day, not about the mouse. */
                    'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-50/60',
                    isNext && 'bg-brand-50 hover:bg-brand-50'
                  )}
                >
                  {/* The time column and the greyed-out "Done"
                      state both went with the clock. A class is
                      not finished for the day just because an
                      hour has passed, and we never knew the
                      hour anyway. */}
                  <span className="min-w-0 flex-1 text-[14px] font-medium text-ink-900">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-[12px] text-ink-400">
                    {studentsInClass(c.id).length} students
                  </span>
                  {isNext && <Badge tone="brand">Closing next</Badge>}
                </Link>
              )
            })}
          </Card>
        </section>
      </div>

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
