/* ============================================================
   ASSIGNMENT TRAY
   ------------------------------------------------------------
   Your Playlist idea, made visible.

   In the live product this is a grey "0 Playlist" pill in the
   top-right corner. Grey means disabled to most people, the
   count sits where nobody looks, and it vanishes when you
   navigate. It is the best mechanic in the product and it is
   effectively hidden.

   Here it's a bar that appears the moment you add something and
   follows you across every screen. You can browse the library,
   go check a class, come back, and your stack is still there.

   The pattern is a shopping cart, and that's on purpose: it's
   the interaction every teacher already understands from every
   other website they use.
   ============================================================ */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Send, Trash2, X, ChevronDown, Bookmark, Check, GripVertical } from 'lucide-react'
import { useApp } from '../store'
import { getResource, getStandard } from '../data/mock'
import { Button, Sheet, cx } from './ui'
import AssignSheet from '../flows/AssignSheet'
import TypeBadge from './TypeBadge'

export default function PlaylistBar() {
  const {
    playlist,
    removeFromPlaylist,
    moveInPlaylist,
    reorderPlaylist,
    clearPlaylist,
    savePlaylist,
    playlistMax,
    editingPlaylist,
    finishEditing,
    playlistMinimized,
    setPlaylistMinimized,
  } = useApp()

  /* ---- Drag to reorder ----
     Sequence is the whole point of a playlist — it becomes the
     order students work through the material — so reordering
     should feel like moving a thing, not like operating a
     machine. Two arrow buttons per row meant six presses to move
     an item from the bottom of a six-item list to the top, each
     one a separate aim-and-click.

     It reorders LIVE as you drag across the rows rather than
     showing a drop line and rearranging at the end. The list is
     short and the rows are one line tall, so the honest preview
     is the list itself: what you see while dragging is exactly
     what you get when you let go, and the numbers renumber as
     you pass.

     THE GRIP HANDLE EARNS ITS PIXELS. Nothing about a row of
     text says "you can drag me", and a capability nobody
     discovers may as well not exist — the same reason the Saved
     tab needed a bookmark. Left edge, because that's where a
     handle lives in every list a teacher has ever dragged.

     AND IT IS NOT DRAG-ONLY. The handle is a real button: focus
     it and the arrow keys move the row. Drag-and-drop with no
     keyboard path locks out anyone using a keyboard or a screen
     reader, and it costs one event handler to avoid. */
  const [dragId, setDragId] = useState(null)
  const [assigning, setAssigning] = useState(false)

  /* ---- THE TRAY TELLS THE PAGE HOW TALL IT IS ----
     The tray floats over the page, so the bottom of every
     screen is behind it — and until now the page reserved a
     flat 112px for something that is over 300px tall with the
     list open. The last row of cards was unreachable: you
     could see the resource, you could not press its Playlist
     button, and scrolling did nothing because the document
     had already ended.

     It measures itself rather than being told. The height
     changes with every resource added and every one removed,
     so any number written down somewhere else is wrong within
     one click. A ResizeObserver catches all of it — adds,
     removes, drags, the fold when it minimises, a window
     resize that rewraps a title onto two lines — without
     anyone enumerating the cases.

     WHY A CSS VARIABLE AND NOT A PROP. The tray and <main>
     are nowhere near each other in the tree; threading a
     number between them would mean lifting it to the store
     and re-rendering the whole app on every pixel. A custom
     property on the root goes straight from the element that
     knows the value to the element that needs it, and costs
     no React render at all.

     THE SCROLL COMPENSATION is the second half, and it only
     covers one moment. Padding alone makes the last card
     REACHABLE, but it does not make it visible: growing the
     document adds space below what is on screen, so if she is
     already at the bottom when the tray opens, the tray
     arrives directly on top of what she was reading and she
     has to scroll again to get it back.

     So when the tray grows AND she is within a screenful of
     the bottom, the page scrolls by exactly the amount it
     grew. The content slides up by the tray's height and the
     row that was at the bottom edge lands just above it —
     which is the behaviour Dhinesh asked for, arrived at
     through the padding rather than instead of it.

     THE "NEAR THE BOTTOM" TEST IS THE WHOLE SAFETY OF THIS.
     Anywhere else on the page nothing happens, because
     nothing needed to: the tray appears over empty space
     below the fold and whatever she is reading stays exactly
     where she left it. An unconditional scroll would yank the
     page every time she added a resource from the top of a
     long list, which is a worse bug than the one it fixes.
     Measured: at the bottom the content moves 168px for a
     168px tray; at scroll position 200 it does not move at
     all. */
  const trayRef = useRef(null)
  const lastHeight = useRef(0)

  /* ---- THE EFFECT MUST NOT RE-SUBSCRIBE ON EVERY ADD ----
     This is the jitter Dhinesh saw: press Playlist on a card
     near the bottom and the page snapped DOWN a tray's height
     in one frame, then smooth-scrolled back up past where it
     started. Traced frame by frame it was unmistakable —
     scrollY 991 → 823 in a single frame, and 823 is exactly the
     page's maximum scroll when `--tray-h` is 0.

     The cause was this dependency list. It read
     `[playlist.length, …]`, so every added resource tore the
     effect down and set it up again — and the teardown reset
     `--tray-h` to 0px. For the instant between cleanup and
     re-run the page lost the space it had reserved, the
     document shrank underneath a reader who was at the bottom
     of it, and the browser did the only thing it can: clamped
     the scroll position to the new, shorter maximum. The
     position was gone before the new height was published, and
     the compensation then animated up from the wrong place.

     Two changes, both about not doing work that was never
     needed:

       THE DEPENDENCY IS NOW A BOOLEAN — whether there is a
       tray at all, not how many resources are in it. Growing
       from three rows to four does not need a new observer;
       the ResizeObserver already watches the same element and
       reports the change itself. That was always its job, and
       re-subscribing was duplicating it.

       THE CLEANUP NO LONGER TOUCHES THE VARIABLE. It only
       disconnects the observer. Zeroing the reserved space is
       a statement about the tray being GONE, and a cleanup
       fires for reasons that have nothing to do with that.
       The zero now lives where it is true: the branch below
       that runs when there is no tray to measure.

     The general shape, worth keeping: an effect that tears
     down and rebuilds on every value change will publish the
     empty state between every pair of real ones. If anything
     downstream reacts to that empty state — layout, scroll,
     an animation — it fires on every change, and it looks
     like a glitch rather than a bug. */
  const hasTray = playlist.length > 0

  useLayoutEffect(() => {
    const root = document.documentElement
    const el = trayRef.current

    if (!el) {
      lastHeight.current = 0
      root.style.setProperty('--tray-h', '0px')
      return
    }

    const publish = () => {
      /* Minimised, the only thing occluding the page is the
         16px peek and the handle straddling it — reserving
         the whole folded tray would leave a band of empty
         page nobody asked for. */
      const height = playlistMinimized ? 46 : el.offsetHeight + 30
      const previous = lastHeight.current
      if (height === previous) return

      /* Measured BEFORE the padding changes, or it always
         reads as "not near the bottom". */
      const distanceToBottom =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      const nearBottom = distanceToBottom <= previous + 120

      lastHeight.current = height
      root.style.setProperty('--tray-h', `${height}px`)

      if (height > previous && nearBottom) {
        requestAnimationFrame(() =>
          window.scrollBy({ top: height - previous, behavior: 'smooth' })
        )
      }
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasTray, playlistMinimized])

  /* The one place the reservation is genuinely released for
     good. The bar never actually unmounts today — AppShell
     renders it on every screen — but a variable left set on
     the document root by a component that has gone is the kind
     of litter that outlives whoever can explain it. */
  useEffect(
    () => () => document.documentElement.style.setProperty('--tray-h', '0px'),
    []
  )

  /* ---- Saving the sequence ----
     Dhinesh asked how anything gets into Saved. For loose
     resources it's the bookmark on the card. For a PLAYLIST it
     has to be here, because here is the only place a playlist
     exists — and this is the moment it's worth rescuing.

     Assembling one is the expensive part: twenty minutes of
     sequencing six resources. Today that work is destroyed the
     instant she assigns it or clears the bar, so next year she
     does the twenty minutes again. One press turns it into
     something she can reopen.

     It asks for a name rather than inventing one, and that's a
     deliberate cost. "Playlist 3" is a name she has to open to
     understand; "Sinking and floating — full lesson" is one she
     recognises from the Saved grid a year later. A name is the
     entire value of saving the thing. */
  /* ---- Editing a saved lesson changes what this bar is ----
     Dhinesh caught both symptoms of the same thing: the bar
     said "5 of 5 resources" for a playlist that has a name, and
     it offered to Save for later something already sitting on
     the shelf.

     THE TITLE. The count is already in the blue circle, so
     spending the only line of type on it said one fact twice
     and the more useful one not at all. When the bar is holding
     a saved lesson it says the lesson's name; when it's an
     ad-hoc stack there is no name to say, so the count earns
     the line back.

     THE BUTTON. "Save for later" on an already-saved playlist
     would make a second copy of it, which is the one outcome
     nobody wants. It becomes Update — write the new order back
     to the card she opened — and goes flat and disabled,
     reading "Saved", the moment the contents match what's
     stored. A button that can't change anything should say so
     rather than work and do nothing.

     NOT "Remove", which was Dhinesh's first instinct. Removing
     the lesson from Saved is a destructive act and this is a
     working surface — she is in the middle of editing the thing
     it would delete. That control belongs on the card, where
     the filled bookmark already does it, at the moment she is
     looking at the shelf rather than at the lesson.

     AND THEN THE WHOLE BUTTON WENT. Edits to an open lesson
     save themselves now (the write-through effect in
     store.jsx), so Update had nothing left to do, the `dirty`
     comparison behind it had nothing left to answer, and the
     "Saved" state it fell back to had nothing left to report.
     Three pieces of machinery, all built to track whether a
     button had been pressed, deleted by removing the button.
     Done takes its place: not a save, just a way to say "I'm
     finished with this lesson." */

  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  /* ---- THE TRAY CONFIRMS ITS OWN SAVE, THEN LEAVES ----
     Dhinesh's call, and it is better than the toast I built
     first for a reason worth keeping.

     A toast is a SECOND object explaining what happened to a
     first one. It appears somewhere else, in another colour,
     after the thing it is about has already gone — so the
     teacher has to connect two events that never share the
     screen. It works, but it works by explanation.

     This version does not explain, it demonstrates. The button
     she pressed turns into "Saved" and stays where her eye
     already is; the tray holds that state long enough to read;
     then it slides away, and the leaving IS the second half of
     the message — the stack is gone because it is somewhere
     else now. One object, one continuous story, no translation
     needed. It is also the pattern the Assign dialog already
     uses: hold a confirmation, then close.

     TWO SECONDS, THEN 400ms OF TRAVEL. The slide reuses the
     minimise transform, so the tray leaves the way it has
     always left rather than blinking out — and a thing that
     slides away reads as "put somewhere", where a thing that
     vanishes reads as "lost". */
  const [saved, setSaved] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const dismissTimers = useRef([])

  /* ---- SAVING RESOLVES THE STACK ----
     It used to save the playlist and leave the tray sitting
     there holding the same resources, which was wrong twice
     over. The obvious half: the stack had become a thing on
     the shelf, and a copy of it was still occupying the bottom
     of every screen as though it were unfinished work.

     The half that was worse: the button went to a tick for two
     seconds and then read "Save for later" again, over the
     identical five resources. One more press and she would
     have had the same lesson on her shelf twice, under two
     names, with nothing to tell them apart. A control that
     offers to repeat an action which should not be repeated is
     not neutral — it is an invitation.

     This is the same rule the rest of the product already
     follows. Assigning takes a resource out of Saved because
     "later" has arrived; saving takes the stack out of the
     tray because it is no longer a stack, it is a lesson. The
     tray holds work in progress, and this work is no longer in
     progress. */
  function handleSave() {
    savePlaylist({
      name: name.trim(),
      note: note.trim() || `${playlist.length} resources, in this order.`,
      resourceIds: playlist,
    })
    setNaming(false)
    setName('')
    setNote('')
    confirmThenDismiss()
  }

  /* ---- ONE EXIT, TWO DOORS ----
     A playlist can be saved from the strip's own Save for
     later, or from inside the Assign dialog — and until now
     only the first door resolved the tray. The second saved
     the lesson, closed itself, and left the bar holding a copy
     of something already on the shelf.

     Rather than teach the second door the same sequence, both
     now call this. Two implementations of "confirm, hold,
     leave" would drift the moment either timing changed, and
     the bug that started this was itself two paths that were
     supposed to do the same thing and didn't. */
  function confirmThenDismiss() {
    setSaved(true)
    dismissTimers.current = [
      setTimeout(() => setLeaving(true), 2000),
      setTimeout(() => {
        clearPlaylist()
        setSaved(false)
        setLeaving(false)
      }, 2400),
    ]
  }

  /* ---- THE DISMISSAL IS CANCELLABLE ----
     Two seconds is short, but it is long enough to press
     Assign in — and a tray that clears itself out from under
     an open Assign dialog would take the resources with it.

     So opening Assign during the hold cancels the countdown.
     The tray then stays, still reading "Saved", until she
     assigns or clears it herself. That is the right resting
     state anyway: the lesson IS saved, and a Save button that
     went back to offering would just make a duplicate. */
  useEffect(() => {
    if (!assigning) return
    dismissTimers.current.forEach(clearTimeout)
    dismissTimers.current = []
    setLeaving(false)
  }, [assigning])

  /* Timers outlive components if you let them. */
  useEffect(() => () => dismissTimers.current.forEach(clearTimeout), [])

  /* Nothing collected means nothing to show. An empty bar
     sitting there permanently would just be clutter. */
  if (playlist.length === 0) return null

  /* Class time counts only what students actually do. A Unit
     Teacher Guide in the stack shouldn't inflate the number a
     teacher is using to decide whether this fits a period. */
  const totalMinutes = playlist.reduce((sum, id) => {
    const r = getResource(id)
    return sum + (r?.forStudents ? r.minutes : 0)
  }, 0)

  /* ---- MINIMISE: the tray slides, it does not disappear ----
     This control has now been three different things, and the
     path is worth keeping because each version failed for a
     different reason.

       1. AN X IN THE TOP-RIGHT CORNER.  Wrong because of what X
          means everywhere else: throw this away. Next to a
          Clear button that genuinely does throw the playlist
          away, one of those two is going to be pressed by
          mistake, and it will be the one that looks like the
          universal "get rid of it".
       2. A COUNTER BUBBLE IN THE CORNER.  Removed on Dhinesh's
          call. It solved re-entry by inventing a second object
          — the teacher closed one thing and a different thing
          appeared somewhere else.
       3. NOTHING AT ALL.  Honest, but it made the state
          invisible: the playlist was still there and the screen
          said otherwise.

     What it is now: the tray slides down off the bottom edge
     and leaves a sliver of itself plus a handle. Nothing
     appears, nothing vanishes — ONE OBJECT MOVES. That is why
     it needs no explanation. A teacher does not have to learn
     where the playlist went, because she watched it go there,
     and the thing she presses to bring it back is the same
     thing she pressed to send it away, in the same place.

     TOP CENTRE, NOT TOP RIGHT. Centred, half-straddling the
     edge, with a chevron and no X, it reads as the handle of a
     drawer rather than the close button of a dialog. The
     corner is where dismissal lives; the middle of an edge is
     where a pull lives.

     THE PEEK IS 16px, which is exactly the page gutter below
     the tray — so minimised, the tray tucks flush into the
     bottom margin instead of stopping at some arbitrary
     fraction. `translate-y-full` moves the tray down by its own
     height, whatever that height is, so there is no second
     number to keep in sync.

     IT FOLDS BEFORE IT SLIDES. The list unmounts the moment
     the tray starts down, which is not an animation flourish —
     it is what keeps the peek clean. Leave the list mounted and
     the visible 16px is the top sixteen pixels of the FIRST
     ROW: half a line of type sheared off by the screen edge,
     which looks like a bug rather than a drawer. Unmounted, the
     peek is always the strip's own top padding. It also
     shortens the travel, so the gesture is quick and has a
     shape a teacher already knows — the thing folds up, then
     tucks away.

     THERE IS NO LONGER A SEPARATE COLLAPSE CONTROL, and that is
     Dhinesh's call. I had built one, renamed it twice, and
     argued for keeping it on the grounds that moving the tray
     and opening the list are different jobs. They are — but
     that was answering the wrong question. The right one is
     whether a teacher ever wants the middle state, and she
     doesn't: a strip that says "5 of 5" while hiding which five
     is a tray with its useful half switched off. The playlist
     exists to be read and reordered.

     So the tray has two states, not three: up and readable, or
     tucked away. One control, one axis, nothing to learn. A
     control that only reaches a state nobody wants is not
     flexibility, it's a third thing to understand — which is
     the load rule this project keeps arriving at. */
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
        <div
          ref={trayRef}
          className={cx(
            'pointer-events-auto relative w-full max-w-3xl transition-transform duration-300 ease-out',
            (playlistMinimized || leaving) && 'translate-y-full'
          )}
        >
        {/* The handle has to live outside the rounded card,
            because that card clips its own overflow so the row
            dividers stay inside the corners. Anything meant to
            hang over an edge has to be a sibling of the thing it
            hangs over, not a child of it. */}
        <button
          onClick={() => setPlaylistMinimized((m) => !m)}
          aria-label={
            playlistMinimized
              ? `Bring the playlist tray back up${
                  editingPlaylist ? ` — editing ${editingPlaylist.name}` : ''
                }`
              : 'Minimise the playlist tray'
          }
          aria-expanded={!playlistMinimized}
          title={
            playlistMinimized
              ? 'Bring the playlist back up'
              : 'Minimise — your playlist is kept'
          }
          className={cx(
            'absolute -top-3.5 left-1/2 z-10 flex h-7 -translate-x-1/2 items-center justify-center rounded-full border shadow-raised transition-colors',
            editingPlaylist && playlistMinimized
              ? 'max-w-[280px] gap-1.5 border-brand-200 bg-brand-50 pl-3 pr-2 text-brand-800 hover:bg-brand-100'
              : 'w-11 border-ink-300 bg-white text-ink-500 hover:bg-ink-100 hover:text-ink-900'
          )}
        >
          {/* ---- THE HANDLE SAYS WHAT IS OPEN ----
              This is the fix for the actual bug Dhinesh hit. He
              opened a saved lesson, tucked the tray away, went
              browsing, pressed Playlist on a resource and it
              went into the lesson he had forgotten was open.

              A mode you cannot see is the oldest fault there
              is, and the tray was the only thing saying "you
              are editing Water cycle week" — so putting the
              tray away put the mode away with it, while leaving
              the mode running. The handle is what stays on
              screen, so the handle is where the fact belongs.
              Tucked away mid-edit, it now reads "Editing ·
              Water cycle week" in brand colour at the bottom of
              every screen he visits.

              It costs nothing when there is no lesson open: no
              name, no colour, just the chevron. The louder form
              exists only for the state that needs explaining. */}
          {editingPlaylist && playlistMinimized && (
            <span className="truncate text-[12px] font-semibold">
              Editing · {editingPlaylist.name}
            </span>
          )}
          {/* One chevron that turns over, not two icons that
              swap. Rotating the same mark keeps the arrow and
              the tray moving as one gesture — the thing you
              press points the way the thing you pressed it on
              is about to travel. */}
          <ChevronDown
            className={cx(
              'h-4 w-4 shrink-0 transition-transform duration-300',
              playlistMinimized && 'rotate-180'
            )}
            strokeWidth={2.5}
          />
        </button>

        {/* `inert` while minimised. The tray is off-screen but
            still in the page, so without this the Tab key would
            walk into Clear and Assign — buttons the teacher
            cannot see and did not mean to reach. */}
        <div
          inert={playlistMinimized || undefined}
          /* The tray floats over whatever she is browsing, which is
             the textbook case for glass: resources slide under it
             as she scrolls the Library. */
          className="glass-panel overflow-hidden rounded-card border border-ink-300 !shadow-tray">
          {/* Expanded list — reorder and remove.
              Sequence matters: it becomes the order students
              work through the material. */}
          {!playlistMinimized && (
            /* NO MAX HEIGHT, NO INNER SCROLL. With a cap of five
                the whole list always fits, so a scroll region here
                would be a box that never scrolls — and worse, one
                that clips a row mid-way when it does, which is
                exactly what makes a drag target hard to hit. The
                bar grows to whatever it holds. */
            <ul className="divide-y divide-ink-100 border-b border-ink-200">
              {playlist.map((id, i) => {
                const r = getResource(id)
                if (!r) return null
                const std = getStandard(r.standardId)
                return (
                  <li
                  key={id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnter={() => {
                    if (!dragId || dragId === id) return
                    reorderPlaylist(playlist.indexOf(dragId), i)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={() => setDragId(null)}
                  className={cx(
                    'flex items-center gap-2.5 bg-white px-3 py-2.5 transition-opacity',
                    /* The row being dragged fades rather than
                       disappears, so you keep track of which one
                       is in your hand. */
                    dragId === id && 'opacity-40'
                  )}
                >
                  <button
                    aria-label={`Reorder ${r.shortTitle} — drag, or use the arrow keys`}
                    title="Drag to reorder"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        moveInPlaylist(id, -1)
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        moveInPlaylist(id, 1)
                      }
                    }}
                    className="shrink-0 cursor-grab rounded p-1 text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-600 active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>

                  {/* The position number stays. It's the thing
                      dragging is FOR — and it renumbers as you
                      drag, which is what tells you the drag
                      worked. */}
                  <span className="tnum w-4 shrink-0 text-center text-[12px] font-semibold text-ink-400">
                    {i + 1}
                  </span>

                  {/* ---- THE CODE MOVED UP AND THE NAME CAME OUT ----
                      The badge and the words "Instruction
                      Module" say the same thing, so keeping
                      both would be one fact printed twice on a
                      two-line row — and the grey line is where
                      the facts that DIFFER live: how long it
                      runs and which TEKS it serves.

                      It also buys the thing the badge is for.
                      A playlist often reads "Relative Density /
                      Relative Density / Relative Density"
                      because a module and its companion share a
                      sub-topic name; with the code beside the
                      title, the three rows separate at a
                      glance instead of after a read. */}
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-2">
                      <TypeBadge type={r.type} />
                      <span className="truncate text-[14px] font-medium text-ink-900">
                        {r.title}
                      </span>
                    </p>
                    <p className="truncate text-[12px] text-ink-500">
                      {r.minutes} min · {std?.id}
                    </p>
                  </div>

                  {/* Remove sits at the far right, alone. It was
                      third in a cluster of three identical grey
                      icons, which is how you delete something you
                      meant to nudge. Now the only destructive
                      control on the row is the only thing on that
                      end of it. */}
                  {/* Named in full while editing, because the
                      removal is immediate and permanent now —
                      the shelf copy changes the moment this is
                      pressed. A hover label that says which
                      lesson is the last thing standing between
                      a slip and a lost resource. */}
                  <IconBtn
                    label={
                      editingPlaylist
                        ? `Remove ${r.shortTitle} from ${editingPlaylist.name}`
                        : `Remove ${r.shortTitle}`
                    }
                    onClick={() => removeFromPlaylist(id)}
                    icon={X}
                    danger
                    className="shrink-0"
                  />
                </li>
                )
              })}
            </ul>
          )}

          {/* ---- The strip ----
              "2 resources ready" → "2 resources". "Ready" was
              doing nothing: a playlist you are looking at is
              obviously ready, and the word only earns its place
              if some other state says "not ready". There isn't
              one.

              Left side states, right side acts: the count and
              the class time are information, everything on the
              right is a control. Every control here now DOES
              something to the playlist — Clear, Save, Assign.
              The Show/Hide button that used to sit at the end
              was the one exception, the only control that
              changed nothing, and it is gone; so is the divider
              that fenced it off from the rest. Assign ends the
              row, which is where the row was always heading. */}
          <div className="flex items-center gap-3 px-4 py-[18px]">
            <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[14px] font-bold text-white">
              {playlist.length}
            </span>
            <div className="min-w-0 flex-1">
              {/* "3 of 5", not "3". The cap has to be readable
                  before she reaches it — a limit first met as a
                  disabled button reads as a fault, the same one
                  read as a count reads as a rule. */}
              {/* The chip, not a prefix on the name. "Editing ·
                  Water cycle week" spends the front of the line
                  — the part the eye lands on — on a word that
                  is the same every time, and pushes the one
                  varying fact to where it gets truncated first.
                  A chip reads in one glance and leaves the name
                  its full width. */}
              <p className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-ink-900">
                {editingPlaylist && (
                  <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[12px] font-semibold text-brand-800">
                    Editing
                  </span>
                )}
                <span className="truncate">
                  {editingPlaylist
                    ? editingPlaylist.name
                    : `${playlist.length} of ${playlistMax} ${
                        playlist.length === 1 ? 'resource' : 'resources'
                      }`}
                </span>
              </p>
              <p className="truncate text-[12px] text-ink-500">
                {editingPlaylist &&
                  `${playlist.length} of ${playlistMax} · `}
                About {totalMinutes} min of class time
              </p>
            </div>

            {/* ---- ONE BUTTON HERE, NOT TWO, WHILE EDITING ----
                Clear and Save for later both belong to an
                ad-hoc stack. Neither survives contact with an
                open lesson: there is nothing left to save, and
                Clear would read as "empty this lesson" — which,
                now that edits write straight through, is a
                thing a teacher could actually do by accident to
                a lesson she spent twenty minutes on.

                So while a lesson is open both are replaced by
                Done, and the only destructive control in the
                tray is the X on a single row, which says which
                lesson it is removing from. Deleting the whole
                lesson stays where it always was — the filled
                bookmark on its card in Saved, pressed while
                looking at the shelf rather than at the open
                lesson. */}
            {editingPlaylist ? (
              <Button
                variant="ghost"
                size="sm"
                icon={Check}
                aria-label="Finish editing this playlist"
                title="Finish — your changes are already saved"
                onClick={finishEditing}
              >
                <span className="hidden sm:inline">Done</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  aria-label="Clear the playlist"
                  title="Clear the playlist"
                  onClick={clearPlaylist}
                >
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={saved ? Check : Bookmark}
                  disabled={saved}
                  /* The words are hidden below `sm`, which turns
                     this into an icon-only button on a narrow
                     window — and an icon-only button with no
                     label is unusable to a screen reader. The
                     label is therefore always present even when
                     the text isn't. */
                  aria-label={saved ? 'Saved to your playlists' : 'Save for later'}
                  title={saved ? 'In Library › Saved' : 'Save for later'}
                  onClick={() => setNaming(true)}
                  /* Brand colour on a disabled button, which is
                     normally a contradiction — disabled means
                     "not available" and usually goes grey. Here
                     it means "already done", and going grey at
                     the moment of success would read as failure.
                     The rule bends because the state is an
                     outcome, not an unavailability. */
                  className={cx(saved && 'text-brand-700 !opacity-100')}
                >
                  {/* Named in full. "Save" on its own is
                      ambiguous next to Assign — save WHERE, and
                      does it also send it? "Save for later" says
                      both what happens and what doesn't, and it
                      matches the bookmark on the cards and the
                      button in the Assign dialog, so all three
                      read as one idea. */}
                  <span className="hidden sm:inline">
                    {saved ? 'Saved' : 'Save for later'}
                  </span>
                </Button>
              </>
            )}
            <Button variant="primary" icon={Send} onClick={() => setAssigning(true)}>
              Assign
            </Button>

          </div>
        </div>
        </div>
      </div>

      {/* ---- Name it, then it's on the shelf ---- */}
      <Sheet
        open={naming}
        onClose={() => setNaming(false)}
        width="sm"
        title="Save this playlist"
        subtitle={`${playlist.length} ${
          playlist.length === 1 ? 'resource' : 'resources'
        } · about ${totalMinutes} min · you'll find it in Library › Saved`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setNaming(false)}>
              Cancel
            </Button>
            {/* Required, not defaulted. An "Untitled playlist"
                fallback looks generous and isn't: the name is the
                entire reason this is worth saving, and three of
                them in the Saved grid are three cards she has to
                open to tell apart. */}
            <Button
              variant="primary"
              icon={Bookmark}
              disabled={!name.trim()}
              onClick={handleSave}
            >
              Save playlist
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-[14px] font-semibold text-ink-900">Name it</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Sinking and floating — full lesson"
              className="mt-1.5 w-full rounded-control border border-ink-300 px-3 py-2 text-[14px] text-ink-800 placeholder:text-ink-400 focus:border-brand-500"
            />
          </label>

          <label className="block">
            <span className="text-[14px] font-semibold text-ink-900">
              A note to yourself{' '}
              <span className="font-normal text-ink-500">(optional)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Built for 3rd Period. Phenomenon first, then the lab."
              className="mt-1.5 w-full rounded-control border border-ink-300 px-3 py-2 text-[14px] text-ink-800 placeholder:text-ink-400 focus:border-brand-500"
            />
            <span className="mt-1 block text-[12px] text-ink-500">
              Shows on the saved card, so a year from now you know what this was for
              without opening it.
            </span>
          </label>
        </div>
      </Sheet>

      <AssignSheet
        open={assigning}
        onClose={() => setAssigning(false)}
        onSaved={confirmThenDismiss}
        resourceIds={playlist}
        onAssigned={() => {
          setAssigning(false)
          clearPlaylist()
        }}
      />
    </>
  )
}

function IconBtn({ icon: Icon, label, danger, className, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'rounded p-1.5 text-ink-400 transition-colors',
        'disabled:opacity-25 disabled:pointer-events-none',
        danger ? 'hover:bg-alert-50 hover:text-alert-600' : 'hover:bg-ink-100 hover:text-ink-700',
        className
      )}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
