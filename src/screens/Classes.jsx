/* ============================================================
   CLASSES  (merges My Groups + Workspace)
   ------------------------------------------------------------
   THE ARGUMENT FOR MERGING

   In the live product these are two tabs holding the same data
   sorted two different ways:

     Workspace  — assignments, with groups nested inside them
     My Groups  — groups, with students nested inside them

   Neither one answers the question a teacher actually asks
   walking down the corridor: "what is 3rd Period doing right
   now, and is anyone stuck?" To get that today you open
   Workspace, expand each assignment, and check whether 3rd
   Period appears in it. That's a search, performed by a human,
   over data the software already has.

   A class is a real thing in a teacher's life. An assignment is
   an event that happens to a class. So the class is the
   container, and the assignment lives inside it.

   WHAT THE CARDS SAY
   The live Groups card shows a name, a student count and an
   "Add Student" button. Add Student is an admin task done in
   August; it doesn't deserve the primary slot for the other
   nine months. These cards lead with what's live right now and
   who needs help.

   ---- Compare this with Option B ----
   Flip the A/B switch in the header. Option B keeps a separate
   top-level Assignments section alongside this one. Same data,
   different front door. Click through both and see which
   matches how you'd actually look for something.
   ============================================================ */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert, Plus } from 'lucide-react'
import {
  classStats,
  assignmentsForClass,
  dueLabel,
  studentsInClass,
  progressFor,
} from '../data/mock'
import ClassActions from '../flows/ClassActions'
import NewClassDialog from '../flows/NewClassDialog'
import { useApp } from '../store'
import {
  Button,
  ProgressBar,
  Score,
  cx,
} from '../components/ui'

