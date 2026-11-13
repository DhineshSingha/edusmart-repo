/* ============================================================
   ARTWORK  —  twelve illustrations
   ------------------------------------------------------------
   WHAT WAS WRONG WITH THE LAST VERSION

   Dhinesh's words: "Imagery option didn't really add images,
   rather added abstract lines and stuff." Correct. I built
   layered CSS gradients, told myself they were artwork, and
   they weren't — they were texture. Nobody looking at a wash of
   violet thinks "matter and energy". The organisation asked for
   pictures and I gave them a mood.

   So these are pictures: a flask bubbling on a lab bench, a
   ball rolling down a ramp, a ringed planet with a rocket
   arcing past it, a hillside with trees and a fish in the
   water. Recognisable subjects, drawn.

   ------------------------------------------------------------
   WHY DRAWN AND NOT PHOTOGRAPHED

   Not a design position — a limitation, stated plainly so you
   can decide rather than discover it in the room. I can't
   license stock photography from here, so the honest choice was
   illustration or nothing.

   That said, illustration is what I'd argue for anyway, and
   the reasons are worth having ready if it comes up:

     WEIGHT     Twelve of these together weigh less than one
                photograph. "Slow, heavy pages" was one of the
                four problems you set out to fix.
     CONTRAST   I control every value, so text on top is
                legible by construction. A photograph's
                brightness is whatever the photographer's
                brightness was.
     OWNERSHIP  Stock photos appear in competitors' products
                too. An illustration set is yours.
     TRUTH      A fighter jet for "Force, Motion, and Energy"
                is an association. A ball on a ramp is the
                actual Grade 5 content.

   IF THEY WANT PHOTOGRAPHS ANYWAY, that's a legitimate answer
   and it's a small change — see the note at the bottom of this
   file for the one line to swap.

   ------------------------------------------------------------
   HOUSE STYLE, so twelve drawings look like one set

   · One deep background per scene, from the strand's own hue.
   · Flat shapes, no outlines, no gradients inside objects.
   · Exactly one warm accent per scene (amber), so the eye has
     somewhere to land.
   · Light tints of white at 8–30% for depth.
   · Subjects sit in the middle band with slack above and below,
     because these get centre-cropped in wide containers.
   ============================================================ */

/* Every gradient needs an id unique across the whole page — two
   SVGs sharing an id is a real and very confusing bug, where
   one illustration silently adopts another's colours. */
function Sky({ id, from, to }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  )
}

const AMBER = '#fbbf24'

/* Shared wrapper.

   HOW THESE GET CROPPED, which turned out to matter more than
   how they're drawn. Every scene is a 2:1 rectangle, and the
   boxes it has to sit in are not: a card header is about 3:1,
   a strand banner is nearer 7:1.

   `slice` fills the box and throws away the overflow. On the
   first attempt I anchored to the bottom, which quietly sliced
   the top off every drawing — the microscope lost its eyepiece,
   the little figure in the Instruction scene lost its head.
   Centring keeps the subject and cuts evenly, so every scene is
   drawn with its subject in the middle and slack above and
   below that it can afford to lose. */
