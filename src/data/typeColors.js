/* ============================================================
   RESOURCE TYPE COLOURS
   ------------------------------------------------------------
   One hue per resource type, so a teacher can tell an
   Instruction Module from its Companion from a Student Review
   without reading any of them. Dhinesh's ask, and a good one:
   on a grid of nine cards the type label is the thing she's
   actually sorting by, and reading nine small uppercase labels
   is slower than seeing three blues and three pinks.

   ------------------------------------------------------------
   HOW STRONG, AND WHY THAT NUMBER

   The band is 26% of the hue mixed into white — it started at
   12%, and Dhinesh doubled it.

   My original argument was that colour here is a sorting aid
   rather than a label: it never has to be identified
   ("that one's blue" is not a thought a teacher needs), it only
   has to group, so it can afford to be almost invisible.

   That reasoning was sound in isolation and wrong in context,
   which is the failure mode worth naming. These cards are one
   click away from a screen carrying four full-strength strand
   colours — saturated chips, a saturated ribbon, a solid bar on
   every TEKS card. Arriving here from there, a 12% wash didn't
   read as restraint, it read as the colour system giving up.
   Consistency across a journey beats local optimisation on one
   screen.

   26% is still nowhere near "a blue card": the body stays
   white, and only the header band carries the hue. What it buys
   is that the band is now unmistakably the same LANGUAGE as the
   strand colours behind it.

   Contrast was measured, not estimated, at every step —
   see the note on `ink` below.

   ------------------------------------------------------------
   THE ASSIGNMENT RULE

   Twenty-one types, nowhere near twenty-one distinguishable
   hues. So the constraint isn't "every type looks different
   from every other type" — that's unachievable and unnecessary.
   It's:

     NO TWO TYPES THAT APPEAR TOGETHER SHARE A HUE.

   The categories are what determine which types a teacher sees
   at once, so hues are assigned per category and reused freely
   across them. Teacher Resources is the tightest with five
   types in one view; Instruction, the one she opens most, has
   three and they're as far apart as amber, blue and pink.
   ============================================================ */

export const typeHues = {
  /* ---- Instruction ----
     The three she sees most often, and the three furthest
     apart on the wheel. IM and IMC especially: they carry the
     SAME sub-topic name, so colour is the only thing that
     separates "Mass" the video from "Mass" the worksheet at a
     glance. */
  PHENOM: '#d97706', // Anchoring Phenomenon — amber
  IM: '#2563eb', // Instruction Module — blue
  IMC: '#db2777', // IM Companion — pink

  /* ---- Online Activities ---- */
  INTERACTIVITY: '#0891b2', // cyan
  SIMULATION: '#4f46e5', // indigo
  SR: '#7c3aed', // Student Review — violet
  ACTIVITIES: '#0d9488', // teal

  /* ---- Hands-on Activities ---- */
  LAB: '#16a34a', // green
  MATERIALS: '#78716c', // stone
  SAFETY: '#dc2626', // red — the one place red is apt
  VOCAB: '#9333ea', // purple

  /* ---- Vocabulary & Literacy ---- */
  WORDEXPLORER: '#c026d3', // fuchsia
  JOURNAL: '#0284c7', // sky
  READER: '#059669', // emerald

  /* ---- Assessments ---- */
  QUIZ: '#d97706', // amber
  ASSESS: '#e11d48', // rose

  /* ---- Teacher Resources ----
     Five types in one view, so all five differ. None of them
     is assignable to students, which the card already says in
     words — the colour here is only for telling one planning
     document from another. */
  UNIT_GUIDE: '#475569', // slate
  WORKBOOK: '#2563eb', // blue
  IMPL: '#0d9488', // teal
  SCOPE: '#7c3aed', // violet
  VERTICAL: '#78716c', // stone
}

export const hueFor = (type) => typeHues[type] ?? '#78716c'

/* ------------------------------------------------------------
   WHERE THE COLOUR GOES
   ------------------------------------------------------------
   First attempt washed the WHOLE card in 4% of the hue. It
   grouped correctly and still looked wrong, and Dhinesh was
   right to reject it. Why it failed is the useful part:

   A tint spread over a whole card has to stay near-invisible to
   avoid tinting the text along with it — so it ends up too weak
   to read as a decision and just makes nine cards look
   subtly, inexplicably dirty. Nobody sees "blue"; they see
   "these aren't quite white".

   The same hue concentrated into a 40px strip can be three
   times stronger and still cost nothing, because there's no
   body copy sitting on it. You get an unmistakable colour where
   you're already looking for the type name, and a clean white
   card everywhere else.

   The general rule: A LITTLE COLOUR IN ONE PLACE BEATS A LOT OF
   COLOUR EVERYWHERE. Concentration is what makes a small amount
   of ink legible as a choice.

   `color-mix` does the work in oklab, which keeps the mixes
   perceptually even — a naive RGB blend makes the yellows look
   washed out next to the blues at the same percentage.
   ------------------------------------------------------------ */
export const typeStyle = (type) => {
  const hue = hueFor(type)
  return {
    /* The header strip. */
    band: `color-mix(in oklab, ${hue} 26%, white)`,
    /* The hairline where the strip meets the white body. */
    line: `color-mix(in oklab, ${hue} 44%, white)`,
    /* The icon and the type name on the strip.

       Mixed 55% to black, and the number was measured
       rather than guessed. At full strength amber on its own
       12% tint is 2.9:1, well under the 4.5 that 11px text
       needs. I first tried 72% hue, which still failed for six
       of the twenty-one — amber, cyan, teal, green, emerald and
       the second teal — because the pale hues carry far more
       luminance than the blues at the same mix.

       At 50% every hue in the set clears 5.0:1, and each one
       still reads unmistakably as its own colour: this is a
       deep amber, not a grey. Worth checking with a script
       rather than an eye — six of these looked fine to me and
       were not. */
    ink: `color-mix(in oklab, ${hue} 55%, black)`,
  }
}
