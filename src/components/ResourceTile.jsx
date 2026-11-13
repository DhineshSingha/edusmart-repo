/* ============================================================
   RESOURCE TILE  —  the one card, used everywhere
   ------------------------------------------------------------
   Every resource in the product renders through this component:
   inside a TEKS, in Recently opened, in Saved, in search, and in
   the two Challenges collections. One component rather than five
   that look alike, so they cannot drift apart.

   ------------------------------------------------------------
   THE THUMBNAIL CAME BACK, SMALLER, AND THAT'S THE RIGHT ANSWER

   I removed the big type block because it was two-thirds of the
   card. Dhinesh then pointed out what went with it: the card
   stopped LOOKING like something you could preview. His
   original design conveyed that properly and mine didn't.

   Both of us were right about different things, and the mistake
   was treating it as one decision. The block had two jobs —
   naming the type, and being an obvious preview target. I
   deleted the whole thing to fix the first job and lost the
   second by accident.

   I first split them — a thin strip up top, a small thumbnail
   in the body — and Dhinesh put them back together, which was
   right. One coloured band does both jobs: it names the type
   and it is the thing you press. About a third of the old
   block's area, and far more explicit than it ever was, because
   it carries an actual play symbol rather than the letters
   "IM".

   THE LESSON, which is the one I keep relearning on this
   project: when something is too big, shrink it. Don't delete
   it and hope nobody notices what it was doing.

   ------------------------------------------------------------
   THE DESCRIPTION IS NOW A BUTTON

   It used to sit on every card as two lines of grey text. Nine
   cards meant eighteen lines of prose a teacher scanned past to
   reach the names — and the descriptions are near-identical
   within a type ("The core video lesson…" on every module).

   So it's a control now, and the text arrives only when asked
   for. That's the same exception-reporting idea as the lagging
   flag on the Library grid: content that is the same everywhere
   shouldn't be shown everywhere.

   The 5E phase came off for the plainer reason that Dhinesh
   asked and it doesn't drive the choice — the phase is already
   how the list is filtered one level up.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import {
  Play,
  FileText,
  PenLine,
  ClipboardCheck,
  MoreHorizontal,
  GraduationCap,
  BookUser,
  Share2,
  Info,
  Check,
  Plus,
  Bookmark,
} from 'lucide-react'
import { resourceTypes, getStandard } from '../data/mock'
import { typeStyle } from '../data/typeColors'
import { useApp } from '../store'
import { Button, cx } from './ui'
import AssignSheet from '../flows/AssignSheet'

const mediaIcons = {
  video: Play,
  doc: FileText,
  interactive: PenLine,
  assessment: ClipboardCheck,
}

/* ============================================================
   THE CONTAINER
   ------------------------------------------------------------
   Every place that shows a run of resources uses this instead
   of repeating `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` in
   seven files. It briefly also rendered a list variant; Dhinesh
   looked at it and chose cards, so the list has gone the way of
   the other two calendars — recoverable from the prototype's
   history (version 56) if it ever comes back up.

   The wrapper stays, one option or not. Seven copies of a grid
   class is seven chances for one of them to drift.
   ============================================================ */
