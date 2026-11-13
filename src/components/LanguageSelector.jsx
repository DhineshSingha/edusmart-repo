/* ============================================================
   LANGUAGE SELECTOR
   ------------------------------------------------------------
   The live product has this as a dropdown labelled LANGUAGE,
   third in a row of four filters. It was missing here and
   Dhinesh caught it.

   WHY IT'S A SEGMENTED CONTROL RATHER THAN A DROPDOWN
   A dropdown is the right shape when there are more options
   than fit, or when you don't want them all on screen. With
   exactly two options it costs a click to show you something
   you could already have seen, and it hides the current state
   behind a closed lid.

   Two options, both visible, one click to switch. If EduSmart
   ever adds a third language this becomes a dropdown — but not
   before, and not on the assumption that it might.

   HOW LOUD IT SHOULD BE
   The first version filled the selected option with solid
   indigo, which made a language toggle as loud as a primary
   action. Dhinesh cut it back, and the reasoning generalises:
   THE VOLUME OF A CONTROL SHOULD MATCH HOW OFTEN IT CHANGES.
   Search is used every visit; the language is set once a term
   and then left alone. A control nobody touches shouldn't be
   one of the brightest things on the page.

   So the selected option is now simply darker and bolder than
   the other — the same way a well-set table of contents marks
   where you are. Still unambiguous, an eighth of the ink.

   WHY IT SITS BESIDE GRADE
   Same reason the grade selector moved here from the header:
   both of these change WHAT THE LIBRARY CONTAINS and nothing
   else. Your classes are your classes whatever language you're
   browsing in. A control that governs one screen belongs on
   that screen, next to the other control that does the same
   job, so the row reads as one sentence — "in Grade 5 Science,
   in English, find…".
   ============================================================ */

import { Languages } from 'lucide-react'
import { useApp } from '../store'
import { cx } from './ui'

const OPTIONS = [
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
]

export default function LanguageSelector({ className }) {
  const { language, setLanguage } = useApp()

  return (
    <div
      className={cx(
        'flex items-center gap-1 rounded-card border border-ink-300 bg-white px-2.5 shadow-card',
        className
      )}
    >
      <Languages className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />

      {/* A real radiogroup rather than two buttons, so a screen
          reader announces "English, selected, 1 of 2" instead
          of reading out two unrelated controls. */}
      <div role="radiogroup" aria-label="Language" className="flex items-center">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={language === o.value}
            onClick={() => setLanguage(o.value)}
            className={cx(
              'rounded px-1.5 py-1 text-[14px] transition-colors',
              language === o.value
                /* Brand, not ink. This is the one language
                   control on the page and it sets what every card
                   below it shows, so it's worth a colour — and
                   the colour makes the active side unmistakable
                   without needing a pill, a fill, or a box.

                   The EN/ES toggle on the cards matches this
                   now. I had kept it ink on the grounds that
                   there is one of this and nine of those —
                   Dhinesh changed it, and the better argument is
                   his: they are two instances of one idea, and
                   the same idea should look the same. */
                ? 'font-semibold text-brand-700'
                : 'text-ink-400 hover:text-ink-700'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
