/* ============================================================
   APP SHELL
   ------------------------------------------------------------
   The frame every screen sits inside.

   WHY THE LABELS WENT BACK TO FAMILIAR WORDS
   ------------------------------------------
   The first version renamed everything to verbs — Teach,
   Insights. That was a mistake, and Dhinesh caught it: landing
   on the new app, you don't know where anything is.

   Here's the distinction that matters. There were two changes
   bundled together:

     1. STRUCTURAL — merging Workspace and My Groups, putting
        assignments inside the class they belong to.
     2. VOCABULARY — calling the library "Teach".

   Change 1 is where all the value is. Change 2 was change for
   its own sake, and it charged every teacher a relearning cost
   to buy nothing. A teacher who has used EduSmart for three
   years already knows the word "Library". Taking that word away
   makes her a beginner again on a product she had mastered.

   So the nav now reads almost exactly like the one she knows —
   and the structure underneath it is completely new. That's the
   best trade available: maximum structural gain, near-zero
   relearning.

   The rule generalises. Rename something only when the old name
   is actively wrong. Familiarity is an asset you spend, not
   clutter you clear away.
   ============================================================ */

import { NavLink, Link } from 'react-router-dom'
import {
  CalendarDays,
  BookOpen,
  Users,
  BarChart3,
  ClipboardList,
} from 'lucide-react'
import { teacher } from '../data/mock'
import { useApp } from '../store'
import { Avatar, cx } from './ui'
import PlaylistBar from './PlaylistBar'
import PrototypeControls from './PrototypeControls'

const NAV_MERGED = [
  { to: '/', label: 'Today', icon: CalendarDays, end: true },
  { to: '/teach', label: 'Library', icon: BookOpen },
  { to: '/classes', label: 'Classes', icon: Users },
  { to: '/insights', label: 'Reports', icon: BarChart3 },
]

const NAV_SPLIT = [
  { to: '/', label: 'Today', icon: CalendarDays, end: true },
  { to: '/teach', label: 'Library', icon: BookOpen },
  { to: '/classes', label: 'Classes', icon: Users },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/insights', label: 'Reports', icon: BarChart3 },
]

export default function AppShell({ children }) {
  const { ia } = useApp()
  const nav = ia === 'merged' ? NAV_MERGED : NAV_SPLIT

  return (
    <div className="min-h-dvh bg-page">
      <header className="glass sticky top-0 z-40 border-b border-ink-200">
        <div className="mx-auto flex h-14 max-w-page items-center gap-2 px-4 sm:px-6">
          <Link to="/" className="mr-2 flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-brand-600 text-[14px] font-bold text-white">
              e
            </span>
            <span className="hidden text-[16px] font-semibold tracking-tight text-ink-900 sm:block">
              EduSmart
            </span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-control px-2.5 py-1.5',
                    'text-[14px] font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* The grade selector used to live here.
              It moved to the Library, next to the search box.

              The reason is worth keeping: changing the grade
              changes which TEKS and resources you can see, and
              nothing else. Your classes are your classes
              whatever grade you're browsing; your reports are
              about your own students. So it governs exactly one
              screen — and a control that governs one screen but
              sits in the global header is lying about its own
              scope. It looks like it changes the whole app.

              Leaving a copy here as well would have been worse
              than the original mistake: two controls doing one
              job means a teacher has to work out whether
              they're the same control. */}

          <PrototypeControls />

          <button className="ml-1 flex shrink-0 items-center gap-2 rounded-control p-0.5 hover:bg-ink-100">
            <Avatar initials={teacher.initials} size="sm" tone="brand" />
          </button>
        </div>
      </header>

      {/* Every screen renders inside this one container. No
          screen sets its own width — that's what put Today out
          of line with the header in the first place. */}
      {/* ---- THE PAGE HAS TO BE TALLER THAN THE TRAY ----
          This was `pb-28` — 112px, a number I picked when the
          tray was a single strip. With the resource list open
          the tray is over 300px tall, so the last row of cards
          on any page sat underneath it with no way to scroll
          further: the Playlist button on the last resource was
          unreachable. Dhinesh found it the only way anyone
          finds this kind of thing, by running out of page.

          THE FIX IS PADDING, NOT SCROLLING. The instinct is to
          scroll the page up when the tray opens, and that
          treats the symptom: it moves content out from under
          the cursor, and the moment she scrolls back down the
          problem is there again. The real fault is that the
          document ENDS behind the tray — there is nowhere left
          to scroll to. Making the page taller by exactly the
          tray's height gives the existing scroll somewhere to
          go, in every direction and at every moment, with no
          behaviour to trigger.

          `--tray-h` is published by the tray itself and read
          here. A variable rather than a prop because the two
          are nowhere near each other in the tree, and because
          the height is not a number either of them can know in
          advance — it changes with every resource added. The
          tray measures itself; the page reacts.

          ---- AND THE 7REM WAS A LEFTOVER ----
          Once `--tray-h` existed, the fixed 112px on top of it
          was the old guess still sitting there, and it was
          being paid on every page whether the tray was open or
          not. On a screen that ended 40px short of the fold
          that padding was the entire reason a scrollbar
          appeared: a teacher scrolled, found nothing, and
          scrolled back. Dhinesh caught it as "an unnecessary
          scroll on each page", which is exactly what it was.

          2rem is the ordinary breathing room under the last
          thing on a page. The tray's own height still rides on
          top, so the reason the padding exists at all is
          untouched — it is just no longer charging rent when
          the tray is shut. */}
      <main
        className="mx-auto max-w-page px-4 pt-6 sm:px-6"
        style={{ paddingBottom: 'calc(2rem + var(--tray-h, 0px))' }}
      >
        {children}
      </main>

      <PlaylistBar />
    </div>
  )
}
