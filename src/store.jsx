/* ============================================================
   SHARED STATE
   ------------------------------------------------------------
   Two things every screen needs to know about:

   1. THE TRAY — resources the teacher has collected but not yet
      assigned. This is your Playlist idea, promoted from a grey
      "0 Playlist" pill in the corner to a permanent, visible
      part of the interface.

   2. THE IA VARIANT — which information architecture we're
      showing. You asked to compare two structures side by side,
      so the app can run as either without a rebuild.

   "Context" is React's way of making a value available to every
   screen without passing it down by hand through every layer.
   Think of it as a shared clipboard the whole app can read.
   ============================================================ */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  classes as seededClasses,
  deleteClass as removeClass,
  getResource,
  registerClass,
  addStudentsToClass as addStudents,
  assignments as seededAssignments,
  addClassesToAssignment as addClassesTo,
  removeClassFromAssignment as removeClassFrom,
  assignStudentsToAssignment as addStudentsTo,
  duplicateAssignment as copyAssignment,
  unassignAssignment as dropAssignment,
  removeStudentFromClass as dropStudent,
  updateStudent as patchStudent,
  renameClass as relabelClass,
  savedResourceIds,
  savedPlaylists,
  sharedTeachers,
  sharedPlaylists,
  sharedResources,
} from './data/mock'

const AppContext = createContext(null)

/* ---- HOW BIG A PLAYLIST CAN BE ----
   Five, which is a product rule Dhinesh set rather than
   something the interface invented, and it changes more than it
   looks like it does.

   A cap turns the playlist from a container into a selection.
   Without one it's a bag you tip things into; with one, every
   addition is a small choice about what deserves a slot — which
   is the same discipline the whole redesign has been applying
   to cards and controls, now applied to the teacher's own
   stack.

   It has to be visible BEFORE it bites. A limit a teacher only
   discovers when a button stops working is a limit that feels
   like a bug, so the bar counts "3 of 5" from the first
   resource and the Playlist button on a full stack says so
   rather than going quietly grey. */
export const PLAYLIST_MAX = 5

