/* ============================================================
   PROTOTYPE CONTROLS
   ------------------------------------------------------------
   Scaffolding, not product. Three switches that exist only so
   Dhinesh can decide things by looking instead of by arguing:

     NAV    A / B — which information architecture
     LOOK           quiet / colour / imagery
     COLOUR         which brand palette

   LOOK is the one to open in front of the organisation. They
   said the redesign "missed its colours and felt bland"; this
   turns that from a sentence into three screens they can point
   at. Ask which one they can find a strand in fastest, not
   which one they prefer — preference has no tiebreaker.

   Styled deliberately as scaffolding — dashed border, muted,
   tucked into a corner — so that in a demo nobody in the room
   mistakes them for features teachers would see. Before you
   present this, open the panel and hide them.

   Both would be deleted before any of this shipped.
   ============================================================ */

import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../store'
import { cx } from './ui'

/* Indigo is the chosen default. The others stay so the decision
   can be re-opened in front of stakeholders without a rebuild —
   "here's what we considered" is a much stronger position than
   "trust me". */
/* How the per-class breakdown inside an assignment is shown.
   Three readings of the same data, not three skins: a table
   compares, a sentence reads, and an attention list answers
   "what do I need to do" and leaves the rest alone. */
const ASSIGNED_VIEW = [
  {
    key: 'cards',
    label: 'Cards',
    note: 'One card per class, three to a row. Matches the rest of the segment, and reads class by class rather than column by column.',
  },
  {
    key: 'table',
    label: 'Table',
    note: 'One header row, then class · progress · dates. The labels are said once instead of on every line, and a bar makes the ratios comparable without colour.',
  },
  {
    key: 'lines',
    label: 'Sentences',
    note: 'No columns. One readable line per class. Quietest of the three, and the least useful for comparing fifteen classes to each other.',
  },
  {
    key: 'attention',
    label: 'What needs you',
    note: 'Only the classes asking for something are listed; the rest collapse to a line you can open. Shortest by far at ten or fifteen classes.',
  },
]

/* How the Library's top level is browsed. */
const BROWSE = [
  {
    key: 'chips',
    label: 'Chips',
    note: 'A row of names. Every strand one click away and almost no vertical space — fastest for someone who already knows the year.',
  },
  {
    key: 'cards',
    label: 'Category cards',
    note: 'The four strands as illustrated cards; sub-categories open underneath, Challenges and Others below that. Colourful, and the shape of the year is obvious.',
  },
]

const PALETTES = [
  { key: 'indigo', label: 'Indigo', swatch: '#4f46e5', note: 'Chosen. Modern, serious, reads as new without shouting.' },
  { key: 'blue', label: 'Royal blue', swatch: '#2e44dc', note: 'Institutional and trusted. Also the most crowded.' },
  { key: 'violet', label: 'Violet', swatch: '#7c3aed', note: 'Most energetic. Furthest from EduSmart today.' },
  { key: 'teal', label: 'Teal', swatch: '#127d73', note: 'The first proposal. Most distinctive, least expected.' },
]

/* The three answers to "did the redesign lose something when
   the photographs came out". Each note says what that option
   costs, because the point of showing them side by side is to
   make the trade visible, not to make one of them win. */
const LOOKS = [
  {
    key: 'quiet',
    label: 'Quiet',
    note: 'White cards, text does the work. Fastest to read, easiest to keep accessible.',
  },
  {
    key: 'colour',
    label: 'Colour',
    note: 'Every strand owns a hue, carried through chips, headers and bands. Colour without pictures.',
  },
  {
    key: 'image',
    label: 'Imagery',
    note: 'Full-bleed art with the name over it, like the live product — but with a scrim so type stays legible.',
  },
]

const SHADOWS = [
  {
    key: 'neutral',
    label: 'Neutral',
    note: 'Warm stone, the ink ramp’s own colour. Sits under a card without a cast.',
  },
  {
    key: 'brand',
    label: 'Brand',
    note: 'The same shadow in indigo. Ties elevation to the brand; cools the page.',
  },
]

const SURFACES = [
  {
    key: 'soft',
    label: 'Soft',
    note: 'Warm off-white page. Cards lift off it without needing an outline.',
  },
  {
    key: 'white',
    label: 'White',
    note: 'Brighter. Cards now share a fill with the page, so every edge becomes a line.',
  },
]