function Scene({ children, fit = 'slice' }) {
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio={fit === 'slice' ? 'xMidYMid slice' : 'xMaxYMid meet'}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/* ============================================================
   THE SIX STRANDS
   ============================================================ */

/* MATTER AND ENERGY — a lab bench. Conical flask with liquid
   and rising bubbles, a beaker beside it, molecules drifting
   above. The most literal "science" image in the set, which
   suits the most concrete strand. */
function MatterArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-matter" from="#6b21a8" to="#2e1065" />
      <rect width="400" height="200" fill="url(#sky-matter)" />
      <circle cx="120" cy="70" r="90" fill="#a21caf" opacity=".35" />

      {/* molecules */}
      <g stroke="#f5d0fe" strokeWidth="2" opacity=".55">
        <line x1="296" y1="42" x2="330" y2="58" />
        <line x1="330" y1="58" x2="356" y2="34" />
      </g>
      <g fill="#f5d0fe" opacity=".8">
        <circle cx="296" cy="42" r="8" />
        <circle cx="330" cy="58" r="6" />
        <circle cx="356" cy="34" r="5" />
      </g>

      {/* bench */}
      <rect x="0" y="168" width="400" height="32" fill="#1e0b3a" />
      <rect x="0" y="166" width="400" height="4" fill="#c084fc" opacity=".5" />

      {/* conical flask */}
      <path
        d="M150 52h26v42l32 60q6 12-8 12h-74q-14 0-8-12l32-60z"
        fill="#ffffff"
        opacity=".18"
      />
      <path d="M140 132h46l22 22q6 12-8 12h-74q-14 0-8-12z" fill="#e879f9" />
      <rect x="146" y="46" width="34" height="9" rx="4" fill="#ffffff" opacity=".35" />
      <g fill="#ffffff" opacity=".65">
        <circle cx="152" cy="150" r="4" />
        <circle cx="168" cy="144" r="3" />
        <circle cx="178" cy="154" r="2.5" />
      </g>
      {/* bubbles escaping the neck */}
      <g fill="#f5d0fe" opacity=".5">
        <circle cx="163" cy="34" r="4" />
        <circle cx="152" cy="18" r="3" />
        <circle cx="172" cy="10" r="2.5" />
      </g>

      {/* beaker */}
      <path d="M232 86h56v68q0 12-12 12h-32q-12 0-12-12z" fill="#ffffff" opacity=".16" />
      <path d="M232 120h56v34q0 12-12 12h-32q-12 0-12-12z" fill={AMBER} />
      <g stroke="#ffffff" strokeWidth="2" opacity=".35">
        <line x1="238" y1="100" x2="252" y2="100" />
        <line x1="238" y1="112" x2="252" y2="112" />
      </g>
    </Scene>
  )
}

/* FORCE, MOTION, AND ENERGY — a ball rolling down a ramp, with
   motion streaks behind it, and a pendulum swinging at the
   right. Both are Grade 5 investigations from the TEKS itself
   ("a car on a ramp", 5.7B), which is the point: the picture is
   the content rather than a metaphor for it. */
function ForceArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-force" from="#9a3412" to="#431407" />
      <rect width="400" height="200" fill="url(#sky-force)" />
      <circle cx="310" cy="46" r="76" fill="#ea580c" opacity=".35" />

      {/* pendulum */}
      <g opacity=".85">
        <line x1="300" y1="8" x2="330" y2="82" stroke="#fed7aa" strokeWidth="2.5" />
        <circle cx="332" cy="90" r="13" fill="#fed7aa" />
        <path
          d="M286 78a48 48 0 0 0 60 24"
          fill="none"
          stroke="#fed7aa"
          strokeWidth="2"
          strokeDasharray="4 5"
          opacity=".6"
        />
      </g>

      {/* ground */}
      <rect x="0" y="162" width="400" height="38" fill="#2a0d06" />

      {/* ramp */}
      <path d="M36 162h214V66z" fill="#ffffff" opacity=".16" />
      <path d="M36 162h214V66z" fill="none" stroke="#fdba74" strokeWidth="2.5" opacity=".7" />

      {/* motion streaks, getting longer as it speeds up */}
      <g stroke={AMBER} strokeWidth="4" strokeLinecap="round" opacity=".75">
        <line x1="196" y1="88" x2="214" y2="80" />
        <line x1="178" y1="104" x2="204" y2="92" />
        <line x1="158" y1="120" x2="194" y2="104" />
      </g>

      {/* ball */}
      <circle cx="140" cy="128" r="17" fill={AMBER} />
      <circle cx="134" cy="122" r="5" fill="#ffffff" opacity=".5" />
    </Scene>
  )
}

/* EARTH AND SPACE — a ringed planet, a moon, stars, and a
   rocket on an arcing trajectory. The one scene where a
   photograph would genuinely be lovely, and also the one the
   live product illustrates best today. */
function EarthArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-earth" from="#1e3a8a" to="#020617" />
      <rect width="400" height="200" fill="url(#sky-earth)" />

      <g fill="#ffffff">
        <circle cx="34" cy="28" r="2" opacity=".9" />
        <circle cx="88" cy="62" r="1.5" opacity=".6" />
        <circle cx="132" cy="22" r="2.2" opacity=".8" />
        <circle cx="196" cy="52" r="1.4" opacity=".5" />
        <circle cx="58" cy="108" r="1.8" opacity=".65" />
        <circle cx="244" cy="20" r="2" opacity=".75" />
        <circle cx="300" cy="96" r="1.5" opacity=".5" />
        <circle cx="16" cy="70" r="1.4" opacity=".55" />
        <circle cx="168" cy="118" r="1.6" opacity=".5" />
      </g>

      {/* orbit */}
      <ellipse
        cx="296"
        cy="140"
        rx="122"
        ry="46"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeDasharray="5 7"
        opacity=".45"
        transform="rotate(-16 296 140)"
      />

      {/* planet */}
      <circle cx="296" cy="140" r="64" fill="#3b82f6" />
      <path d="M232 140a64 64 0 0 1 128 0z" fill="#60a5fa" opacity=".45" />
      <g fill="#1d4ed8" opacity=".55">
        <circle cx="272" cy="120" r="13" />
        <circle cx="314" cy="156" r="9" />
        <circle cx="298" cy="104" r="6" />
      </g>
      <ellipse
        cx="296"
        cy="140"
        rx="92"
        ry="20"
        fill="none"
        stroke={AMBER}
        strokeWidth="7"
        opacity=".85"
        transform="rotate(-16 296 140)"
      />

      {/* moon */}
      <circle cx="112" cy="150" r="20" fill="#cbd5e1" opacity=".8" />
      <circle cx="106" cy="145" r="5" fill="#94a3b8" opacity=".8" />

      {/* rocket */}
      <g transform="rotate(38 96 74)">
        <path d="M96 40q16 18 16 38t-16 24q-16-4-16-24t16-38z" fill="#f8fafc" />
        <path d="M80 82l-12 18 14-6zM112 82l12 18-14-6z" fill="#ef4444" />
        <circle cx="96" cy="66" r="7" fill="#38bdf8" />
        <path d="M88 102h16l-8 22z" fill={AMBER} opacity=".9" />
      </g>
    </Scene>
  )
}

/* ORGANISMS AND ENVIRONMENTS — a habitat: sun, hills, trees,
   and a pond with a fish. This is the one the live product
   does with a clownfish photograph, and the one where a photo
   is genuinely hardest to beat — so it's the fairest test of
   whether illustration is good enough for your organisation. */
function OrganismsArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-org" from="#166534" to="#052e16" />
      <rect width="400" height="200" fill="url(#sky-org)" />

      <circle cx="322" cy="46" r="26" fill={AMBER} />
      <circle cx="322" cy="46" r="40" fill={AMBER} opacity=".18" />

      {/* hills */}
      <path d="M0 122q70-44 140-8t120-22 140 16v92H0z" fill="#15803d" opacity=".85" />
      <path d="M0 152q90-34 168 2t232-14v60H0z" fill="#14532d" />

      {/* trees */}
      <g>
        <rect x="76" y="118" width="7" height="26" fill="#78350f" />
        <path d="M79.5 76l26 48h-52z" fill="#22c55e" />
        <path d="M79.5 96l20 34h-40z" fill="#4ade80" opacity=".75" />
      </g>
      <g>
        <rect x="140" y="128" width="6" height="22" fill="#78350f" />
        <path d="M143 98l20 36h-40z" fill="#16a34a" />
      </g>
      <g>
        <rect x="246" y="124" width="6" height="22" fill="#78350f" />
        <path d="M249 92l22 40h-44z" fill="#22c55e" opacity=".9" />
      </g>

      {/* pond */}
      <path d="M0 172q60-14 122 0t148-4 130 6v26H0z" fill="#0e7490" />
      <path d="M0 178q60-12 122 2t148-4 130 6v18H0z" fill="#0891b2" opacity=".7" />

      {/* fish */}
      <g transform="translate(180 186)">
        <path d="M0 0q12-11 26 0T0 0z" fill={AMBER} />
        <path d="M26 0l12-7v14z" fill={AMBER} opacity=".8" />
        <circle cx="8" cy="-1" r="1.8" fill="#052e16" />
      </g>
      <g stroke="#a5f3fc" strokeWidth="2" opacity=".5" strokeLinecap="round">
        <line x1="286" y1="184" x2="306" y2="184" />
        <line x1="316" y1="192" x2="342" y2="192" />
      </g>
    </Scene>
  )
}

