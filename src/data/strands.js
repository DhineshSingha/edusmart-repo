/* ============================================================
   STRAND IDENTITY  —  colour and artwork for the six strands
   ------------------------------------------------------------
   This file exists because of one disagreement worth settling
   properly: Dhinesh removed the photographs from the category
   screen, and his organisation said the product "missed its
   colours and felt bland".

   Both positions have something in them, so rather than argue,
   the prototype now runs three ways and you can look:

     QUIET   white cards, one thin accent. Text does the work.
     COLOUR  each strand owns a hue, applied everywhere.
     IMAGE   full-bleed artwork with the name over it, which is
             what the live product does today.

   ------------------------------------------------------------
   THE HUES — SECOND ATTEMPT, AND WHY THE FIRST ONE FAILED

   Dhinesh's verdict on the first set: "the colours are not very
   different from each other." He was right, and the reason is
   worth writing down because it's a real design mistake rather
   than bad luck with swatches.

   I had reasoned that GREEN, AMBER AND RED ARE ALREADY SPOKEN
   FOR in this product — they mean a student is fine, slipping,
   or behind — so I banned them from the strand palette. That
   removed roughly a third of the colour wheel. What was left
   was blue, violet and teal, so four of my six hues came out of
   the same corner and the whole point of colour-coding
   collapsed. I protected a rule and lost the feature.

   The fix is to separate the two palettes by REGISTER instead
   of by hue. Status colours are bright, mid-value, saturated:
   #22c55e, #f59e0b, #ef4444. Strand colours are deep jewel
   tones, several steps darker, and they only ever appear as
   large flat areas — a band, a filled chip, a header. Status
   only ever appears as a number, a dot, or a thin bar.

   So a teacher never has to compare a strand green with a
   status green: one is a dark field behind white text, the
   other is a bright 12px bar next to a percentage. Different
   value, different size, different place.

   With that settled the four CONTENT strands can sit roughly
   80° apart around the wheel — magenta, orange, blue, green —
   which is as separated as four hues get.

   ONE HARD RULE: no strand uses red. Red is the only status
   colour that means something urgent, and it keeps sole
   ownership of that meaning.

   THE TWO PROCESS STRANDS STAY NEUTRAL, on purpose. They aren't
   units a teacher moves between; they're taught across the
   whole year, and the design already mutes them everywhere
   else. Giving them loud colours would have said they were
   peers of the content strands, which would be a lie told in
   paint. They differ from each other only by temperature —
   one cool slate, one warm stone.

   Every hue below is dark enough that WHITE TEXT ON IT PASSES
   WCAG AA. That is the single thing the live screen gets wrong:
   "Force, Motion, and Energy" is white type on a pale sky
   photograph and it fails contrast today. A photograph's
   brightness is uncontrolled; a hex value isn't.

   ============================================================ */

/* ------------------------------------------------------------
   THE SIX STRANDS
   ------------------------------------------------------------
   hue      the strand's colour. White text on it passes AA.
   tint     a very pale version, for quiet backgrounds.
   ring     a mid version, for borders and dots.
   deep     the near-black the illustration fades into. It is
            exactly the colour each drawing's own background
            ends on, so a banner using both has no visible
            seam between the flat area and the picture.

   The pictures used to live here too, as CSS gradients. They
   are now real drawings, in components/Artwork.jsx.
   ------------------------------------------------------------ */
export const strands = {
  /* MATTER AND ENERGY — magenta. The live product already
     illustrates this one with purple plasma, so it's the least
     jarring place to start, and magenta is far enough from the
     blues that it reads as its own thing. */
  'u-matter': { hue: '#a21caf', tint: '#fdf4ff', ring: '#f0abfc', deep: '#2e1065' },

  /* FORCE, MOTION, AND ENERGY — burnt orange. Semantically
     right (motion, energy) and it's the hue the first attempt
     was missing entirely. Deep enough that nobody confuses it
     with the bright amber that means "this class is slipping". */
  'u-force': { hue: '#c2410c', tint: '#fff7ed', ring: '#fdba74', deep: '#431407' },

  /* EARTH AND SPACE — deep blue. Night sky, and the one strand
     where the obvious colour is also the right one. */
  'u-earth': { hue: '#1d4ed8', tint: '#eff6ff', ring: '#93c5fd', deep: '#020617' },

  /* ORGANISMS AND ENVIRONMENTS — forest green. Deliberately
     several steps darker than the #22c55e that means a student
     is doing fine; side by side they don't read as the same
     colour, and they never appear in the same form anyway. */
  'u-organisms': { hue: '#15803d', tint: '#f0fdf4', ring: '#86efac', deep: '#052e16' },

  /* SCIENTIFIC AND ENGINEERING PRACTICES — cool slate. A
     process strand: taught all year, not a unit you switch to.
     Neutral says that without a caption. */
  'u-sep': { hue: '#475569', tint: '#f8fafc', ring: '#cbd5e1', deep: '#0f172a' },

  /* RECURRING THEMES AND CONCEPTS — warm stone. The other
     process strand. Distinguished from its sibling by
     temperature rather than by hue, which keeps them reading as
     a pair. */
  'u-rtc': { hue: '#57534e', tint: '#fafaf9', ring: '#d6d3d1', deep: '#1c1917' },
}

/* A safe fallback, so a new strand added to the data later
   renders as something rather than as nothing. */
export const strandFallback = {
  hue: '#475569',
  tint: '#f8fafc',
  ring: '#cbd5e1',
  deep: '#0f172a',
}

export const strandOf = (unitId) => strands[unitId] ?? strandFallback

/* ------------------------------------------------------------
   THE SCRIM
   ------------------------------------------------------------
   The single most important line in this file.

   Text laid directly over artwork is legible until the day
   somebody swaps the artwork. A scrim — a dark gradient sitting
   between the picture and the words — makes the guarantee
   structural: whatever is behind it, the bottom of the tile is
   dark, so white type on it is readable.

   This is the fix for what's wrong with the live category
   screen, and it costs one element.
   ------------------------------------------------------------ */
export const SCRIM =
  'linear-gradient(to top, rgba(2,6,23,.88) 0%, rgba(2,6,23,.55) 45%, rgba(2,6,23,.15) 100%)'

/* ------------------------------------------------------------
   RESOURCE CATEGORY COLOURS  (the six cards inside a TEKS)
   ------------------------------------------------------------
   A second, separate scale. These are kinds of MATERIAL, not
   places in the curriculum, and the two never share a card — a
   strand colour lives on the Library, a category colour lives
   inside a TEKS. So they can reuse the same region of the wheel
   without any risk of being read as the same system.

   Same rules as above: deep enough for white text, and no red.
   ------------------------------------------------------------ */
export const categoryHues = {
  Instruction: '#4338ca',
  'Online Activities': '#0369a1',
  'Hands-on Activities': '#0f766e',
  'Vocabulary & Literacy': '#7e22ce',
  Assessments: '#9d174d',
  'Teacher Resources': '#475569',
}

export const categoryHue = (name) => categoryHues[name] ?? '#475569'
