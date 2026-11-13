/* ============================================================
   STUDENT DETAIL
   ------------------------------------------------------------
   One child, everything about them.

   The live product has something close to this — the per-student
   view listing Quiz / Reader / SR with scores and time spent.
   It's good. Two things are missing.

   1. TIME SPENT IS THE MOST UNDERUSED NUMBER YOU HAVE.
      Your screens already capture it. But a score alone can't
      tell you whether a student is lost or just careless — and
      time can. 44% in 21 minutes is someone trying hard and not
      getting it. 44% in 4 minutes is someone who clicked
      through. Those are completely different conversations, and
      right now a teacher has to spot the pattern herself.
      Here the software says it out loud.

   2. BENCHMARK-LEVEL BREAKDOWN.
      Scores are listed per assignment, but state reporting and
      intervention both work per TEKS. So this shows both.
   ============================================================ */

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  getStudent,
  classes,
  assignmentsForClass,
  progressFor,
  getStandard,
  allStandards,
  standardScore,
  studentsNeedingAttention,
  onDate,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  Avatar,
  ProgressBar,
  Score,
  AttemptScore,
  scoreTone,
  SectionHeader,
  cx,
} from '../components/ui'
import CoachingPlan from '../flows/CoachingPlan'

export default function StudentDetail() {
  const { studentId } = useParams()
  const student = getStudent(studentId)
  const [coaching, setCoaching] = useState(false)

  if (!student) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-500">That student doesn't exist.</p>
        <Link to="/classes" className="mt-3 inline-block text-sm text-brand-700 underline">
          Back to Classes
        </Link>
      </div>
    )
  }

  const cls = classes.find((c) => c.studentIds.includes(student.id))
  const work = cls
    ? assignmentsForClass(cls.id)
        .map((a) => ({ assignment: a, progress: progressFor(student.id, a.id) }))
        .filter((x) => x.progress)
    : []

  const flagged = studentsNeedingAttention().find((x) => x.student.id === student.id)
  const weakStandard = flagged?.standard ?? allStandards[0]

  const TrendIcon =
    student.trend === 'down' ? TrendingDown : student.trend === 'up' ? TrendingUp : Minus

  return (
    <div className="space-y-6">
      <header>
        <Link
          to={cls ? `/classes/${cls.id}` : '/classes'}
          className="inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {cls?.name ?? 'Classes'}
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              initials={student.initials}
              size="lg"
              tone={flagged ? 'alert' : 'brand'}
              className="!h-14 !w-14 !text-base"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                  {student.name}
                </h1>
                {student.eb && <Badge tone="info">EB</Badge>}
              </div>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-500">
                {cls?.name}
                <span className="text-ink-300">·</span>
                <span className="flex items-center gap-1">
                  <TrendIcon
                    className={cx(
                      'h-3.5 w-3.5',
                      student.trend === 'down'
                        ? 'text-alert-500'
                        : student.trend === 'up'
                          ? 'text-good-500'
                          : 'text-ink-400'
                    )}
                  />
                  {student.trend === 'down'
                    ? 'trending down'
                    : student.trend === 'up'
                      ? 'improving'
                      : 'steady'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <Score value={student.mastery} size="lg" />
              <p className="text-[12px] text-ink-400">overall</p>
            </div>
            <Button variant="primary" icon={Sparkles} onClick={() => setCoaching(true)}>
              Coaching plan
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- Work ---- */}
        <section className="lg:col-span-2">
          <SectionHeader
            title="Work so far"
            description="Score and time together. One without the other hides the diagnosis."
          />
          <Card className="divide-y divide-ink-100 overflow-hidden">
            {work.map(({ assignment, progress }) => {
              const std = getStandard(assignment.standardId)
              /* The pattern a teacher would otherwise have to
                 spot herself. */
              const effortFlag =
                progress.state === 'completed' && progress.score < 65
                  ? progress.minutes >= 15
                    ? {
                        tone: 'watch',
                        text: 'Tried hard, still stuck — likely a concept gap',
                      }
                    : {
                        tone: 'alert',
                        text: 'Finished fast and scored low — may have rushed',
                      }
                  : null

              return (
                <div key={assignment.id} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-ink-900">
                        {assignment.title}
                      </p>
                      <p className="text-[12px] text-ink-500">
                        {std?.id} {std?.title}
                        {/* The same fact as the arrow on the right,
                            said in words, because this list is read
                            as a history rather than scanned as a
                            column — and a history is the one place
                            where "the work was given again" is
                            the point rather than a footnote. */}
                        {progress.retaken && (
                          <span className="text-brand-700">
                            {' · '}re-assigned {onDate(progress.retakenOn)}
                          </span>
                        )}
                        {progress.coached && (
                          <span className="text-brand-700">
                            {' · '}coaching plan {onDate(progress.coachedOn)}
                          </span>
                        )}
                      </p>
                    </div>

                    {progress.state === 'completed' ? (
                      <>
                        <span className="flex shrink-0 items-center gap-1 text-[12px] text-ink-500">
                          <Clock className="h-3 w-3" />
                          {progress.minutes} min
                        </span>
                        <AttemptScore
                          first={progress.firstScore}
                          value={progress.score}
                          className="shrink-0 justify-end text-right"
                        />
                      </>
                    ) : (
                      <Badge tone={progress.state === 'in-progress' ? 'info' : 'neutral'}>
                        {progress.state === 'in-progress' ? 'In progress' : 'Not started'}
                      </Badge>
                    )}
                  </div>

                  {effortFlag && (
                    <p
                      className={cx(
                        'mt-2 flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-[12px]',
                        effortFlag.tone === 'watch'
                          ? 'bg-watch-50 text-watch-700'
                          : 'bg-alert-50 text-alert-700'
                      )}
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {effortFlag.text}
                    </p>
                  )}
                </div>
              )
            })}
          </Card>
        </section>

        {/* ---- By TEKS ---- */}
        <section>
          <SectionHeader
            title="By TEKS"
            description="What state reporting and intervention both work from."
          />
          <Card className="divide-y divide-ink-100 overflow-hidden">
            {allStandards
              .filter((s) => s.tested)
              .map((std) => {
                const score = standardScore(student.id, std.id)
                return (
                  <Link
                    key={std.id}
                    to={`/teach/${std.id}`}
                    /* `/60` rather than flat ink-50, to match
                       every other list row in the product. The
                       difference is small and the point is that
                       there is no difference. */
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-ink-50/60"
                  >
                    <span className="w-[74px] shrink-0 text-[12px] font-semibold text-ink-600">
                      {std.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-ink-800">{std.title}</p>
                      <ProgressBar
                        className="mt-1"
                        value={score}
                        total={100}
                        tone={scoreTone(score)}
                      />
                    </div>
                    <Score value={score} size="sm" className="w-9 shrink-0 text-right" />
                  </Link>
                )
              })}
          </Card>
        </section>
      </div>

      <CoachingPlan
        open={coaching}
        onClose={() => setCoaching(false)}
        student={student}
        standard={weakStandard}
        className={cls}
      />
    </div>
  )
}