/* SCIENTIFIC AND ENGINEERING PRACTICES — the instruments:
   microscope, hand lens, ruler, a clipboard with results on it.
   These are the process standards — measuring, observing,
   recording — so tools are the honest subject. */
function PracticesArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-sep" from="#475569" to="#0f172a" />
      <rect width="400" height="200" fill="url(#sky-sep)" />
      <circle cx="80" cy="54" r="80" fill="#64748b" opacity=".3" />

      {/* bench */}
      <rect x="0" y="168" width="400" height="32" fill="#0b1220" />

      {/* microscope */}
      <g fill="#e2e8f0">
        <ellipse cx="128" cy="166" rx="46" ry="9" />
        <rect x="120" y="96" width="14" height="70" rx="5" />
        <path d="M134 100q34 4 34 34v10h-13v-10q0-22-21-24z" />
        <rect x="96" y="130" width="52" height="8" rx="3" />
        <rect x="150" y="34" width="17" height="52" rx="7" transform="rotate(16 158 60)" />
        <rect x="146" y="86" width="26" height="14" rx="4" />
      </g>
      <circle cx="122" cy="134" r="5" fill={AMBER} />

      {/* hand lens */}
      <g transform="translate(236 56)">
        <circle cx="30" cy="30" r="27" fill="#cbd5e1" opacity=".35" />
        <circle cx="30" cy="30" r="27" fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <rect x="46" y="48" width="9" height="34" rx="4" fill="#e2e8f0" transform="rotate(-42 50 65)" />
      </g>

      {/* ruler */}
      <g transform="rotate(-8 300 150)">
        <rect x="240" y="140" width="130" height="22" rx="4" fill={AMBER} />
        <g stroke="#78350f" strokeWidth="2" opacity=".8">
          <line x1="256" y1="140" x2="256" y2="150" />
          <line x1="276" y1="140" x2="276" y2="154" />
          <line x1="296" y1="140" x2="296" y2="150" />
          <line x1="316" y1="140" x2="316" y2="154" />
          <line x1="336" y1="140" x2="336" y2="150" />
          <line x1="356" y1="140" x2="356" y2="154" />
        </g>
      </g>

      {/* clipboard */}
      <g transform="rotate(7 46 128)">
        <rect x="14" y="94" width="64" height="80" rx="6" fill="#f1f5f9" />
        <rect x="34" y="88" width="24" height="12" rx="4" fill="#94a3b8" />
        <g stroke="#94a3b8" strokeWidth="3" strokeLinecap="round">
          <line x1="26" y1="118" x2="66" y2="118" />
          <line x1="26" y1="132" x2="66" y2="132" />
          <line x1="26" y1="146" x2="52" y2="146" />
        </g>
      </g>
    </Scene>
  )
}

/* RECURRING THEMES AND CONCEPTS — a cycle arrow, meshing gears,
   and a repeating wave. Patterns that come back, which is the
   literal definition of the strand. */
function ThemesArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-rtc" from="#57534e" to="#1c1917" />
      <rect width="400" height="200" fill="url(#sky-rtc)" />
      <circle cx="320" cy="150" r="90" fill="#78716c" opacity=".3" />

      {/* cycle */}
      <g transform="translate(96 100)">
        <circle r="54" fill="none" stroke="#e7e5e4" strokeWidth="11" opacity=".22" />
        <path
          d="M0-54a54 54 0 0 1 46.8 27"
          fill="none"
          stroke={AMBER}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path d="M40 -36l20 12-6 22z" fill={AMBER} />
        <path
          d="M-46.8 27a54 54 0 0 0 46.8 27"
          fill="none"
          stroke="#e7e5e4"
          strokeWidth="11"
          strokeLinecap="round"
          opacity=".8"
        />
        <path d="M-6 54l-22 6 -8-22z" fill="#e7e5e4" opacity=".8" />
      </g>

      {/* gears */}
      <g fill="#d6d3d1" opacity=".9">
        <g transform="translate(268 84)">
          <circle r="30" />
          <g>
            <rect x="-5" y="-40" width="10" height="14" rx="2" />
            <rect x="-5" y="26" width="10" height="14" rx="2" />
            <rect x="-40" y="-5" width="14" height="10" rx="2" />
            <rect x="26" y="-5" width="14" height="10" rx="2" />
          </g>
          <circle r="11" fill="#1c1917" />
        </g>
        <g transform="translate(324 130)" opacity=".75">
          <circle r="22" />
          <g>
            <rect x="-4" y="-30" width="8" height="11" rx="2" />
            <rect x="-4" y="19" width="8" height="11" rx="2" />
            <rect x="-30" y="-4" width="11" height="8" rx="2" />
            <rect x="19" y="-4" width="11" height="8" rx="2" />
          </g>
          <circle r="8" fill="#1c1917" />
        </g>
      </g>

      {/* repeating wave */}
      <path
        d="M-10 180q25-30 50 0t50 0 50 0 50 0 50 0 50 0 50 0"
        fill="none"
        stroke="#e7e5e4"
        strokeWidth="4"
        opacity=".45"
      />
    </Scene>
  )
}

const STRAND_ART = {
  'u-matter': MatterArt,
  'u-force': ForceArt,
  'u-earth': EarthArt,
  'u-organisms': OrganismsArt,
  'u-sep': PracticesArt,
  'u-rtc': ThemesArt,
}

export function StrandArt({ unitId, fit }) {
  const Art = STRAND_ART[unitId] ?? PracticesArt
  return <Art fit={fit} />
}

/* ============================================================
   THE SIX RESOURCE CATEGORIES
   ------------------------------------------------------------
   Deliberately simpler than the strand scenes. These sit six to
   a screen inside a TEKS, so if each one were as busy as the
   strand art the page would be exhausting. One clear object
   each, held in the category's own hue.
   ============================================================ */

/* INSTRUCTION — a lesson on a screen, with a play button. */
function InstructionArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-instr" from="#4338ca" to="#1e1b4b" />
      <rect width="400" height="200" fill="url(#sky-instr)" />
      <circle cx="90" cy="60" r="74" fill="#6366f1" opacity=".4" />
      <rect x="112" y="40" width="176" height="108" rx="10" fill="#e0e7ff" />
      <rect x="112" y="40" width="176" height="20" rx="10" fill="#c7d2fe" />
      <path d="M186 74l38 22-38 22z" fill="#4338ca" />
      <rect x="182" y="148" width="36" height="22" fill="#a5b4fc" />
      <rect x="150" y="168" width="100" height="9" rx="4" fill="#c7d2fe" />
      <circle cx="330" cy="120" r="17" fill={AMBER} />
      <path d="M330 138q-22 0-26 26h52q-4-26-26-26z" fill={AMBER} opacity=".85" />
    </Scene>
  )
}

/* ONLINE ACTIVITIES — a laptop with something being dragged. */
function OnlineArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-online" from="#0369a1" to="#0c1a33" />
      <rect width="400" height="200" fill="url(#sky-online)" />
      <circle cx="312" cy="54" r="72" fill="#0ea5e9" opacity=".4" />
      <rect x="96" y="42" width="208" height="122" rx="10" fill="#e0f2fe" />
      <rect x="110" y="56" width="180" height="94" rx="5" fill="#0c4a6e" />
      <rect x="74" y="164" width="252" height="14" rx="7" fill="#bae6fd" />
      <g>
        <rect x="126" y="76" width="52" height="40" rx="6" fill={AMBER} />
        <circle cx="222" cy="96" r="20" fill="#38bdf8" />
        <rect x="126" y="126" width="132" height="10" rx="5" fill="#0ea5e9" opacity=".7" />
      </g>
      <path d="M244 118l6 34 9-13 13 8z" fill="#ffffff" />
    </Scene>
  )
}

