/* ============================================================
   COACHING PLAN
   ------------------------------------------------------------
   This is the best thing in your product, so I've changed as
   little as possible about the IDEA and a lot about the reach.

   KEPT: the shape. Diagnose the gap in plain language, then
   offer a three-step remedy with the actual resources attached.
   That structure is genuinely good and most ed-tech doesn't do
   it.

   CHANGED, three things:

   1. It's reachable now. In the live product this opens from a
      small button, in a table row, inside a tab, that you only
      find if you already went looking. Here it opens from the
      Today screen, from any class, from any student, and from
      Insights. Same modal — many more doors.

   2. Resources come pre-selected. Today every checkbox starts
      empty, which quietly hands the hardest decision back to
      the teacher: "which of these five should I pick?" The
      product already knows which standard she's weak on. It
      should propose, and let the teacher remove. A default is
      a recommendation; an empty form is a shrug.

   3. The evidence is shown, not just described. The paragraph
      says "60% in Quiz and just 14% in SR" — good writing, but
      a teacher has to hold three numbers in her head. Showing
      the bars underneath makes the gap visible in one glance.
   ============================================================ */

import { useEffect, useState } from 'react'
import { Sparkles, TrendingDown, Check, RotateCcw, MessageCircle } from 'lucide-react'
import {
  resourcesForStandard,
  resourceTypes,
  standardScore,
  getStandard,
  getAssignment,
  getResource,
  coachableAssignmentFor,
  coachingPlanFor,
  coachingTargetsFor,
  sendCoachingPlan,
  resourceProgressFor,
  progressFor,
  needsAttention,
  onDate,
} from '../data/mock'
import { Sheet, Button, Badge, Avatar, AttemptScore, Score, LevelLabel, cx } from '../components/ui'

