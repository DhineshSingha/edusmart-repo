/* ============================================================
   NEW CLASS
   ------------------------------------------------------------
   WHAT THIS IS ACTUALLY FOR

   The five classes already on the screen are timetabled
   sections — 1st Period, 2nd Period. In a district running this
   at 500,000 students those come from the student information
   system, and a teacher neither creates nor deletes them. If
   this dialog were for making one of those, it would be the
   wrong dialog: it would let her invent a section that the
   district's records don't have, and the moment the roster
   synced, her class and the truth would disagree.

   What a teacher genuinely makes herself is the other kind: a
   small group pulled together for a reason. Six who need
   Mixtures again. Four who are ready to run ahead. A combined
   group for the week the timetable collapses. Every one of
   those is built by picking from students she already teaches —
   which is why this dialog has no "add a student by name" field
   anywhere in it. She cannot invent a child; she can only
   gather the ones she has.

   That single decision is what makes the whole thing small: a
   name, and a selection. No import step, no roster upload, no
   empty state to explain.

   ------------------------------------------------------------
   WHY THE LIST IS GROUPED BY THE CLASS THEY'RE ALREADY IN

   A hundred and ten names in one alphabetical column is a
   search problem wearing a list's clothing. But a teacher does
   not hold her students as one cohort — she holds them as
   periods, because that is how she sees them. "Jayden in 4th"
   is how she would say it, so that is how they are stacked
   here, with the period's own name on the divider.

   It also makes the common case a single click: a group that is
   "all of 1st Period plus four from 3rd" is one select-all and
   four taps, rather than twenty-four.

   ------------------------------------------------------------
   THE TWO FILTERS, AND WHY THERE ARE ONLY TWO

   "Needs help" exists because it is the most likely reason this
   dialog is open at all. Every class card on the screen behind
   it is carrying a red band counting students who are
   struggling; the natural next move is to gather them and
   re-teach. Making her remember which names those were, and
   find them one at a time down a list of a hundred and ten,
   would be the product knowing something and refusing to say
   it. It draws the line with the same rule the cards use —
   `needsHelp` in mock.js — so the eight the card counted are
   exactly the eight this filter offers.

   "Selected" exists to answer the question every long picker
   eventually gets asked: who have I actually got? Once she has
   scrolled to 4th Period, her three from 1st are off-screen and
   a footer count of "8 selected" names none of them. One tap
   shows the whole selection and nothing else — which is the
   honest version of a summary, rather than a strip of three
   avatars and a "+5".

   There is deliberately no filter by score band, no sort, no
   "smart group" suggestion. Each would be another decision
   taken before the first one is finished.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store'
import { Button, Sheet } from '../components/ui'
import StudentPicker from './StudentPicker'

export default function NewClassDialog({ open, onClose, onCreated, seedStudentIds }) {
  const { createClass } = useApp()

  const [name, setName] = useState('')
  const [picked, setPicked] = useState([])
  const nameRef = useRef(null)

  /* ---- ALL THAT IS LEFT TO RESET IS THE ANSWER ----
     The query, the lens and which group is showing went with
     the picker, which resets them itself. What stays here is
     what this dialog owns: the name and the selection. Opening
     a dialog that still holds the last attempt's answers is one
     of those faults nobody reports and everybody works around.
     Reset on open, not on close, so the reset can never be seen
     happening mid-fade. */
  useEffect(() => {
    if (!open) return
    setName('')
    /* ---- ARRIVING WITH THE CHILDREN ALREADY CHOSEN ----
       Reports can open this dialog from a group a teacher has
       just ticked in a list — the six who are below Meets on
       the same TEKS. Those are the children; making her find
       them again in the picker would be asking her to redo the
       work she did to get here. She can still untick any of
       them, because arriving with a selection is a starting
       point, not a receipt. */
    setPicked(seedStudentIds?.length ? [...seedStudentIds] : [])
    /* The cursor goes where the first decision is. Nothing else
       on this screen can be done before the class has a name. */
    const t = setTimeout(() => nameRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open, seedStudentIds])

  const ready = name.trim().length > 0 && picked.length > 0

  function submit() {
    if (!ready) return
    const cls = createClass(name, picked)
    onCreated?.(cls)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New class"
      subtitle="Give it a name and choose who's in it, from anywhere on the district roster."
      /* ---- XL (768px), NOT LG (672px) ----
         The extra 96px all goes to the left column, which was
         cramped the moment renaming arrived: "1st Period" fits
         anywhere, but a teacher who relabels a section "Science
         — Block B" or names her own group "Mixtures re-teach,
         2nd + 4th" needs somewhere to read it. The group names
         are the navigation here, and navigation you have to
         guess at is not navigation.

         Still narrower than Assign, which is 896px — that one
         carries a resource list, a class picker, two date
         fields and a note. Width is spent where the density
         is, not handed out evenly. */
      width="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* ---- THE COUNT IS THE STATUS ----
              It says what will be created, in the words of the
              thing being created, and it is the same sentence
              whether she has one student or forty. A disabled
              button with no explanation is a dead end; this
              tells her which of the two requirements is still
              outstanding. */}
          <p className="text-[12px] text-ink-500">
            {picked.length === 0
              ? 'No students chosen yet'
              : `${picked.length} ${picked.length === 1 ? 'student' : 'students'} chosen`}
            {picked.length > 0 && !name.trim() && ' · needs a name'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={!ready}>
              Create class
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ---- Name ---- */}
        <div>
          <label
            htmlFor="new-class-name"
            className="block text-[12px] font-semibold uppercase tracking-wide text-ink-500"
          >
            Class name
          </label>
          <input
            id="new-class-name"
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            /* A placeholder that shows the KIND of thing this is
               for. "e.g. 3rd Period" would have taught her the
               wrong lesson — her periods are already here. */
            placeholder="e.g. Mixtures re-teach"
            maxLength={60}
            className="mt-1.5 w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        {/* ---- Who's in it ----
            The picker is a component now rather than three
            hundred lines of this file. New class and Add
            students ask the same question and only differ in
            what they do with the answer, so the question is
            asked in one place. The selection stays here,
            because this dialog needs it for its own footer —
            "8 students chosen · needs a name" is a sentence
            only the caller can write. */}
        <StudentPicker picked={picked} setPicked={setPicked} />
      </div>
    </Sheet>
  )
}