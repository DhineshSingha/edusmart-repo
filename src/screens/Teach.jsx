/* ============================================================
   TEACH  (replaces Content Library)
   ------------------------------------------------------------
   THREE PROBLEMS WITH THE CURRENT LIBRARY

   1. It is a four-level drill with no shortcuts.
      Grade → Category → Standard → Resource, every time, with
      no way back to something you used last week except walking
      the whole tree again. So here: search sits at the top,
      and Recent and Saved are tabs, not buried features.

   2. The cards carry no information.
      Every category card in the live product reads "78
      Resources". All eight of them. An identical number on
      every card helps a teacher choose nothing — it is
      decoration shaped like data.

      The fix is NOT to add more numbers. I tried that first and
      got it wrong twice; see the long note above StandardGrid
      for what came off and why. The rule that survived: a fact
      earns a place on a card only if it DIFFERS from the card
      next to it. Resource count does. "STAAR" on all four
      didn't.

   3. It doesn't know the product has a Reports section.
      Content and outcomes live in separate tabs, so a teacher
      browsing material gets no hint that her classes struggled
      with this standard last month. That's a real gap.

      It is NOT closed on this grid, and two attempts proved
      why. A percentage on every card was noise — four numbers
      within three points of each other. An exception flag
      ("20 pts behind") was worse: rarer, but written in a
      vocabulary the reader had to decode, and demanding a
      strand average that wasn't on screen.

      Both arrived while she was looking for Tuesday's lesson,
      not deciding what to reteach. So the loop closes in the
      two places where that IS the question: the per-class
      picture on the TEKS page, where she's choosing a resource
      and can pick a remedial one, and Reports, where all five
      classes sit side by side. This grid stays a place to find
      material.
   ============================================================ */

import { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  Beaker,
  Zap,
  Orbit,
  Leaf,
  FlaskConical,
  Repeat,
  History,
  BookMarked,
  Bookmark,
  LayoutGrid,
  ClipboardList,
  Wrench,
  ListMusic,
  Users,
  BarChart3,
  ChevronRight,
  CalendarClock,
  Send,
  Share2,
  MoreHorizontal,
  Copy,
  Undo2,
  Check,
} from 'lucide-react'
import {
  units,
  contentUnits,
  processUnits,
  currentUnitId,
  allStandards,
  resources,
  resourcesForStandard,
  getResource,
  progressFor,
  recentResourceIds,
  collections,
  getCollection,
  phases,
  classes,
  assignedPerformanceFor,
  assignments,
  assignmentStatsForClass,
  statusOf,
  statusForClass,
  deliveryFor,
  reachedIn,
  newcomersIn,
  classesNotOnAssignment,
  unassignImpact,
  getStandard,
  getClass,
  getStudent,
  onDate,
  todayISO,
  daysUntil,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  buttonClass,
  Segmented,
  SectionHeader,
  EmptyState,
  Avatar,
  ProgressBar,
  Sheet,
  cx,
  Score,
} from '../components/ui'
import ResourceTile, { ResourceLayout } from '../components/ResourceTile'
import PreviewOverlay from '../flows/PreviewOverlay'
import AssignSheet from '../flows/AssignSheet'
import DateField from '../components/DateField'
import GradeSelector from '../components/GradeSelector'
import LanguageSelector from '../components/LanguageSelector'
import TypeBadge from '../components/TypeBadge'
import { strandOf } from '../data/strands'
import { StrandArt } from '../components/Artwork'
import { useApp } from '../store'

const collectionIcons = {
  clipboard: ClipboardList,
  wrench: Wrench,
}

const unitIcons = {
  beaker: Beaker,
  zap: Zap,
  orbit: Orbit,
  leaf: Leaf,
  flask: FlaskConical,
  repeat: Repeat,
}

