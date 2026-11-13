/* ============================================================
   UI PRIMITIVES
   ------------------------------------------------------------
   The small, dumb pieces every screen is assembled from:
   buttons, cards, badges, progress bars.

   Why bother? Because the alternative is writing a button 40
   times and getting 40 slightly different buttons. This is the
   same discipline as a Figma component library — define it
   once, use it everywhere, change it in one place.

   Nothing in here knows anything about EduSmart. They're
   generic parts. The meaning lives in the screens.
   ============================================================ */

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { levelFor } from '../data/mock'

/* Joins class names and drops anything falsy, so we can write
   conditional styles inline without producing "undefined" in
   the class attribute. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/* ------------------------------------------------------------
   BUTTON
   Four variants, and each one means something specific:

   primary   — the one thing we want you to do on this screen.
               Never more than one per view.
   soft      — the main action on a REPEATED object. Same
               meaning as primary, a fifth of the ink.
   secondary — a real alternative, equally valid.
   ghost     — low-stakes, reversible. Toolbar-ish.
   danger    — destructive and hard to undo.

   The current product paints nearly everything in the same
   orange, which is why nothing on those screens has priority.

   WHY `soft` HAD TO EXIST. Every resource card carried a solid
   indigo Assign, and a grid shows twelve of them at once. That
   breaks the rule written two lines above this: if every card
   has a primary button, no button is primary, and the page
   turns into a wall of indigo blocks with the resource names
   whispering between them.

   `soft` keeps Assign obviously the main action ON ITS OWN CARD
   while letting twelve of them sit on a page quietly. The rule
   generalises: solid fills are for things there is one of.
   ------------------------------------------------------------ */
const buttonStyles = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-card',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  secondary:
    'bg-white text-ink-800 border border-ink-300 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-alert-600 text-white hover:bg-alert-700',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-[14px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[16px] gap-2',
}

/* The style string on its own, so a react-router <Link> can
   look exactly like a button without us nesting an <a> inside a
   <button> — which is invalid HTML and breaks keyboard use. */