/* HANDS-ON ACTIVITIES — the practical kit: flask over a
   tripod, test tubes in a rack. */
function HandsOnArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-hands" from="#0f766e" to="#052e2b" />
      <rect width="400" height="200" fill="url(#sky-hands)" />
      <circle cx="300" cy="56" r="74" fill="#14b8a6" opacity=".35" />
      <rect x="0" y="170" width="400" height="30" fill="#032422" />

      {/* round-bottom flask on a tripod */}
      <g>
        <path d="M118 78h16v26a44 44 0 1 1-16 0z" fill="#ffffff" opacity=".2" />
        <path d="M92 138a34 34 0 0 0 68 0z" fill={AMBER} />
        <rect x="114" y="70" width="24" height="9" rx="4" fill="#ffffff" opacity=".4" />
        <g stroke="#ccfbf1" strokeWidth="4" strokeLinecap="round">
          <line x1="92" y1="160" x2="160" y2="160" />
          <line x1="98" y1="160" x2="88" y2="180" />
          <line x1="154" y1="160" x2="164" y2="180" />
        </g>
      </g>

      {/* test-tube rack */}
      <g transform="translate(238 88)">
        <rect x="-8" y="52" width="116" height="10" rx="4" fill="#ccfbf1" opacity=".8" />
        {[0, 34, 68].map((x, i) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <rect x="4" y="0" width="22" height="72" rx="11" fill="#ffffff" opacity=".22" />
            <rect
              x="4"
              y={34 + i * 8}
              width="22"
              height={38 - i * 8}
              rx="11"
              fill={i === 1 ? AMBER : '#5eead4'}
            />
          </g>
        ))}
      </g>
    </Scene>
  )
}

/* VOCABULARY & LITERACY — an open book with a word coming off
   the page. */
function VocabArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-vocab" from="#7e22ce" to="#2e1065" />
      <rect width="400" height="200" fill="url(#sky-vocab)" />
      <circle cx="308" cy="52" r="70" fill="#a855f7" opacity=".4" />

      <path d="M40 140V58q52-20 100 0v82q-48-18-100 0z" fill="#f5f3ff" />
      <path d="M240 140V58q-52-20-100 0v82q48-18 100 0z" fill="#ede9fe" />
      <rect x="136" y="52" width="8" height="92" rx="3" fill="#c4b5fd" />
      <g stroke="#a78bfa" strokeWidth="4" strokeLinecap="round">
        <line x1="60" y1="80" x2="120" y2="80" />
        <line x1="60" y1="96" x2="120" y2="96" />
        <line x1="60" y1="112" x2="100" y2="112" />
        <line x1="160" y1="80" x2="220" y2="80" />
        <line x1="160" y1="96" x2="220" y2="96" />
        <line x1="160" y1="112" x2="200" y2="112" />
      </g>

      {/* speech bubble */}
      <g transform="translate(262 92)">
        <rect x="0" y="0" width="94" height="58" rx="14" fill={AMBER} />
        <path d="M22 58l-4 22 26-22z" fill={AMBER} />
        <text
          x="47"
          y="39"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="#3b0764"
          fontFamily="Inter, sans-serif"
        >
          Aa
        </text>
      </g>
    </Scene>
  )
}

