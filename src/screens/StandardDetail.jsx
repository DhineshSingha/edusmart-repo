/* ============================================================
   TEKS DETAIL  —  two levels, as the live product has it
   ------------------------------------------------------------
   Five attempts at flattening this screen failed, and the
   reason is worth writing down properly.

   I treated a resource as a name plus an Add button. It isn't:
   it carries preview, language, assign, add to playlist,
   student version, teacher version and share. Seven
   affordances. An object with seven affordances needs room —
   which is exactly why the live product gives resources their
   own view, and why the directory in front of them is not an
   extra click but the thing that makes them possible.

   So the structure is Dhinesh's:

     Level 1  the directory — six categories, contents listed
     Level 2  the resources — full cards with every action

   What's improved is inside each level, not the shape:

   LEVEL 1  Cards carry information (counts, class time, what's
            already in your playlist), the contents are links
            straight to a resource rather than labels you then
            hunt for, and the saturated fill and line-art
            drawings are gone so the names can be read.

   LEVEL 2  The big type block stays — I had dismissed it as
            decoration and it isn't; with no thumbnail image
            available it's the only visual anchor a card has.
            It's now the preview target. Duration, a plain
            description, and a working EN/ES toggle are new.

   PREVIEW  Full screen, as today — but you can assign or add
            to your playlist from inside it. Today you preview,
            close, find the card again, then act.
   ============================================================ */

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  getStandard,
  resourcesForStandard,
  resourceCategories,
  phases,
  students,
  standardScore,
  classAverageFor,
  classes,
  studentsInClass,
} from '../data/mock'
import { Badge, Segmented, Score, cx } from '../components/ui'
import { Star } from 'lucide-react'
import ResourceDirectory from '../components/ResourceDirectory'
import ResourceTile, { ResourceLayout } from '../components/ResourceTile'
import PreviewOverlay from '../flows/PreviewOverlay'

const PHASE_ORDER = [...phases.filter((p) => p !== 'Teacher Resources'), 'Teacher Resources']

const phaseBlurb = {
  Engage: 'Hook their curiosity before any explanation.',
  Explore: 'Hands-on first contact with the phenomenon.',
  Explain: 'Direct instruction, once they have something to explain.',
  Elaborate: 'Stretch the idea into new contexts and vocabulary.',
  Evaluate: 'Check what actually stuck.',
  'Teacher Resources': 'Planning material for you. Nothing here is assignable.',
}

/* One hue, stepped. Six different colours would compete with
   the status palette, where colour already means something
   about students. */
const accent = (i) =>
  `color-mix(in oklab, var(--color-brand-500) ${35 + i * 13}%, white)`