export default function PrototypeControls() {
  const {
    ia,
    setIa,
    palette,
    setPalette,
    richness,
    setRichness,
    surface,
    setSurface,
    shadow,
    setShadow,
    browse,
    setBrowse,
    assignedView,
    setAssignedView,
  } =
    useApp()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const ref = useRef(null)

  /* Click outside to dismiss. */
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (hidden) return null

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Prototype controls"
        title="Prototype controls — not part of the product"
        className={cx(
          'flex items-center gap-1.5 rounded-control border border-dashed px-2 py-1.5',
          'text-[12px] font-medium transition-colors',
          open
            ? 'border-ink-400 bg-ink-100 text-ink-700'
            : 'border-ink-300 bg-ink-50 text-ink-500 hover:text-ink-700'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Prototype</span>
      </button>

      {open && (
        /* SCROLLS. The panel has grown a switch at a time —
           nav, look, surface, palette, date picker, card shape —
           and the last two were simply falling off the bottom of
           the screen with no way to reach them. Capped at the
           viewport height minus the header, with its own scroll,
           so it can keep growing without anything going missing
           again. */
        <div className="glass-panel absolute right-0 top-full z-50 mt-2 flex max-h-[calc(100vh-6rem)] w-72 flex-col overflow-y-auto overscroll-contain rounded-card border border-ink-300 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[12px] leading-relaxed text-ink-500">
              Review switches. Not features — hide them before you demo.
            </p>
            <button
              onClick={() => setHidden(true)}
              title="Hide for this session"
              className="-mr-1 -mt-1 rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* ---- Navigation ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Navigation
            </h3>
            <div className="mt-2 space-y-1.5">
              {[
                {
                  key: 'merged',
                  label: 'A — Classes holds assignments',
                  note: 'Four sections. Fewer places to look.',
                },
                {
                  key: 'split',
                  label: 'B — Assignments gets its own tab',
                  note: 'Five sections. Better after a big test.',
                },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setIa(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    ia === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] text-ink-500">{o.note}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Look ----
              Sits above brand colour on purpose: this is the
              bigger decision, and the one the organisation has
              an opinion about. Try it on the Library, then on a
              TEKS page — those are the two screens where it
              actually changes anything. */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Look
            </h3>
            <div className="mt-2 space-y-1.5">
              {LOOKS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setRichness(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    richness === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
              Changes the Library and the TEKS pages.
            </p>
          </section>

          {/* ---- Assigned detail ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Assigned — class breakdown
            </h3>
            <div className="mt-2 space-y-1.5">
              {ASSIGNED_VIEW.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setAssignedView(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    assignedView === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
              Open an assignment's class list in Library › Assigned to compare.
            </p>
          </section>

          {/* ---- Library browse ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Library browse
            </h3>
            <div className="mt-2 space-y-1.5">
              {BROWSE.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setBrowse(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    browse === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
              Changes the top of the Library only.
            </p>
          </section>

          {/* ---- Surface ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Page surface
            </h3>
            <div className="mt-2 space-y-1.5">
              {SURFACES.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setSurface(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    surface === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Shadow colour ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Shadow colour
            </h3>
            <div className="mt-2 space-y-1.5">
              {SHADOWS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setShadow(o.key)}
                  className={cx(
                    'w-full rounded-control border px-2.5 py-2 text-left transition-colors',
                    shadow === o.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span className="block text-[12px] font-medium text-ink-900">
                    {o.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-500">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Palette ---- */}
          <section className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">
              Brand colour
            </h3>
            <div className="mt-2 space-y-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPalette(p.key)}
                  className={cx(
                    'flex w-full items-start gap-2.5 rounded-control border px-2.5 py-2 text-left transition-colors',
                    palette === p.key
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300'
                  )}
                >
                  <span
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ background: p.swatch }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium text-ink-900">
                      {p.label}
                    </span>
                    <span className="block text-[12px] leading-snug text-ink-500">
                      {p.note}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <p className="mt-4 border-t border-ink-200 pt-3 text-[12px] leading-relaxed text-ink-500">
            All four palettes pass WCAG AA contrast. Pick on taste, not on
            accessibility — that part is already handled.
          </p>
        </div>
      )}
    </div>
  )
}
