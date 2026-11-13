/* ============================================================
   RESOURCE DIRECTORY  —  level one of two
   ------------------------------------------------------------
   This is your original screen, kept because it was right, and
   improved rather than replaced.

   WHAT IT GETS RIGHT AND I KEPT
   Every category lists its own contents in plain text. Nothing
   is hidden behind a click, and the whole map of a TEKS reads
   in one glance. I spent four versions trying to beat that and
   didn't.

   WHAT CHANGED
   1. The cards carry information, not just names. Each shows
      how many resources, how much class time, and — new —
      whether you've already assigned anything from it. On the
      live screen, six saturated tiles all look identical, so
      the eye has nothing to sort by.
   2. They're white with a coloured accent instead of solid
      fill. Six blocks of saturated colour at full strength is
      the loudest thing on the page, and it's the packaging
      rather than the content.
   3. The contents are links, not labels. Click "Lab Safety
      Poster" and you land on that exact resource. The live
      screen makes you read the name, click the category, then
      find the name again.
   3b. TWO CLICK PATHS, ONE CARD. Click the card anywhere and
      you get the whole category. Click one of the names inside
      it and you get only that. Neither one is hidden, and the
      card doesn't ask you to aim at a 15px heading.
   4. The decorative line art is gone. It occupied about a third
      of each tile and said nothing. The space went to the
      resource names, which say something.
   ============================================================ */

import { ArrowRight } from 'lucide-react'
import { useApp } from '../store'
import { categoryHue } from '../data/strands'

export default function ResourceDirectory({ groups, onOpen, accentFor }) {
  const { isInPlaylist, richness } = useApp()

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map(({ name, items, blurb }, i) => {
        const assignable = items.filter((r) => r.forStudents)
        const minutes = assignable.reduce((s, r) => s + r.minutes, 0)
        const inPlaylist = items.filter((r) => isInPlaylist(r.id)).length
        /* Lists KIND, not type. Instruction Module and Module
           Companion are one entry — "Instruction Module &
           Companion" — because that's how the live product
           names them and how a teacher thinks about them: the
           companion is the worksheet that goes with the video,
           not a separate thing to choose. */
        const kinds = [...new Set(items.map((r) => r.kind))]

        return (
          /* ---- The whole card is the button ----
             A 15px heading is a small target for something this
             important. The card is the target now: click anywhere
             on it — the colour bar, the blurb, the empty space at
             the bottom — and the whole category opens.

             It's a <section> with onClick rather than a <button>
             because the contents list inside it has its own
             buttons, and HTML forbids a button inside a button.
             role + tabIndex + the keyboard handler give it back
             everything a real button has: focus ring, Enter,
             Space. */
          <section
            key={name}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(name)
              }
            }}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-card border border-ink-200 bg-white text-left shadow-card transition-shadow hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {/* ---- QUIET ----
                A coloured edge rather than a coloured block: it
                marks the category without shouting over the
                names, which are the part you actually read. */}
            {richness === 'quiet' && (
              <span className="h-1 w-full" style={{ background: accentFor(i) }} />
            )}

            {/* ---- COLOUR AND IMAGERY, BOTH ----
                A solid band deep enough to hold the category
                name in white. The name moves onto the colour, so
                the card reads as one object rather than a white
                box wearing a stripe.

                THIS SCREEN GETS NO ILLUSTRATIONS, in either
                variant. It used to, and Dhinesh cut them, which
                is the same call I argued for earlier without
                following through:

                  IMAGERY COSTS MORE THE MORE OFTEN YOU PASS IT.

                A strand banner is a once-a-session surface — one
                picture, at the top, while you get your bearings.
                These six cards are the working screen. A teacher
                opens a TEKS, scans the categories and clicks
                through, over and over, all week. Six full-bleed
                drawings there stop being wayfinding and become
                six things to look past on the way to the
                resource names, which are what she actually came
                to read.

                Colour still does the identifying job — you can
                tell Assessments from Instruction at a glance —
                and it does it in a 40px band instead of a 144px
                picture, so the contents rise up the card and the
                whole grid gets shorter.

                The six category illustrations still exist in
                components/Artwork.jsx if this is ever worth
                revisiting. They're simply not mounted. */}
            {richness !== 'quiet' && (
              <div
                className="flex items-center justify-between gap-2 px-4 py-3"
                style={{ background: categoryHue(name) }}
              >
                <h3 className="text-[16px] font-semibold tracking-tight text-white">
                  {name}
                </h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
            )}

            <div className="flex flex-1 flex-col p-4">
              {/* In QUIET the heading lives here, inside the
                  card body. In the other two it has already been
                  drawn on the band or the artwork above. */}
              {richness === 'quiet' && (
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[16px] font-semibold tracking-tight text-ink-900 group-hover:text-brand-700">
                    {name}
                  </h3>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
              )}

              {blurb && (
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{blurb}</p>
              )}

              {/* The contents. Names, and every one is a link.
                  stopPropagation is what keeps the two paths
                  apart: clicking "Instruction Module & Companion"
                  opens only that, and does NOT also fire the
                  card's open-everything click underneath it.

                  No count after the name any more — the card
                  already says "38 resources" at the bottom, and a
                  number beside every line was reading as ranking
                  rather than quantity. */}
              <ul className="mt-3 space-y-1">
                {kinds.map((kind) => (
                  <li key={kind}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpen(name, kind)
                      }}
                      className="text-left text-[12px] leading-snug text-ink-600 transition-colors hover:text-brand-700 hover:underline"
                    >
                      {kind}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-auto pt-3.5 text-[12px] text-ink-400">
                {items.length} resources
                {minutes > 0 && ` · ${minutes} min of class time`}
                {inPlaylist > 0 && (
                  <span className="font-medium text-brand-700">
                    {' · '}
                    {inPlaylist} in your playlist
                  </span>
                )}
              </p>
            </div>
          </section>
        )
      })}
    </div>
  )
}