/* ASSESSMENTS — an answer sheet and a pencil. */
function AssessmentArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-assess" from="#9d174d" to="#3b0a24" />
      <rect width="400" height="200" fill="url(#sky-assess)" />
      <circle cx="86" cy="58" r="74" fill="#db2777" opacity=".38" />

      <rect x="96" y="26" width="150" height="152" rx="10" fill="#fdf2f8" />
      {[0, 1, 2, 3].map((r) => (
        <g key={r} transform={`translate(116 ${52 + r * 32})`}>
          <rect x="0" y="4" width="16" height="8" rx="4" fill="#fbcfe8" />
          {[0, 1, 2].map((c) => (
            <circle
              key={c}
              cx={34 + c * 26}
              cy="8"
              r="9"
              fill={c === r % 3 ? '#be185d' : 'none'}
              stroke="#f9a8d4"
              strokeWidth="3"
            />
          ))}
        </g>
      ))}

      {/* pencil */}
      <g transform="rotate(34 300 108)">
        <rect x="256" y="96" width="112" height="24" rx="3" fill={AMBER} />
        <path d="M256 96l-26 12 26 12z" fill="#fde68a" />
        <path d="M236 103l-6 5 6 5z" fill="#44403c" />
        <rect x="358" y="96" width="16" height="24" rx="3" fill="#f472b6" />
      </g>
    </Scene>
  )
}

/* TEACHER RESOURCES — the planning stack: folders and a guide
   with a bookmark. Nothing here is for students, and the
   picture says so. */
function TeacherArt({ fit }) {
  return (
    <Scene fit={fit}>
      <Sky id="sky-teach" from="#475569" to="#0f172a" />
      <rect width="400" height="200" fill="url(#sky-teach)" />
      <circle cx="312" cy="56" r="72" fill="#64748b" opacity=".35" />
      <rect x="0" y="176" width="400" height="24" fill="#0b1220" />

      {/* folders */}
      <g transform="translate(54 72)">
        <path d="M0 16a8 8 0 0 1 8-8h40l10 12h70a8 8 0 0 1 8 8v76H0z" fill="#94a3b8" />
        <path d="M8 40h136v64H8z" fill="#cbd5e1" />
      </g>
      <g transform="translate(96 96)">
        <path d="M0 14a8 8 0 0 1 8-8h38l10 12h68a8 8 0 0 1 8 8v58H0z" fill="#cbd5e1" />
        <path d="M6 36h134v48H6z" fill="#f1f5f9" />
      </g>

      {/* guide with bookmark */}
      <g transform="translate(250 66)">
        <rect x="0" y="0" width="96" height="112" rx="8" fill="#f8fafc" />
        <rect x="0" y="0" width="16" height="112" rx="8" fill="#94a3b8" />
        <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round">
          <line x1="32" y1="30" x2="80" y2="30" />
          <line x1="32" y1="48" x2="80" y2="48" />
          <line x1="32" y1="66" x2="64" y2="66" />
        </g>
        <path d="M66 0h20v46l-10-10-10 10z" fill={AMBER} />
      </g>
    </Scene>
  )
}

const CATEGORY_ART = {
  Instruction: InstructionArt,
  'Online Activities': OnlineArt,
  'Hands-on Activities': HandsOnArt,
  'Vocabulary & Literacy': VocabArt,
  Assessments: AssessmentArt,
  'Teacher Resources': TeacherArt,
}

export function CategoryArt({ name, fit }) {
  const Art = CATEGORY_ART[name] ?? TeacherArt
  return <Art fit={fit} />
}

/* ============================================================
   IF YOUR ORGANISATION WANTS PHOTOGRAPHS
   ------------------------------------------------------------
   Nothing above needs rewriting. Both <StrandArt> and
   <CategoryArt> render one absolutely-positioned element that
   fills its container, so swapping in a photograph is one line:

     export function StrandArt({ unitId }) {
       return (
         <img
           src={photos[unitId]}
           alt=""
           className="absolute inset-0 h-full w-full object-cover"
         />
       )
     }

   Two things to insist on when they do:

   1. KEEP THE SCRIM. It's the dark gradient the caller lays
      over this. Without it, white text on a pale photograph
      fails contrast — which is what's wrong with the live
      category screen right now.

   2. AGREE ON A CROP. These illustrations are drawn to survive
      being cut to a wide, short strip. A photograph with its
      subject dead centre will lose its head.
   ============================================================ */