export default function CoachingPlan({
  open,
  onClose,
  student,
  standard,
  assignmentId,
  onSent,
  className: cls,
}) {
  const std = typeof standard === 'string' ? getStandard(standard) : standard

  /* The resources worth reaching for first: the explanatory and
     vocabulary material, not another test. A student who failed
     an assessment doesn't need a second assessment, she needs
     the concept again in a different shape. */
  const remedial = std
    ? resourcesForStandard(std.id).filter((r) =>
        ['IM', 'IMC', 'PHENOM', 'VOCAB', 'READER'].includes(r.type)
      )
    : []

  const [picked, setPicked] = useState([])
  const [retry, setRetry] = useState(true)
  const [checkIn, setCheckIn] = useState(false)
  const [sent, setSent] = useState(false)

  /* ---- WHICH ASSIGNMENT THIS PLAN BELONGS TO ----
     A plan is stored against an assignment, because that is
     where its results are read — the report's columns are the
     pieces it re-taught. The report passes it; every other door
     works it out from the child's worst finished piece of work
     on this standard, which is the one that put him on her list
     in the first place. */
  const assignment = assignmentId
    ? getAssignment(assignmentId)
    : coachableAssignmentFor(student?.id, std?.id)

  /* `tick` exists so the panel can re-read the plan store the
     instant it writes to it. Pressing Send does not close this
     panel any more — it turns it into the results view, which is
     the only way a prototype can show "sent" and "what came of
     it" in the same breath. */
  const [tick, setTick] = useState(0)
  const plan =
    student && assignment ? coachingPlanFor(student.id, assignment.id) : null
  void tick

  /* Pre-select the two highest-value resources whenever the
     panel opens for a new student.

     This has to be an effect, not a useState initialiser. The
     component stays mounted while closed, so the initialiser
     runs exactly once — back when there was no student yet —
     and every subsequent open would show an empty list. Which
     is precisely the "empty form is a shrug" problem this
     screen exists to fix. */
  useEffect(() => {
    if (!open || !std) return
    setPicked(remedial.slice(0, 2).map((r) => r.id))
    setRetry(true)
    setCheckIn(false)
    setSent(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, std?.id, student?.id])

  if (!student || !std) return null

  const scores = [
    { label: 'Quiz', value: standardScore(student.id, std.id) },
    { label: 'Student Review', value: Math.max(10, standardScore(student.id, std.id) - 18) },
    { label: 'Module check', value: Math.min(100, standardScore(student.id, std.id) + 7) },
  ]

  const pickedMinutes = remedial
    .filter((r) => picked.includes(r.id))
    .reduce((s, r) => s + r.minutes, 0)

  function toggle(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  function send() {
    if (!assignment) {
      /* Nothing finished to hang a plan on — the send is honest
         about having nowhere to record itself rather than
         inventing an assignment to attach to. */
      setSent(true)
      setTimeout(() => {
        setSent(false)
        onClose()
      }, 1400)
      return
    }
    sendCoachingPlan({
      studentId: student.id,
      assignmentId: assignment.id,
      classId: cls?.id,
      standardId: std.id,
      supportIds: picked,
    })
    setTick((t) => t + 1)
    onSent?.()
  }

  /* ============================================================
     THE REVIEW VIEW — a plan that has already gone out
     ------------------------------------------------------------
     The compose form answers "what shall I send". Once something
     HAS been sent, that is the wrong question, and showing the
     form again would be the screen forgetting its own history —
     which is exactly the gap Dhinesh found: the button sent
     something, and the next morning nothing on any page knew.

     So the panel has two states and the stored plan decides
     which. Same door, same title, different question:
     "what did it do".
     ============================================================ */
  if (plan) {
    const rows = resourceProgressFor(student.id, plan.assignmentId)
    const overall = progressFor(student.id, plan.assignmentId)
    const covered = plan.results
      .map((res) => ({
        res,
        row: rows.find((x) => x.resource.id === res.resourceId),
      }))
      .filter((x) => x.row)
    const support = plan.supportIds.map(getResource).filter(Boolean)
    const gain = covered.length
      ? Math.round(
          covered.reduce((n, { res }) => n + (res.score - res.firstScore), 0) /
            covered.length
        )
      : 0
    const stillBehind = needsAttention(overall?.score)
    /* ---- ONLY CLAIM A CROSSING THAT HAPPENED ----
       The first draft said "that puts him over the line"
       whenever the child ended up above it, which on Noah
       Whitfield — 76 before, 80 after — credited the plan with
       moving him past a line he was never behind. He was coached
       on one weak piece inside an assignment he had already
       passed, which is a real and good reason to send a plan and
       an entirely different sentence. */
    const crossed = needsAttention(overall?.firstScore) && !stillBehind

    return (
      <Sheet
        open={open}
        onClose={onClose}
        width="2xl"
        title={`Coaching plan for ${student.firstName}`}
        subtitle={`${cls?.name ?? 'Class'} · ${std.id} ${std.title}`}
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] text-ink-600">
              Sent {onDate(plan.sentOn)} · {covered.length}{' '}
              {covered.length === 1 ? 'piece' : 'pieces'} re-taught
            </p>
            <Button variant="primary" size="lg" onClick={onClose}>
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-7">
          {/* ---- THE VERDICT, BEFORE THE DETAIL ----
              She opened this to find out whether it worked. The
              answer is one sentence and it goes first; the rows
              underneath are the working, for when she wants it.

              The tone follows the OUTCOME and not the gain. A
              child who came up eleven points and is still under
              the line is not a success story, and a green box
              over his name would be the screen congratulating
              itself for work that is not finished. */}
          <section
            className={cx(
              'rounded-card border p-4',
              stillBehind
                ? 'border-watch-200 bg-watch-50'
                : 'border-good-200 bg-good-50'
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar
                initials={student.initials}
                size="lg"
                tone={stillBehind ? 'watch' : 'good'}
              />
              <div className="min-w-0 flex-1">
                <h3
                  className={cx(
                    'flex items-center gap-1.5 text-sm font-semibold',
                    stillBehind ? 'text-watch-800' : 'text-good-800'
                  )}
                >
                  <Check className="h-4 w-4" />
                  Sent {onDate(plan.sentOn)}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-700">
                  {student.firstName} came up{' '}
                  <strong className="tnum font-semibold text-ink-900">+{gain}</strong> on
                  average across the {covered.length}{' '}
                  {covered.length === 1 ? 'piece' : 'pieces'} this plan re-taught.{' '}
                  {/* ---- NO PRONOUNS ANYWHERE IN HERE ----
                      The first draft of these three sentences said
                      "he", and the screen promptly told a teacher
                      that Leila Haddad still needs attention and
                      that HE is making progress. The mock has no
                      gender field and should not have one — a
                      roster is not the place to guess, and name
                      alone is not evidence. So the sentences are
                      written around it: the name, or no subject at
                      all. The rest of this panel already managed
                      that; only the parts I added forgot. */}
                  {stillBehind
                    ? `Still under the line on ${assignment.title}, so this is progress rather than a finish.`
                    : crossed
                      ? `That is over the line on ${assignment.title}.`
                      : `${student.firstName} was already over the line on ${assignment.title} — this closed the one piece that was not.`}
                </p>
                <p className="mt-3 flex items-center gap-2 text-[14px]">
                  <span className="text-ink-500">{assignment.title}</span>
                  <AttemptScore
                    first={overall?.firstScore}
                    value={overall?.score}
                    size="base"
                  />
                  <LevelLabel value={overall?.score} />
                </p>
              </div>
            </div>
          </section>

          {/* ---- WHAT IT RE-TAUGHT, PIECE BY PIECE ----
              The same rows as the report's columns, turned on
              their side so the titles can be read in full. This
              is the list Dhinesh described: he did well on one of
              the five, so that one is not here — only the pieces
              the plan actually covered, each with the score it
              started from. */}
          <Step n={1} title="What it re-taught" description="Each piece, before and after.">
            <ul className="space-y-1.5">
              {covered.map(({ res, row }) => (
                <li
                  key={res.resourceId}
                  className="flex items-center gap-3 rounded-control border border-ink-200 bg-white px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink-900">
                      {row.resource.title}
                    </span>
                    <span className="block text-[12px] text-ink-500">
                      {resourceTypes[row.resource.type].label} · {row.minutes} min
                    </span>
                  </span>
                  <AttemptScore first={res.firstScore} value={res.score} />
                </li>
              ))}
            </ul>
          </Step>

          {support.length > 0 && (
            <Step
              n={2}
              title="Support material sent with it"
              description="The concept in a different form, alongside the work itself."
            >
              <ul className="space-y-1.5">
                {support.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 rounded-control border border-ink-200 bg-white px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink-900">
                        {r.title}
                      </span>
                      <span className="block text-[12px] text-ink-500">
                        {resourceTypes[r.type].label}
                      </span>
                    </span>
                    <Badge tone="good">Finished</Badge>
                  </li>
                ))}
              </ul>
            </Step>
          )}

          {/* ---- THE PRETENCE, NAMED ON THE SCREEN ----
              Dhinesh asked for results to appear the moment a plan
              is sent, so the finished state is always one click
              away. That is the right call for judging a design and
              it is not how a fortnight works, so the screen says
              so rather than letting the prototype quietly claim
              otherwise. */}
          <p className="flex items-start gap-2 rounded-control bg-ink-100 px-3 py-2.5 text-[12px] leading-relaxed text-ink-600">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
            In the prototype a plan reports back straight away so the finished state is
            visible. In the real product these scores would arrive over the following week
            or two.
          </p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      /* ---- THE SAME WIDTH AS RE-ASSIGN ----
         672px, and it was the narrowest of the three panels that
         ask a teacher to choose from a list — which is backwards,
         because this is the one whose rows carry a full resource
         title, a type and a duration, and whose diagnosis
         paragraph was wrapping to four lines over the top of
         them. 896px is what Re-assign already uses, so the two
         dialogs that do the same shape of work now open at the
         same size instead of one of them feeling cramped for no
         reason the teacher can see. */
      width="2xl"
      title={`Coaching plan for ${student.firstName}`}
      subtitle={`${cls?.name ?? 'Class'} · ${std.id} ${std.title}`}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] text-ink-600">
            {picked.length > 0 ? (
              <>
                <span className="font-semibold text-ink-900">
                  {picked.length} {picked.length === 1 ? 'resource' : 'resources'}
                </span>
                <span className="text-ink-500"> · about {pickedMinutes} min</span>
              </>
            ) : (
              <span className="text-ink-500">Choose at least one resource</span>
            )}
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={sent ? Check : undefined}
            disabled={picked.length === 0 || sent}
            onClick={send}
          >
            {sent ? 'Sent to ' + student.firstName : 'Send plan'}
          </Button>
        </div>
      }
    >
      <div className="space-y-7">
        {/* ---- The diagnosis ---- */}
        <section className="rounded-card border border-alert-100 bg-alert-50 p-4">
          <div className="flex items-start gap-3">
            <Avatar initials={student.initials} size="lg" tone="alert" />
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-alert-700">
                <TrendingDown className="h-4 w-4" />
                Where {student.firstName} is stuck
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-700">
                Overall performance is{' '}
                {/* A child can reach a coaching plan before he has
                    finished anything — from a roster, or because
                    a teacher went looking. "null%" is the kind of
                    thing that ends up in a screenshot. */}
                <strong className="font-semibold text-ink-900">
                  {student.mastery == null ? 'No score yet' : `${student.mastery}%`}
                </strong>{' '}
                and trending {student.trend === 'down' ? 'downward' : 'flat'}. The gap is
                concentrated in{' '}
                <strong className="font-semibold text-ink-900">{std.id}</strong> — the
                spread between recognising the idea and applying it suggests a concept
                gap rather than careless mistakes.
              </p>
            </div>
          </div>

          {/* The same evidence, visible rather than described. */}
          <dl className="mt-4 space-y-2 border-t border-alert-100 pt-3.5">
            {scores.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <dt className="w-32 shrink-0 text-[12px] text-ink-600">{s.label}</dt>
                <dd className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                    <div
                      className={cx(
                        'h-full rounded-full',
                        s.value >= 80
                          ? 'bg-good-500'
                          : s.value >= 65
                            ? 'bg-watch-500'
                            : 'bg-alert-500'
                      )}
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                  <span className="tnum w-9 shrink-0 text-right text-[12px] font-semibold text-ink-800">
                    {s.value}%
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- WHAT THE PLAN WILL ACTUALLY SEND BACK ----
            This was missing, and its absence was the reason the
            panel felt like a leap of faith: four steps of choices
            and nothing saying which of the child's work was going
            out again. Dhinesh described the rule plainly — he did
            well on one of the five, keep that one, send the other
            four — so the panel shows the four, with the score
            each one is starting from.

            It is a list, not a set of checkboxes, because the
            rule picks them: every piece he needs attention on,
            minus anything a re-assign has already put right. If
            she wants to send back something narrower than that,
            Re-assign is the tool that does it, and it is one
            button away on the same screen. Two controls that
            both choose resources would make her decide which one
            she is in. */}
        {assignment && coachingTargetsFor(student.id, assignment.id).length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-ink-900">
              This plan sends back{' '}
              {coachingTargetsFor(student.id, assignment.id).length} of{' '}
              {assignment.resourceIds.length} pieces
            </h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
              Everything in {assignment.title} that needs attention. What is already right
              stays done.
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {resourceProgressFor(student.id, assignment.id).map((row) => {
                const inPlan = coachingTargetsFor(student.id, assignment.id).some(
                  (r) => r.id === row.resource.id
                )
                return (
                  <li
                    key={row.resource.id}
                    className={cx(
                      'flex items-center gap-3 rounded-control border px-3 py-2.5',
                      inPlan ? 'border-brand-200 bg-brand-50' : 'border-ink-200 bg-white'
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink-900">
                        {row.resource.title}
                      </span>
                      <span className="block text-[12px] text-ink-500">
                        {resourceTypes[row.resource.type].label}
                      </span>
                    </span>
                    <Score value={row.score} size="sm" />
                    {/* ---- "KEEPING" HAS TO MEAN SOMETHING ----
                        It read as "this one is fine" and sat next
                        to a 60%, because the rule leaves out
                        anything a re-assign has already handled
                        and the badge had no word for that. A
                        teacher seeing 60% marked Keeping would
                        reasonably conclude the panel cannot read
                        its own numbers. Three outcomes, three
                        words. */}
                    {inPlan ? (
                      <Badge tone="brand">Going back</Badge>
                    ) : row.retaken ? (
                      <Badge tone="info">Re-assigned already</Badge>
                    ) : (
                      <Badge tone="neutral">Keeping</Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* ---- Step 1 ---- */}
        <Step
          n={1}
          title="Strengthen the concept"
          description="Re-teach it in a different form. Pre-selected below — remove anything you've already tried."
          action={
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setPicked(
                  picked.length === remedial.length ? [] : remedial.map((r) => r.id)
                )
              }
            >
              {picked.length === remedial.length ? 'Clear all' : 'Select all'}
            </Button>
          }
        >
          <ul className="space-y-1.5">
            {remedial.map((r) => {
              const on = picked.includes(r.id)
              return (
                <li key={r.id}>
                  <label
                    className={cx(
                      'flex cursor-pointer items-center gap-3 rounded-control border px-3 py-2.5 transition-colors',
                      on
                        ? 'border-brand-300 bg-brand-50'
                        : 'border-ink-200 bg-white hover:border-ink-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(r.id)}
                      className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink-900">
                        {r.title}
                      </span>
                      <span className="block text-[12px] text-ink-500">
                        {resourceTypes[r.type].label}
                      </span>
                    </span>
                    <Badge tone="neutral">{r.minutes} min</Badge>
                  </label>
                </li>
              )
            })}
          </ul>
        </Step>

        {/* ---- Step 2 ---- */}
        <Step
          n={2}
          title="Give it another go"
          description="Reopen the assignment where the score dropped, once the concept has been retaught."
        >
          <Toggle
            on={retry}
            onChange={setRetry}
            icon={RotateCcw}
            label="Reopen the Student Review"
            hint="Unlocks automatically when the resources above are finished."
          />
        </Step>

        {/* ---- Step 3 ---- */}
        <Step
          n={3}
          title="Short check-in"
          description="Sometimes it's confidence, not content."
          optional
        >
          <Toggle
            on={checkIn}
            onChange={setCheckIn}
            icon={MessageCircle}
            label="Remind me to talk to "
            suffix={student.firstName}
            hint="Appears on your Today screen before this class."
          />
        </Step>

        <p className="flex items-start gap-2 rounded-control bg-ink-100 px-3 py-2.5 text-[12px] leading-relaxed text-ink-600">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
          {student.firstName} sees this as a short list of things to work through — not as
          a flag. Nothing here is visible to other students.
        </p>
      </div>
    </Sheet>
  )
}

function Step({ n, title, description, optional, action, children }) {
  return (
    <section>
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-800">
            {n}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">
              {title}
              {optional && (
                <span className="ml-1.5 text-[12px] font-normal text-ink-400">
                  optional
                </span>
              )}
            </h3>
            {description && (
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="pl-7.5">{children}</div>
    </section>
  )
}

function Toggle({ on, onChange, icon: Icon, label, suffix, hint }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-control border px-3 py-2.5 transition-colors',
        on ? 'border-brand-300 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
      )}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink-900">
          <Icon className="h-3.5 w-3.5 text-ink-400" />
          {label}
          {suffix}
        </span>
        {hint && <span className="mt-0.5 block text-[12px] text-ink-500">{hint}</span>}
      </span>
    </label>
  )
}