export function ResourceLayout({ children, className }) {
  return (
    <div className={cx('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  )
}

export default function ResourceTile({
  resource,
  onPreview,
  showStandard = false,
  /* ============================================================
     READ-ONLY
     ------------------------------------------------------------
     The tile shown inside "What's in this assignment" is a
     RECORD of what was sent, not a shelf to act from. Assigning
     from it would assign the single resource, not the
     assignment it is part of — two different things wearing the
     same word — and saving or playlisting from a historical
     record is a thought a teacher is not having while reading
     one.

     SO THE ROW IS DIMMED, NOT REMOVED. Dropping it would change
     the tile's height and make this card a different card from
     the one in Browse, which is the whole reason the same
     component is used here. Dimming keeps the shape, keeps the
     information that these actions exist, and says plainly that
     they are not available HERE.

     Preview stays live. Looking at the material is the reason
     this dialog exists, and it is the one thing on the tile
     that reads rather than writes.
     ============================================================ */
  readOnly = false,
}) {
  const {
    isInPlaylist,
    toggleInPlaylist,
    playlistFull,
    playlistMax,
    isSaved,
    toggleSaved,
    language,
    editingPlaylist,
  } = useApp()
  const meta = resourceTypes[resource.type]
  const MediaIcon = mediaIcons[meta.media] ?? FileText
  const added = isInPlaylist(resource.id)
  /* A full playlist doesn't hide this button or grey it without
     explanation — it SAYS it's full. "Playlist full" tells her
     what happened and implies what to do (take something out);
     a dead grey button tells her the product is broken. */
  const blocked = playlistFull && !added
  const saved = isSaved(resource.id)
  const assignable = resource.forStudents
  const std = getStandard(resource.standardId)
  const tint = typeStyle(resource.type)

  const [lang, setLang] = useState(language)
  useEffect(() => setLang(language), [language])

  const [menuOpen, setMenuOpen] = useState(false)
  const [descOpen, setDescOpen] = useState(false)
  const menuRef = useRef(null)
  const descRef = useRef(null)

  /* One outside-click handler for both popovers. */
  useEffect(() => {
    if (!menuOpen && !descOpen) return
    const away = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (descRef.current && !descRef.current.contains(e.target)) setDescOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [menuOpen, descOpen])

  /* Kept even though the card no longer listens for clicks: the
     Assign dialog is rendered inside this card, and a click inside
     it must not travel out to anything the card sits in. */
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn?.(e)
  }

  const preview = () => onPreview?.(resource)

  /* ---- Assign ----
     Every Assign button in the product now opens the real
     dialog. They were placeholders, which is a particular kind
     of prototype rot: the screen looks finished, so nobody
     notices the one button a teacher would press first does
     nothing. A demo fails on exactly that click.

     The dialog lives INSIDE the card rather than being lifted
     to the screen, so any grid of resources gets it for free.
     It renders only while open, so a page of twelve cards
     isn't carrying twelve hidden dialogs. */
  const [assigning, setAssigning] = useState(false)

  /* ---- ICON-ONLY BUTTONS CARRY BOTH LABELS ----
     Dhinesh hovered the ⋯ and nothing appeared, while the
     bookmark beside it said "Save for later". Inconsistent, and
     the inconsistency is the tell: aria-label had been written
     wherever a screen reader needed it and title wherever I
     happened to think of it.

     They answer the same question for two different people. An
     icon with no words is a small bet that its meaning is
     obvious — ⋯ and ⓘ are about as close to universal as icons
     get, and still neither says WHAT is behind it. The tooltip
     costs nothing, arrives only if she pauses, and is the
     difference between guessing and knowing.

     So every icon-only control in the product now has both, and
     they say the same words. Where they disagreed, the shorter
     and plainer name won: "More actions" became "More options"
     and "What this is" became "Description" — both Dhinesh's
     wording, and both better than mine for the same reason. A
     label is a NAME for the thing behind the control, not a
     sentence explaining it. "Description" is what the popover
     contains; "What this is" was me narrating.

     ---- The shared right-hand controls ----
     Written once and used by both shapes. If the row and the card
     grew their own copies they would drift within a week, and
     then "Save for later" would mean two slightly different
     things depending on which view you were in. */
  const descButton = (
    <div className="relative shrink-0" ref={descRef}>
      <button
        onClick={stop(() => {
          setMenuOpen(false)
          setDescOpen((o) => !o)
        })}
        aria-label="Description"
        title="Description"
        aria-expanded={descOpen}
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-control transition-colors',
          descOpen
            ? 'bg-ink-100 text-ink-800'
            : 'text-ink-400 hover:bg-ink-100 hover:text-ink-800'
        )}
      >
        <Info className="h-4 w-4" />
      </button>
      {descOpen && (
        <div className="glass-panel absolute bottom-full right-0 z-30 mb-1.5 w-64 rounded-card border border-ink-300 p-3 text-left">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
            {meta.label}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-700">{resource.blurb}</p>
          {assignable && (
            <p className="mt-2 text-[12px] text-ink-500">
              {resource.minutes} min · {resource.phase}
            </p>
          )}
        </div>
      )}
    </div>
  )

  const saveButton = (
    <button
      onClick={stop(() => toggleSaved(resource.id))}
      aria-label={saved ? 'Remove from Saved' : 'Save for later'}
      aria-pressed={saved}
      title={saved ? 'Saved — press to remove' : 'Save for later'}
      className={cx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-control transition-colors',
        saved
          ? 'text-brand-600 hover:bg-ink-100'
          : 'text-ink-400 hover:bg-ink-100 hover:text-ink-800'
      )}
    >
      <Bookmark className={cx('h-4 w-4', saved && 'fill-current')} />
    </button>
  )

  const moreButton = (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={stop(() => {
          setDescOpen(false)
          setMenuOpen((o) => !o)
        })}
        aria-label="More options"
      title="More options"
        aria-expanded={menuOpen}
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-control transition-colors',
          menuOpen
            ? 'bg-ink-100 text-ink-800'
            : 'text-ink-400 hover:bg-ink-100 hover:text-ink-800'
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menuOpen && (
        <div className="glass-panel absolute bottom-full right-0 z-30 mb-1.5 w-44 overflow-hidden rounded-card border border-ink-300 py-1 text-left">
          {/* NO PREVIEW ITEM. The coloured band above already
              opens it, and it's the most visible thing on the
              card — a play symbol on a tinted block, the one
              affordance we spent three rounds getting right.

              A menu entry for it is a second door to a room
              you're already standing in. Worse, it quietly
              undermines the band: if preview lives in the menu
              too, then the band isn't THE way in, it's A way in,
              and a teacher who finds the menu first never learns
              the faster route.

              The four things left in here are the ones with no
              other home. That's what a ⋯ menu is for. */}
          {[
            { icon: BookUser, label: 'Student version' },
            { icon: GraduationCap, label: 'Teacher version' },
            { icon: Share2, label: 'Share' },
          ].map(({ icon: Icon, label, act }) => (
            <button
              key={label}
              onClick={stop(() => {
                setMenuOpen(false)
                act?.()
              })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] text-ink-800 transition-colors hover:bg-ink-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-ink-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const langToggle = (
    <span className="flex shrink-0 items-center gap-0.5">
      {['EN', 'ES'].map((l) => (
        <button
          key={l}
          onClick={stop(() => setLang(l))}
          className={cx(
            'rounded px-1 py-0.5 text-[12px] transition-colors',
            /* Brand, matching the page-level language selector.
               I had argued for ink here — one selector on the
               page, nine toggles in a grid, and the rule that
               colour is for things there is one of.

               Dhinesh overruled it, and he's right for a reason
               I weighted wrong: these two controls are the SAME
               IDEA, and a teacher who has just set the page to
               Spanish should see the same colour when she
               overrides one card back to English. Consistency
               between two instances of one concept beats a
               general rule about restraint, because the rule was
               protecting against visual noise and two small
               letters aren't noisy.

               The ink version is also genuinely ambiguous: at
               12px, semibold-dark against light-grey reads as
               "enabled and disabled" rather than "chosen and
               available". */
            lang === l ? 'font-semibold text-brand-700' : 'text-ink-300 hover:text-ink-600'
          )}
        >
          {l}
        </button>
      ))}
    </span>
  )

  const assignSheet = (
    <div onClick={(e) => e.stopPropagation()}>
      <AssignSheet
        open={assigning}
        onClose={() => setAssigning(false)}
        resourceIds={[resource.id]}
        onAssigned={() => setAssigning(false)}
      />
    </div>
  )

  return (
    <article
      className={cx(
        /* ---- THE CARD IS NOT A BUTTON ANY MORE ----
           It used to be: role="button", the whole surface
           clickable, with four real controls sitting on top of it
           that each had to stop their click from reaching the
           card underneath.

           Dhinesh's call, and it settles something that was quietly
           wrong. A card whose every pixel does one thing, except
           the six patches that do six other things, is a card you
           can only use confidently after you have learned where
           its holes are. The teacher can't see the holes. She
           presses near the duration to read it and a video opens.

           Now exactly one region opens the preview — the coloured
           band, which is the part that already LOOKS like a
           thumbnail and already carries the play symbol. The white
           area is what it appears to be: text you can read and
           select, and a row of controls you press deliberately.

           Nothing was lost. The band was always the obvious target;
           the rest of the card was a silent second one. */
        'group relative flex flex-col rounded-card border border-ink-200 bg-white',
        'text-left shadow-card',
        /* NOT `overflow-hidden`, which is what clipped the ⋯ menu
           at the top of the card in Dhinesh's screenshot. A
           popover that escapes its parent needs the parent not to
           clip — so the rounded corners are applied to the strip
           and the action row directly instead.

           And while a popover is open this card lifts above its
           neighbours; without it the menu slides under the card
           to its right, which is the same bug wearing a different
           hat. */
        menuOpen || descOpen ? 'z-20' : ''
      )}
    >
      {/* ---- The coloured band: the type, and the way in ----
          One block doing two jobs that belong together — it says
          what kind of resource this is AND it is the thing you
          press to look at it. That's how the live product reads,
          and splitting them across two places (a strip up here,
          a thumbnail down there) was me solving a problem nobody
          had. Dhinesh put them back together. */}
      <button
        onClick={stop(preview)}
        aria-label={`Preview ${resource.shortTitle}`}
        title="Preview"
        /* The band and its contents scale; the TEXT SIZES DON'T.
           That's the distinction Dhinesh drew and it's the right
           one — a card can feel roomier without its words
           getting louder. Height comes from padding and from the
           badge, both of which are shape rather than content. */
        className={cx(
          'flex cursor-pointer items-center gap-3.5 rounded-t-card border-b px-5 py-6',
          'transition-[filter] hover:brightness-[0.97]'
        )}
        style={{ background: tint.band, borderColor: tint.line, color: tint.ink }}
      >
        {/* The badge says what KIND of thing opens, not the
            generic fact that something does. A play triangle on
            a worksheet would be a small lie; an eye on one was
            technically honest and told a teacher nothing she
            couldn't already guess.

            So the badge carries the resource's own media icon —
            play for video and interactives, a document for
            printables, a clipboard for assessments. The white
            circle is what says "press me"; the icon inside it is
            free to be specific. */}
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-card ring-1 ring-black/5 transition-transform group-hover:scale-105">
          {meta.media === 'video' || meta.media === 'interactive' ? (
            <Play className="h-5 w-5 translate-x-px fill-current" />
          ) : (
            <MediaIcon className="h-5 w-5" />
          )}
        </span>
        <p className="truncate text-[12px] font-semibold uppercase tracking-wide">
          {meta.label}
        </p>
      </button>

      {/* ---- Everything you read ---- */}
      <div className="flex flex-1 flex-col px-5 py-5">
        {/* The code is on EVERY card, in all contexts. It used to
            appear only in search and Saved, on the theory that
            inside 5.6A every card repeating "5.6A" carries
            nothing. That was right about the grid and wrong about
            the teacher: a resource gets copied into a playlist,
            shown to a colleague, or found again three screens
            later, and then the card has to say what it belongs to
            on its own. */}
        <p className="truncate text-[12px] font-semibold text-ink-500">
          {std ? std.id : 'Grade 5'}
          {showStandard && std && (
            <span className="font-normal text-ink-400"> · {std.title}</span>
          )}
        </p>

        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-ink-900">
          {resource.shortTitle}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="truncate text-[12px] text-ink-500">
            {assignable ? `${resource.minutes} min` : 'Reference'}
            {resource.scope !== 'teks' && ' · whole grade'}
          </span>

          {langToggle}
        </div>
      </div>

      {/* ---- Actions ---- */}
      {/* Two layers when read-only, deliberately. The OUTER one
          keeps its pointer events so the tooltip still appears
          on hover and the reason is reachable; the INNER one
          drops them so nothing inside can be pressed or focused.
          A single `pointer-events-none` would have taken the
          explanation away with the controls, which is the fault
          this pattern exists to avoid — a dimmed control that
          cannot say why is just a broken one. */}
      <div
        {...(readOnly
          ? {
              'aria-disabled': true,
              'aria-describedby': `${resource.id}-readonly`,
              title: 'Open this in the Library to assign or save it',
              className: 'cursor-default',
            }
          : {})}
      >
        {readOnly && (
          <p id={`${resource.id}-readonly`} className="sr-only">
            These actions are unavailable here. This is a record of what was
            assigned — open the resource in the Library to assign, save or add it to a
            playlist.
          </p>
        )}
      <div
        className={cx(
          'flex items-center gap-1 rounded-b-card border-t border-ink-100 px-4 py-2.5',
          readOnly && 'pointer-events-none select-none opacity-45'
        )}
      >
        {assignable ? (
          <>
            <Button size="sm" variant="soft" onClick={stop(() => setAssigning(true))}>
              Assign
            </Button>
            {/* ---- THE BUTTON SAYS WHERE IT IS SENDING THINGS ----
                Dhinesh found the bug the hard way: with a saved
                lesson open and the tray tucked away, this button
                said "Playlist" — exactly what it says when
                nothing is open — and quietly fed his resource
                into that lesson. Same words, different outcome.
                That is a mode error, and the cure is never to
                ask people to remember the mode; it is to write
                the mode on the control they are about to press.

                "Add to OPEN playlist" rather than the lesson's
                name, and that was Dhinesh's call once we looked
                at the data: saved names run to 34 characters
                ("Sinking and floating — full lesson") and the
                naming dialog encourages exactly that. A name
                here would truncate differently on every card,
                so the action row would change width as the eye
                moved across a grid of them. The word "open" is
                what does the work — it says a playlist already
                exists and is waiting, which is the one fact he
                did not have. WHICH lesson is answered by the
                tray handle, which is on screen the whole time
                and has room for a name.

                Only one lesson can be open at once, so the
                button never has to disambiguate. It only has to
                say: not a fresh stack. */}
            <Button
              size="sm"
              variant="ghost"
              icon={added ? Check : Plus}
              disabled={blocked}
              title={
                blocked
                  ? `A playlist holds ${playlistMax}. Remove one first.`
                  : editingPlaylist
                    ? added
                      ? `Already in ${editingPlaylist.name}`
                      : `Add to ${editingPlaylist.name}`
                    : undefined
              }
              onClick={stop(() => toggleInPlaylist(resource.id))}
              className={cx(added && 'text-brand-700')}
            >
              {added
                ? editingPlaylist
                  ? 'In this playlist'
                  : 'In playlist'
                : blocked
                  ? 'Playlist full'
                  : editingPlaylist
                    ? 'Add to open playlist'
                    : 'Playlist'}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="soft" onClick={stop(preview)}>
            Open
          </Button>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {descButton}
          {saveButton}
          {moreButton}
        </div>
      </div>
      </div>

      {/* Rendered here but positioned `fixed`, so it centres on
          the screen rather than inside the card. */}
      {assignSheet}
    </article>
  )
}