export function AppProvider({ children }) {
  /* ---- Brand colour ----
     Lets you compare palettes on the real product instead of on
     a swatch card. A colour that looks great as a square often
     doesn't survive contact with a dense roster screen. */
  const [palette, setPalette] = useState('indigo')

  useEffect(() => {
    document.documentElement.dataset.palette = palette
  }, [palette])

  /* ---- The playlist ----
     An array of resource ids, in the order the teacher added
     them. Order matters: it becomes the sequence students work
     through, which is what your "Enforce Ordering" toggle is
     for. */
  const [playlist, setPlaylist] = useState([])

  /* ---- THE TRAY NO LONGER HAS A COLLAPSED STATE ----
     There used to be a `playlistOpen` flag here, and a Show /
     Hide button in the bar that drove it. Both are gone on
     Dhinesh's call, and the deletion is the interesting part.

     The flag had grown a history: it started as local state in
     the bar, moved up here when "Edit playlist" needed to open
     the bar from outside, and picked up a save-and-restore ref
     when minimising had to remember it. Three mechanisms, all
     serving a state — bar visible, contents hidden — that a
     teacher has no reason to want. A playlist is a sequence;
     hiding the sequence leaves a control panel for something
     you can't see.

     When a piece of state costs more every time you touch it,
     the question is usually not how to hold it better but
     whether to hold it at all. The tray is now open or tucked
     away, and `playlistMinimized` alone says which. */

  /* ---- Which saved playlist is being edited, if any ----
     The bar has two lives. Most of the time it's an ad-hoc
     stack a teacher is assembling as she browses, and it has no
     name because it isn't a thing yet. But once she presses
     Edit playlist on a saved card, the bar IS that playlist —
     it has a name, it already exists on the shelf, and saving
     it again would produce a second copy of the same lesson.

     One id is all it takes to tell those two states apart, and
     everything else in the bar follows from it: what the title
     says, and what the save button does. */
  const [editingId, setEditingId] = useState(null)

  /* ---- The tray can be put away without being emptied ----
     Three different "make this go away" actions, and they are
     genuinely three different wishes:

       COLLAPSE  hide the list of resources, keep the strip.
                 "I don't need to see the order right now."
       MINIMISE  slide the whole tray off the bottom, leaving a
                 handle. "It's in my way and I'm reading the
                 page under it."
       CLEAR     throw the playlist out. "I've changed my mind
                 about all of this."

     Minimise is the one that was missing, and its absence
     pushed people toward Clear — which destroys twenty minutes
     of sequencing to solve a problem about screen space.

     THE NAME CHANGED FROM "dismissed" TO "minimised", and that
     is not tidying. Dismissed described a thing that was gone;
     minimised describes a thing that is still on screen, just
     small. The interface now does the second, so the variable
     that drives it should say the second — a name that
     describes the old behaviour is how the next person reading
     this file builds the wrong thing. */
  const [playlistMinimized, setPlaylistMinimized] = useState(false)

  /* ---- SAVED FOR LATER ----
     Dhinesh asked the obvious question I had left unanswered:
     the Saved tab existed, but nothing in the product could put
     anything into it. A shelf with no way to reach it.

     Two different things live here and they are collected in two
     different places, because they cost the teacher two very
     different amounts of work:

       savedIds     loose resources. One press on the card, from
                    anywhere the card appears. "I might use this."
       savedLists   playlists. Saved from the playlist bar, after
                    she has sequenced them. "I have already worked
                    out how to teach this."

     Both start populated from the mock data so the tab isn't
     empty on first load, and both are real state now, so
     anything saved during a demo shows up in Library › Saved. */
  const [savedIds, setSavedIds] = useState(savedResourceIds)
  const [savedLists, setSavedLists] = useState(savedPlaylists)

  /* ---- SHARED WITH YOU ----
     What colleagues have sent her. Read-only by design: she
     never edits another teacher's lesson, she takes a copy and
     edits that.

     THAT RULE IS NOT POLITENESS, it is a direct consequence of
     the auto-save decision. Edits to an open lesson now write
     through the instant she makes them, so "editing" a shared
     playlist in place would silently change what the colleague
     who sent it still sees. The moment saving became implicit,
     the boundary around someone else's work had to become
     explicit.

     So the only state that changes here is which shares she
     has already copied — enough to stop the card offering
     again, and to tell her she has it. The shares themselves
     are constants. */
  /* ============================================================
     CLASSES THE TEACHER MAKES HERSELF

     The five seeded classes are her timetabled sections — in a
     real district those arrive from the student information
     system and she would never type them in. What she DOES
     create is the other kind: a small group pulled together for
     a reason, for re-teaching or for stretching, drawn from the
     students she already has.

     This holds the list so React redraws when one is added.
     `registerClass` does the actual writing, into the same array
     every lookup in mock.js reads — see the note there. Copying
     the array is what makes the change visible: mutating the one
     we are already holding would leave the reference identical
     and React would decide nothing had happened.

     `justCreated` is here rather than inside the Classes screen
     because the dialog that creates a class and the card that
     confirms it are in different components, and this is the
     only thing they both touch.
     ============================================================ */
  const [classList, setClassList] = useState(seededClasses)
  /* ---- ASSIGNMENTS NEED WHAT CLASSES NEEDED ----
     They were read-only scenery until a teacher could add a
     class to one or catch a child up. Both mutate an object in
     place, and React cannot see a mutation — only a new
     reference. So the array is copied into state the same way,
     and every writer below ends by replacing it. The mock
     module still does the writing. */
  const [assignmentList, setAssignmentList] = useState(seededAssignments)
  const [justCreated, setJustCreated] = useState(null)

  const [copiedShares, setCopiedShares] = useState([])

  /* ---- NO TOAST CHANNEL, AND THAT IS THE POINT ----
     There was one here: a `toast` slot and a `notify()` to
     fill it, built so the playlist bar could report a save
     after it had already disappeared. Dhinesh replaced the
     whole idea with a better one — the bar now holds its own
     "Saved" state for two seconds and then slides away, so the
     confirmation happens on the control that was pressed and
     the departure is part of the message rather than the thing
     that needed explaining.

     Which left this state with nothing to hold, and a global
     message channel nobody was using is worse than none: the
     next person to want a confirmation reaches for it instead
     of asking whether the control could say so itself. Deleted
     on that basis, along with the Toast component. */

  /* ---- Which IA we're showing ----
     'merged'   — Classes holds everything. Assignments live
                  inside the class they belong to.
     'split'    — Classes plus a separate top-level Assignments
                  section, for teachers who think assignment-
                  first rather than class-first.             */
  const [ia, setIa] = useState('merged')

  /* ---- How much visual richness the cards carry ----
     'quiet'  — white cards, one thin accent. What we have now.
     'colour' — every strand and category owns a hue.
     'image'  — full-bleed artwork with the name over it, which
                is what the live product does today.

     This exists because you and your organisation disagreed
     about whether the redesign lost something when the
     photographs came out. It's a faster disagreement to settle
     by switching between them in front of people than by
     describing them. */
  const [richness, setRichness] = useState('image')

  /* ---- Which language the library is in ----
     The live product has this as a LANGUAGE dropdown next to
     the grade, and it was missing here. Worth being careful
     about, because it looks like a duplicate of the EN/ES
     toggle on every resource card and it isn't:

       THIS      the language you are working in. Set once.
                 A teacher with a bilingual section sets it to
                 Spanish in September and never touches it.
       THE CARD  an override for one resource, for the two
                 students who need it.

     The relationship only holds if this actually drives the
     cards — a page-level control that the cards ignore is the
     worst of both worlds, and would be exactly the "two
     controls doing one job" problem I flagged when the grade
     selector was in the header. So it's in the store, and each
     tile starts from it. */
  const [language, setLanguage] = useState('EN')

  /* ---- How the Library's top level is browsed ----
     'chips'  a row of named chips. Everything one click away,
              nothing taking vertical space.
     'cards'  the four content strands as illustrated cards,
              with the sub-categories appearing underneath the
              one you pick and Challenges / Others below that.

     Two real answers to the same question, and they trade
     against each other: the chips get her to material in the
     fewest pixels, the cards make the shape of the year
     obvious to someone opening this for the first time. Worth
     deciding in front of people rather than in the abstract.

     Cards is the default, which is Dhinesh's call after seeing
     both built. The chips remain the leaner answer and the one
     I'd still expect a sixth-year teacher to prefer — but a
     default is what everyone who never opens the settings
     lives with, and for a first encounter with the redesign,
     including the demo to the organisation, the version that
     shows the shape of the year wins. */
  const [browse, setBrowse] = useState('cards')
  /* Which shape the per-class breakdown takes inside an
     assignment on Library › Assigned. Three genuinely different
     readings of the same data rather than three skins — see the
     note on each one in Teach.jsx. */
  const [assignedView, setAssignedView] = useState('cards')

  /* ---- The page surface ----
     'soft'  — the warm stone the design has used throughout.
     'white' — pure white behind everything.
     A one-line change in CSS, but not a cosmetic one: on white,
     cards no longer differ in value from the page, so every
     boundary has to become a drawn line. Worth looking at
     rather than arguing about. */
  const [surface, setSurface] = useState('white')

  /* ---- The colour of the shadows ----
     'neutral' — warm stone, the ink ramp's own colour.
     'brand'   — the same geometry in indigo.
     Dhinesh asked to compare rather than be told, so both ship
     and the switch decides. */
  const [shadow, setShadow] = useState('neutral')



  useEffect(() => {
    document.documentElement.dataset.surface = surface
  }, [surface])

  useEffect(() => {
    document.documentElement.dataset.shadow = shadow
  }, [shadow])

  /* ---- EDITS TO AN OPEN LESSON SAVE THEMSELVES ----
     Dhinesh's call, and it removes a whole layer rather than
     adding one. There was an Update button, a `dirty`
     comparison behind it, a "Saved" state it fell back to, and
     a decision to make on the way out. All of that existed to
     answer one question — has she pressed the button yet — and
     the question only existed because of the button.

     Now the tray IS the saved lesson while it is open: add,
     remove or reorder and the shelf copy already says so. The
     cost is honest and worth writing down: REMOVING A ROW WHILE
     EDITING IS IMMEDIATE AND HAS NO UNDO. The protection is
     that there is only one destructive control (the X on a
     row), it names the lesson it is removing from, and
     everything else she can do here is reversible by doing it
     again.

     ONE EFFECT RATHER THAN FOUR CALLS. Add, remove, drag and
     the arrow keys are four different paths to the same fact —
     the order changed — so the write-through hangs off the
     order itself, not off each of the four. A path added later
     is covered without anyone remembering to wire it up, which
     is the kind of bug that only shows up months later.

     The same-contents guard is what stops it looping: loading a
     lesson sets `playlist` and `editingId` together, and
     without the guard that first render would write the lesson
     back over itself and stamp it "Updated just now" for a
     change nobody made. */
  useEffect(() => {
    if (!editingId) return
    setSavedLists((current) =>
      current.map((p) => {
        if (p.id !== editingId) return p
        const same =
          p.resourceIds.length === playlist.length &&
          p.resourceIds.every((id, i) => id === playlist[i])
        return same ? p : { ...p, resourceIds: playlist, updated: 'Updated just now' }
      })
    )
  }, [playlist, editingId])

  const value = useMemo(
    () => ({
      playlist,
      ia,
      setIa,
      palette,
      setPalette,
      richness,
      setRichness,
      language,
      setLanguage,
      surface,
      setSurface,
      shadow,
      setShadow,
      browse,
      setBrowse,
      assignedView,
      setAssignedView,

      classList,
      assignmentList,
      justCreated,

      /* Returns the new class so the caller can act on it
         without re-finding it. The highlight clears itself
         after a few seconds: it is a "this one, here" for the
         moment the dialog closes, not a status the card should
         wear for the rest of the session. */
      createClass: (name, studentIds) => {
        const cls = registerClass({ name, studentIds })
        setClassList([...seededClasses])
        setJustCreated(cls.id)
        setTimeout(() => setJustCreated((id) => (id === cls.id ? null : id)), 4000)
        return cls
      },

      /* Both of these follow the same shape as createClass: the
         mock module does the writing, and copying the array
         here is what tells React the world moved. `[...]` on a
         rename looks redundant — the array is the same length
         and holds the same objects — but the object it holds
         was mutated in place, so without a fresh reference the
         new name would sit in memory and never reach a card. */
      renameClass: (id, name) => {
        relabelClass(id, name)
        setClassList([...seededClasses])
      },

      /* Same shape as the class writes: mock.js does the
         writing, and a fresh array reference is what tells
         React the world moved. A student edit changes an object
         inside `classList`, not the list itself, so without the
         copy the new name sits in memory and never reaches a
         row. */
      updateStudent: (id, patch) => {
        const ok = patchStudent(id, patch)
        if (ok) setClassList([...seededClasses])
        return ok
      },

      addStudentsToClass: (classId, studentIds) => {
        const n = addStudents(classId, studentIds)
        if (n) setClassList([...seededClasses])
        return n
      },

      removeStudentFromClass: (classId, studentId) => {
        const gone = dropStudent(classId, studentId)
        if (gone) setClassList([...seededClasses])
        return gone
      },

      /* Both refresh BOTH lists. Adding a class to an
         assignment changes nothing about the class itself, but
         `classStamp` moved inside the mock, and a screen showing
         both halves is entitled to a consistent pair. */
      addClassesToAssignment: (assignmentId, classIds, dates) => {
        addClassesTo(assignmentId, classIds, dates)
        setAssignmentList([...seededAssignments])
        setClassList([...seededClasses])
      },

      assignStudentsToAssignment: (assignmentId, studentIds, dates) => {
        addStudentsTo(assignmentId, studentIds, dates)
        setAssignmentList([...seededAssignments])
        setClassList([...seededClasses])
      },

      duplicateAssignment: (id) => {
        const copy = copyAssignment(id)
        setAssignmentList([...seededAssignments])
        return copy
      },

      /* ---- UNASSIGNING FROM ONE CLASS, NOT FROM EVERYWHERE ----
         The class page needs a different verb from the Library's.
         There, "Unassign" means take this back from everyone;
         here it can only honestly mean take it back from THIS
         room, because that is the only room the screen is about.

         Dropping the last class would leave an assignment
         assigned to nobody — a row in the Assigned tab with no
         students and no dates, which is not a state the product
         has a name for. So the last one out takes the assignment
         with it. */
      removeClassFromAssignment: (assignmentId, classId) => {
        const a = seededAssignments.find((x) => x.id === assignmentId)
        const last = !a || a.classIds.length <= 1
        if (last) dropAssignment(assignmentId)
        else removeClassFrom(assignmentId, classId)
        setAssignmentList([...seededAssignments])
        setClassList([...seededClasses])
        return last
      },

      unassignAssignment: (id) => {
        const gone = dropAssignment(id)
        if (gone) setAssignmentList([...seededAssignments])
        return gone
      },

      deleteClass: (id) => {
        const gone = removeClass(id)
        if (gone) setClassList([...seededClasses])
        return gone
      },

      playlistMinimized,
      setPlaylistMinimized,
      playlistMax: PLAYLIST_MAX,
      playlistFull: playlist.length >= PLAYLIST_MAX,

      /* Adding something always brings the tray back. A closed
         tray is "not now", not "never" — and the moment she
         picks up another resource, now has arrived. */
      addToPlaylist: (id) => {
        setPlaylistMinimized(false)
        setPlaylist((current) =>
          current.includes(id) || current.length >= PLAYLIST_MAX
            ? current
            : [...current, id]
        )
      },

      removeFromPlaylist: (id) => setPlaylist((current) => current.filter((x) => x !== id)),

      /* Removing always works. Adding stops at the cap — quietly
         here, because the button that calls this is already
         disabled and labelled by the time it would matter. */
      toggleInPlaylist: (id) => {
        setPlaylistMinimized(false)
        setPlaylist((current) =>
          current.includes(id)
            ? current.filter((x) => x !== id)
            : current.length >= PLAYLIST_MAX
              ? current
              : [...current, id]
        )
      },

      clearPlaylist: () => {
        setPlaylist([])
        setEditingId(null)
        setPlaylistMinimized(false)
      },

      /* Done. Mechanically identical to clearing, and named
         separately anyway, because the two call sites mean
         opposite things: Clear throws away an ad-hoc stack
         nobody has saved, Done closes a lesson that is already
         safe on the shelf. Reusing one verb for both would make
         the next person reading the bar think Done deletes
         something. */
      finishEditing: () => {
        setPlaylist([])
        setEditingId(null)
        setPlaylistMinimized(false)
      },

      /* ---- Load a saved playlist for editing ----
         REPLACES rather than appends, and the verb is why. "Edit
         playlist" means "this one is now what I'm working on";
         appending would merge it into whatever was already in
         the bar and quietly hit the five-resource cap partway
         through, leaving her with a mixture of two lessons and
         no way to tell which items came from where. */
      loadPlaylist: (ids, id = null) => {
        setPlaylistMinimized(false)
        setPlaylist(ids.slice(0, PLAYLIST_MAX))
        setEditingId(id)
      },

      editingId,
      editingPlaylist: savedLists.find((p) => p.id === editingId) ?? null,

      /* Move an item to an arbitrary position. This is what
         drag-and-drop needs: dragging isn't a series of one-step
         swaps, it's "this thing now lives there". */
      reorderPlaylist: (from, to) =>
        setPlaylist((current) => {
          if (from === to || from < 0 || to < 0) return current
          if (from >= current.length || to >= current.length) return current
          const next = [...current]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          return next
        }),

      /* Move an item up or down in the sequence. */
      moveInPlaylist: (id, direction) =>
        setPlaylist((current) => {
          const i = current.indexOf(id)
          const j = i + direction
          if (i < 0 || j < 0 || j >= current.length) return current
          const next = [...current]
          ;[next[i], next[j]] = [next[j], next[i]]
          return next
        }),

      isInPlaylist: (id) => playlist.includes(id),

      /* ---- Saved resources ---- */
      savedIds,
      isSaved: (id) => savedIds.includes(id),
      toggleSaved: (id) =>
        setSavedIds((current) =>
          current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]
        ),

      /* Assigning resolves "later". Anything that goes out to a
         class comes off the shelf — see the note in AssignSheet
         for why this has to happen automatically. */
      removeSaved: (ids) =>
        setSavedIds((current) => current.filter((x) => !ids.includes(x))),

      /* ---- Saved playlists ----
         New ones go to the FRONT of the list. The thing she just
         saved is the thing she is most likely to want back, and
         if it lands at the bottom of a growing list she has to
         hunt for something she created ten seconds ago. */
      /* ---- Shared, and what she has taken from it ---- */
      sharedTeachers,
      sharedPlaylists,
      sharedResources,
      /* Same rule as the Recent and Saved badges: count what
         the tab will actually draw. A share whose resource has
         gone stale is dropped by the view, so counting it here
         would put the badge back out of step with the page —
         the exact bug Dhinesh caught on the other two. */
      sharedCount:
        sharedPlaylists.length +
        sharedResources.filter((s) => getResource(s.resourceId)).length,
      isCopied: (id) => copiedShares.includes(id),

      /* Copying a shared lesson makes an ordinary saved
         playlist of her own — same shape, new id, and a note
         that records where it came from so that a year later
         the card still says "from Marcus Webb" rather than
         leaving her to wonder why she has a lesson she doesn't
         remember building. */
      copySharedPlaylist: (shared, fromName) => {
        setCopiedShares((current) =>
          current.includes(shared.id) ? current : [...current, shared.id]
        )
        setSavedLists((current) => [
          {
            id: `pl-${Date.now()}`,
            name: shared.name,
            note: shared.note,
            /* A field of its own rather than a sentence glued
               onto the note. The note is the colleague's prose
               about the lesson; this is a fact about where the
               card came from, and the card needs to be able to
               place the two differently — which it could not
               do if they arrived as one string. */
            sharedFrom: fromName,
            updated: 'Saved just now',
            resourceIds: shared.resourceIds,
          },
          ...current,
        ])
      },

      savedLists,
      savePlaylist: ({ name, note, resourceIds }) =>
        setSavedLists((current) => [
          {
            id: `pl-${Date.now()}`,
            name,
            note,
            updated: 'Saved just now',
            resourceIds,
          },
          ...current,
        ]),
      removeSavedPlaylist: (id) =>
        setSavedLists((current) => current.filter((p) => p.id !== id)),
    }),
    /* ---- EVERY PIECE OF STATE IN HERE HAS TO BE IN HERE ----
       `shadow` was missing from this list and the symptom was
       exactly what you would expect if you knew to look for it,
       and baffling if you did not: clicking Brand set the state,
       the effect ran, the <html> attribute changed — and the
       panel still showed Neutral selected, because the context
       object it was reading had not been rebuilt.

       Dhinesh reported it as "the second option is not
       selectable". It was selectable; the screen was reading a
       stale copy of the answer. A memo that forgets one
       dependency does not fail loudly, it just serves yesterday. */
    [playlist, playlistMinimized, editingId, ia, palette, richness, language, surface, shadow, browse, assignedView, savedIds, savedLists, copiedShares, classList, assignmentList, justCreated]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/* Every screen calls this to reach the shared state.
   `const { playlist, addToPlaylist } = useApp()` and you're connected. */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
