/* ============================================================
   THE RESOURCE TYPE BADGE
   ------------------------------------------------------------
   A short code — IM, IMC, Lab, SR, Phenom — in the colour that
   type owns everywhere else in the product.

   WHY THIS IS A FILE AND NOT THREE COPIES OF SIX LINES.
   A playlist gets listed in three places: the saved card in
   Library › Saved, the rows in the tray, and the "What you're
   assigning" list in the Assign dialog. The same five resources
   in the same order, three times — and until now they were
   drawn three different ways. The saved card had a coloured
   code before the title, the tray had the type spelled out in
   grey under the title, and the Assign dialog had a grey code
   after the title.

   That is one object with three grammars. A teacher reading her
   lesson in the tray and then in the dialog has to re-learn the
   row each time, and none of the three is wrong on its own,
   which is exactly how this kind of thing survives. Dhinesh
   asked for the coloured code in the tray; the useful version
   of that request is to make all three the same row.

   COLOUR IS DOING REAL WORK HERE, not decoration. A module and
   its companion share a sub-topic name, so a playlist regularly
   reads "Relative Density / Relative Density / Relative
   Density" down the list. The hue is what tells them apart at a
   glance, before you have read a word.

   THE SHORT CODE IS NOT SELF-EXPLANATORY, and that is handled
   rather than ignored: the full name is in the hover title and
   in the accessible text, so nobody has to already know that
   IMC means IM Companion. The code earns its brevity by being
   backed, not by being obvious.
   ============================================================ */

import { resourceTypes } from '../data/mock'
import { typeStyle } from '../data/typeColors'
import { cx } from './ui'

export default function TypeBadge({ type, className }) {
  const meta = resourceTypes[type]
  if (!meta) return null

  /* Same mixes the card headers use — band behind, ink on top,
     measured to clear 8:1 for every one of the 21 hues. The
     badge and the card it came from are the same colour by
     construction rather than by two people picking the same
     swatch. */
  const tint = typeStyle(type)

  return (
    <span
      title={meta.label}
      className={cx(
        'shrink-0 rounded px-1.5 py-0.5 text-[12px] font-semibold leading-tight',
        className
      )}
      style={{ background: tint.band, color: tint.ink }}
    >
      {/* Screen readers get the name, eyes get the code. A bare
          "IMC" read aloud is noise, and a badge that reads
          "eye em see" in the middle of a lesson list is worse
          than no badge at all. */}
      <span className="sr-only">{meta.label}</span>
      <span aria-hidden="true">{meta.short}</span>
    </span>
  )
}