export default function Classes() {
  const { ia, classList, justCreated } = useApp()
  const [creating, setCreating] = useState(false)

  /* ---- TAKE HER TO THE THING SHE JUST MADE ----
     A new class lands at the end of the grid, which on five
     existing classes is below the fold. Creating something and
     being returned to a screen that looks exactly as it did
     before is the same as creating nothing.

     So the card is scrolled to and outlined for a moment. This
     is the confirmation pattern the tray settled on: show the
     real object in its real place rather than a message about
     it. `block: 'center'` rather than the default, so the card
     lands where the eye already is instead of at the very
     bottom edge of the window. */
  useEffect(() => {
    if (!justCreated) return
    const el = document.getElementById(`class-${justCreated}`)
    if (!el) return
    /* Same guard as the assignment card in Reports: scrolling is
       for showing her something she cannot see. A new class
       added to a short list is already on screen, and moving the
       page under her to "reveal" it is a jolt that says nothing.
       The outline still does the confirming either way. */
    const r = el.getBoundingClientRect()
    if (r.top >= 0 && r.bottom <= window.innerHeight) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [justCreated])

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Classes</h1>
          {/* The subtitle used to define what the averages
              counted. There are none left to define, so it says
              the one thing a teacher needs to know about the
              screen she is now looking at: the scores she came
              for are one click further in. */}
          <p className="mt-1 text-sm text-ink-500">
            {ia === 'merged'
              ? 'Your rosters and everything assigned to them, in one place.'
              : 'Your rosters. Assignments have their own section in this layout.'}{' '}
            Open a class to see how it is doing.
          </p>
        </div>
        <Button variant="secondary" icon={Plus} onClick={() => setCreating(true)}>
          New class
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {classList.map((cls) => (
          <ClassCard
            key={cls.id}
            cls={cls}
            showAssignments={ia === 'merged'}
            isNew={cls.id === justCreated}
          />
        ))}
      </div>

      <NewClassDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}

/* ---- HOW MANY ASSIGNMENTS A CARD SHOWS ----
   Two. It was three, which fitted but did not read: three
   titles, three bars, three counts and three due phrases is
   twelve pieces of information stacked under a heading, on a
   card that has already said the class name, its size, its
   average and how many children are struggling. Dhinesh called
   it crowded and the word is exact — nothing was wrong, there
   was just no air.

   Two is also the number that makes the overflow line ordinary
   rather than exceptional. At three, "+1 more assigned"
   appeared on one card in five and looked like an edge case; at
   two it appears on four of them, so a teacher learns in one
   glance that the card shows the front of a list rather than
   the list.

   One constant rather than three literals, because the number
   appears in the slice, in the test for the overflow line and
   in the subtraction inside it — and a card that showed two and
   then said "+2 more" out of four would be quietly lying. */
const SHOWN_ASSIGNMENTS = 2

function ClassCard({ cls, showAssignments, isNew }) {
  const stats = classStats(cls.id)
  const roster = studentsInClass(cls.id)

  /* Sorted once, here, rather than relied on to arrive in a
     useful order. `slice()` first because `sort` mutates, and
     this array is shared with every other screen reading the
     same class. */
  const byDue = assignmentsForClass(cls.id)
    .filter((a) => a.status === 'active')
    .slice()
    .sort((a, b) => a.due.localeCompare(b.due))

  return (
    /* ---- THE WHOLE CARD IS THE LINK ----
       It used to carry three of them — the title, the red
       banner and an "Open class" button at the foot — all
       pointing at the same screen. Three targets for one
       destination is not three times easier to reach; it is
       three things to read before you find out they were the
       same thing.

       So the card is one link and the button is gone. A card
       that does exactly one thing when you press it anywhere is
       the least you have to explain, and the foot of the card
       gets its space back.

       This is the opposite of the rule on resource cards, where
       only the coloured band opens the preview — and the reason
       is the difference between the two. A resource card has
       five controls inside it, so a click on the card has to
       mean nothing or it would swallow them. This card has
       none. */
    /* ============================================================
       THE CARD IS THE CHROME; THE LINKS ARE INSIDE IT

       This used to be one enormous <a> with a ⋯ button laid
       over its corner. It is now a plain container holding two
       links and a button, and the reason is Dhinesh's: the
       assignments list wants its own destination.

       WHY THAT IS RIGHT RATHER THAN JUST CONVENIENT. A card
       with one target has to answer "what is this about?" with
       a single answer, and this card has genuinely been about
       two things since the assignments list arrived — who is in
       this class, and what it is working on. Sending a teacher
       who clicked a row of due dates to a roster is making her
       pay for our tidiness with a second click and a tab
       change.

       ---- AND THE SECOND DESTINATION IS A CARD, NOT A REGION ----
       My first attempt split the surface in two and told them
       apart with a hover tint. Dhinesh caught what that costs:
       at rest the card is one flat sheet, so the only thing
       announcing a second destination is a colour that appears
       after you have already pointed at it. A teacher who never
       hovers never learns it is there, and on a tablet — the
       secondary device for this product — there is no hover at
       all, so she never could.

       Nesting it as its own card puts the seam in the layout
       instead of in an interaction. Two objects, visible as two
       objects before anything is touched. It also lands beside
       the alert band, which has been a nested tinted block
       since the first draft — so the card now reads as a
       heading with two panels under it rather than as a sheet
       with an invisible fold.

       The rule this doesn't break is the one about resource
       cards: never let a card-wide click swallow controls
       inside it. There are no controls inside either panel.

       And the menu is still a sibling rather than a child: a
       button inside an <a> is invalid markup that browsers
       resolve by guessing, which here would mean "Rename"
       navigating into the class as well as opening the dialog.
       ============================================================ */
    <div
      id={`class-${cls.id}`}
      className={cx(
        'relative flex flex-col rounded-card border bg-white transition-all',
        /* The just-created outline is the brand ring the Library
           category cards settled on — same signal, same colour,
           so "this is the one" means one thing across the
           product. It fades itself after a few seconds; a card
           that wore it permanently would be claiming newness
           long after it stopped being news. */
        isNew
          ? 'border-brand-600 shadow-raised ring-2 ring-brand-600 ring-offset-2'
          : 'border-ink-200 shadow-card hover:border-ink-300 hover:shadow-raised'
      )}
    >
    <Link
      to={`/classes/${cls.id}`}
      /* Rounded only at the top, so its hover tint stops at the
         card's own corners instead of squaring them off. */
      /* No background of its own. The identity block IS the
         card — tinting it would have made it look like a third
         panel floating on the one it is already part of, and
         it would have been the same grey as the assignments
         card at rest. Its hover signal is the class name
         turning brand, which it has had since the first
         version. */
      className="group block px-5 pb-0 pt-5"
    >
      {/* ============================================================
          IDENTITY  —  and why the label moved off the card

          THE PROBLEM DHINESH SPOTTED. The name and the score
          label were sharing one row, and the label was 242px of
          `whitespace-nowrap` — a block that refuses to shrink.
          "1st Period" leaves it room; "Mrs. Patel — 5th Grade
          Science, Block B" does not, so the name wraps to three
          lines against a rigid neighbour and the head of the
          card goes to pieces. A name a teacher typed herself is
          the one string on this screen whose length we do not
          control, so it must never be the thing that gives.

          WHY NOT JUST DELETE THE QUALIFIER. Because we added it
          for a reason: "74% / Average score" is a number with no
          question attached, the same fault as the old "Class
          average" in Library. Deleting it fixes the layout by
          re-breaking the meaning.

          THE REAL FAULT IS REPETITION, NOT LENGTH. Five cards in
          a grid all carry the identical label. It is not five
          facts, it is one fact printed five times — and it is
          the printing that crowds the name. So the qualifier
          moves up to the page subtitle, where it is said once
          and governs every card under it, the way a column
          header governs a column. Same rule we settled on in
          Library: say a fact once, at the level that owns it.

          WHAT'S LEFT IS A SENTENCE. "24 students" and "74%
          average score" now sit on one baseline as two short
          facts about this class, reading the way a teacher would
          say them out loud. `flex-wrap` means that if the card
          ever gets narrow enough, they stack instead of
          colliding — the layout degrades by stacking, never by
          squeezing the name.
          ============================================================ */}
      <div>
        {/* The name gives the menu room rather than running
            under it. `pr-9` is the button's width plus the
            card's own padding — a long class name wraps above
            the control instead of disappearing behind it.

            ---- 16px, AND DELIBERATELY NOT 14 ----
            I changed this to 14px to match every other card
            title, off the back of Dhinesh ASKING what the size
            was. He had asked a question, not requested a change,
            and I turned the answer into an edit. Reverted.

            Worth recording that the inconsistency is real — this
            is the only 16px title in the product — and that
            there is a decent case for it staying: this card is
            the primary object on its screen, with a whole
            assignments panel nested inside it, where the others
            are tiles in a grid. If it is ever made to match,
            that should be a decision rather than a tidy-up
            somebody did while answering a question.

            ---- IT IS AN <h3> NOW ----
            It was a <p>, so a screen reader found no heading on
            a card whose entire purpose is to name a class. Every
            other card title in the product is an <h3>; this one
            was styled like a heading without being one, which is
            the kind of defect that never shows up in a
            screenshot. */}
        <h3 className="pr-9 text-base font-semibold text-ink-900 group-hover:text-brand-700">
          {cls.name}
        </h3>

        {/* No time, no room. See the note on `classes` in
            mock.js — the product does not own the teacher's
            timetable and should not print one. These two are
            the facts about a class it genuinely holds. */}
        {/* ---- JUST THE SIZE NOW ----
            The average left with everything else score-shaped.
            A class card answers who and how many; how well is
            Reports' question, and asking it here was what made
            Reports redundant. */}
        <p className="mt-1 text-[12px] text-ink-500">{stats.size} students</p>
      </div>
    </Link>

      {/* ============================================================
          THE "N STUDENTS NEED HELP" BAND IS GONE

          It was the loudest thing on this screen and the least
          able to do anything about itself: a teacher who read
          "11 students need help" could not act on it here, and
          the five red bands across five cards were the live
          product's "everything is orange" fault in a different
          colour.

          It has moved to the class report, where the number is
          followed by the eleven children, each with a Coach
          button. The same fact, in the place that can finish the
          sentence.

          Worth recording what this dissolved rather than moved:
          the calibration question — 53 of 110 flagged, every
          card red — stopped being a design problem the moment
          the alarm landed on a screen that can act on it. When a
          restructure makes a problem disappear instead of
          relocating it, the structure was the problem.
          ============================================================ */}

      {showAssignments && (
        /* ---- ITS OWN DESTINATION ----
           Straight to this class's Assignments tab, not the
           roster. The heading picks up the brand colour on
           hover alongside the tint, so the region announces
           that it leads somewhere of its own rather than
           relying on the teacher discovering it by accident. */
        <Link
          to={`/classes/${cls.id}?tab=assignments`}
          /* ---- A CARD INSIDE THE CARD ----
             Same shape language as the alert band directly
             above it: `rounded-control`, a one-step border, a
             tint off the card's white. That is what makes the
             two read as siblings rather than as one styled
             thing and one unstyled one.

             On hover it comes UP rather than darkening — white
             fill, firmer border, a small shadow — so the panel
             lifts off the card it is sitting on. Darkening
             would have moved it further into the background,
             which is the wrong direction for something you are
             about to press.

             `mx-5 mb-5` rather than padding on the parent: the
             panel is inset by the card's own gutter, so its
             edges line up with the alert band's and with the
             class name's. `flex-1` makes it take the rest of
             the height, which is what keeps the five cards in a
             row the same size. */
          className={cx(
            'group/asn m-5 mt-4 block min-h-0 flex-1 rounded-control border p-3 transition-all',
            'border-ink-200 bg-ink-50',
            'hover:border-ink-300 hover:bg-white hover:shadow-card'
          )}
        >
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400 transition-colors group-hover/asn:text-brand-700">
            Assignments · due next
          </p>
          {byDue.length === 0 ? (
            <p className="text-[12px] text-ink-400">Nothing assigned right now.</p>
          ) : (
            <ul className="space-y-2.5">
              {byDue.slice(0, SHOWN_ASSIGNMENTS).map((a) => {
                const done = roster.filter(
                  (s) => progressFor(s.id, a.id)?.state === 'completed'
                ).length
                const due = dueLabel(a.due)
                return (
                  <li key={a.id}>
                    <p className="truncate text-[12px] font-medium text-ink-800">
                      {a.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar value={done} total={roster.length} />
                      <span className="tnum shrink-0 text-[12px] text-ink-500">
                        {done}/{roster.length}
                      </span>
                    </div>
                    {/* ---- THE TEKS CODE IS GONE ----
                        It read "5.6C · due in 3 days". Dhinesh
                        cut the code, and it's the right cut: a
                        bare "5.6C" is a filing reference, not a
                        fact about this class. The teacher
                        already knows what she assigned — the
                        title above says "Solutions — module and
                        review" — so the code was answering a
                        question nobody standing here is asking.
                        It belongs on the assignment itself,
                        where it's needed for reporting, not on
                        five cards in a grid.

                        What's left is the one thing this line
                        was for: how long is left. It changes
                        colour only when it has earned it, so a
                        red word on this card always means the
                        same thing. */}
                    <p
                      className={cx(
                        'mt-0.5 text-[12px]',
                        due.tone === 'alert' && 'font-medium text-alert-600',
                        due.tone === 'watch' && 'font-medium text-watch-700',
                        due.tone === 'normal' && 'text-ink-400'
                      )}
                    >
                      {due.text}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
          {byDue.length > SHOWN_ASSIGNMENTS && (
            <p className="mt-2 text-[12px] text-ink-400">
              +{byDue.length - SHOWN_ASSIGNMENTS} more assigned
            </p>
          )}
        </Link>
      )}

      {/* Top-right, over the card's own padding. `z-10` clears
          the link; the inset ring on a just-created card is
          drawn outside, so nothing collides. */}
      <div className="absolute right-3.5 top-3.5 z-10">
        <ClassActions cls={cls} />
      </div>
    </div>
  )
}