export default function Teach() {
  /* Saved is real state now rather than a fixed list, so anything
     bookmarked on a card or saved from the playlist bar lands
     here immediately. */
  const { savedIds, savedLists, sharedCount } = useApp()

  /* ---- COUNT WHAT RENDERS, NOT WHAT IS STORED ----
     The segment badges used to read `recentResourceIds.length`
     and `savedIds.length`, while the grids below them rendered
     `.map(getResource).filter(Boolean)`. Two different numbers
     from the same data, and they disagreed by however many ids
     had gone stale — which is how Recent came to say 6 over a
     list of 3.

     The dangling ids are fixed and mock.js now shouts about new
     ones, but the shape of this was the deeper fault: a label
     and the thing it labels were computed separately, so
     nothing could keep them in step. Resolve once, count the
     resolved list, render the resolved list. Now the badge
     cannot be wrong about what is underneath it, whatever the
     data does next. */
  const recentItems = recentResourceIds.map(getResource).filter(Boolean)
  const savedItems = savedIds.map(getResource).filter(Boolean)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('browse')
  const [phase, setPhase] = useState('all')
  const [grade, setGrade] = useState('g5')
  const [preview, setPreview] = useState(null)

  /* Search runs over resource titles AND standard codes and
     titles, because teachers search for both "water cycle" and
     "SC.5.E.7.1". The live product's search box only has one
     mode and no hint about what it matches. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return resources
      .filter((r) => {
        const std = allStandards.find((s) => s.id === r.standardId)
        return (
          r.title.toLowerCase().includes(q) ||
          r.standardId.toLowerCase().includes(q) ||
          std?.title.toLowerCase().includes(q) ||
          std?.text.toLowerCase().includes(q)
        )
      })
      .filter((r) => phase === 'all' || r.phase === phase)
      .slice(0, 24)
  }, [query, phase])

  return (
    <div className="space-y-7">
      {/* Called "Library" because that's what teachers already
          call it. The structure underneath is new; the word
          doesn't need to be. */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Library</h1>
        <p className="mt-1 text-sm text-ink-500">
          Find material, stack it up, send it to your classes.
        </p>
      </header>

      {/* ---- Grade + search ----
          One row, two controls, read left to right as a
          sentence: "in Grade 5 Science, find…". That's the
          actual mental model, so the layout matches it.

          `items-stretch` rather than fixed heights: the two
          controls derive their height from the taller of them,
          so they can never drift a pixel apart when the type
          scale changes. Two side-by-side controls that are 2px
          different in height read as broken even to people who
          can't say why.

          Stacks on phones, where side by side would leave both
          too narrow to read. */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row">
        <GradeSelector
          value={grade}
          onChange={setGrade}
          className="shrink-0 sm:w-56 lg:w-60"
        />

        <LanguageSelector className="shrink-0" />

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a topic, a TEKS code, or a resource — try “water cycle” or “5.8B”"
            className={cx(
              'h-full w-full rounded-card border border-ink-300 bg-white py-3.5 pl-11 pr-4',
              'text-sm text-ink-900 placeholder:text-ink-400',
              /* The border matches the focus outline that lands
                 on top of it, so no grey shows through at the
                 corners where the two curves don't quite agree. */
              'shadow-card transition-colors focus:border-brand-600'
            )}
          />
        </div>
      </div>

      {results ? (
        /* ================= SEARCH RESULTS ================= */
        <section>
          <SectionHeader
            title={`${results.length} ${results.length === 1 ? 'result' : 'results'}`}
            description={`for “${query}”`}
            action={
              <Segmented
                size="sm"
                value={phase}
                onChange={setPhase}
                options={[
                  { value: 'all', label: 'All' },
                  ...phases.map((p) => ({ value: p, label: p })),
                ]}
              />
            }
          />
          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nothing matched that"
              description="Try a shorter phrase, or browse by unit below."
            />
          ) : (
            <ResourceLayout>
              {results.map((r) => (
                <ResourceTile key={r.id} resource={r} onPreview={setPreview} showStandard />
              ))}
            </ResourceLayout>
          )}
        </section>
      ) : (
        /* ================= DEFAULT ================= */
        <>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              /* ---- TWO GROUPS, NOT FIVE TABS ----
                 Dhinesh's ordering, and it is a better reading
                 of this row than the one it replaces. Browse and
                 Recent are ways INTO the catalogue — everything
                 EduSmart publishes, and the slice of it she
                 touched last. Assigned, Saved and Shared with
                 you are views of her own world: what she sent,
                 what she set aside, what a colleague handed her.

                 Those are two different questions, and five
                 equal-weight tabs said they were one. The rule
                 that drops out of it is the one that decides
                 where ASSIGNED goes: a tab belongs with the
                 tabs that answer the same question, not with
                 the ones that happen to be about the same
                 objects. */
              { value: 'browse', label: 'Browse' },
              { value: 'recent', label: 'Recent', count: recentItems.length },
              { divider: true },
              {
                /* ---- WHY THIS LIVES IN LIBRARY ----
                   I had proposed putting the list of everything
                   she has assigned on the Classes screen, as a
                   second tab. Dhinesh called it bad IA and he is
                   right: Classes is a list of GROUPS, and
                   hanging a list of assignments off it makes the
                   screen about two unrelated nouns. The list
                   would also have been one level deeper than
                   anything else of its kind.

                   Library is where she sends material FROM, so
                   it is where she looks to find out what she has
                   already sent — the same instinct that puts
                   Sent next to Inbox rather than inside the
                   address book. And it costs no nav item, no new
                   screen and no new address: a fourth view of
                   the row she is already reading. */
                value: 'assigned',
                label: 'Assigned',
                count: assignments.length,
              },
              {
                value: 'saved',
                label: 'Saved',
                count: savedItems.length + savedLists.length,
              },
              /* ---- "Shared with you", not "Shared" ----
                 Three words where the others have one, and
                 worth every character. "Shared" on its own is
                 ambiguous in exactly the direction that
                 matters: it could as easily mean the things
                 SHE has shared out. A tab whose name leaves
                 you unsure which way the arrow points is a tab
                 you open once to find out. */
              {
                value: 'shared',
                label: 'Shared with you',
                count: sharedCount,
              },
            ]}
          />

          {view === 'browse' && <BrowseByUnit />}

          {view === 'recent' && (
            <section>
              <SectionHeader
                title="Recently opened"
                description="The last things you opened. The live product forgets all of this the moment you navigate away."
                action={<History className="h-4 w-4 text-ink-300" />}
              />
              <ResourceLayout>
                {recentItems.map((r) => (
                  <ResourceTile
                    key={r.id}
                    resource={r}
                    onPreview={setPreview}
                    showStandard
                  />
                ))}
              </ResourceLayout>
            </section>
          )}

          {view === 'assigned' && <Assigned onPreview={setPreview} />}

          {view === 'shared' && <SharedWithYou onPreview={setPreview} />}

          {view === 'saved' && (
            <div className="space-y-8">
              {/* ---- Playlists first ----
                  Yes, Saved holds playlists as well as loose
                  resources, and they go above them.

                  Assembling a playlist is the expensive part. A
                  teacher spends twenty minutes sequencing six
                  resources into a lesson; a single saved card
                  took her one click. If both were mixed into one
                  grid, the thing that took twenty minutes would
                  be indistinguishable from the thing that took a
                  second, and she'd hunt for it every time. */}
              <section>
                <SectionHeader
                  title="Saved playlists"
                  description="Lessons you've already sequenced. Open one to reuse it as it is, or change it before you send."
                  action={<ListMusic className="h-4 w-4 text-ink-300" />}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {savedLists.map((pl) => (
                    <SavedPlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onPreview={setPreview}
                    />
                  ))}
                </div>
              </section>

              <section>
                <SectionHeader
                  title="Saved resources"
                  description="Single pieces of material you've set aside but not assigned yet."
                  action={<BookMarked className="h-4 w-4 text-ink-300" />}
                />
                <ResourceLayout>
                  {savedItems.map((r) => (
                    <ResourceTile
                      key={r.id}
                      resource={r}
                      onPreview={setPreview}
                      showStandard
                    />
                  ))}
                </ResourceLayout>
              </section>
            </div>
          )}
        </>
      )}

      <PreviewOverlay resource={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

/* ------------------------------------------------------------
   BROWSE — one strand at a time
   ------------------------------------------------------------
   THE PROBLEM WITH THE LAST VERSION
   It laid all nineteen tested student expectations down the
   page in four sections. Which meant that to assign anything
   from Organisms and Environments — the last strand — a teacher
   scrolled past three strands she isn't teaching. Dhinesh
   caught it, and his instinct was right for a reason worth
   naming:

     A LIST IS A DECISION. Nineteen cards on screen asks the
     teacher to choose between nineteen things. She wasn't
     choosing between nineteen things. She was looking for one.

   WHAT REPLACED IT, AND WHY IT ISN'T JUST A FILTER
   A filter would have made her tell the product something it
   could already work out. A Grade 5 teacher follows a scope and
   sequence: she is on ONE unit for three or four weeks. So the
   page opens on the strand she is actually teaching — inferred
   from where her live assignments are — and shows only that.

   The result, for the common case: no scrolling, and no
   clicking either. She lands on the four or five TEKS she came
   for. For every other case it's one click on a chip.

   WHY THE CHIPS STAY VISIBLE RATHER THAN BECOMING A DROPDOWN
   Hiding the other strands behind a dropdown would save more
   space and cost more than it saves. The four strand names on
   screen ARE the table of contents — a teacher who has never
   used this can see the whole shape of the year in one glance
   without loading any of it. Visible but not rendered is the
   right trade; hidden behind a control is not.

   NOTE: there's deliberately no "show me everything" option.
   That's the long list that caused the problem, and putting it
   back as a chip invites the same failure. If a real teacher
   turns out to need the whole year at once for planning, it's
   a five-line addition — but let's find out first rather than
   assume.
   ------------------------------------------------------------ */
/* The sticky app header, and the air Dhinesh asked for beneath
   it. Named because three separate things now depend on the
   pair: where a pick scrolls to, how much runway the page needs
   to get there, and the comment explaining the second. */
const HEADER_H = 56
const PICKER_GAP = 40

function BrowseByUnit() {
  const { browse } = useApp()
  const current = currentUnitId()
  /* ---- NOTHING IS SELECTED WHEN THE PAGE OPENS ----
     This was `useState(current)` — the unit being taught this
     week, pre-selected, with its standards already listed.
     Reasonable, and it hid the one relationship the screen
     exists to express.

     Dhinesh showed this row to colleagues and they could not
     tell that Matter and Energy was selected, or that the rows
     underneath belonged to it. With a card already chosen on
     arrival there is no moment where anything changes, so the
     screen never demonstrates its own rule: nobody watches the
     list appear, so nobody learns it came from the card.

     Starting empty makes the first click teach it. One press,
     and three cards step back while a panel in that card's own
     colour opens underneath. After that the connection is
     known, and every later selection confirms it. */
  const [activeId, setActiveId] = useState(null)

  /* ============================================================
     PICKING A CATEGORY BRINGS THE PICKER TO THE TOP

     THE PROBLEM. The four illustrated cards cost about 180px
     before a single standard is visible, and above them sit the
     page title, the grade selector and the search box. Click
     "Force, Motion, and Energy" and the five TEKS you asked for
     open below the fold — so the answer to the click is
     off-screen, and the teacher's first move after every
     selection is to scroll.

     THE FIX IS NOT TO SHRINK ANYTHING. It is to put the thing
     she just used at the top of the window and let the rest of
     the page fall below it: the cards stay where she can change
     her mind, the standards fill the screen underneath, and the
     search box she is not using right now goes up out of the
     way. One scroll up brings it back — which is Dhinesh's
     point, and the reason this is safe. Nothing is removed,
     nothing is hidden behind a control; the page is just parked
     where the work is.

     WHY IT IS DRIVEN FROM THE HANDLER AND NOT AN EFFECT ON
     `activeId`. An effect would also fire on the first render,
     jerking the page down the moment Library opens — and it
     would NOT fire when she clicks the category that is already
     selected, which is exactly the case where she is most
     likely to be reaching for the list again. Scrolling where
     the click happens means the rule is "you pressed a
     category, here is the category", every time, with no
     exceptions to remember.
     ============================================================ */
  const pickerRef = useRef(null)

  function choose(id) {
    setActiveId(id)
    /* Next frame, so the card that just grew has been laid out
       before we measure. `scrollY` + `getBoundingClientRect`
       rather than `offsetTop`, because offsetTop is relative to
       the nearest positioned ancestor and this block has had
       three different ones during the redesign. */
    requestAnimationFrame(() => {
      const el = pickerRef.current
      if (!el) return
      /* 56 is the sticky header (h-14); 40 is the gap Dhinesh
         specified under it. Both live in HEADER_H / PICKER_GAP
         so the number in the scroll and the number in the
         runway below can never drift apart — the whole bug this
         replaced was two places disagreeing about how far the
         page could go. */
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - PICKER_GAP
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
  }

  /* One piece of state for both kinds of destination, because
     from the teacher's side it IS one choice — "what am I
     looking at". Two separate selections would let her pick a
     strand and a collection at once, which means nothing. */
  const activeCollection = getCollection(activeId)
  /* No fallback to the first unit any more. `null` is a real
     state on this screen now, and silently substituting a unit
     nobody picked is how the old default got here. */
  const unit = units.find((u) => u.id === activeId) ?? null

  return (
    /* ============================================================
       THE RUNWAY THAT MAKES THE SCROLL LAND

       Matter and Energy has four standards; Force, Motion and
       Energy has five. Dhinesh noticed the two don't come to
       rest in the same place, and the cause is not alignment —
       it is that the shorter page RUNS OUT OF SCROLL. I measured
       it: selecting Matter at a 900px window, the browser wants
       to go to 195 and can only reach 155, because 155 is the
       whole scrollable distance the document has. At a 1100px
       window neither category can move at all. The card was
       parked wherever the page happened to end, and the number
       of standards decided where that was.

       No amount of arithmetic in the scroll handler fixes this.
       A browser cannot scroll to a position that doesn't exist,
       so the position has to be made to exist: everything from
       the picker down is guaranteed at least a screen's worth of
       height, and then the target is always reachable and every
       category lands in exactly the same place.

       THE 13rem IS TWO NUMBERS ADDED UP, and they are written
       here because getting them wrong is silent:
         96px  HEADER_H + PICKER_GAP — the space above the cards
               once they have arrived
         112px <main>'s own pb-28, which already contributes
               scrollable height below this block
       Anything left over is blank space under the last standard
       on a short category, which is the honest price of "the
       selection always lands in the same place" and cheaper than
       the alternative of it never quite landing.
       ============================================================ */
    <div className="min-h-[calc(100vh-13rem)] space-y-6">
      {/* ============================================================
          THE SWITCHER  —  three groups, two rows
          ------------------------------------------------------------
          The previous version was eight chips in one wrapping row
          with two bare dividers between them, and Dhinesh called
          it clumsy. He was right, and the diagnosis is specific:
          a divider says "these are separate" without saying WHAT
          they are, so it adds a visual break and no meaning. And
          when the row wrapped, a divider ended up orphaned at the
          end of a line, separating nothing.

          What the three groups actually are:

            THE CURRICULUM   four strands, taught in sequence,
                             three or four weeks each. Used daily.
            ALL YEAR         two process strands, woven through
                             every unit rather than taught as one.
            COLLECTIONS      two standing sets you dip into —
                             practice tests before STAAR, design
                             challenges whenever.

          So: the four she uses daily get the top row at full
          weight. The four she uses occasionally share a second
          row at a smaller size, each half introduced by a short
          text label rather than a mute line.

          A LABEL BEATS A DIVIDER at the same width. "Taught all
          year" is about as wide as the divider plus the gaps it
          needed, and it answers the question the divider raised.

          WHY NOT A GROUP TAB BAR (pick a group, then a chip)?
          It would be tidier and it would cost a click on every
          journey to the second and third groups, to save space
          on a row that already fits. It would also put four
          names behind a control, which is the thing you've
          pushed back on twice. Everything here stays one click
          and stays on screen.
          ============================================================ */}
      {/* ============================================================
          TWO WAYS IN, SWITCHABLE
          ------------------------------------------------------------
          Same destinations, same content underneath — the only
          thing that changes is how the four content strands are
          offered.

            CHIPS  a row of names. Everything one click away and
                   almost no vertical space. Fastest for a teacher
                   who knows her year and is going somewhere
                   specific, which is most days.

            CARDS  the four strands as illustrated cards, with the
                   TEKS opening underneath the one she picks and
                   Challenges / Others below that. Slower to the
                   material — the grid costs about 180px before
                   she sees a single standard — but the shape of
                   the year is visible without reading, and it's
                   the version that answers "the product lost its
                   colours".

          The honest trade is speed against orientation, and it
          probably resolves differently for a teacher in her sixth
          year than for one in her first week. That's exactly the
          kind of question to put in front of the organisation
          rather than settle here.
          ============================================================ */}
      {browse === 'cards' ? (
        <div ref={pickerRef}>
          <CategoryCards
            activeId={activeId}
            setActiveId={choose}
            current={current}
          />

          {/* ---- The second tier, directly under the first ----
              Dhinesh moved this up from the bottom of the page,
              and the move is right for a reason worth stating:
              everything that answers "what am I looking at"
              should be in one place. Split across the top and
              bottom of a screen, the eight names weren't a
              navigation bar, they were two unrelated controls
              that happened to do the same job.

              ONE LEVEL DOWN, NOT FOUR. My first pass made these
              plain 32px chips, and next to four 168px
              illustrated cards they read as fine print —
              Dhinesh's word was "shadowed", which is exactly
              right. The gap between the tiers was so large that
              the second tier stopped looking like navigation at
              all.

              The fix is not to make them look like the cards.
              It's to give them enough presence to read as
              objects: 56px tall, a surface with a border and a
              shadow, an icon in its own tile, and a 14px name.
              They are now unmistakably a tier below — half the
              height, no colour field, no illustration — and
              unmistakably a tier, rather than a footnote.

              The distinction between the tiers is carried by
              MATERIAL, not by size alone. The cards are colour
              and picture; these are white and type. Even
              enlarged, nobody mistakes one for the other.

              NOT ALIGNED TO THE FOUR COLUMNS ABOVE, either, even
              though there happen to be four of them. That's the
              trap we just climbed out of with the standards
              list — a shared column grid says "this belongs to
              that", and STAAR Practice has nothing to do with
              Matter and Energy. They flow left to right at their
              own widths instead, which is what a row of
              unrelated chips should do. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <TierGroup label="Challenges">
              {collections.map((c) => (
                <SecondTierTile
                  key={c.id}
                  icon={collectionIcons[c.icon]}
                  label={c.short}
                  active={c.id === activeId}
                  onClick={() => choose(c.id)}
                />
              ))}
            </TierGroup>

            <TierGroup label="Others">
              {processUnits.map((u) => (
                <SecondTierTile
                  key={u.id}
                  icon={unitIcons[u.icon]}
                  label={u.name}
                  active={u.id === activeId}
                  onClick={() => choose(u.id)}
                />
              ))}
            </TierGroup>
          </div>
        </div>
      ) : (
      <div ref={pickerRef} className="space-y-2">
        {/* ---- The curriculum: what she teaches this month ----
            Labelled, after Dhinesh asked whether it needed one.
            It does, and not for symmetry with the row below —
            "OTHERS" is a relative word with no stated referent.
            Other than what? It only means something once the
            first group has a name, and until now that name
            existed only in the teacher's head.

            THE WORD MATTERS HERE. "TEKS strands" would be wrong:
            all six of the strands on this switcher are TEKS
            strands, including the two under Others. What
            separates these four is that they're the CONTENT
            strands — they map one-to-one onto the four STAAR
            reporting categories — while the other two are
            process strands, assessed inside content questions
            rather than on their own.

            Two defensible swaps, both one word long:
              "Units"                what a teacher says out
                                     loud, slightly loose.
              "Reporting categories" exactly right, but test
                                     vocabulary on a teaching
                                     screen.

            The indent this adds doesn't demote the row: these
            chips stay larger and the active one stays brand-
            filled, so the hierarchy is carried by size and
            colour rather than by where the row starts. */}
        <ChipGroup label="Categories">
          {contentUnits.map((u) => (
            <StrandChip
              key={u.id}
              unit={u}
              active={u.id === activeId}
              isCurrent={u.id === current}
              onClick={() => choose(u.id)}
            />
          ))}
        </ChipGroup>

        {/* ---- Everything else, quieter and labelled ----
            All four of these are now IDENTICAL in form: same
            size, same colours, same icon treatment. Only the
            group label above them differs.

            The previous version gave the two process strands a
            slightly different tint from the two collections,
            and Dhinesh spotted the shade. He's right that it
            was doing nothing: once a label says "Others" and
            another says "Challenges", the chips themselves have
            no distinction left to carry. A difference that
            isn't carrying meaning just reads as an
            inconsistency somebody forgot to fix.

            Same reason the dashed border went earlier. When a
            label and a visual treatment say the same thing, the
            label wins — it can be read. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <ChipGroup label="Challenges">
            {collections.map((c) => (
              <SubChip
                key={c.id}
                icon={collectionIcons[c.icon]}
                label={c.short}
                active={c.id === activeId}
                onClick={() => choose(c.id)}
              />
            ))}
          </ChipGroup>

          <ChipGroup label="Others">
            {processUnits.map((u) => (
              <SubChip
                key={u.id}
                icon={unitIcons[u.icon]}
                label={u.name}
                active={u.id === activeId}
                onClick={() => choose(u.id)}
              />
            ))}
          </ChipGroup>
        </div>
      </div>

      )}

      {activeCollection ? (
        <CollectionSection collection={activeCollection} />
      ) : unit ? (
        <UnitSection unit={unit} isCurrent={unit.id === current} hideRibbon={browse === 'cards'} />
      ) : (
        /* ---- THE WAITING STATE SAYS WHAT TO DO ----
           Not an illustration and not an apology. The screen is
           not broken or empty of content — it is holding, and
           one line naming the next move is the whole of what it
           owes her. Dashed rather than solid so it reads as a
           space waiting to be filled rather than as a card that
           failed to load. */
        <div className="rounded-card border border-dashed border-ink-300 px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink-700">
            Choose a category to see its standards
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            They will open here, in that category's colour.
          </p>
        </div>
      )}

    </div>
  )
}

/* ------------------------------------------------------------
   THE FOUR STRANDS AS CARDS
   ------------------------------------------------------------
   Each one is its own illustration, its own colour, and its own
   name — the same three things the ribbon carries, at a quarter
   of the width so all four fit on one row.

   THE SELECTED ONE IS NOT JUST DARKER. It gets a ring in its
   own hue, because with four saturated cards side by side
   "darker" is not a reliable signal — which of four strong
   colours looks most selected depends on the hue, not on the
   state. A ring is the same shape whatever colour it sits on,
   and the offset white gap makes it read at a glance.

   I tried a caret pointing down at the standards as well, to
   say the grid BELONGS to the selected card. It has to be
   clipped by the card's own overflow (which the bleeding
   artwork needs), so it never appeared — and on looking at it
   without, the ring plus the shared column position does the
   job. Two signals where one works is one too many anyway.
   ------------------------------------------------------------ */
function CategoryCards({ activeId, setActiveId, current }) {
  return (
    /* ---- THE GUTTER HAD TO GIVE ----
       Dhinesh asked for the selected card to grow 10–15%. At
       the old 16px gap that is arithmetically impossible to do
       cleanly: a 326px card growing a tenth puts 16px on each
       side, which is the entire gutter, and 15% overlaps its
       neighbours by 16px. Anything in between lands in the
       worst place of all — a few pixels of overlap, which reads
       as a rendering fault rather than as a card lifted in
       front of the others.

       THAT WAS THE WRONG TOOL, and it took three attempts to
       admit it. A transform paints a card larger without the
       layout knowing, so the extra pixels have to be stolen
       from a neighbour's gutter or spent outside the content
       column — and every origin I tried just moved the damage
       between those two. There is no setting that has neither,
       because the row was never given the space in the first
       place.

       So the width is LAYOUT now, not paint. At lg the row is
       a flex line and the selected card simply takes a larger
       share of it: `flex-[1.1]` against `flex-1`. The gutter
       is a real gap of exactly 24px between every pair, at
       every moment, because nothing is overlapping anything —
       the cards genuinely are those widths. The column edges
       are straight because no card extends past its own box.
       And the height grows the same way, from 168px to 185px,
       with the row centred so all four still share a centre
       line.

       THE ROW'S HEIGHT IS PINNED to the tallest state it can
       reach, 185px, and that is not a detail. Without it the
       row is as tall as whatever is currently selected, so
       clicking a card changed the row from 168 to 185 and shunted
       the Challenges strip and every standard beneath it down by
       17px — a jolt through the whole page, from a click that
       should have changed one card. Reserving the tall size
       once means the selected card grows into space the page
       has already set aside, and nothing below it ever moves.

       Same lesson as the playlist tray reserving its own height
       on <main>: anything that changes size has to declare its
       LARGEST size to whatever is laid out after it, or the
       rest of the page pays for the change.

       The cost is that the unselected cards are ~30px
       narrower than they would be if none were selected. That
       is the honest price of the effect and it is paid in the
       one place that can afford it, rather than in the gutter
       or the margin. 24px was then the largest gap that still
       leaves the narrow cards wide enough to hold "Organisms
       and Environments" on one line — the longest label in the
       data sets the floor, and the gutter gets what is left.

       THE BIG SCALE IS lg ONLY, because the geometry is not
       the same lower down. At two columns a card is over 400px
       wide, so the same tenth is 40px of growth against the
       same gutter — it would burst the row. The small-screen
       cards keep the 3.5% they have always had. A single
       number here would have been tidier to read and wrong on
       one of the two layouts. */
    <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:h-[185px] lg:items-center lg:gap-6">
      {contentUnits.map((u) => {
        const s = strandOf(u.id)
        const Icon = unitIcons[u.icon] ?? LayoutGrid
        const active = u.id === activeId
        const count = u.standards.length
        return (
          <button
            key={u.id}
            onClick={() => setActiveId(u.id)}
            aria-pressed={active}
            className={cx(
              'group relative flex h-[168px] flex-col justify-end overflow-hidden rounded-card text-left',
              'lg:min-w-0 lg:flex-1 lg:transition-[flex-grow,height] lg:duration-200',
              active && 'lg:h-[185px] lg:flex-[1.1]',
              /* ---- WHY THERE IS NO SCALE HERE ANY MORE ----
                 There was `origin-bottom`, then `origin-center`,
                 then `origin-[40%_50%]`, each one fixing what
                 the last one broke: bottoms aligned but centres
                 didn't, then centres aligned but the card left
                 the column, then it stayed in the column but
                 closed the gutter. Three fixes to the same
                 symptom is the signal that the diagnosis is
                 wrong — the transform was never going to work,
                 because a transform changes what is painted and
                 not what is laid out, and every pixel it adds
                 has to come out of somewhere the layout still
                 believes is occupied.

                 The small scale below survives only at phone
                 and tablet widths, where the row is a two-column
                 grid and there is no flex line to take a share
                 of. At 3.5% its growth is small enough to sit
                 inside the page padding without anyone noticing,
                 which is exactly the reason it was acceptable
                 there in the first place. */
              'transition-all duration-200',
              /* ---- AND NO SELECTION RING, IN THE END ----
                 This was `ring-2 ring-offset-2` in the strand
                 hue, then `ring-inset` (which Tailwind v4
                 silently ignores, so it drew a white ring
                 outside the card against a white page —
                 invisible), then `inset-ring-2`, which finally
                 rendered. And then Dhinesh circled two faint
                 vertical lines on the card's edges.

                 They were the ring. An inset ring paints on the
                 element's own background layer, UNDER its
                 children — and the artwork span is a child
                 covering the top 64% of the card. So the ring
                 was hidden for two thirds of the perimeter and
                 exposed for the rest: not a ring, two short
                 pale streaks near the bottom corners. It read
                 as a rendering artefact because that is exactly
                 what it was.

                 It could have been redrawn as an overlay above
                 the artwork, which was my first instinct. But
                 the reason it existed no longer holds. When
                 Dhinesh asked for a stronger selection he had a
                 card that looked identical to its neighbours —
                 "that one outline is not making it look like
                 it's selected, add some additional drop shadow
                 or make the card a little bigger." It is now a
                 tenth larger in both dimensions and carries the
                 deepest shadow in the product. The outline was
                 scaffolding for a signal that has since been
                 built properly, and the fourth attempt to make
                 scaffolding render correctly is a good moment
                 to ask whether it is still holding anything
                 up. */
              /* ---- THE OUTLINE IS BRAND INDIGO, AND OUTSIDE ----
                 Dhinesh asked for the brand colour, and that
                 decides where the outline can live. Indigo
                 cannot go INSIDE the card: the strand hues are
                 a purple, an orange, a navy and a green, and
                 indigo on navy is a line you cannot find. It
                 works against the white page, so it goes back
                 outside — which is where it started, six
                 versions ago, before the transform made outward
                 pixels expensive.

                 They are not expensive any more. The card is
                 sized by flex now rather than scaled, so a ring
                 is the only thing extending past the box: 4px
                 on each side, which narrows the two gutters
                 beside the selected card from 24px to 20px and
                 puts an end card 4px past the column edge.
                 Measured rather than assumed, and a third of
                 the 12px that was visibly wrong last time.

                 THE OFFSET IS WHAT MAKES IT READ. `ring-2`
                 alone would draw indigo hard against the card's
                 own edge, which looks like a border the card
                 came with. `ring-offset-2` puts 2px of page
                 colour between them, so the ring is plainly a
                 mark someone added rather than part of the
                 card. On a white page the offset is invisible
                 and the effect is an indigo outline floating
                 just off the card. */
              /* ---- DIMMING THE OTHERS WAS WRONG, AND THE REASON IS
                     SEMANTIC RATHER THAN AESTHETIC ----
                 The three unchosen cards briefly dropped to 55%
                 opacity and half saturation. It solved the
                 problem it was aimed at — selection finally read
                 as contrast across the row instead of as a mark
                 on one card — and it introduced a worse one.

                 Faded and desaturated is what every interface
                 means by DISABLED. These cards are nothing of
                 the kind: all four are live, and pressing any of
                 them is the whole point of the row. A signal
                 borrowed from another meaning does not stay
                 borrowed; a teacher who reads three strands as
                 unavailable has been told something false, and
                 she has been told it by the one convention she
                 can be relied on to know.

                 So they go back to full strength. What now
                 carries the selection is the ring, the size, the
                 shadow — and the thing that did not exist when
                 those were last judged: nothing is selected when
                 the page opens, so the first click visibly
                 produces the list. The relationship is taught by
                 the change rather than by the styling, which is
                 the cheaper teacher and the only one that was
                 actually missing. */
              active
                ? 'z-10 scale-[1.035] shadow-overlay ring-2 ring-brand-600 ring-offset-2 lg:scale-100'
                : 'shadow-card hover:shadow-raised lg:hover:brightness-110'
            )}
            style={{
              background: `linear-gradient(to bottom, ${s.hue} 0%, ${s.deep} 100%)`,
            }}
          >
            {/* The strand's drawing, bled to the top-right and
                cropped by the card. Same reasoning as the ribbon:
                a picture that fits inside its box is a sticker,
                one the card cuts off is the card's own surface. */}
            <span className="pointer-events-none absolute inset-x-0 -top-2 h-[64%]">
              <StrandArt unitId={u.id} />
              <span
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${s.deep}00 0%, ${s.deep}cc 62%, ${s.deep} 100%)`,
                }}
              />
            </span>

            {/* A flat scrim under the type only, not over the
                whole card — the picture can stay bright, the
                words get their contrast guaranteed. */}
            {/* items-CENTER, not items-end. The icon is a 36px
                square next to two lines of type, and aligning
                their bottoms hung it low — it read as having
                slipped rather than as belonging to the words.
                Centred, the block reads as one unit.

                The gap is 8px rather than 10 for a duller
                reason: those two pixels are what keep the
                longest strand name on one line at this column
                width. */}
            <span
              className="relative flex items-center gap-2 p-4"
              style={{ background: 'linear-gradient(to top, rgba(2,6,23,.45), rgba(2,6,23,0))' }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white/15 text-white ring-1 ring-white/25">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug text-white">
                  {u.name}
                </span>
                <span className="mt-0.5 block text-[12px] text-white/75">
                  TEKS {u.statement} · {count} standards
                </span>
              </span>
            </span>

            {u.id === current && (
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold text-ink-900">
                Teaching now
              </span>
            )}

          </button>
        )
      })}
    </div>
  )
}

/* ONE chip for everything on the second row — both collections
   and both process strands. Not two components that happen to
   look alike: one component, so they cannot drift apart later.

   Deliberately neutral in all three Look variants, including
   Colour and Imagery. These are the things a teacher reaches
   for occasionally; giving them strand hues would have put them
   in visual competition with the four she uses daily, which is
   the opposite of what the row is for. */
/* ------------------------------------------------------------
   THE SECOND TIER, IN THE CARDS BROWSE ONLY
   ------------------------------------------------------------
   A real tile rather than a chip. It exists because the chip
   version of this row is peer-to-peer with the strand chips
   above it, where a chip is the right weight — but in the cards
   version its neighbours are 168px of colour and illustration,
   and the same chip disappears.

   So this component is scoped to that one variant. The chip
   below is untouched, because in its own context it isn't
   broken. A shared component adjusted to suit its loudest
   caller is how both callers end up slightly wrong.
   ------------------------------------------------------------ */
function SecondTierTile({ icon: Icon = LayoutGrid, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex h-14 items-center gap-3 rounded-card border pl-3 pr-4 text-left transition-all',
        active
          ? 'border-brand-500 bg-brand-50 shadow-raised ring-1 ring-brand-500'
          : 'border-ink-200 bg-white shadow-card hover:border-ink-300 hover:shadow-raised'
      )}
    >
      <span
        className={cx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-control transition-colors',
          active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span
        className={cx(
          'text-sm font-semibold',
          active ? 'text-brand-800' : 'text-ink-800'
        )}
      >
        {label}
      </span>
    </button>
  )
}

/* The group label sits ABOVE its tiles here rather than beside
   them. Beside a 32px chip a label reads as part of the row; on
   a 56px tile it has to stack, or the row's height gets set by
   a word rather than by its contents. */
function TierGroup({ label, children }) {
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function SubChip({ icon: Icon = LayoutGrid, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-[12px] font-medium transition-colors',
        active
          ? 'border-ink-800 bg-ink-800 text-white'
          : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

/* No TEKS cards in between, because there is no TEKS in
   between. A full-length practice test doesn't belong to 5.6A,
   and Engineering Design challenges cut across every strand —
   so these browse straight to their resources. Forcing them
   through a standards layer would be inventing a level of
   hierarchy to match a screen rather than the content. */
function CollectionSection({ collection }) {
  const [preview, setPreview] = useState(null)
  const Icon = collectionIcons[collection.icon] ?? LayoutGrid

  return (
    <section>
      <div className="mb-4 flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-ink-100 text-ink-700">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink-900">
            {collection.name}
            <Badge tone="neutral">Not tied to one TEKS</Badge>
          </h2>
          <p className="mt-0.5 max-w-2xl text-[12px] leading-relaxed text-ink-500">
            {collection.blurb}
          </p>
        </div>
      </div>

      <ResourceLayout>
        {collection.resources.map((r) => (
          <ResourceTile key={r.id} resource={r} onPreview={setPreview} />
        ))}
      </ResourceLayout>

      <PreviewOverlay resource={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

/* ------------------------------------------------------------
   A SAVED PLAYLIST
   ------------------------------------------------------------
   Shows what's inside it rather than just its name. Same
   principle as the TEKS category cards: a teacher shouldn't
   have to open something to find out whether it's the thing she
   meant. Three items and a count is enough to recognise a
   lesson she built six months ago.
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   A SAVED PLAYLIST
   ------------------------------------------------------------
   Rebuilt after Dhinesh called it bland with no hierarchy, and
   he was right about both. Three things were wrong.

   NO SIZE DIFFERENCE ANYWHERE. Title, note, contents and meta
   were 14, 12, 12 and 12 — four blocks of near-identical grey
   text, so nothing told the eye where to land. The name is the
   only thing she recognises the lesson by, and it was competing
   with a sentence directly underneath it.

   THE NOTE WAS THE LOUDEST THING AFTER THE NAME, and it's the
   least useful. "Built for 3rd Period last year" is a footnote
   about the past; what she needs to know is what's IN it.

   THE CONTENTS WERE TRUNCATED at three of five, so the card
   showed most of a list and then apologised. With a cap of five
   resources the whole thing always fits — the truncation was
   inherited from a world where a playlist could be any length,
   and nobody noticed the rule had changed.

   So: name, then every resource in order, then the facts, then
   the actions. Four tiers that actually differ in weight.
   ------------------------------------------------------------ */
/* ---- ONE CARD, TWO OWNERS ----
   `sharedBy` is the whole difference between a lesson of hers
   and one a colleague sent. Everything above the buttons is
   identical — name, numbered resources, coloured codes, the
   count and the time — because it IS the same object, and a
   second component would have drifted from this one within a
   month the way the three playlist lists had already drifted
   from each other.

   What changes is the footer, and it changes for a reason
   rather than for variety: she cannot edit someone else's
   lesson in place, so Edit playlist is replaced by Save for
   later, which takes a copy that is hers to edit. */
function SavedPlaylistCard({ playlist, onPreview, sharedBy }) {
  const { loadPlaylist, removeSavedPlaylist, copySharedPlaylist, isCopied } = useApp()
  const items = playlist.resourceIds.map(getResource).filter(Boolean)
  const minutes = items.reduce((s, r) => s + (r.forStudents ? r.minutes : 0), 0)
  const copied = sharedBy ? isCopied(playlist.id) : false

  /* Assign was a dead button until now — a placeholder on the one
     control a teacher would press first, which is the particular
     kind of prototype rot that makes a demo fail on the first
     click. It opens the real dialog, carrying the playlist's id
     so that assigning it takes the card off the shelf. */
  const [assigning, setAssigning] = useState(false)

  return (
    <Card className="flex h-full flex-col p-4">
      <h3 className="text-base font-semibold leading-snug text-ink-900">
        {playlist.name}
      </h3>

      {/* ---- NO BYLINE ON THE CARD ----
          I built one — face, name and school under the title —
          on the reasoning that provenance is most of what she
          uses to decide whether to trust a colleague's lesson.
          That reasoning is right and the placement was wrong,
          which the screenshot showed and the tests could not:
          these cards sit UNDER a heading that already says
          "Marcus Webb · Grade 5 Science · Creekside
          Elementary", so both of his cards were repeating both
          lines of it, verbatim, two inches below.

          The same lesson as the tray handle a few changes ago.
          Two copies of one fact are not twice as clear — they
          read as two different things and send you looking for
          the difference. The fact belongs once, at the level
          that owns it, and here that is the group. */}

      {/* ---- Every resource, in order ----
          NUMBERED, because a playlist is a sequence and the
          order is the part that took her twenty minutes to work
          out. An unnumbered list of five is a set; a numbered
          one is a lesson.

          THE TYPE IS A COLOURED BADGE, not a word. "Instruction
          Module · Relative Density" spent two thirds of the line
          on the type and truncated the title, which is backwards
          — she's looking for the title. The short code in the
          type's own colour says the same thing in three
          characters and ties these rows to the resource cards
          she'll see next.

          It still has to be there at all: a module and its
          companion share a sub-topic name, so without the type a
          card shows "Relative Density" twice and looks broken.

          Each row opens the preview. */}
      <ol className="mt-3 space-y-1.5">
        {items.map((r, i) => {
          return (
            <li key={r.id}>
              <button
                onClick={() => onPreview?.(r)}
                title={`Preview ${r.shortTitle}`}
                className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-ink-50"
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
          )
        })}
      </ol>

      {/* ---- PROVENANCE MOVES WHEN OWNERSHIP DOES ----
          On a shared card, who sent it is a HEADLINE, sitting
          under the name with a face beside it, because it is
          most of what she uses to decide whether to trust the
          lesson. On her own copy of that same lesson it is a
          FOOTNOTE in the grey line, because the deciding is
          done — it is hers now, and the only job left is to
          answer "where did this come from" a year later when
          she cannot remember building it.

          Same fact, two weights, and the weight is set by what
          she is about to do with it rather than by the fact
          itself. It also stays out of the way of the earlier
          decision to strip descriptions off these cards:
          authorship is not a description. */}
      <p className="mt-3 text-[12px] text-ink-400">
        {items.length} resources
        {minutes > 0 && ` · ${minutes} min`} · {playlist.updated ?? playlist.shared}
        {!sharedBy && playlist.sharedFrom && ` · from ${playlist.sharedFrom}`}
      </p>

      {/* ---- ASSIGN IS PRIMARY HERE ----
          I had these as soft/ghost under the rule that a card
          which repeats shouldn't carry a solid fill, because
          three primaries in a row is none. Dhinesh overruled it
          and the exception is justified: these cards are a
          shortlist she deliberately built, and the entire reason
          a saved lesson exists is to be sent. Everywhere else a
          card is something she's deciding about; here it's
          something she already decided about.

          The rule still costs something — three indigo buttons
          in a row do compete — and the second action is a GHOST
          rather than a bordered secondary, which is what keeps
          the pair from reading as two competing boxes. One
          filled shape, one piece of text: the same treatment as
          Assign and Playlist on the resource cards, so a
          teacher meets the pattern once and it holds
          everywhere.

          "EDIT PLAYLIST", not "Open in playlist". The old label
          named the destination; the new one names the intent,
          and the intent is what she's choosing between. Assign
          it as it stands, or change it first. */}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" variant="primary" onClick={() => setAssigning(true)}>
          Assign
        </Button>

        {sharedBy ? (
          /* ---- NO EDIT BUTTON ON A COLLEAGUE'S LESSON ----
              Not a permissions nicety — a consequence of
              auto-save. Edits to an open lesson write through
              instantly now, so editing this one in place would
              silently rewrite what Marcus still sees. Save for
              later takes a copy; the copy is hers, and Edit
              playlist is waiting on it in Saved.

              Same words as everywhere else in the product. She
              already knows what "Save for later" does to a
              resource card, and it does the same thing here. */
          <Button
            size="sm"
            variant="ghost"
            icon={copied ? Check : Bookmark}
            disabled={copied}
            aria-label={
              copied
                ? 'Already saved to your playlists'
                : `Save a copy of ${playlist.name} to your playlists`
            }
            title={
              copied
                ? 'In Library › Saved — yours to edit'
                : 'Save a copy to your playlists'
            }
            onClick={() => copySharedPlaylist(playlist, sharedBy.name)}
            className={cx(copied && 'text-brand-700')}
          >
            {copied ? 'Saved' : 'Save for later'}
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => loadPlaylist(playlist.resourceIds, playlist.id)}
            >
              Edit playlist
            </Button>

            {/* The way back off the shelf. A save control with no
                matching remove turns Saved into a list that only
                ever grows, and a list that only grows stops being
                a shortlist. Same filled bookmark as the resource
                cards, so it reads as the same idea. */}
            <button
              onClick={() => removeSavedPlaylist(playlist.id)}
              aria-label="Remove from Saved"
              title="Saved — press to remove"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-brand-600 transition-colors hover:bg-ink-100"
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </button>
          </>
        )}
      </div>

      <AssignSheet
        open={assigning}
        onClose={() => setAssigning(false)}
        resourceIds={playlist.resourceIds}
        /* Only her OWN saved lesson comes off the shelf when it
           is assigned. Passing the id of a shared one would
           hand AssignSheet something to delete that isn't hers,
           and "assigning resolves later" is a rule about her
           shelf, not about her colleague's. */
        savedPlaylistId={sharedBy ? undefined : playlist.id}
        onAssigned={() => setAssigning(false)}
      />
    </Card>
  )
}

/* A label and its chips, kept together so they can't be split
   across a line break — the failure mode that made the old
   dividers look broken. */
function ChipGroup({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[12px] font-medium uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

function StrandChip({ unit, active, isCurrent, onClick }) {
  const { richness } = useApp()
  const s = strandOf(unit.id)

  /* In QUIET the chips are brand-coloured, because the strand
     has no identity of its own to express. In COLOUR and IMAGE
     it does — so the chip wears it.

     This is the argument for colour over photographs, made
     visible: the SAME hue that fills the tile also tints the
     chip, the section header and the card band. A photograph
     can only ever be on the tile. Colour follows the teacher
     through the product; a clownfish cannot. */
  const themed = richness !== 'quiet'

  const style = themed
    ? active
      ? { background: s.hue, borderColor: s.hue, color: '#fff' }
      : { background: s.tint, borderColor: s.ring, color: s.hue }
    : undefined

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={style}
      className={cx(
        'flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-[14px] font-medium transition-colors',
        themed
          ? 'hover:brightness-95'
          : active
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
      )}
    >
      {/* A dot, not a badge. It marks where she already is —
          useful to notice, never worth a label competing with
          the strand name. */}
      {isCurrent && (
        <span
          className={cx('h-1.5 w-1.5 shrink-0 rounded-full', !themed && (active ? 'bg-white' : 'bg-brand-500'))}
          style={themed ? { background: active ? '#fff' : s.hue } : undefined}
        />
      )}
      {unit.name}
    </button>
  )
}

function UnitSection({ unit, isCurrent, hideRibbon = false }) {
  const Icon = unitIcons[unit.icon] ?? LayoutGrid
  const { richness } = useApp()
  const s = strandOf(unit.id)
  /* Same test StandardGrid uses, so the panel and the rows
     inside it can never disagree about whether this screen is
     showing strand colour. */
  const themed = richness !== 'quiet'

  /* ---- IMAGE variant: the banner ----
     This is the closest thing in the redesign to the live
     product's category tile — full-bleed artwork, strand name
     over it, white type.

     The difference is the scrim. On the live screen the text
     sits directly on the photo, which is why "Force, Motion,
     and Energy" is currently unreadable against a pale sky.
     Here a dark gradient always sits between the picture and
     the words, so the contrast is guaranteed by construction
     rather than by luck with the photograph. */
  /* In the cards version the selected card IS the header — it
     carries the name, the colour, the picture and the "teaching
     now" flag. Drawing the ribbon underneath it would say all
     four things twice, six inches apart. */
  /* ---- THE PANEL CAME AND WENT, AND THAT IS THE RIGHT ENDING ----
     When Dhinesh's colleagues could not tell which card was
     selected, the fix had two halves: the three unchosen cards
     stepped back, and these rows gained a panel in the selected
     strand's own tones — a tint behind them, a border around
     them, a 3px bar of the hue along the top — so the list
     visibly belonged to the card.

     He looked at it and circled the bar: not needed. He is
     right, and the reason is worth keeping, because it is the
     same reason the ring failed earlier. Those two halves were
     never independent. Once three of four cards are dimmed, the
     selected card's colour is the ONLY strong colour left in
     the row — and the strand-coloured edge on every standard
     row below is then unmistakably the same colour as the one
     card still lit. The rows were already carrying the tether;
     the panel was a second copy of a signal that had started
     working on its own.

     So the colour he asked for is still here, in the row edges
     and the TEKS codes where it always was. What went is the
     block drawn around them. A fix that is only needed before
     another fix lands is scaffolding, and this file has now
     taken scaffolding down twice — first the selection ring,
     now this. Worth noticing as a pattern: when two changes
     ship together, check whether the second one is still doing
     anything before leaving it in. */
  if (hideRibbon) {
    const n = unit.standards.length
    return (
      <section aria-label={`${n} standards in ${unit.name}`}>
        <StandardGrid unit={unit} asList />
      </section>
    )
  }

  if (richness === 'image') {
    return (
      <section>
        <div
          className="relative mb-4 overflow-hidden rounded-card"
          style={{
            /* The strand's own colour at the left, falling into
               its deep tone by the time it reaches the picture.
               A banner that was dark all the way across would
               have thrown away the colour coding on the one
               screen where it matters most — the drawings are
               necessarily dark, so the hue has to come from
               somewhere else. */
            background: `linear-gradient(to right, ${s.hue} 0%, ${s.deep} 45%)`,
          }}
        >
          {/* The illustration is parked at the right in a box
              roughly its own shape, rather than stretched across
              the whole banner.

              This is a cropping problem, not a taste one. The
              banner is about seven times wider than it is tall
              and the drawing is two — stretch it across and you
              are looking at a thin horizontal slice of a flask
              rather than a flask. A ~340px box keeps the picture
              nearly uncropped, and the text then sits on flat
              colour where contrast is a fixed number.

              The banner's background is the strand's `deep`,
              which is exactly the colour the drawing's own
              background ends on — so the fade below has nothing
              to hide and there's no visible seam.

              A MINIMUM HEIGHT, because the paragraph that used
              to set this banner's height has gone. The drawing
              is 2:1; the banner without that line is nearer 6:1,
              and `slice` then shows a thin horizontal band of a
              flask rather than a flask. The floor gives the
              picture back roughly the room it was designed for —
              the height was never really coming from the
              sentence, the sentence just happened to be what was
              holding it open.

              I took this out once, reading "imagery" in Dhinesh's
              note as covering the drawing as well as the card
              text. It didn't: he wanted the descriptions gone and
              the pictures kept. Worth recording because the two
              are genuinely different decisions — the paragraphs
              were repeated, near-identical and in the way; the
              illustration appears once per strand and is the only
              thing on the screen that isn't words. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[300px] lg:block">
            <StrandArt unitId={unit.id} />
            <span
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${s.deep} 0%, ${s.deep}bb 20%, transparent 58%)`,
              }}
            />
          </div>

          {/* A much lighter scrim than the card version needs.
              The background behind this text is a colour I chose
              rather than a photograph, so the scrim only has to
              cover the gap between the lightest strand hue and
              the contrast floor — not guard against an unknown
              image. Any heavier and the strand colour stops
              being visible, which would defeat the banner. */}
          <div
            className="relative flex min-h-[112px] items-center p-5"
            style={{
              background:
                'linear-gradient(to right, rgba(2,6,23,.42) 0%, rgba(2,6,23,.34) 55%, transparent 80%)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-white/15 text-white ring-1 ring-white/25">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-white">
                  {unit.name}
                  <span className="text-[12px] font-normal text-white/70">
                    TEKS {unit.statement}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold text-ink-900">
                      You're teaching this now
                    </span>
                  )}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <StandardGrid unit={unit} />
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-start gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700"
          style={richness === 'colour' ? { background: s.tint, color: s.hue } : undefined}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink-900">
            {unit.name}
            <span className="text-[12px] font-normal text-ink-400">
              TEKS {unit.statement}
            </span>
            {isCurrent && <Badge tone="brand">You're teaching this now</Badge>}
          </h2>
        </div>
      </div>

      <StandardGrid unit={unit} />
    </section>
  )
}

/* ------------------------------------------------------------
   THE TEKS CARDS
   ------------------------------------------------------------
   Pulled out of UnitSection so all three variants share exactly
   the same cards, and the only thing that changes between them
   is how much colour those cards carry. If the grid were
   duplicated per variant they'd drift apart within a week and
   the comparison would stop being fair.

   ------------------------------------------------------------
   WHAT CAME OFF THESE CARDS, AND WHY

   They used to carry seven things. Dhinesh asked what two of
   them were for, under one test: does this change what the
   teacher does next? Neither survived it.

   1. THE "STAAR" BADGE. It appeared on every card in every
      content strand — 4 of 4, 5 of 5, 5 of 5, 5 of 5 — and on
      none at all in the two process strands, where those cards
      say "taught throughout" instead. So on the screen where it
      showed, it was constant; on the screen where it would have
      varied, it was absent.

      That is precisely the failure I criticised in the live
      product's "78 Resources" on eight identical tiles, and I
      shipped it three cards later. A value that never differs
      across the choice set cannot help anyone choose. It also
      wasn't free: it was amber, the colour that means "this
      class is slipping" everywhere else, so four of them pulled
      the eye to the top of a grid to say nothing.

      Worth revisiting properly one day: STAAR distinguishes
      Readiness from Supporting standards, and THAT varies per
      standard and does change how a teacher spends her time.
      Modelling it as a flat tested true/false was the wrong
      granularity. A badge on some cards would earn its place; a
      badge on all of them never will.

   2. THE CLASS AVERAGE. The idea was right and I'd argue for it
      again — in the live product, content and outcomes sit in
      separate tabs, so a teacher browsing material gets no hint
      that her classes struggled here. But look at what it
      rendered: 67, 68, 68, 70. A three-point spread. No teacher
      does anything differently at 67 than at 70.

      And she is on this screen to find the TEKS she teaches
      Tuesday, which her scope and sequence already decided. The
      number arrived at a moment when it could not change
      anything.

      Worse, "your classes" was an average across all five
      periods, which hides the only interesting fact in it —
      3rd Period at 72%, 4th at 62%. Averaging classes together
      produces the least actionable form of the data.

   WHAT REPLACED IT: nothing, on a normal day. The full picture,
   per class, still sits on the TEKS detail page one click away,
   which is the moment it can actually be acted on — she's
   choosing a resource there and can pick a remedial one.

   On the grid there is now an exception flag instead, shown
   only when a standard sits well below the rest of its own
   strand. A number that always appears is wallpaper. A flag
   that rarely appears is a signal, and it costs nothing on the
   days when nothing is wrong.
   ------------------------------------------------------------ */

/* ---- One column of the stat block on a TEKS row ----
   Fixed width per column, passed in rather than measured, so
   the three stacks align down every row of a unit. Auto width
   would let "6th Period 64%" and "2nd Period 69%" sit a few
   pixels apart and the column would waver — which reads as
   sloppiness long before anyone works out why.

   EACH WIDTH IS SET BY ITS CAPTION, not by its value. The
   first column was sized to "3 of 5" and "Classes assigned"
   wrapped onto two lines under it, which dropped that
   caption a line below the other two and broke the one
   alignment the whole layout depends on. The caption is the
   longest thing in every column, so the caption is what the
   column has to fit. */
function Stat({ value, caption, width }) {
  return (
    <div className={cx('shrink-0', width)}>
      <div className="leading-tight">{value}</div>
      <p className="mt-0.5 text-[12px] leading-tight text-ink-500">{caption}</p>
    </div>
  )
}

function StandardGrid({ unit, asList = false }) {
  const { richness } = useApp()
  const s = strandOf(unit.id)
  const themed = richness !== 'quiet'

  /* ---- ROWS, NOT A SECOND GRID OF FOUR ----
     In the cards version the standards used to sit in a
     four-column grid directly beneath four category cards, and
     Dhinesh read it exactly as the layout said: 5.6A belongs to
     Matter and Energy, 5.6B to Force and Motion, and so on.

     That reading is the layout's fault, not his. Two grids of
     the same width, stacked, with matching column edges, is the
     visual grammar of a table — column position means
     something. It happened to be four and four here; with five
     standards it would have been four and five, which would
     have looked broken instead of wrong, and broken is the
     luckier failure because somebody notices.

     A list breaks the alignment completely. Nothing in a row
     lines up with a card above it, so there's no column to
     read meaning into, and the generous gap between rows says
     these are siblings of each other rather than children of
     anything. It also suits the content better: a standard is a
     code and a sentence, which is a line, not a box.

     The hue moves from a bar across the top to a bar down the
     left edge, for the plain reason that a row is wide and
     short — the same 6px of colour reads as a stripe across the
     top of a wide row and as an accent down the side. */
  if (asList) {
    return (
      <div className="space-y-2.5">
        {unit.standards.map((std) => {
          const count = resourcesForStandard(std.id).length
          const perf = assignedPerformanceFor(std.id)
          return (
            <Link key={std.id} to={`/teach/${std.id}`} className="block">
              <Card
                interactive
                className="relative flex items-center gap-4 overflow-hidden py-4 pl-5 pr-4"
              >
                {themed && (
                  <span
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ background: s.hue }}
                  />
                )}
                <span
                  className="w-14 shrink-0 text-sm font-semibold tracking-tight text-ink-500"
                  style={themed ? { color: s.hue } : undefined}
                >
                  {std.id}
                </span>

                {/* ---- TITLE OVER COUNT, NOT TITLE BESIDE COUNT ----
                    The count used to sit at the far right, which
                    put the least important fact on the row in the
                    most valuable position — the end of the line,
                    where the eye stops. Stacked under the title it
                    reads as what it is: a detail about the thing
                    named above it, not a column of its own.

                    That also frees the right edge for a number
                    that has earned it. */}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {std.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-500">
                    {count} resources
                  </span>
                </span>

                {/* ---- THREE STATS, VALUE OVER LABEL ----
                    Dhinesh's layout, and it beats the sentence
                    it replaces. A sentence has to be read; three
                    stacks of value-over-label can be scanned,
                    and because the columns are fixed width the
                    percentages line up down the whole unit — so
                    the weak standard is the one that catches
                    your eye rather than the one you work out.

                    WHY THE FIRST VALUE IS NOT COLOURED. Bold,
                    yes. But colour in this product means
                    good / watch / alert, and "3 of 5 classes"
                    is none of those — a teacher part-way
                    through a unit has assigned it to some of
                    her sections, which is a fact, not a
                    problem. Colouring it would invent an alarm.
                    Colour is reserved for the two figures where
                    it means something.

                    WHY NOT "CLASS NEEDING ATTENTION", which was
                    the proposed caption. It is the better idea
                    and the wrong word for this data: the gap
                    between her best and worst section runs 0 to
                    6 points across every standard she has
                    assigned. Calling a class three points below
                    average "needing attention" is the same
                    fault as "20pts behind" wearing the opposite
                    costume — a label that sounds urgent about
                    something that isn't, on every row, until it
                    means nothing anywhere.

                    So the caption stays honest and the COLOUR
                    does the judging: 4th Period at 78% reads
                    green, 3rd Period at 51% reads red. She gets
                    the alarm exactly when it is warranted, from
                    the thing that only fires when it is.

                    A column header has to mean the same on
                    every row or it stops being a header and
                    becomes something you re-read each time. */}
                <div className="flex w-[356px] shrink-0 items-start justify-end gap-6 text-center">
                  {perf ? (
                    <>
                      <Stat
                        caption="Classes assigned"
                        width="w-[110px]"
                        value={
                          <span className="text-sm font-semibold text-ink-900">
                            {perf.classCount} of {classes.length}
                          </span>
                        }
                      />
                      <Stat
                        caption="Average"
                        width="w-[60px]"
                        value={<Score value={perf.average} size="sm" />}
                      />
                      {/* One class assigned means no "lowest" to
                          report — it is the same class as the
                          average. A dash rather than repeating
                          the figure, and the first column
                          already says "1 of 5", which explains
                          the dash without a second sentence. */}
                      <Stat
                        caption="Lowest class"
                        width="w-[132px]"
                        value={
                          perf.classCount > 1 ? (
                            <span className="text-sm font-semibold text-ink-900">
                              {perf.lowest.name}{' '}
                              <Score value={perf.lowest.avg} size="sm" />
                            </span>
                          ) : (
                            <span className="text-sm text-ink-300">—</span>
                          )
                        }
                      />
                    </>
                  ) : (
                    /* The unassigned row keeps the same
                       footprint, so titles truncate at the same
                       point and nothing shifts down the list. */
                    <p className="self-center text-[12px] text-ink-400">
                      Not assigned to a class yet
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    /* FOUR across, not three. The resource grids stay at three —
       those cards carry a thumbnail, a title and five controls,
       and they need the width. A TEKS card carries three short
       lines, so at three across it was mostly margin. */
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {unit.standards.map((std) => {
        const count = resourcesForStandard(std.id).length
        return (
          <Link key={std.id} to={`/teach/${std.id}`}>
            <Card interactive className="flex h-full flex-col overflow-hidden">
              {/* The strand's hue as a band across the top. In
                  QUIET there's no band at all — the card is
                  white and the type carries it. */}
              {themed && <span className="block h-1.5 w-full" style={{ background: s.hue }} />}

              {/* Roomier than the content strictly needs, and
                  deliberately so. With the curriculum paragraph
                  gone these cards had shrunk to three short lines
                  and read as a list of chips rather than a set of
                  things to choose between — a card that is only
                  as tall as its text stops looking like an object
                  you can press.

                  The height comes from padding and a floor, not
                  from putting content back. Same move as the
                  resource tiles: when something feels thin, give
                  it air, not filler. */}
              {/* ---- NO PICTURE, AND NO HEIGHT TO FILL ----
                  This card went through two answers to "it looks
                  empty" — a line drawing, then a fuller one in
                  grey — and both were the same mistake made
                  twice: treating empty space as a hole to plug
                  rather than as evidence.

                  The card holds a code, a title and a count.
                  That is genuinely all a teacher needs to pick
                  one, and everything else we tried to add either
                  repeated itself across all four cards (the TEKS
                  statement, "Assessed on STAAR") or was drawn
                  rather than known (the illustration). A card
                  that looks empty is usually the wrong SIZE, not
                  the wrong content.

                  So: no floor, tighter padding, and four across
                  instead of three. The page ends up denser and
                  more of the strand fits above the fold, which
                  is worth more than anything we were going to
                  put in that corner. */}
              <div className="flex flex-1 flex-col p-4">

                <div className="flex items-start justify-between gap-2">
                  {/* Same size and weight as the title below it.
                      The code and the title are one label read as
                      a pair — "5.7A, equal and unequal forces" —
                      and setting the code three steps smaller was
                      demoting the half of that pair a teacher
                      scans for. Most of them know their scope and
                      sequence by code before they know it by
                      name.

                      No pill behind it any more, for two reasons.
                      At this size it doesn't need one: weight and
                      colour already separate it from the
                      description. And a pill is a container, which
                      implies a tag or a control — this is neither,
                      it's a name. Most of all, the exception flag
                      to the right IS a pill, and it should be the
                      only one on the card. Two pills side by side
                      read as two things of the same kind, which
                      quietly costs the flag the distinctiveness
                      that makes it work. */}
                  <span
                    className="text-sm font-semibold tracking-tight text-ink-500"
                    style={themed ? { color: s.hue } : undefined}
                  >
                    {std.id}
                  </span>

                  {/* ---- THE LAGGING FLAG HAS GONE TOO ----
                      Dhinesh asked what "20 pts behind" meant,
                      which was the answer: if the person who
                      designed a label has to explain it, the
                      label has already failed.

                      Three faults, and they compound. "Behind"
                      never said behind WHAT — the strand, as it
                      happens, but nothing on the card said so.
                      "pts" reads as gradebook points in a
                      school, not percentage points of mastery.
                      And the number was unusable on its own:
                      to do anything with "20" she'd need the
                      strand average, which isn't on the screen.

                      I'd defend the IDEA — exception reporting,
                      a card that says nothing until there's
                      something to say. But this execution put a
                      red alert on a browsing screen, in a
                      vocabulary the reader had to decode, at the
                      moment she was looking for Tuesday's
                      lesson rather than deciding what to
                      reteach. Reports is where that question
                      gets asked and answered properly, with all
                      five classes side by side.

                      What's left on this card: a code, a title,
                      a count. */}
                </div>

                {/* ---- NO CURRICULUM TEXT ON THE CARD ----
                    Two lines of TEKS language on four cards is
                    eight lines of near-identical statutory prose
                    a teacher reads past to reach four short
                    names. She already knows what 5.6A covers —
                    the code and the title ARE the recall cue;
                    the paragraph is the legal wording of
                    something she teaches every year.

                    It hasn't been deleted from the product. The
                    full statement is on the TEKS page, one click
                    away, which is where she'd go if she ever did
                    want to read it — and on that page it's the
                    subject rather than a wall to scan past.

                    Same rule that took the blurbs off the
                    resource cards and the percentages off this
                    grid: content that is the same everywhere
                    shouldn't be shown everywhere. */}
                <h3 className="mt-2 text-sm font-semibold leading-snug text-ink-900">
                  {std.title}
                </h3>

                {/* One line, one fact, and it varies per card.
                    This is what's left of "78 Resources" on eight
                    identical tiles — the number that actually
                    differs. */}
                <div className="relative mt-auto flex items-end justify-between gap-3 pt-4">
                  <span className="text-[12px] text-ink-500">{count} resources</span>
                  {!std.tested && (
                    <span className="text-[12px] text-ink-400">taught throughout</span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

/* ============================================================
   SHARED WITH YOU
   ------------------------------------------------------------
   What colleagues have sent her, grouped under the person who
   sent it.

   GROUPED BY TEACHER RATHER THAN BY KIND. Saved splits
   playlists from loose resources, because there the question
   is "what did I set aside" and a lesson she spent twenty
   minutes on should not sit in the same grid as a one-click
   bookmark. Here the first question is a different one —
   "what did Marcus send me" — and provenance is the thing she
   sorts by. Same material, different organising fact, because
   the question changed.

   THE DROPDOWN IS A FILTER, NOT A GATE. Dhinesh's call, and
   the right one: she may not know whose lesson she is after,
   only that somebody sent her a water-cycle thing. A dropdown
   that must be answered before anything appears hides the
   answer behind the question. So she lands on everything, and
   narrows only when the page is long enough to need it —
   which is also why the control does not appear at all until
   more than one colleague has shared.

   NOTHING IS EDITED HERE. Every action either sends the
   material out (Assign) or takes a copy into her own shelf
   (Save for later). The originals belong to someone else and
   stay exactly as they were sent — see the note in store.jsx
   for why auto-save made that boundary non-negotiable.
   ============================================================ */
/* ============================================================
   ASSIGNED
   ------------------------------------------------------------
   Everything she has sent, from the screen she sent it from —
   rebuilt against the live product's Workspace › Assigned,
   which models this better than my first pass did.

   WHAT THE LIVE SCREEN GETS RIGHT, AND I HAD FLATTENED
   An assignment is not one thing with one deadline. It is a set
   of DELIVERIES: a card per class, each with its own window,
   its own population and its own progress. The live product
   shows 8/10 Students and Aug 19 → Aug 30 per group, marks a
   group added later as "Newly Assigned", and offers to catch up
   children who joined after it went out. All three are real
   facts about teaching that a single due date cannot hold, and
   all three are now in the data — see `perClass` in mock.js.

   WHAT I CHANGED, AND WHY
   The live screen hides the whole per-class breakdown behind an
   "Assigned to 5 Groups • 35 Students" expander, so the state
   of every assignment is one click away. Here it is open. The
   count is still there as a heading, so nothing is lost; what
   goes is the click, and the eleven other clicks on a page of
   twelve assignments.

   THREE GROUPS, ALL VISIBLE
   Live, Upcoming, Closed as headings rather than as a filter
   row. A filter would be one more control on a screen that
   already carries a search, a grade picker, a language toggle
   and five tabs — and it would hide two thirds of the answer
   behind a click, which is the thing this redesign keeps
   refusing to do.

   The grouping reads per class, not off the assignment's own
   status field: an assignment is Live while ANY class still has
   it open, because the question this screen answers is "is
   there anything outstanding on this".
   ============================================================ */
function Assigned({ onPreview }) {
  const { assignmentList, duplicateAssignment } = useApp()
  const [assigningMore, setAssigningMore] = useState(null)
  const [catchingUp, setCatchingUp] = useState(null)
  const [sharing, setSharing] = useState(null)
  const [unassigning, setUnassigning] = useState(null)
  /* One dialog for the whole tab rather than one per row. There
     can only ever be one open, and hoisting it means a row does
     not have to carry state for something that is not on it. */
  const [viewingWindows, setViewingWindows] = useState(null)
  const [viewingClasses, setViewingClasses] = useState(null)
  /* ---- A COPY HAS TO ANNOUNCE ITSELF ----
     Duplicate puts a new card at the top of Live, and without a
     mark the only evidence anything happened is a list that is
     one longer than it was — which she will not notice, and
     will press again. The ring clears itself after a few
     seconds: it says "this one, here", not a status the card
     should wear for the rest of the session. The same pattern
     as a newly created class. */
  const [justCopied, setJustCopied] = useState(null)
  useEffect(() => {
    if (!justCopied) return
    const t = setTimeout(() => setJustCopied(null), 4000)
    return () => clearTimeout(t)
  }, [justCopied])

  const groups = useMemo(() => {
    const by = (state) => assignments.filter((a) => statusOf(a) === state)
    const live = by('live')
      .slice()
      .sort((a, b) => daysUntil(a.due) - daysUntil(b.due))
    const upcoming = by('upcoming')
      .slice()
      .sort((a, b) => daysUntil(a.start) - daysUntil(b.start))
    const closed = by('closed')
      .slice()
      .sort((a, b) => b.due.localeCompare(a.due))
    return [
      {
        key: 'live',
        title: 'Live',
        description: 'Open with at least one class. Soonest deadline first.',
        rows: live,
      },
      {
        key: 'upcoming',
        title: 'Upcoming',
        description: 'Set up, not yet open to students.',
        rows: upcoming,
      },
      {
        key: 'closed',
        title: 'Closed',
        description: 'Every class is past its due date. Most recent first.',
        rows: closed,
      },
    ].filter((g) => g.rows.length > 0)
  }, [assignmentList])

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="You haven't assigned anything yet"
        description="Find material in Browse, stack it into a playlist, and send it to a class."
      />
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.key}>
          <SectionHeader title={g.title} count={g.rows.length} description={g.description} />
          {/* ---- THREE UP, NOT A STACK ----
             Dhinesh's call. A full-width row for an assignment
             was spending twelve hundred pixels on a title, a
             date and three buttons, and the empty middle made
             twelve assignments look like a very long list of
             very little. Three to a row puts a term's work on
             one screen.

             What it costs is the inline class breakdown — there
             is no room for a four-column table in a 440px card
             — so that moves into a dialog, which is where the
             due-date breakdown already went for the same
             reason. The card keeps the SUMMARY, which is the
             part a teacher scans; the detail is a click away
             and no longer pushes fourteen other cards down the
             page when she opens it. */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.rows.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onAssignMore={() => setAssigningMore(a)}
                onCatchUp={(cid) => setCatchingUp({ assignment: a, classId: cid })}
                onShare={() => setSharing(a)}
                onDuplicate={() => {
                  const copy = duplicateAssignment(a.id)
                  if (copy) setJustCopied(copy.id)
                }}
                onUnassign={() => setUnassigning(a)}
                onShowWindows={(cid) => setViewingWindows({ assignment: a, classId: cid })}
                onShowClasses={() => setViewingClasses(a)}
                onPreview={onPreview}
                highlight={a.id === justCopied}
              />
            ))}
          </div>
        </section>
      ))}

      {/* ---- THE SAME DIALOG, NOT A SECOND ONE ----
          Dhinesh's call. I had built a smaller "give this to
          another class" sheet, which meant the same question got
          two different screens depending on where she started —
          and the smaller one quietly lacked the resource list,
          the ordering, the instructions and the student picker
          that she already knows are there. Assign is Assign; it
          is told that this assignment exists and locks the
          classes that already have it. */}
      {assigningMore && (
        <AssignSheet
          open
          assignment={assigningMore}
          resourceIds={assigningMore.resourceIds}
          onClose={() => setAssigningMore(null)}
          onAssigned={() => setAssigningMore(null)}
        />
      )}
      <CatchUpDialog
        open={!!catchingUp}
        assignment={catchingUp?.assignment}
        classId={catchingUp?.classId}
        onClose={() => setCatchingUp(null)}
      />
      <ShareAssignmentDialog assignment={sharing} onClose={() => setSharing(null)} />
      <UnassignConfirm
        assignment={unassigning}
        onClose={() => setUnassigning(null)}
      />
      <ClassesDialog
        assignment={viewingClasses}
        onClose={() => setViewingClasses(null)}
        onCatchUp={(cid) =>
          setCatchingUp({ assignment: viewingClasses, classId: cid })
        }
        onShowWindows={(cid) =>
          setViewingWindows({ assignment: viewingClasses, classId: cid })
        }
      />
      <WindowsDialog
        assignment={viewingWindows?.assignment}
        classId={viewingWindows?.classId}
        onClose={() => setViewingWindows(null)}
        /* Closes itself before opening the next one. Two stacked
           dialogs would leave her looking at the roster THROUGH
           the assign sheet, and backing out of the second would
           drop her on a list that is now out of date. */
        onAssignNewcomers={() => {
          const ctx = viewingWindows
          setViewingWindows(null)
          setCatchingUp({ assignment: ctx.assignment, classId: ctx.classId })
        }}
      />
    </div>
  )
}

/* ---- ONE ASSIGNMENT ----
   Header: what it is. Body: who has it, one card per class.
   Assign sits in the header because it edits the body — the
   same placement the live product uses, and the reason it needs
   no explanation. */
function AssignmentCard({
  assignment: a,
  onAssignMore,
  onShare,
  onDuplicate,
  onUnassign,
  onShowClasses,
  onPreview,
  highlight,
}) {
  const everyoneHasIt = classesNotOnAssignment(a.id).length === 0
  const reach = a.classIds.reduce((n, cid) => n + reachedIn(a, cid).length, 0)
  const waiting = a.classIds.reduce((n, cid) => n + newcomersIn(a, cid).length, 0)
  const items = a.resourceIds.map(getResource).filter(Boolean)
  const minutes = items.reduce((n, r) => n + (r.forStudents ? r.minutes : 0), 0)

  return (
    /* ============================================================
       THE SAME CARD AS A SAVED LESSON
       ------------------------------------------------------------
       Dhinesh's call, and it closes a gap I had left open. A
       saved playlist and an assignment are the same five
       resources in the same order — one still on the shelf, one
       already sent — and they were wearing two different cards.
       A teacher meeting both in the same Library should not have
       to learn the shape twice.

       It also removes a click I had just added. The card used to
       open a dialog to answer "what is in this"; now the answer
       is on the card, which is what Saved has always done and
       what makes that tab readable at a glance. The playlist cap
       of five is what makes that safe — the list can never run
       long enough to need collapsing, a rule set two months ago
       paying off in a place it was not written for.

       What stays behind a click is who has it, because that is
       the part that can run to fifteen rows.
       ============================================================ */
    /* ---- ONE HEIGHT FOR EVERY CARD ----
       Set to what a FIVE-resource assignment needs, because
       five is the cap and therefore the tallest a card can ever
       be: 25px a row, 6px between, plus the chrome. Cards in a
       grid were already stretching to match their own row, so a
       row of short ones sat tight and the row below it sat tall,
       and the page read as two grids rather than one.

       It is a min, not a fixed height, so a title that wraps to
       two lines still grows the card rather than clipping. The
       point is a floor that the commonest cases all reach, not
       a cage. */
    <Card
      className={cx(
        'flex h-full min-h-[348px] flex-col p-4 transition-shadow',
        highlight && 'ring-2 ring-brand-500 ring-offset-2'
      )}
    >
      <h3 className="text-base font-semibold leading-snug text-ink-900">{a.title}</h3>

      {/* ---- EVERY RESOURCE, IN ORDER ----
          Numbered, because an assignment is a sequence and the
          order is the part she worked out. The type is a
          coloured badge rather than a word, for the reason the
          saved cards use one: a module and its companion share a
          sub-topic name, so without the type the card shows
          "Relative Density" twice and looks broken — and
          spelling it out would spend two thirds of the line on
          the type and truncate the title she is looking for.

          Each row opens the preview, exactly as it does on a
          saved lesson. */}
      <ol className="mt-3 space-y-1.5">
        {items.map((r, i) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onPreview?.(r)}
              title={`Preview ${r.shortTitle}`}
              className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-ink-50"
            >
              <span className="tnum w-3 shrink-0 text-[12px] text-ink-400">{i + 1}</span>
              <TypeBadge type={r.type} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink-800">
                {r.shortTitle}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* The grey line a saved card carries, with "Created"
          where that one says "Saved" — the one fact that differs
          between a lesson on the shelf and a lesson that has
          gone out. */}
      <p className="mt-3 text-[12px] text-ink-400">
        {items.length} {items.length === 1 ? 'resource' : 'resources'}
        {minutes > 0 && ` · ${minutes} min`} · Created {onDate(a.created ?? a.start)}
      </p>

      {/* ---- ONE LINE, AND IT OPENS ----
          Who has this is the only thing on the card that can run
          to fifteen rows, so it stays a summary with a way in.
          The "Needs action" chip rides on the closed state: the
          detail can wait behind a click, the thing asking
          something of her cannot.

          ---- IT SITS WITH THE ACTIONS, NOT WITH THE RESOURCES ----
          `mt-auto` moves it to the foot of the card, so the slack
          from a one-resource assignment opens up ABOVE it rather
          than below. It belongs there: the resource list and the
          grey line under it describe what the assignment IS; who
          has it and what you can do about it are both about what
          has happened to it. Grouping them puts the two halves
          of the card in the order a teacher reads them, and it
          lines the control up across every card in the row
          instead of floating it wherever the list happened to
          end.

          ---- IT IS THE HEAVIEST THING ON THE CARD, AND IT IS INDIGO ----
          This row carries the card's emphasis, because the
          sending already happened and "who has it" is the only
          live question left.

          A detour worth writing down, because I argued myself
          into the wrong answer and had to be pulled out of it.
          I made this indigo, Dhinesh asked whether it had to be,
          I read that as "take it off" and rebuilt it in grey —
          reasoning that indigo is the ACTION colour (Assign, the
          Today links, every dialog's primary) and that a summary
          wearing it would teach a teacher the wrong thing. He
          meant the opposite, and the grey version proved him
          right the moment it rendered: with no colour anywhere
          in the lower half, the card lost its centre. Eye went
          to the title, then nowhere. A card whose most important
          row is grey on grey is a card with no answer to "what
          am I looking at".

          The action-colour worry was real but overcooked. Indigo
          here is a 50-level TINT with a 200 border — the same
          family as the solid button, nowhere near the same
          weight. Nothing in this product fills a whole row with
          brand-50 and expects a press; the chevron and the
          hover say what it does. And the tint is what finally
          separates this segment from Saved for later at a
          glance: a row of indigo BANDS versus a row of indigo
          BUTTONS, which is the differentiation this whole change
          set out to make.

          The amber "Needs action" chip still wins against it —
          different hue, higher saturation — so the one thing
          asking for her attention stays the one thing that
          catches it. */}
      <button
        type="button"
        onClick={onShowClasses}
        className="mt-auto flex w-full flex-wrap items-center gap-2 rounded-control border border-brand-200 bg-brand-50 px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-100"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] text-brand-800">
          Assigned to{' '}
          <span className="font-semibold text-brand-900">
            {a.classIds.length} {a.classIds.length === 1 ? 'class' : 'classes'}
          </span>{' '}
          · <span className="font-semibold text-brand-900">{reach} students</span>
        </span>
        {waiting > 0 && (
          <span
            title={`${waiting} ${waiting === 1 ? 'student is' : 'students are'} waiting to be assigned`}
            className="shrink-0 rounded-full bg-alert-100 px-2 py-0.5 text-[12px] font-medium text-alert-800"
          >
            Needs action
            <span className="sr-only">
              : {waiting} {waiting === 1 ? 'student' : 'students'} waiting to be assigned
            </span>
          </span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
      </button>

      {/* ---- ASSIGN · SHARE · MORE ----
          ---- ASSIGN IS NOT PRIMARY HERE, AND THAT IS THE POINT ----
          This started as a filled indigo Assign, copied straight
          off the saved card. Side by side the two segments then
          looked like the same card twice, which is the thing
          Dhinesh caught: if Assigned and Saved for later read
          identically, the tab you are on is the only clue to
          what you are looking at, and a teacher shouldn't have
          to remember where she is to know what she's seeing.

          So the emphasis moved up a row. On a SAVED lesson the
          whole point is that it hasn't gone out yet, so Assign
          stays the filled button. On an ASSIGNED one the sending
          already happened — the live question is who has it and
          who is waiting — so the filled shape belongs on the
          "Assigned to N classes · N students" row, and Assign
          drops to a bordered secondary. It is still there, still
          first in the row, still the same click; it just stops
          shouting about work that is already done.

          One filled-ish shape per card either way. The shape
          just moved to whichever thing the card is actually
          about.

          Assign is dimmed, not hidden, when every class already
          has it — a button that vanishes once teaches nothing; a
          dimmed one with its reason attached answers the
          question she opened the card to ask. */}
      <div className="flex items-center gap-2 pt-3">
        <Button
          size="sm"
          variant="secondary"
          icon={Send}
          aria-disabled={everyoneHasIt || undefined}
          aria-describedby={everyoneHasIt ? `${a.id}-all` : undefined}
          onClick={() => !everyoneHasIt && onAssignMore()}
          className={cx(everyoneHasIt && 'opacity-50')}
        >
          Assign
        </Button>
        {everyoneHasIt && (
          <p id={`${a.id}-all`} className="sr-only">
            Every one of your classes already has this assignment.
          </p>
        )}
        <Button size="sm" variant="ghost" icon={Share2} onClick={onShare}>
          Share
        </Button>
        <span className="ml-auto">
          <AssignmentMenu assignment={a} onDuplicate={onDuplicate} onUnassign={onUnassign} />
        </span>
      </div>
    </Card>
  )
}

/* ============================================================
   WHO HAS IT — IN A DIALOG
   ------------------------------------------------------------
   The class breakdown, moved out of the card when the cards
   went three to a row. Same three readings of the data behind
   the Prototype switch — a table, sentences, or only what needs
   her — just with room to show them properly.

   It also fixes something the inline version had: opening one
   assignment's classes used to push every assignment below it
   down the page. A dialog costs the same click and moves
   nothing.
   ============================================================ */
function ClassesDialog({ assignment: a, onClose, onCatchUp, onShowWindows }) {
  const { assignedView } = useApp()
  if (!a) return null
  const reach = a.classIds.reduce((n, cid) => n + reachedIn(a, cid).length, 0)

  return (
    <Sheet
      open
      onClose={onClose}
      /* ---- THE DIALOG IS NAMED AFTER THE THING THAT OPENED IT ----
         This was "Who has this", which is a decent description
         and the wrong label. The control the teacher pressed
         says "Assigned to 3 classes · 67 students"; the dialog
         it opens should say the same words back, so the two read
         as one object rather than as a button and some unrelated
         panel that happened to appear.

         A title that paraphrases the control is a small tax every
         time: she has to confirm that this is what she asked for.
         A title that repeats it costs nothing to check. */
      title="Assigned to"
      subtitle={`${a.title} · ${a.classIds.length} ${
        a.classIds.length === 1 ? 'class' : 'classes'
      } · ${reach} students`}
      /* The page's own width, like the resources dialog on the
         same card. At 896px the table's four quarters came out
         at 212px and "2 students newly added" truncated to "2
         students new…" — a row holding a four-column table
         needs the width a four-column table needs, and the
         dialog is the thing that should give way, not the
         sentence. */
      width="page"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="-mx-6 -my-5 overflow-hidden">
        {assignedView === 'attention' ? (
          <AttentionView assignment={a} onCatchUp={onCatchUp} />
        ) : assignedView === 'lines' ? (
          <LinesView assignment={a} onCatchUp={onCatchUp} onShowWindows={onShowWindows} />
        ) : assignedView === 'table' ? (
          <TableView assignment={a} onCatchUp={onCatchUp} onShowWindows={onShowWindows} />
        ) : (
          <CardsView assignment={a} onCatchUp={onCatchUp} onShowWindows={onShowWindows} />
        )}
      </div>
    </Sheet>
  )
}

/* ---- what every variant needs to know about one class ---- */
function readDelivery(a, cid) {
  const c = getClass(cid)
  if (!c) return null
  const d = deliveryFor(a, cid)
  const st = assignmentStatsForClass(a.id, cid)
  return { c, d, st, newcomers: newcomersIn(a, cid) }
}

/* ---- "MULTIPLE DUE DATES" IS A QUESTION, SO IT OPENS ----
   It was plain text, and text that says there is more to know
   while offering no way to know it is the worst of both: it
   costs the reader the same attention as an answer and gives
   her none of one. A phrase that admits it is hiding something
   owes a way in.

   ---- A DIALOG, NOT A THIRD EXPANSION ----
   My first pass opened it inline, under the row. That put the
   detail three levels deep — an assignment card, inside it a
   collapsible class list, inside that an expanding row — and
   each level pushed everything below it down the page, so
   opening one class moved the fourteen others. Three nested
   disclosures is a place people get lost in rather than a
   hierarchy they read.

   A dialog is flat. It costs the same click, it does not move
   the page, and it has room for twenty-four names laid out
   properly instead of squeezed into a table row's width. It is
   also the second time this card has needed exactly this — the
   resource list behaves the same way, for the same reason.

   Underlined rather than boxed. It sits in a table cell between
   a progress bar and an action column; a bordered control there
   would read as a third button on the row. */
/* ---- THE QUALIFIER SITS WITH THE DATES IT QUALIFIES ----
   "Starts today" was in the last column, next to the Assign
   button, and Dhinesh is right that the column stopped meaning
   one thing: some rows held an ACTION, some held a DATE NOTE,
   some held nothing, and which you got depended on how long ago
   the window opened. Two structurally identical assignments
   showed different kinds of thing in the same place.

   The note was never an action. It is a reading of the start
   date, so it belongs in the Dates cell, in grey, beside the
   date it is reading. The last column then holds exactly one
   kind of thing — what needs doing — and is blank on most rows
   by design.

   AND IT IS ON EVERY ROW. I had it appear only before the
   window opened, on the grounds that "started 7 days ago" adds
   nothing once the work is under way. Dhinesh is right that
   this reintroduced the fault in a smaller place: a qualifier
   that comes and goes makes two identical-looking rows carry
   different amounts of information, and the reader has to work
   out whether the silence means something.

   A column that always says something can be read by running
   the eye down it. A column that sometimes says something has
   to be read row by row.

   So every row gets the relative reading. It is not a
   restatement of the range beside it either: the range is two
   dates she has to measure against today's, and this is the
   measurement. */
function startQualifier(start) {
  const n = daysUntil(start)
  if (n > 1) return `starts in ${n} days`
  if (n === 1) return 'starts tomorrow'
  if (n === 0) return 'starts today'
  if (n === -1) return 'started yesterday'
  return `started ${Math.abs(n)} days ago`
}

function DateSpan({ delivery: d, onOpen, plain }) {
  /* In the card view the card is the button, so this renders as
     text. The phrasing still has to carry the fact — "2 due
     dates" is the whole reason that class's dates cannot be
     printed as a range. */
  if (plain && d.multiple) {
    return <span className="font-medium text-ink-700">{d.windows.length} due dates</span>
  }
  if (!d.multiple) {
    const q = startQualifier(d.start)
    return (
      <>
        {onDate(d.start)} <span className="text-ink-300">–</span> {onDate(d.due)}
        {q && <span className="text-ink-400"> · {q}</span>}
      </>
    )
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="font-medium text-ink-700 underline decoration-ink-300 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400"
    >
      {d.windows.length} due dates
    </button>
  )
}

/* ============================================================
   THE WINDOWS, OPENED
   ------------------------------------------------------------
   One block per deadline: the ratio for that group, its dates,
   and the children on it with where each has got to.

   WHY THE NAMES AND NOT JUST A COUNT. A teacher opening this is
   not asking "how many deadlines are there" — the row already
   told her. She is asking WHO is on the late one, because that
   is the group she has to remember when she marks. Names answer
   it; a count sends her somewhere else to find out.

   STATUS IN WORDS, NOT COLOUR ALONE. Completed / In progress /
   Not started, each with its own tone — but the word carries
   the meaning and the colour only reinforces it. Colour alone
   would fail the same test the delivery chips failed: a wall of
   it stops marking anything, and a teacher who cannot
   distinguish the hues gets nothing at all.
   ============================================================ */
const STATE_WORD = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
}
const STATE_TONE = {
  completed: 'text-good-700',
  'in-progress': 'text-watch-700',
  'not-started': 'text-ink-400',
}

/* `showClassLink` is false when this opens from the class's own
   page: a link reading "Open 1st Period" while she is standing
   on 1st Period is a control that does nothing, and a dead
   control teaches her to distrust the live ones beside it. */
export function WindowsDialog({
  assignment: a,
  classId,
  onClose,
  showClassLink = true,
  onAssignNewcomers,
}) {
  if (!a || !classId) return null
  const c = getClass(classId)
  const d = deliveryFor(a, classId)
  const reached = reachedIn(a, classId).length
  const newcomers = newcomersIn(a, classId).map(getStudent).filter(Boolean)

  return (
    <Sheet
      open
      onClose={onClose}
      /* ---- THE TITLE IS THE CLASS, NOT THE MECHANISM ----
         This dialog used to be reachable only from the "2 due
         dates" link, so "Due dates" was a fair name for it. Now
         every class card opens it, and on eleven of twelve
         classes there is exactly one date range — so a dialog
         called "Due dates" would be named after the rare case.

         It is named after what it always contains: this class,
         and who in it has the work. */
      title={c?.name ?? 'Class'}
      subtitle={`${a.title} · ${reached} ${reached === 1 ? 'student' : 'students'}`}
      width="2xl"
      footer={
        /* ---- THE ROUTE TO THE CLASS LIVES HERE NOW ----
           The class name on the card was a link before the card
           became a button. Putting it in the footer is better
           than where it was: at the top of a card it was a thing
           she might hit by accident while reaching for the card
           itself, and down here it reads as the obvious next
           step once she has seen the names. */
        <div className="flex items-center justify-between gap-3">
          {showClassLink ? (
            <Link
              to={`/classes/${classId}?tab=assignments`}
              className="text-[14px] font-medium text-brand-700 hover:text-brand-800 hover:underline"
            >
              Open {c?.name}
            </Link>
          ) : (
            <span />
          )}
          {/* ---- THE ACTION SITS WITH THE OTHER ACTIONS ----
              It was inline, beside the "Not assigned yet"
              heading, which put the one control she might press
              in the middle of a list she was reading. The footer
              is where every dialog in this product keeps its
              commit, so it is the first place she looks for one
              and the only place she does not have to find it.

              Left of Close, because the order is
              do-this-then-leave. */}
          <span className="flex items-center gap-2">
            {onAssignNewcomers && newcomers.length > 0 && (
              <Button variant="primary" onClick={onAssignNewcomers}>
                Assign {newcomers.length === 1 ? 'student' : `${newcomers.length} students`}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </span>
        </div>
      }
    >
      {/* ---- THE ONES WHO DO NOT HAVE IT COME FIRST ----
          This sat at the BOTTOM, under the windows, on the
          reasoning that the children on a deadline are the body
          of the dialog and these two are the footnote. Dhinesh
          turned it round and he is right: twenty-two names that
          are fine is not what she opened this for, and burying
          the only thing wrong underneath them means the longer
          the class, the further she has to scroll to reach the
          problem. A warning printed below the thing it is
          warning about is a warning she reads second.

          So: what needs you, then everything else. Same order
          the Reports screen uses, and the same reason.

          They stay outside the windows and keep their own
          heading, because they are not on a deadline — that is
          the whole point of them. Putting them in a window would
          have been tidier and would have said something untrue.

          The Assign button that used to sit on this heading is
          in the footer now, beside Close. */}
      {newcomers.length > 0 && (
        <div className="mb-5">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-alert-800">
            Not assigned yet
            <span className="text-[12px] font-normal text-alert-700">
              joined {c?.name} after this went out
            </span>
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newcomers.map((st) => (
              <li
                key={st.id}
                className="rounded-control border border-alert-200 bg-alert-50 px-3 py-2"
              >
                <Link
                  to={`/students/${st.id}`}
                  className="block truncate text-[14px] text-ink-900 hover:text-brand-700"
                >
                  {st.name}
                </Link>
                <span className="block text-[12px] text-alert-700">Does not have it</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- THE SENTENCE ONLY APPEARS WHEN IT HAS NEWS ----
          On a class with one window there is nothing to explain:
          the heading above the names says the dates, and a line
          saying "this class has one deadline" is a sentence that
          tells the reader what she can already see.

          On a class with two it is the most important thing in
          the dialog, because two date ranges under one class
          name looks like a mistake until somebody says why. */}
      {d.multiple && (
        <p className="mb-4 text-sm text-ink-700">
          {c?.name} is working to {d.windows.length} deadlines on this assignment, because a
          group was given it on a different window.
        </p>
      )}
      <div className="space-y-5">
      {d.windows.map((w, i) => {
        const rows = w.studentIds.map(getStudent).filter(Boolean)
        const done = rows.filter(
          (st) => progressFor(st.id, a.id)?.state === 'completed'
        ).length
        return (
          <div key={`${w.start}-${w.due}-${i}`}>
            {/* The dates lead, because they are what makes this
                group a group. The ratio follows as the thing she
                came to compare between them. */}
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-ink-900">
              {onDate(w.start)} <span className="text-ink-300">–</span> {onDate(w.due)}
              <span className="text-[12px] font-normal text-ink-500">
                <span className="tnum">
                  {done}/{rows.length}
                </span>{' '}
                finished
              </span>
            </p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((st) => {
                const state = progressFor(st.id, a.id)?.state ?? 'not-started'
                return (
                  <li
                    key={st.id}
                    className="rounded-control border border-ink-200 bg-white px-3 py-2"
                  >
                    <Link
                      to={`/students/${st.id}`}
                      className="block truncate text-[14px] text-ink-900 hover:text-brand-700"
                    >
                      {st.name}
                    </Link>
                    <span className={cx('block text-[12px]', STATE_TONE[state])}>
                      {STATE_WORD[state]}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      </div>
    </Sheet>
  )
}

function RowAction({ newcomers, delivery: d, onCatchUp }) {
  if (newcomers.length > 0) {
    return (
      <>
        <span className="truncate text-alert-800">
          {newcomers.length} {newcomers.length === 1 ? 'student' : 'students'} newly added
        </span>
        {/* ---- PRIMARY, AND IT EARNS IT ----
            The design system's rule is that solid fills are for
            things there is one of — which is why Assign on a
            resource card is `soft`, since a grid of twelve would
            otherwise be a wall of indigo.

            This one is the exception the rule was written
            around. It is the ONLY action in the whole section,
            it appears on the rare row rather than every row, and
            what it does is the single thing on this screen that
            a teacher must do and nothing else will do for her: a
            child is sitting in her class without the work.
            Making that look like a tertiary control was
            understating it. */}
        <Button size="sm" variant="primary" onClick={onCatchUp}>
          Assign
        </Button>
      </>
    )
  }
  /* ---- ONE KIND OF THING, OR NOTHING ----
     This column used to hold an action on some rows and a note
     about the start date on others. A column that answers two
     different questions depending on the row is a column with
     no heading you could write, which is why it had none.

     The start note moved into the Dates cell where it belongs
     (see startQualifier). What is left is the one thing this
     column is for, and it is empty on most rows — which is the
     point: a teacher scanning fifteen classes is hunting for
     the two that need something, and blank space is what makes
     them findable. */
  return null
}


/* ============================================================
   VARIANT 0 — CARDS  (the default)
   ------------------------------------------------------------
   The table was correct and Dhinesh still didn't want it, which
   is worth taking seriously rather than defending. Looking at it
   again with his eye: the table was built for a question this
   dialog is rarely opened to ask.

   A table is a comparison instrument. It earns its header row,
   its aligned columns and its visual coldness when the reader is
   ranking rows against each other — "which of my fifteen classes
   is behind". But this dialog is opened from ONE assignment's
   card, and the thing she usually wants is "what is the state of
   each class on this", class by class, with the one that needs
   something standing out. That is a reading task, not a ranking
   task, and a card answers it in one glance per class instead of
   one glance per column.

   There is also a plain consistency argument. Everything else in
   this segment is now a card — the assignment itself, the saved
   playlists, the resources in the preview dialog. A table
   dropped in the middle of that is a different kind of object
   for no reason the teacher can see.

   WHAT THE CARD HAD TO EARN BACK. A table says its labels once
   in the header; cards have no header, so each value has to be
   self-describing or the labels come back fifteen times. Two
   choices do that work:

   · The ratio carries the word: "16/23 finished" reads on its
     own, so no FINISHED heading is needed.
   · The dates carry their own meaning already — a range plus
     "started 7 days ago" is not a value that needs naming.

   So the card holds no field labels at all, which is what keeps
   it from looking like a form.

   COMPARISON IS NOT LOST, just weakened. The bars are all the
   same length and all start at the same offset inside their
   cards, so running the eye across a row still ranks them. That
   is most of what the table's alignment was buying. The table
   itself is still one click away under Prototype for anyone who
   wants the stricter grid.
   ============================================================ */
function CardsView({ assignment: a, onCatchUp, onShowWindows }) {
  return (
    <ul className="grid gap-3 px-4 py-4 sm:grid-cols-2 xl:grid-cols-3">
      {a.classIds.map((cid) => (
        <ClassCard
          key={cid}
          assignment={a}
          classId={cid}
          onCatchUp={onCatchUp}
          onShowWindows={onShowWindows}
        />
      ))}
    </ul>
  )
}

function ClassCard({ assignment: a, classId: cid, onCatchUp, onShowWindows }) {
  const r = readDelivery(a, cid)
  if (!r) return null
  const needs = r.newcomers.length > 0

  return (
    /* ---- THE CARD THAT NEEDS SOMETHING LOOKS DIFFERENT ----
       In the table this was carried by a sentence and a button
       appearing in an otherwise empty column — which worked
       because a blank column is conspicuous. Cards have no blank
       column, so the signal moves into the card's own frame: an
       amber border and a tinted footer.

       ---- WHY RED AND NOT INDIGO ----
       Dhinesh rejected the amber and left it between red and
       indigo. Built both and looked at them: indigo loses on one
       specific, visible count. The thing in this footer that
       MATTERS is the Assign button, which is brand-600 — put it
       on a brand-50 footer inside a brand-bordered card and the
       button sinks into its own background. The signal and the
       action end up the same colour, so the card gets quieter
       exactly where it should get louder. On the pale red the
       indigo button is the brightest thing in the card.

       The usual objection to red is that it means error, and two
       students joining a class late is nobody's mistake. That
       objection is answered by the words rather than the hue:
       "2 students newly added" and "Needs action" are both
       neutral statements of fact. Red here is doing its other
       job — marking the one row that is not like the others —
       and it is the only warm colour on a screen that is
       otherwise entirely indigo and grey, which is what makes it
       findable at a glance in a dialog of fifteen cards.

       Border AND footer, not border alone. A coloured outline is
       the first thing to disappear for a teacher who cannot
       separate the hues, and this is the one state on the screen
       that must not be missable. The words in the footer say it
       outright; the colour just gets her eye there faster. */
    <li
      className={cx(
        'flex flex-col rounded-card border bg-white',
        needs ? 'border-alert-300' : 'border-ink-200'
      )}
    >
      {/* ---- THE WHOLE CARD OPENS THE NAMES ----
          It used to be only the "2 due dates" link that opened
          anything, so eleven of the twelve cards were inert: the
          same object, looking the same, one of them clickable.
          A teacher cannot see which is which without trying, and
          a surface where some things respond and some don't
          teaches her to stop trying.

          Now every card opens the same thing — who in that class
          has it and where each child has got to — because that
          is the question the card's summary raises and cannot
          answer. 12/21 finished names no one.

          ---- A BUTTON, SO THE CLASS LINK HAS TO GO ----
          The class name was a <Link> to the class page. An <a>
          inside a <button> is invalid HTML and behaves
          differently in every browser, so one of them had to
          lose, and the link was the one worth losing: the name
          is a LABEL for the card, and a label that quietly
          navigates away while the rest of the card opens a
          dialog is two meanings on one object. The route to the
          class isn't gone — it sits at the foot of the dialog
          that opens, where it reads as a destination rather than
          as a trap.

          `text-left` because a button centres its text and this
          is a card, not a control. */}
      {/* ---- THE BODY OPENS THE DUE DATES AND THE NAMES ----
          Back to being a button, which is where this started.
          The two things that changed since: the footer below now
          holds the destinations that LEAVE this dialog, and this
          one does not — it opens the detail of the very summary
          you are looking at. That is the split that makes a
          clickable card safe. A card whose body went somewhere
          else would be a trap; a card whose body expands what it
          is already showing is just the card. */}
      <button
        type="button"
        onClick={() => onShowWindows(cid)}
        className="flex-1 rounded-t-card p-3.5 text-left transition-colors hover:bg-ink-50"
      >
        <span className="block truncate text-[14px] font-semibold text-ink-900">
          {r.c.name}
        </span>

        {/* ---- THE RATIO SAYS ITS OWN NAME ----
            "16/23" under a FINISHED heading is a table. "16/23
            finished" on a card is a fact, and it costs one word
            to stop needing the heading. */}
        {/* ---- THE BAR IS CAPPED HERE TOO ----
            Stretched across the card it ran to roughly 230px,
            which is a long way past the point where a bar tells
            you anything more. All of these are the same length
            and all start at the same offset, so what the reader
            compares is the FILLED portion — and at 128px a
            13/22 and a 16/23 are already clearly different.

            Capping it also stops the ratio being flung to the
            far edge of the card. Bar and number now read as one
            object with the slack after them, instead of two
            things at opposite ends of a gap. Same reasoning as
            the table view, one size smaller because the card
            is. */}
        <span className="mt-3 flex items-center gap-2.5">
          <span className="w-32 shrink-0">
            <ProgressBar value={r.st.completed} total={r.st.total} tone="brand" />
          </span>
          <span className="min-w-0 truncate text-[12px] text-ink-600">
            <span className="tnum font-medium text-ink-900">
              {r.st.completed}/{r.st.total}
            </span>{' '}
            finished
          </span>
        </span>

        {/* `plain` because the card around it is the way in. Two
            controls opening the same dialog from one card is a
            choice the reader has to make and cannot get right. */}
        <span className="mt-2.5 block text-[12px] text-ink-600">
          <DateSpan delivery={r.d} plain />
        </span>
      </button>

      {needs && (
        <div className="flex items-center gap-2 border-t border-alert-200 bg-alert-50 px-3.5 py-2.5">
          <span className="min-w-0 flex-1 text-[12px] text-alert-800">
            {r.newcomers.length} {r.newcomers.length === 1 ? 'student' : 'students'} newly
            added
          </span>
          <Button size="sm" variant="primary" onClick={() => onCatchUp(cid)}>
            Assign
          </Button>
        </div>
      )}

      {/* ---- REPORT · ROSTER — BOTH LEAVE, AND THAT IS THE POINT ----
          A card now has three destinations and they divide
          cleanly by WHERE THEY GO. The body expands this card in
          place: tap it and the dates and the names open over the
          top, and you are still here. These two are links, and
          both take you out of the Library and into Classes or
          Reports for this class.

          That division is why both can live on one card without
          the reader having to work anything out. In-place detail
          is the big silent target; leaving is a small named
          button. She never has to guess which kind of thing she
          is about to do, because the two kinds do not look alike.

          REPORT LEADS. Dhinesh put it first and it is the right
          call: she is standing in front of a progress bar, so
          the live question is how they DID, and the roster — a
          list of who is in the room — is the reference she needs
          far less often. The bordered button goes to the thing
          she came for.

          The row sits at the foot of every card, needed or not,
          so the twelve cards keep one shape. The red strip above
          it comes and goes; this does not. */}
      <div className="flex items-center gap-1 border-t border-ink-100 px-3 py-2">
        <Link
          to={`/insights?tab=classes&class=${cid}&assignment=${a.id}`}
          className={buttonClass({ variant: 'secondary', size: 'sm' })}
        >
          <BarChart3 className="h-4 w-4" aria-hidden />
          Report
        </Link>
        <Link
          to={`/classes/${cid}?tab=students`}
          className={buttonClass({ variant: 'ghost', size: 'sm' })}
        >
          <Users className="h-4 w-4" aria-hidden />
          Roster
        </Link>
      </div>
    </li>
  )
}

/* ============================================================
   VARIANT 1 — TABLE
   ------------------------------------------------------------
   What was wrong with the version before this one, and it was
   not the list: it was a table pretending not to be. Every row
   carried its own legend — "Assigned to 13/22 students" — which
   is what a row does when nothing above it will say what the
   column means. Three classes, three repetitions; fifteen
   classes, fifteen.

   A header row says it once. The rows then hold values only,
   which is what makes a column scannable: the eye runs down
   numbers, not down sentences.

   AND A BAR, UNCOLOURED. Dhinesh was right that colour-coding
   fifteen rows turns into texture, but the thing colour was
   doing — making a ratio comparable at a glance — is worth
   keeping, and a bar does it on shape alone. 13/22 and 16/23
   are two seconds of arithmetic apart as numbers and instant as
   lengths.
   ============================================================ */
function TableView({ assignment: a, onCatchUp, onShowWindows }) {
  return (
    <div>
      <div className="flex items-center gap-x-4 bg-ink-50/60 px-4 py-1.5">
        <span className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          Class
        </span>
        <span className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          Finished
        </span>
        <span className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          Dates
        </span>
        {/* Deliberately unlabelled. The column holds a reason
            and a button on the rare row and nothing on the rest;
            a heading over it would be a promise of content that
            most rows do not keep. */}
        <span className="min-w-0 flex-1" aria-hidden />
      </div>

      <ul className="divide-y divide-ink-100 border-t border-ink-100">
        {a.classIds.map((cid) => (
          <TableRow
            key={cid}
            assignment={a}
            classId={cid}
            onCatchUp={onCatchUp}
            onShowWindows={onShowWindows}
          />
        ))}
      </ul>
    </div>
  )
}

function TableRow({ assignment: a, classId: cid, onCatchUp, onShowWindows }) {
  const r = readDelivery(a, cid)
  if (!r) return null
  return (
    <li className="flex items-center gap-x-4 px-4 py-2.5 transition-colors hover:bg-ink-50/60">
        <Link
          to={`/classes/${r.c.id}?tab=assignments`}
          className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-900 hover:text-brand-700"
        >
          {r.c.name}
        </Link>

        <span className="flex min-w-0 flex-1 items-center gap-2.5">
                {/* ---- THE BAR IS CAPPED, NOT STRETCHED ----
                    Left to fill its quarter, the bar pushed the
                    ratio hard against the Dates column and the
                    two columns read as one. A bar does not get
                    more legible past about 160px — it is a
                    length being compared to other lengths, and
                    all of these are the same length — so the
                    extra width was buying nothing and spending
                    the gap that separates the columns.

                    Wrapped in a sized parent rather than given a
                    width class: ProgressBar sets `w-full` on
                    itself, and which of two Tailwind widths wins
                    is decided by the order the CSS is emitted,
                    not by the order they are written. A sized
                    parent is not a race. */}
                <span className="w-40 shrink-0">
                  <ProgressBar value={r.st.completed} total={r.st.total} tone="brand" />
                </span>
                <span className="tnum shrink-0 text-[14px] text-ink-700">
                  {r.st.completed}/{r.st.total}
                </span>
              </span>

              <span className="min-w-0 flex-1 truncate text-[14px] text-ink-600">
          <DateSpan delivery={r.d} onOpen={() => onShowWindows(cid)} />
      </span>

      <span className="flex min-w-0 flex-1 items-center justify-end gap-2.5 text-[14px]">
        <RowAction newcomers={r.newcomers} delivery={r.d} onCatchUp={() => onCatchUp(cid)} />
      </span>
    </li>
  )
}

/* ============================================================
   VARIANT 2 — SENTENCES
   ------------------------------------------------------------
   No columns at all. One line per class, written as something
   you read rather than something you parse.

   The case for it: columns are machinery, and machinery earns
   its place by making comparison easy. If a teacher only ever
   asks "how is 3rd Period doing on this" — one class at a
   time — then the grid is cost with no return, and a sentence
   is lighter on the page and on her.

   The case against, which is why it is not the default: fifteen
   sentences cannot be compared. The moment the question becomes
   "which of my classes is behind", every value is at a
   different horizontal position and the eye has to read each
   line to find it.
   ============================================================ */
function LinesView({ assignment: a, onCatchUp, onShowWindows }) {
  return (
    <ul className="divide-y divide-ink-100">
      {a.classIds.map((cid) => (
        <LineRow
          key={cid}
          assignment={a}
          classId={cid}
          onCatchUp={onCatchUp}
          onShowWindows={onShowWindows}
        />
      ))}
    </ul>
  )
}

function LineRow({ assignment: a, classId: cid, onCatchUp, onShowWindows }) {
  const r = readDelivery(a, cid)
  if (!r) return null
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 transition-colors hover:bg-ink-50/60">
        <Link
          to={`/classes/${r.c.id}?tab=assignments`}
          className="shrink-0 text-[14px] font-medium text-ink-900 hover:text-brand-700"
        >
          {r.c.name}
        </Link>
        <span className="min-w-0 flex-1 truncate text-[14px] text-ink-600">
          <span className="tnum font-medium text-ink-900">
            {r.st.completed} of {r.st.total}
          </span>{' '}
          finished
          <span aria-hidden className="mx-1.5 text-ink-300">
            ·
          </span>
        <DateSpan delivery={r.d} onOpen={() => onShowWindows(cid)} />
      </span>
      <span className="flex shrink-0 items-center gap-2.5 text-[14px]">
        <RowAction newcomers={r.newcomers} delivery={r.d} onCatchUp={() => onCatchUp(cid)} />
      </span>
    </li>
  )
}

/* ============================================================
   VARIANT 3 — WHAT NEEDS YOU
   ------------------------------------------------------------
   The one that changes what the section is FOR.

   The other two answer "here is every class and how it is
   doing". This one answers "here is what you have to do about
   this assignment", and files the rest out of the way. With ten
   or fifteen classes that is the difference between fifteen
   rows and two.

   It is the same move Reports made when it stopped opening on
   the grade book: a teacher opening a list of assignments is
   not auditing, she is looking for the thing that needs her.

   THE REST IS NOT HIDDEN, it is summarised and one click away,
   with its count on the summary — so the section never claims
   fewer classes than it has. That is the line between filing
   something away and losing it.
   ============================================================ */
function AttentionView({ assignment: a, onCatchUp }) {
  const [showRest, setShowRest] = useState(false)
  const rows = a.classIds.map((cid) => ({ cid, r: readDelivery(a, cid) })).filter((x) => x.r)
  const needs = rows.filter((x) => x.r.newcomers.length > 0)
  const rest = rows.filter((x) => x.r.newcomers.length === 0)

  return (
    <div>
      {needs.length > 0 && (
        <ul className="divide-y divide-ink-100">
          {needs.map(({ cid, r }) => (
            <li
              key={cid}
              /* Keeps its amber fill — that is a state, not a
                 cursor — but still responds, a shade deeper. */
              className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-watch-50/50 px-4 py-3 transition-colors hover:bg-watch-50"
            >
              <Link
                to={`/classes/${r.c.id}?tab=assignments`}
                className="shrink-0 text-[14px] font-medium text-ink-900 hover:text-brand-700"
              >
                {r.c.name}
              </Link>
              <span className="min-w-0 flex-1 truncate text-[14px] text-alert-800">
                {r.newcomers.length}{' '}
                {r.newcomers.length === 1 ? 'student has' : 'students have'} joined since
                this went out
              </span>
              {/* Same call as the table's — see the note on
                  RowAction. Here it is even more clearly the
                  point of the row. */}
              <Button size="sm" variant="primary" onClick={() => onCatchUp(cid)}>
                Assign to {r.newcomers.length}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <div className={cx(needs.length > 0 && 'border-t border-ink-100')}>
          <button
            type="button"
            onClick={() => setShowRest((o) => !o)}
            aria-expanded={showRest}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] text-ink-600 transition-colors hover:bg-ink-50"
          >
            <ChevronRight
              className={cx(
                'h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform',
                showRest && 'rotate-90'
              )}
              aria-hidden
            />
            {/* Named, not counted — "3 others" would make her
                open it to find out which. At fifteen classes the
                names wrap and the count takes over. */}
            {rest.length <= 4
              ? `${rest.map((x) => x.r.c.name).join(', ')} — nothing needed`
              : `${rest.length} other classes — nothing needed`}
          </button>

          {showRest && (
            <ul className="divide-y divide-ink-100 border-t border-ink-100">
              {rest.map(({ cid, r }) => (
                <li
                  key={cid}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 pl-10 transition-colors hover:bg-ink-50/60"
                >
                  <Link
                    to={`/classes/${r.c.id}?tab=assignments`}
                    className="shrink-0 text-[14px] font-medium text-ink-900 hover:text-brand-700"
                  >
                    {r.c.name}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-ink-600">
                    <span className="tnum font-medium text-ink-900">
                      {r.st.completed} of {r.st.total}
                    </span>{' '}
                    finished
                    <span aria-hidden className="mx-1.5 text-ink-300">
                      ·
                    </span>
                    {/* No expansion on this one: it is the
                        already-filed-away half of a list that is
                        itself filed away, and a third level of
                        opening is a place nobody finds. The
                        count still tells the truth. */}
                    {r.d.multiple ? (
                      `${r.d.windows.length} due dates`
                    ) : (
                      <>
                        {onDate(r.d.start)} <span className="text-ink-300">–</span>{' '}
                        {onDate(r.d.due)}
                      </>
                    )}
                  </span>

                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   CATCHING UP THE LATECOMERS
   ------------------------------------------------------------
   Small on purpose. The decision is one question — by when —
   and the children are named rather than counted, because "2
   students" is the thing she already knows and the names are
   what she might be checking.

   The default is the class's own due date when that is still
   ahead, and a week out when it is not. A child handed work on
   Monday against Friday's expired deadline is marked late
   before he opens it.
   ============================================================ */
export function CatchUpDialog({ open, assignment: a, classId, onClose }) {
  const { assignStudentsToAssignment } = useApp()
  /* 'keep' | 'new' — the same question the Assign dialog asks
     when a class is added late, asked here for students instead
     of classes. It is the same decision, so it should look and
     behave like the same decision rather than being a bare date
     field that silently defaults to one of the two answers. */
  const [when, setWhen] = useState('keep')
  const [start, setStart] = useState(null)
  const [due, setDue] = useState(null)
  /* ---- WHICH OF THEM, NOT ALL OF THEM ----
     Dhinesh's call and it is the honest shape. "2 students
     newly added" is a prompt, not an instruction: one of them
     may have transferred in with the unit already done, or be
     joining next week. All ticked to start, because catching up
     everyone is what she means almost every time — but the list
     is a choice, not a receipt. */
  const [picked, setPicked] = useState([])

  const d = a ? deliveryFor(a, classId) : null
  const stillOpen = d ? daysUntil(d.due) >= 0 : false
  const newcomers = a ? newcomersIn(a, classId).map(getStudent).filter(Boolean) : []

  useEffect(() => {
    if (!open || !d) return
    /* Defaults to the class's own window when its deadline is
       still ahead, because the common case is a child who
       joined on Monday for work the rest hand in on Friday.
       When it has passed, the only live option is the default —
       never a dimmed one, which would open the dialog in a
       state it will not accept. */
    setWhen(stillOpen ? 'keep' : 'new')
    setStart(new Date(todayISO))
    setDue(stillOpen ? new Date(d.due) : addDaysLocal(new Date(todayISO), 7))
    setPicked(newcomersIn(a, classId))
  }, [open, d?.due, stillOpen, a?.id, classId])

  if (!open || !a || !d) return null
  const c = getClass(classId)
  const n = picked.length
  const ready = n > 0 && (when === 'new' ? !!start && !!due : stillOpen)

  return (
    <Sheet
      open
      onClose={onClose}
      title="Assign to the new students"
      subtitle={`${a.title} · ${c?.name}`}
      /* Wider, because the two date fields sit side by side as
         they do in the Assign dialog — a flow that asks the
         same question twice should not ask it in two different
         shapes. */
      width="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Send}
            disabled={!ready}
            onClick={() => {
              /* The class's own window is passed through rather
                 than null, because the mock compares the two to
                 decide whether this class now holds a second
                 deadline — handing it the same values is how it
                 learns the answer is no. */
              assignStudentsToAssignment(a.id, picked, {
                start: when === 'keep' ? d.start : isoLocal(start),
                due: when === 'keep' ? d.due : isoLocal(due),
              })
              onClose()
            }}
          >
            Assign {n > 0 ? n : ''}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-700">
        {newcomers.length === 1 ? 'This student' : 'These students'} joined {c?.name} after
        this went out, so {newcomers.length === 1 ? 'he or she has' : 'they have'} never had
        it.
      </p>

      {/* ---- THE SAME CHIPS AS THE ASSIGN DIALOG ----
          Dhinesh's call. Picking children out of a class is one
          interaction in this product, and it had grown a second
          appearance here — full-width rows with a tick box —
          purely because this dialog was written later. Two
          shapes for one gesture is a thing a teacher has to
          learn twice.

          The pill also suits the quantity. These are almost
          always two or three names; a stack of full-width rows
          gave each one the weight of a list item in a list of
          one. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {newcomers.map((s) => {
          const on = picked.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() =>
                setPicked((cur) =>
                  cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id]
                )
              }
              className={cx(
                'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[12px] transition-colors',
                on
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              )}
            >
              <Avatar
                initials={s.initials}
                size="sm"
                tone={on ? 'brand' : 'neutral'}
                className="!h-6 !w-6 !text-[12px]"
              />
              {s.name}
            </button>
          )
        })}
      </div>
      {/* Only when it is true. A permanent "2 of 2 chosen" is
          noise; the line exists to catch the moment she has
          unticked everybody and the button has gone quiet. */}
      {n === 0 && (
        <p className="mt-2 text-[12px] text-alert-700">
          Choose at least one student.
        </p>
      )}

      {/* ================= THE WINDOW ================= */}
      <div className="mt-5 space-y-2">
        <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          <CalendarClock className="h-3.5 w-3.5" />
          When they get it
        </h3>

        {/* ---- TWO WORDS AND TWO DATES ----
            This was three lines of prose per option explaining
            what each one meant. Dhinesh is right that it was
            explaining a decision that explains itself: the
            titles name the two choices and the dates under them
            say what the first one is. The sentence I had written
            under each — "one window for the whole class, and
            these students join it" — was a description of the
            option's own title, which is the clearest sign a
            label is doing its job and the help text is not.

            The one place a sentence is still earned is the
            dimmed option, because "why can't I pick this" is a
            question the dates alone do not answer. */}
        <Choice
          name="catchup-when"
          value="keep"
          current={when}
          onChange={setWhen}
          disabled={!stillOpen}
          reasonId="catchup-keep-reason"
          title="Existing dates"
          detail={
            stillOpen
              ? `${onDate(d.start)} – ${onDate(d.due)}`
              : `${onDate(d.start)} – ${onDate(d.due)} · that window has closed`
          }
        />

        <Choice
          name="catchup-when"
          value="new"
          current={when}
          onChange={setWhen}
          title="New dates"
        />

        {/* The fields appear under the option they belong to
            rather than sitting greyed out beside it. A disabled
            date field next to a selected radio is two controls
            arguing about which one is live. */}
        {when === 'new' && (
          <div className="grid gap-3 pl-8 pt-1 sm:grid-cols-2">
            <DateField
              label="From"
              value={start}
              onChange={(v) => {
                setStart(v)
                if (due && v > due) setDue(addDaysLocal(v, 7))
              }}
              min={new Date(todayISO)}
              today={new Date(todayISO)}
              rangeOther={due}
              rangeRole="start"
            />
            <DateField
              label="To"
              value={due}
              onChange={(v) => {
                setDue(v)
                if (start && v < start) setStart(v)
              }}
              min={start ?? new Date(todayISO)}
              today={new Date(todayISO)}
              rangeOther={start}
              rangeRole="end"
            />
            {/* Said once, where the consequence lands. If the
                dates genuinely differ the class ends up holding
                two windows, and the row will say "Multiple due
                dates" rather than pretending to one. */}
            {due && d.due && isoLocal(due) !== d.due && (
              <p className="text-[12px] text-ink-500 sm:col-span-2">
                {c?.name} will show two due dates — {onDate(d.due)} for everyone else,{' '}
                {onDate(isoLocal(due))} for {n === 1 ? 'this student' : `these ${n}`}.
              </p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}

/* The same drawn tick the roster and the pickers use — see the
   note in ClassDetail about why it is not a native checkbox. */
function Tick({ on }) {
  return (
    <span
      aria-hidden
      className={cx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
        on ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white'
      )}
    >
      {on && (
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

/* ---- A RADIO ROW THAT SAYS WHY IT IS DIMMED ----
   `aria-disabled` rather than `disabled`, paired with a reason
   that is always in the DOM. A native disabled radio is skipped
   in a screen reader's form navigation, so its user never meets
   the explanation that is the whole point of showing the option
   rather than hiding it. This way the row is reachable,
   announced as unavailable, and followed by the sentence saying
   what would make it available. */
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
          {/* Optional. "New dates" needs no second line — the
              fields it reveals are the explanation — and a
              subtitle rendered empty would leave every option
              taller than its content. */}
          {detail && (
            <span className="mt-0.5 block text-[12px] text-ink-500">{detail}</span>
          )}
        </span>
      </button>
      {/* The reason a screen reader user gets, in full
          sentences, because the dates on their own do not
          explain why the option is unavailable — and a dimmed
          control that cannot say why is just a broken one. */}
      {disabled && (
        <p id={reasonId} className="sr-only">
          That window has already closed, so it cannot be given to students starting now.
          Choose new dates instead.
        </p>
      )}
    </>
  )
}

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


/* ============================================================
   THE ⋯ MENU
   ------------------------------------------------------------
   Two items, and they are the two Dhinesh named: Duplicate and
   Unassign. Both are rare and one is destructive, which is the
   whole reason they are behind a press rather than on the row —
   the three visible controls are the ones she reaches for, and
   a fourth and fifth button of equal weight would make the row
   a menu bar.

   Portalled to <body> with fixed positioning taken from the
   button's own rectangle, and flipped above when the window is
   short of room below. The assignment card clips its contents
   (it has to, for the rounded divider under the header), and a
   menu drawn inside it gets sliced off — the same fault, and
   the same fix, as the student row menu in ClassDetail.
   ============================================================ */
export function AssignmentMenu({ assignment: a, onDuplicate, onUnassign }) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState(null)
  const btnRef = useRef(null)
  /* ---- THE MENU NEEDS ITS OWN REF, AND THAT IS NOT OPTIONAL ----
     The close-on-click-away listener runs on MOUSEDOWN, and the
     menu is portalled to <body> — so it is not inside the
     button, and pressing an item closed the menu before the
     CLICK could land. Both items looked present, were
     announced correctly, and did nothing at all.

     A portal escapes the DOM tree, so every "is this inside me"
     test has to be told about it explicitly. Same lesson as the
     student row menu, and the reason DateField carries a
     popRef. */
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const away = (e) => {
      if (btnRef.current?.contains(e.target)) return
      if (menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    const move = () => setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    window.addEventListener('resize', move)
    document.addEventListener('scroll', move, true)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
      window.removeEventListener('resize', move)
      document.removeEventListener('scroll', move, true)
    }
  }, [open])

  function toggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen((o) => !o)
  }

  /* ---- IT OPENS UPWARDS, INTO ITS OWN CARD ----
     The ⋯ sits in the action row at the FOOT of the card, so
     there is never room below it inside the card — a menu
     opening downwards necessarily spilled over the card
     underneath, and read as belonging to that one.

     Opening above puts it over this card's own body, where
     there is room and where it is obviously attached to the
     thing it acts on. Downwards is kept only as the fallback
     for a card near the top of the window, where above would
     run off the screen. Position has to answer "what does this
     belong to" before it answers "where does it fit". */
  const MENU_H = 96
  const below = rect ? rect.top < MENU_H + 16 : false

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More for ${a.title}`}
        className="flex h-8 w-8 items-center justify-center rounded-control text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: below ? rect.bottom + 6 : undefined,
              /* Measured from the button's TOP when flipped, so
                 the menu's foot sits just above the ⋯ rather
                 than overlapping it. */
              bottom: below ? undefined : window.innerHeight - rect.top + 6,
              left: Math.min(rect.right - 184, window.innerWidth - 196),
              width: 184,
            }}
            className="glass-panel z-50 overflow-hidden rounded-card border border-ink-200 py-1"
          >
            <MenuItem
              icon={Copy}
              onClick={() => {
                setOpen(false)
                onDuplicate()
              }}
            >
              Duplicate
            </MenuItem>
            {/* The destructive one is last and red, with a rule
                above it. Position and colour are both doing
                work: nothing lands on it by momentum, and it
                never looks like the item above. */}
            <div className="my-1 border-t border-ink-100" />
            <MenuItem
              icon={Undo2}
              danger
              onClick={() => {
                setOpen(false)
                onUnassign()
              }}
            >
              Unassign
            </MenuItem>
          </div>,
          document.body
        )}
    </>
  )
}

function MenuItem({ icon: Icon, danger, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] transition-colors',
        danger
          ? 'text-alert-700 hover:bg-alert-50'
          : 'text-ink-800 hover:bg-ink-50'
      )}
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </button>
  )
}

/* ---- THE RESOURCES DIALOG IS GONE ----
   It existed to answer "what is in this assignment", and the
   card answers that itself now — numbered, with type badges,
   every row previewable. A dialog whose content has moved onto
   the thing that opened it is a click with nothing behind it.
   The playlist cap of five is what makes listing them on the
   card safe; see the note on AssignmentCard. */

/* ============================================================
   SHARE
   ------------------------------------------------------------
   Honest about what the prototype can and cannot do.

   The receiving side is built — "Shared with you" is a real tab
   with real colleagues' lessons in it — but nothing in this
   prototype sends anything out, and that was already recorded
   as a known gap before this screen existed. So this dialog
   says so, in one sentence, rather than offering a teacher
   picker that would do nothing when pressed.

   A control that pretends to work is worse than one that
   explains why it doesn't: the first costs her trust in every
   other control on the page.
   ============================================================ */
export function ShareAssignmentDialog({ assignment: a, onClose }) {
  if (!a) return null
  return (
    <Sheet
      open
      onClose={onClose}
      title="Share this assignment"
      subtitle={a.title}
      width="sm"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-700">
        Sharing out isn't built in this prototype yet. The receiving side is —
        anything a colleague shares with you arrives in{' '}
        <span className="font-medium text-ink-900">Shared with you</span>, with their
        name on it.
      </p>
      <p className="mt-3 text-[12px] text-ink-500">
        When it is built, this will pick the colleagues to send to and whether they
        can edit their copy or only use it as it stands.
      </p>
    </Sheet>
  )
}

/* ============================================================
   UNASSIGN
   ------------------------------------------------------------
   Named in the numbers she loses rather than as "are you sure?"
   — a confirmation that asks her to be sure of something it has
   not told her is a speed bump, not a safeguard.

   And the consequence is stated at its real size. Taking back
   something nobody has opened costs nothing; taking back
   something sixty-eight children have finished throws their
   work away. Those are different acts and the dialog should not
   describe them in the same sentence. Overstating a consequence
   is not a safe error: a teacher warned gravely about something
   harmless learns to click through the warnings.
   ============================================================ */
/* ---- ONE DIALOG, TWO SCOPES ----
   With `classId` it takes the assignment back from THAT CLASS
   only; without it, from everyone. Two scopes rather than two
   dialogs, because the thing that must not drift between them
   is the sentence naming what is about to be lost — and a
   second copy of this would drift within a month.

   The scope changes the numbers AND the words. A teacher
   pressing Unassign on a class page has not asked to take the
   work off her other five classes, and a confirmation that
   counted them would either frighten her out of a safe action or
   talk her into a destructive one. */
export function UnassignConfirm({ assignment: a, classId, onClose }) {
  const { unassignAssignment, removeClassFromAssignment } = useApp()
  if (!a) return null
  const scoped = !!classId
  const c = scoped ? getClass(classId) : null
  const st = scoped ? assignmentStatsForClass(a.id, classId) : null
  const impact = scoped
    ? { classes: 1, students: st.total, completed: st.completed }
    : unassignImpact(a.id)
  /* Taking the last class off an assignment removes the
     assignment, and she is entitled to know that BEFORE she
     presses the button rather than by noticing it is gone. */
  const last = scoped && a.classIds.length <= 1

  return (
    <Sheet
      open
      onClose={onClose}
      title={scoped ? `Unassign from ${c?.name}?` : 'Unassign this?'}
      subtitle={a.title}
      width="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Keep it
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (scoped) removeClassFromAssignment(a.id, classId)
              else unassignAssignment(a.id)
              onClose()
            }}
          >
            Unassign
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-700">
        {impact.completed === 0 ? (
          scoped ? (
            <>
              It disappears from {impact.students} students in {c?.name}. Nobody there has
              finished it, so no work is lost.
            </>
          ) : (
            <>
              It disappears from {impact.students} students in {impact.classes}{' '}
              {impact.classes === 1 ? 'class' : 'classes'}. Nobody has finished it, so no
              work is lost.
            </>
          )
        ) : (
          <>
            {impact.completed} of {impact.students} students
            {scoped ? ` in ${c?.name}` : ''} have finished it. Their work and their scores
            go with it, and this cannot be undone.
          </>
        )}
      </p>
      {scoped && !last && (
        /* "Your other 1 class keeps it" is what a count-first
           sentence produces, and nobody writes that. At one, the
           number IS "other", so it drops out. */
        <p className="mt-3 text-sm text-ink-700">
          {a.classIds.length - 1 === 1
            ? 'Your other class keeps it.'
            : `Your other ${a.classIds.length - 1} classes keep it.`}
        </p>
      )}
      {last && (
        <p className="mt-3 text-sm text-ink-700">
          {c?.name} is the only class on this, so the assignment goes with it and leaves
          the Assigned list.
        </p>
      )}
      <p className="mt-3 text-[12px] text-ink-500">
        The resources stay in the library. This only takes back what you sent.
      </p>
    </Sheet>
  )
}

function SharedWithYou({ onPreview }) {
  const { sharedTeachers, sharedPlaylists, sharedResources } = useApp()
  const [who, setWho] = useState('all')

  /* Only colleagues who have actually sent something. A filter
     listing a name with nothing behind it invites a click that
     lands on an empty page, and the teacher blames the page. */
  const senders = sharedTeachers.filter((t) =>
    sharedPlaylists.some((p) => p.from === t.id) ||
    sharedResources.some((r) => r.from === t.id)
  )

  const visible = who === 'all' ? senders : senders.filter((t) => t.id === who)

  if (senders.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nothing shared with you yet"
        description="When another teacher sends you a lesson or a resource, it lands here."
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          title="Shared with you"
          description="Lessons and resources other teachers have sent. Assign one as it stands, or save a copy to make it yours."
          className="mb-0"
        />
        {/* More than one sender, or no filter. One colleague
            and a dropdown with a single name in it is a
            control that can only tell you what you can
            already see. */}
        {senders.length > 1 && (
          <TeacherFilter teachers={senders} value={who} onChange={setWho} />
        )}
      </div>

      {visible.map((t) => {
        const lists = sharedPlaylists.filter((p) => p.from === t.id)
        const loose = sharedResources.filter((r) => r.from === t.id)
        const total = lists.length + loose.length

        return (
          <section key={t.id} className="space-y-5">
            {/* The teacher's own row. It is a heading, not a
                card: a box around each colleague would make
                three people look like three products. */}
            <div className="flex items-center gap-3 border-b border-ink-200 pb-3">
              <Avatar initials={t.initials} tone="brand" />
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-ink-900">
                  {t.name}
                </p>
                <p className="truncate text-[12px] text-ink-500">{t.detail}</p>
              </div>
              <span className="ml-auto shrink-0 text-[12px] text-ink-400">
                {total} {total === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* ---- TWO KINDS, NAMED ----
                A teacher scanning Marcus's group sees two
                white cards and then a card with a coloured
                header, and without a word the third one reads
                as a third lesson. The difference between "a
                sequenced lesson" and "one resource I thought
                you'd like" is the whole difference in what she
                does next.

                Quiet labels rather than full section headers:
                Saved already splits these two with "Saved
                playlists" and "Saved resources", so the same
                split named the same way means she meets the
                distinction once. They show even when a
                colleague sent only one kind — a label that
                appears and disappears depending on what is
                underneath it is a label she has to notice
                before she can rely on. */}
            {lists.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-semibold text-ink-500">
                  Playlists
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lists.map((pl) => (
                  <SavedPlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onPreview={onPreview}
                    sharedBy={t}
                  />
                ))}
                </div>
              </div>
            )}

            {loose.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-semibold text-ink-500">
                  Single resources
                </p>
                <ResourceLayout>
                  {loose.map((share) => {
                    const r = getResource(share.resourceId)
                    return r ? (
                      <ResourceTile
                        key={share.id}
                        resource={r}
                        onPreview={onPreview}
                        showStandard
                      />
                    ) : null
                  })}
                </ResourceLayout>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

/* ---- The teacher filter ----
   Built to match GradeSelector rather than reaching for a
   native <select>, because the two would sit on the same
   screen and a native menu next to a styled one looks like
   two different products stapled together.

   "All teachers" is a real option in the list, not just the
   starting state, so the way back is where she'd look for it
   — in the menu she used to leave it. */
function TeacherFilter({ teachers, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = teachers.find((t) => t.id === value)

  useEffect(() => {
    if (!open) return
    const away = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const options = [{ id: 'all', name: 'All teachers', detail: null }, ...teachers]

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by the teacher who shared"
        className={cx(
          'flex h-9 items-center gap-2 rounded-control border bg-white px-3 text-[14px] transition-colors',
          open ? 'border-brand-500' : 'border-ink-300 hover:border-ink-400'
        )}
      >
        <Users className="h-4 w-4 shrink-0 text-ink-400" />
        <span className="max-w-[180px] truncate font-medium text-ink-900">
          {selected ? selected.name : 'All teachers'}
        </span>
        <ChevronDown
          className={cx(
            'h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="glass-panel absolute right-0 top-full z-30 mt-1.5 w-max min-w-full max-w-[22rem] overflow-hidden rounded-card border border-ink-300"
        >
          {options.map((t) => {
            const isSelected = t.id === value
            return (
              <button
                key={t.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(t.id)
                  setOpen(false)
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                  isSelected ? 'bg-brand-50' : 'hover:bg-ink-50'
                )}
              >
                {t.id === 'all' ? (
                  <Users className="h-6 w-6 shrink-0 rounded-full bg-ink-100 p-1.5 text-ink-500" />
                ) : (
                  <Avatar initials={t.initials} size="sm" tone="brand" />
                )}
                <span className="min-w-0">
                  <span
                    className={cx(
                      'block truncate text-[14px]',
                      isSelected ? 'font-semibold text-brand-800' : 'text-ink-900'
                    )}
                  >
                    {t.name}
                  </span>
                  {t.detail && (
                    <span className="block truncate text-[12px] text-ink-400">
                      {t.detail}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check className="ml-auto h-4 w-4 shrink-0 text-brand-600" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