export function buttonClass({ variant = 'secondary', size = 'md' } = {}) {
  return cx(
    'inline-flex items-center justify-center rounded-control font-medium',
    'transition-colors duration-150',
    'disabled:opacity-40 disabled:pointer-events-none',
    buttonStyles[variant],
    buttonSizes[size]
  )
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  ...props
}) {
  return (
    <button className={cx(buttonClass({ variant, size }), className)} {...props}>
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
      {IconRight && (
        <IconRight className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
    </button>
  )
}

/* ------------------------------------------------------------
   CARD
   A white surface with a hairline border. `interactive` adds
   hover feedback — only use it when the whole card is clickable,
   otherwise you're promising something the card doesn't do.
   ------------------------------------------------------------ */
export function Card({ interactive, className, children, ...props }) {
  return (
    <div
      className={cx(
        'rounded-card border border-ink-200 bg-white shadow-card',
        interactive &&
          /* ---- AND IT RISES A PIXEL ----
             The shadow deepening on its own reads as the light
             changing; moving the card one pixel up reads as the
             card moving, which is the thing that makes an
             interface feel responsive rather than merely
             animated. One pixel is deliberately almost nothing —
             enough to register, too little to shift the row. */
          'cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-ink-300 hover:shadow-raised',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------
   BADGE
   Small status marker. `tone` maps to the status colours from
   the design system, so a badge can never invent a colour.
   ------------------------------------------------------------ */
const badgeTones = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  good: 'bg-good-50 text-good-700 ring-good-100',
  watch: 'bg-watch-50 text-watch-700 ring-watch-100',
  alert: 'bg-alert-50 text-alert-700 ring-alert-100',
  info: 'bg-info-50 text-info-700 ring-info-100',
}

/* `title` is a real parameter rather than something callers
   spread in, because a two-letter badge that nobody can expand
   is the fault TypeBadge already documents: a short code earns
   its brevity by being BACKED, not by being obvious. */
export function Badge({ tone = 'neutral', icon: Icon, title, className, children }) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[12px] font-medium ring-1 ring-inset whitespace-nowrap',
        badgeTones[tone],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------
   AVATAR
   Initials, not photos. Schools rarely have student photos in
   the system, and a wall of identical grey silhouettes is
   worse than initials.
   ------------------------------------------------------------ */
const avatarSizes = {
  sm: 'h-7 w-7 text-[12px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
}

export function Avatar({ initials, size = 'md', tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-ink-200 text-ink-700',
    brand: 'bg-brand-100 text-brand-800',
    alert: 'bg-alert-100 text-alert-700',
    watch: 'bg-watch-100 text-watch-700',
  }
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        avatarSizes[size],
        tones[tone],
        className
      )}
    >
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------
   PROGRESS BAR
   Used for "how much of this class has finished". Always shows
   the fraction as text too — a bar alone makes a teacher guess.
   ------------------------------------------------------------ */
export function ProgressBar({ value, total, tone = 'brand', className }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const fills = {
    brand: 'bg-brand-500',
    good: 'bg-good-500',
    watch: 'bg-watch-500',
    alert: 'bg-alert-500',
  }
  return (
    <div
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-ink-200', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cx('h-full rounded-full transition-all duration-500', fills[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------
   SCORE
   A percentage that colours itself by band. Centralised so that
   "what counts as a worrying score" is defined once, not
   re-decided on every screen.
   ------------------------------------------------------------ */
/* ---- THE COLOUR IS THE BAND'S COLOUR ----
   This used to carry its own cut lines — 80 and 65 — which were
   a third set of numbers, agreeing with neither of the two the
   rest of the product used. A score could print green while the
   same child was counted as needing attention, and both screens
   were doing what they were told.

   It now reads the one scale in mock.js, so the colour of a
   number and the band it belongs to cannot disagree. The import
   is the only thing in this file that knows anything about
   EduSmart, and it earns the exception: the alternative is
   three definitions of "worrying" and no way to keep them in
   step. */
export function scoreTone(score) {
  return levelFor(score)?.tone ?? 'neutral'
}

/* The band's name, for the places where one number is the
   headline and "68%" alone does not say whether that is a
   problem. Deliberately quiet — the percentage stays the thing
   you read, and this is the clause after it. */
export function LevelLabel({ value, className }) {
  const level = levelFor(value)
  if (!level) return null
  return (
    <span
      className={cx(
        /* ---- GREY, BECAUSE THE NUMBER BESIDE IT IS COLOURED ----
           This used to take the band's own colour, which put the
           same hue on screen twice in a row: "68%" in amber,
           then "Approaches" in amber. Dhinesh read the Reports
           page as colour-heavy, and this doubling is a large part
           of why — every score on every card was saying its one
           thing in two coloured pieces.

           The percentage carries the signal, the word carries the
           name. Two jobs, one colour between them.

           Never wraps. "Did not meet" breaking across two lines
           made every red row taller than every green one, which
           turned a label into a layout. */
        'whitespace-nowrap text-[12px] font-medium text-ink-500',
        className
      )}
    >
      {level.label}
    </span>
  )
}

/* ---- WHERE HE WAS, AND WHERE HE IS ----
   A score that was earned twice: "48 → 60". Dhinesh asked for
   exactly this shape and it is the right one, for a reason worth
   naming — the two numbers and the arrow between them ARE the
   sentence. Nothing to expand, nothing to hover, no second row,
   no legend. A teacher reads it left to right and is finished.

   The first number is grey and the second carries the band
   colour, because only one of them is still true. Grey is not
   decoration here: it is the difference between a fact about
   today and a fact about a fortnight ago, and if both were
   coloured the cell would be making two claims at once.

   WHEN THERE IS NO SECOND ATTEMPT THIS RENDERS NOTHING EXTRA.
   Not a dash, not a placeholder, not a greyed-out arrow — just
   the ordinary score, exactly as the rest of the table shows it.
   A column where every row carries an arrow and most of them
   mean "nothing happened" teaches a teacher to stop reading the
   arrows, which costs her the six rows that matter. */
export function AttemptScore({ first, value, size = 'md', className }) {
  if (first == null || value == null) return <Score value={value} size={size} className={className} />
  const sizes = { sm: 'text-[14px]', md: 'text-sm', base: 'text-base', lg: 'text-lg' }
  return (
    <span className={cx('inline-flex items-baseline gap-1 whitespace-nowrap', className)}>
      <span className={cx('tnum font-medium text-ink-400', sizes[size])}>{first}</span>
      <span className={cx('text-ink-400', sizes[size])} aria-hidden>
        →
      </span>
      <Score value={value} size={size} />
      <span className="sr-only">, up from {first}% on the first attempt</span>
    </span>
  )
}

export function Score({ value, className, size = 'md' }) {
  const colours = {
    neutral: 'text-ink-400',
    good: 'text-good-700',
    watch: 'text-watch-700',
    alert: 'text-alert-700',
  }
  /* `base` (16px) sits between md and lg, added for the Reports
     class card where the score has to match a 16px class name
     beside it. Without it that card had to choose between 14px
     (smaller than the name) and 18px (larger), and neither is
     "the same size", which was the requirement. */
  const sizes = { sm: 'text-[14px]', md: 'text-sm', base: 'text-base', lg: 'text-lg' }
  if (value == null)
    return <span className={cx('text-ink-400', sizes[size], className)}>—</span>
  return (
    <span
      className={cx('tnum font-semibold', colours[scoreTone(value)], sizes[size], className)}
    >
      {value}%
    </span>
  )
}

/* ------------------------------------------------------------
   SEGMENTED CONTROL
   For switching between views of the SAME thing (list vs grid,
   Grade Book vs Item Analysis). Not for navigation — if it
   changes what you're looking at rather than how, it's a link.
   ------------------------------------------------------------ */
export function Segmented({ options, value, onChange, size = 'md', className }) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-0.5 rounded-control bg-ink-100 p-0.5',
        className
      )}
      role="tablist"
    >
      {options.map((opt, i) => {
        /* ---- A DIVIDER IS A CLAIM ABOUT THE TABS ----
           `{ divider: true }` in the options list draws a
           hairline instead of a button. It exists because a row
           of five tabs reads as five equal siblings, and
           sometimes they are not: Library's are two ways INTO
           the catalogue and three views of the teacher's own
           world. Grouping them says that in one pixel, where a
           second control or a heading would cost a line.

           It is not decoration — it is the only thing on the
           row carrying the distinction. Keyed by index because
           a divider has no value of its own, and skipped by
           keyboard tab order because there is nothing to
           select. */
        if (opt.divider) {
          return (
            <span
              key={`div-${i}`}
              aria-hidden
              className="mx-1.5 h-4 w-px shrink-0 self-center bg-ink-300"
            />
          )
        }
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            /* ---- THE CHOSEN TAB IS BRAND, NOT WHITE ----
               This was a white pill with a shadow on a grey
               track: raised, legible, and saying nothing about
               WHICH kind of thing it was. The design system has
               had a rule about that from the start — brand
               colour marks what you can act on and the thing
               you have currently chosen — and the segmented
               control was the one control in the product still
               breaking it. Dhinesh spotted it on Library, where
               six tabs sit in a row and the selected one was
               distinguished only by being slightly lighter than
               its neighbours.

               Solid rather than a tint. `bg-brand-50` is the
               nav's treatment and it works there because the
               nav sits on white; here the track is already
               `ink-100`, so a pale indigo pill would be two
               greys apart from its background and the selection
               would still be doing its job by brightness alone.
               Solid indigo is the same answer the nav gives,
               stated loudly enough for the surface it is on.

               The shadow stays. It is what makes the pill read
               as sitting on top of the track rather than
               painted into it, and the colour change does not
               replace that job. */
            className={cx(
              'rounded-[6px] font-medium transition-colors duration-150 whitespace-nowrap',
              size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[14px]',
              active
                ? 'bg-brand-600 text-white shadow-card'
                : 'text-ink-600 hover:text-ink-900'
            )}
          >
            {opt.label}
            {/* The count is secondary on both sides, so it steps
                back from whatever it sits on: brand-200 on the
                indigo pill, ink-400 on the track. Keeping it
                ink-400 on indigo would have been unreadable, and
                making it white would have given one tab two
                equally loud numbers. */}
            {opt.count != null && (
              <span className={cx('ml-1.5 tnum', active ? 'text-brand-200' : 'text-ink-400')}>
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------
   SHEET
   A panel that slides in from the right, used instead of a
   centred modal for anything with more than three fields.

   Why a side sheet rather than the current centred dialog: a
   sheet leaves the page behind it visible, so a teacher picking
   classes to assign to can still see the assignment list she
   came from. Centred modals sever that context.
   ------------------------------------------------------------ */
export function Sheet({ open, onClose, title, subtitle, footer, width = 'md', children }) {
  /* Escape closes it. Small thing; its absence is always felt. */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  /* Dialog widths, smallest to largest. `2xl` (896px) exists for
     Assign specifically: it is the densest dialog in the product —
     a resource list, a two-column class picker, two date fields
     and a note — and at 672px the class cards were narrow enough
     that "24 students" sat almost under the class name. Width is
     the cheap fix for density; shrinking the type is not.

     ---- `page` IS NOT JUST A BIGGER NUMBER ----
     It is the page's own content width, 1400px, and it exists
     because of one rule: A RESOURCE TILE IS THE SAME SIZE
     EVERYWHERE.

     The resources inside an assignment are shown in the same
     ResourceTile that Browse, Saved and Shared with you use —
     deliberately, so a teacher does not re-learn the card
     depending on which direction she arrived from. But a tile
     has no width of its own: the grid gives it a third of
     whatever it sits in, so putting that grid in an 896px
     dialog quietly shrank every card from 440px to 272px. Same
     component, same code, 38% smaller, and it read as a
     different card.

     Matching the page width makes the grid inside the dialog
     the same grid that is on the page behind it: 1352px, three
     tiles of 440. It tracks, too — both are a third of the same
     number, so they shrink together when the window does. A
     fixed pixel width would have been right at one screen size
     and wrong at every other one.

     ---- AND IT IS THE CONTENT COLUMN, NOT THE CONTAINER ----
     I had this as plain `max-w-page`, which is 1400px — and the
     page is NOT 1400px wide. AppShell is `max-w-page px-4
     sm:px-6`, so the column everything actually sits in is 1400
     minus two 24px gutters: 1352. The dialog was therefore 48px
     wider than the page behind it, hanging 24px past the cards
     on each side. Dhinesh spotted it immediately, and it is the
     kind of thing that reads as sloppiness even to someone who
     could not say why.

     So the token is the CONTENT width, computed from the same
     variable the page uses rather than typed as a number. If
     `--container-page` or the gutters ever change, this follows
     them instead of quietly drifting out of alignment again.

     The overlay's own `p-4 sm:p-6` then does the same job the
     page's padding does on a narrow window: the dialog stops
     short of the viewport edge rather than touching it. Above
     about 1450px the dialog and the page column are exactly the
     same width, which is the case that matters, because that is
     where the overhang was visible. */
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    page: 'max-w-[calc(var(--container-page)-3rem)]',
  }

  /* ---- Rendered through a PORTAL, into <body> ----
     Not a detail — without it this dialog is broken wherever it
     is opened from inside a card.

     `z-50` only means "above my siblings in the nearest
     stacking context". A resource card sets its own z-index so
     its ⋯ menu can sit above the card next door, and that
     creates a context: the dialog's z-50 gets trapped inside it
     and the cards further down the grid paint straight over the
     top. Which is exactly what happened — the dialog opened
     with three resource cards lying across it.

     A portal takes the element out of the card's DOM position
     entirely and appends it to <body>, where z-50 means what
     everyone assumes it means. The fix belongs here rather than
     in the card, so that every dialog in the product gets it
     and nobody has to remember. */
  return createPortal(
    /* ---- CENTRED, NOT A RIGHT-EDGE DRAWER ----
       This used to slide in from the right. Dhinesh moved it,
       and the reason is a good one to record because it isn't
       about aesthetics: the help tool is going to live on that
       edge, and TWO DIFFERENT THINGS ARRIVING FROM THE SAME
       PLACE teaches a teacher nothing about which one she
       summoned.

       Position is a signal, and it's one of the few a user reads
       before they read any words. So the right edge now belongs
       to help and nothing else; everything modal comes to the
       middle. That's worth more than the drawer metaphor, which
       was only ever a convention.

       The middle also suits what this dialog actually is. A
       drawer implies something attached to the side of the page
       that you can glance at while still working on what's
       behind it. Assigning isn't that — it's a decision with a
       commit at the end, and a centred dialog says so. */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="glass-scrim absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          /* Glass, not flat white — a dialog is the clearest
             case of something floating above the screen it came
             from, and the blur behind it is what says so. */
          'glass-panel relative flex max-h-full w-full flex-col overflow-hidden rounded-card',
          'animate-[riseIn_160ms_ease-out]',
          widths[width]
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="-mr-1.5 rounded-control p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="border-t border-ink-200 bg-ink-50 px-6 py-4">{footer}</footer>
        )}
      </div>

      {/* Rises and settles rather than sliding in from an edge.
          A dialog that arrives from a direction is making a
          claim about where it came from; this one didn't come
          from anywhere, so it shouldn't pretend. */}
      <style>{`
        @keyframes riseIn {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0)   scale(1);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  )
}

/* ------------------------------------------------------------
   SECTION HEADER
   Consistent spacing and weight for the title above a block of
   content, with optional action on the right.
   ------------------------------------------------------------ */
export function SectionHeader({ title, count, description, action, className }) {
  return (
    <div className={cx('mb-3 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          {title}
          {count != null && (
            <span className="tnum rounded-full bg-ink-100 px-1.5 py-0.5 text-[12px] font-medium text-ink-500">
              {count}
            </span>
          )}
        </h2>
        {description && <p className="mt-0.5 text-[14px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------
   EMPTY STATE
   An empty list should explain itself and offer a way forward.
   A blank area just looks broken.
   ------------------------------------------------------------ */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-300 bg-white/50 px-6 py-12 text-center">
      {Icon && <Icon className="h-6 w-6 text-ink-300" />}
      <p className="mt-3 text-sm font-medium text-ink-800">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-ink-500">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------
   BAND ROWS
   ------------------------------------------------------------
   The class's shape as four labelled rows rather than one
   stacked strip.

   The strip was compact and it had a real flaw: four segments
   in one bar can only be compared by eye against each other,
   and the two green bands ran together into a single block that
   needed a hairline to stay legible. Worse, a stacked bar makes
   the viewer do arithmetic — to know how many are failing you
   read a proportion and multiply. Dhinesh asked for rows, and
   rows are right: each band gets its own line, its own name and
   its own number, and nothing has to be decoded.

   ---- THE BARS SCALE TO THE CLASS, NOT TO THE BIGGEST BAND ----
   The obvious move is to let the largest band fill the track,
   which makes the shape dramatic. It also makes every class
   look identical and breaks the one comparison that matters:
   twelve of these sit in a grid, and a six-child band in a
   class of twenty-four must not draw the same bar as a
   six-child band in a class of twelve. The denominator is the
   class, so a full track means everybody and the four bars
   always add up to one.

   Empty bands keep their row. "Nobody is mastering this" is
   something a teacher should be able to read, and a band that
   silently disappears takes its own absence with it.
   ------------------------------------------------------------ */
/* 400, not 500. These bars are read by length; the hue only
   has to name the band. The deeper weights stay where colour is
   doing the work on its own — the score, the alert link. */
const bandFills = {
  good: 'bg-good-400',
  watch: 'bg-watch-400',
  alert: 'bg-alert-400',
  neutral: 'bg-ink-300',
}

export function BandRows({ bands, total, unscored = 0, className }) {
  if (!total) return null
  /* Worst first. LEVELS reads best-first because that is how a
     scale reads in prose; a list a teacher scans for trouble
     reads the other way, and the row she needs is the top one. */
  const ordered = [...bands].reverse()
  return (
    <div className={cx('space-y-1', className)}>
      {ordered.map((b) => (
        <div key={b.id} className="flex items-center gap-2">
          {/* ---- THE LABEL IS NOT THE SIGNAL, THE BAR IS ----
              Each of these was set in its own band colour, so
              four coloured words sat beside four coloured bars
              saying exactly the same thing. Across a grid of
              twelve cards that is ninety-six redundant points of
              colour, and it turns a report into a paint chart:
              the eye goes to the hue instead of to the shape,
              which is the one thing these rows exist to show.

              Grey labels, coloured bars. The colour appears once
              per row, on the element whose LENGTH is the fact. */}
          <span className="w-[84px] shrink-0 text-[12px] text-ink-600">{b.label}</span>
          <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-100">
            <span
              className={cx('block h-full rounded-full', bandFills[b.tone])}
              style={{ width: `${(b.count / total) * 100}%` }}
            />
          </span>
          {/* Fixed width so the numbers line up in a column down
              the card — four counts that jitter left and right
              cannot be compared at a glance, which is the only
              reason they are here. */}
          <span
            className={cx(
              'tnum w-5 shrink-0 text-right text-[12px] font-medium',
              b.count > 0 ? 'text-ink-700' : 'text-ink-300'
            )}
          >
            {b.count}
          </span>
        </div>
      ))}
      {/* ---- AND THE PART NOBODY HAS MARKED ----
          Grey, last, and counted in the same denominator as the
          rest. Without it the four bars silently add up to less
          than the class above them, and a teacher reading "23
          students" over bands totalling sixteen has to work out
          where seven children went. "Nothing finished" is not a
          failure state and does not take a band's colour. */}
      {unscored > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-[84px] shrink-0 text-[12px] text-ink-400">Nothing yet</span>
          <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-100">
            <span
              className="block h-full rounded-full bg-ink-300"
              style={{ width: `${(unscored / total) * 100}%` }}
            />
          </span>
          <span className="tnum w-5 shrink-0 text-right text-[12px] font-medium text-ink-500">
            {unscored}
          </span>
        </div>
      )}
    </div>
  )
}