export default function StandardDetail() {
  const { standardId } = useParams()
  const std = getStandard(standardId)

  const [axis, setAxis] = useState('type')
  const [openGroup, setOpenGroup] = useState(null)
  /* Which KIND within the category is showing. Null means the
     whole category — that's the difference between clicking the
     card and clicking one of its contents, which is what
     Dhinesh caught: clicking "Instruction Module" was showing
     Anchoring Phenomena too. */
  const [openKind, setOpenKind] = useState(null)
  const [preview, setPreview] = useState(null)


  if (!std) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-500">That TEKS doesn't exist.</p>
        <Link to="/teach" className="mt-3 inline-block text-sm text-brand-700 underline">
          Back to Library
        </Link>
      </div>
    )
  }

  const all = resourcesForStandard(std.id)
  const key = axis === 'type' ? 'category' : 'phase'
  const order = axis === 'type' ? resourceCategories : PHASE_ORDER

  const groups = order
    .map((name) => ({
      name,
      items: all.filter((r) => r[key] === name),
      blurb: axis === 'phase' ? phaseBlurb[name] : undefined,
    }))
    .filter((g) => g.items.length > 0)

  const current = groups.find((g) => g.name === openGroup)
  const kinds = current ? [...new Set(current.items.map((r) => r.kind))] : []
  const shown = current
    ? openKind
      ? current.items.filter((r) => r.kind === openKind)
      : current.items
    : []
  const shownAssignable = shown.filter((r) => r.forStudents)

  function open(name, kind) {
    setOpenGroup(name)
    setOpenKind(kind ?? null)
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <header>
        <nav className="flex flex-wrap items-center gap-1.5 text-[14px] text-ink-500">
          <Link to="/teach" className="hover:text-ink-800">
            Library
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
          {openGroup ? (
            <>
              <button
                onClick={() => {
                  setOpenGroup(null)
                  setOpenKind(null)
                }}
                className="hover:text-ink-800"
              >
                {std.id}
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              {openKind ? (
                <>
                  <button
                    onClick={() => setOpenKind(null)}
                    className="hover:text-ink-800"
                  >
                    {openGroup}
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                  <span className="font-medium text-ink-800">{openKind}</span>
                </>
              ) : (
                <span className="font-medium text-ink-800">{openGroup}</span>
              )}
            </>
          ) : (
            <span className="font-medium text-ink-800">{std.id}</span>
          )}
        </nav>

        <div className="mt-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* Code, then strand, then the badge.
                The first two are WHERE YOU ARE — they answer
                "did I land on the right page", which is the only
                question being asked in the first half-second.
                The badge is a property of the standard, useful
                once you've confirmed that. Putting it in the
                middle made the eye jump over it to find the
                strand name, every single time. */}
            {/* NO PILL. Dhinesh called this one on the resource
                cards weeks ago and it was still here.

                A pill is a container, and a container says "this
                thing is a category you could be filtered by, or a
                state that might have been different". The code is
                neither. It's a name, and names are set in type,
                not boxed. The weight already separates it from the
                strand beside it, which is all the box was doing —
                at the cost of a shape that competes with the STAAR
                badge two items along, which IS a real badge and
                needs to win that comparison. */}
            <span className="text-[12px] font-semibold text-ink-700">{std.id}</span>
            <span className="text-[12px] text-ink-500">{std.unitName}</span>
            {std.tested ? (
              <Badge tone="watch" icon={Star}>
                Assessed on STAAR
              </Badge>
            ) : (
              <Badge tone="neutral">Taught throughout</Badge>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
            {std.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{std.text}</p>
        </div>
      </header>

      {std.tested && <StandardPerformance standardId={std.id} />}

      {/* ================= LEVEL 1 ================= */}
      {!openGroup && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-500">Filter by</span>
              <Segmented
                value={axis}
                onChange={setAxis}
                options={[
                  { value: 'type', label: 'Resource type' },
                  { value: 'phase', label: '5E model' },
                ]}
              />
            </div>
            <p className="text-[12px] text-ink-500">
              {all.length} resources · about{' '}
              {all.reduce((s, r) => s + (r.forStudents ? r.minutes : 0), 0)} min of class
              time
            </p>
          </div>

          <ResourceDirectory groups={groups} onOpen={open} accentFor={accent} />
        </>
      )}

      {/* ================= LEVEL 2 ================= */}
      {current && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                {openKind ?? current.name}
              </h2>
              {/* No "· in Instruction" any more. The breadcrumb
                  two lines above already reads Library › 5.6A ›
                  Instruction › Instruction Module & Companion,
                  and the switcher just below says "Everything in
                  Instruction". Saying it a third time in the
                  subtitle was the category repeating itself
                  within a single glance. */}
              <p className="text-[12px] text-ink-500">
                {shown.length} {shown.length === 1 ? 'resource' : 'resources'} for{' '}
                {std.id}
              </p>
            </div>

            {/* "Add all 10 to playlist" has gone.
                A playlist holds five. An action that offers to
                add eleven things to a five-slot stack is not a
                shortcut, it's a promise the product can't keep —
                it would either fail silently on six of them or
                pick five for her without saying which.

                It could have been rewritten to add only what
                fits, but then the button appears and disappears
                depending on how full the stack is, and its label
                changes every time she adds something. A control
                that flickers in and out of existence costs more
                attention than the four clicks it was saving.

                With a cap of five, choosing them one at a time
                IS the task. */}
          </div>

          {/* Siblings within this category, so switching from
              Instruction Module & Companion to Anchoring
              Phenomenon doesn't mean going back up a level. */}
          {kinds.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setOpenKind(null)}
                className={cx(
                  'rounded-control border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  openKind === null
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                )}
              >
                Everything in {current.name}
              </button>
              {kinds.map((k) => (
                <button
                  key={k}
                  onClick={() => setOpenKind(k)}
                  className={cx(
                    'rounded-control border px-3 py-1.5 text-[12px] font-medium transition-colors',
                    openKind === k
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          <ResourceLayout>
            {shown.map((r) => (
              <ResourceTile key={r.id} resource={r} onPreview={setPreview} />
            ))}
          </ResourceLayout>
        </>
      )}

      <PreviewOverlay resource={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

/* ------------------------------------------------------------
   HOW YOUR CLASSES ARE DOING ON THIS TEKS
   ------------------------------------------------------------
   The idea is still right and I'd defend it: in the live
   product, choosing what to teach and seeing how it went sit in
   different tabs, so a teacher browsing material gets no signal
   that 4th Period scored 62% here. Putting the outcome next to
   the content closes that loop.

   THE FORM WAS WRONG, TWICE OVER, AND DHINESH FOUND BOTH.

   1. IT DIDN'T SCALE. It was a five-column grid of named bars,
      built while looking at a teacher who has five classes. Ask
      what happens at twenty — a science specialist on a
      rotation, or a middle-school teacher with eight sections —
      and it becomes four rows of bars occupying the top half of
      the page, above the resources she actually came for. A
      layout that only works at the size of the mock data isn't
      a layout, it's a screenshot.

   2. MOST OF IT DIDN'T CHANGE ANYTHING. 69, 68, 72, 62, 64.
      Five numbers, and four of them are the same number. The
      only one that could alter what she does is the low one.
      Reading five bars to find one fact is four bars of tax.

   WHAT IT IS NOW: one sentence. The overall figure, because it
   genuinely shapes the choice ahead — a class at 67% on this
   standard wants more scaffolded material than one at 85%. Then
   the names of any classes meaningfully behind that average,
   AS LINKS, because the entire point of knowing 4th Period is
   behind is to go and do something about it.

   It reads the same at five classes and at fifty. At most two
   names, then a count. And on a TEKS where every class is
   level, the second half simply doesn't appear — the line goes
   quiet on its own.
   ------------------------------------------------------------ */

/* How far below her own average a class has to sit before it's
   worth naming. Same principle as the Library grid, slightly
   tighter: this comparison is between classes taught by one
   teacher, where a real gap shows up sooner than it does
   between standards. */
const CLASS_BEHIND_BY = 6

function StandardPerformance({ standardId }) {
  const overall = classAverageFor(standardId)

  const behind = classes
    .map((c) => {
      const roster = studentsInClass(c.id)
      return {
        ...c,
        avg: Math.round(
          roster.reduce((s, st) => s + standardScore(st.id, standardId), 0) /
            Math.max(roster.length, 1)
        ),
      }
    })
    .filter((c) => c.avg <= overall - CLASS_BEHIND_BY)
    .sort((a, b) => a.avg - b.avg)

  /* Two names, then a number. Naming every lagging class would
     reintroduce the scaling problem in sentence form. */
  const named = behind.slice(0, 2)
  const rest = behind.length - named.length

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[14px] text-ink-600">
      <span className="text-ink-500">Your classes average</span>
      <Score value={overall} size="sm" />
      <span className="text-ink-500">
        on this TEKS, across {classes.length} {classes.length === 1 ? 'class' : 'classes'}.
      </span>

      {/* ---- INDIVIDUALLY ----
          Each named class goes straight to that class's own
          page. This is the link that does the work: the reason
          to know 4th Period is behind is to go and look at 4th
          Period, and making her navigate there herself — Classes,
          find the right one, click — is three steps to reach
          something the sentence has already named. */}
      {named.length > 0 && (
        <span className="text-ink-500">
          Furthest behind:{' '}
          {named.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ', '}
              <Link
                to={`/classes/${c.id}`}
                className="font-medium text-alert-700 underline decoration-alert-700/30 underline-offset-2 hover:decoration-alert-700"
              >
                {c.name}
              </Link>
              <span className="text-ink-400"> ({c.avg}%)</span>
            </span>
          ))}
          {rest > 0 && ` and ${rest} other${rest === 1 ? '' : 's'}`}.
        </span>
      )}

      {/* ---- WHAT USED TO BE HERE ----
          A "Compare all 12 in Reports" link, pointing at a By
          TEKS tab that carried a per-class breakdown of this
          standard. That tab has been removed — Reports is about
          classes and children now, not about the curriculum —
          so the link had nowhere honest to go.

          Most of it is not lost: the sentence above names the
          classes furthest behind on this TEKS and links straight
          to each of them, which was the useful half of that
          journey.

          WHAT IS GONE, stated plainly so nobody has to rediscover
          it. "Furthest behind" only appears when a class sits a
          clear margin below the cohort (see CLASS_BEHIND_BY). On
          a TEKS where every class is doing about equally badly —
          5.7A at 51% across all twelve, say — no class qualifies,
          so this page now shows the average and nothing else, and
          the full per-class split for one standard exists nowhere
          in the product. That is a real consequence of removing
          the tab rather than an oversight. If it is ever wanted
          back, the honest place for it is here, on the page that
          owns the standard, not on a Reports tab. */}
    </p>
  )
}
