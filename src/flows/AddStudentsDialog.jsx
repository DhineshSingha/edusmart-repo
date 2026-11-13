/* ============================================================
   ADD STUDENTS TO A CLASS
   ------------------------------------------------------------
   The same picker New class uses, asked on behalf of a class
   that already exists. Everything that took rounds of
   correction there — the four lenses, the two panes, the
   all-grades default, the fallback when a search empties the
   selected group — arrives here for free, because it is the
   same component and not a copy of one.

   ------------------------------------------------------------
   WHY ADDING IS ALLOWED ON A DISTRICT SECTION WHEN REMOVING IS NOT

   This looks inconsistent and isn't. Removing a child from 1st
   Period contradicts the district's record: it hides a student
   she is still responsible for, and the next sync puts him
   back. Adding one supplements it. The case it exists for is
   the ordinary September one — a child starts on Monday and the
   district record lands on Thursday, and she is not going to
   teach him for three days without a roster entry.

   The data already said so before this dialog did: two of the
   children in 1st Period are accounts a teacher made herself.
   They had to have come from somewhere, and this is it.

   One supplements the roster, the other argues with it. That is
   the whole rule, and it is why Remove stays dimmed on the same
   classes where Add is live.

   ------------------------------------------------------------
   THE CHILDREN ALREADY IN THE CLASS ARE SHOWN, NOT HIDDEN

   Greyed, with "Already in" on the row. Hiding them would have
   been less code and worse: a teacher who searches a name she
   knows is in this class and gets nothing concludes the search
   is broken, not that she was right. The picker answers the
   question she asked — is he here? — rather than silently
   declining to.
   ============================================================ */

import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useApp } from '../store'
import { Button, Sheet } from '../components/ui'
import StudentPicker from './StudentPicker'

export default function AddStudentsDialog({ open, cls, onClose }) {
  const { addStudentsToClass } = useApp()
  const [picked, setPicked] = useState([])

  useEffect(() => {
    if (open) setPicked([])
  }, [open])

  const already = new Set(cls?.studentIds ?? [])
  const n = picked.length

  if (!cls) return null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Add students to ${cls.name}`}
      subtitle="Choose anyone on the district roster. They stay in their other classes too."
      width="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* The count says what will happen in the words of the
              thing that will happen, and it is the same sentence
              at one student as at forty. */}
          <p className="text-[12px] text-ink-500">
            {n === 0
              ? 'No students chosen yet'
              : `${n} ${n === 1 ? 'student' : 'students'} chosen`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              disabled={n === 0}
              onClick={() => {
                addStudentsToClass(cls.id, picked)
                onClose()
              }}
            >
              {/* The number is on the button because the button
                  is the last thing she reads before committing,
                  and because "Add" alone after a long scroll
                  does not say how long the scroll was. */}
              Add {n > 0 ? n : ''}
            </Button>
          </div>
        </div>
      }
    >
      <StudentPicker
        picked={picked}
        setPicked={setPicked}
        disabledIds={already}
        disabledNote="Already in"
      />
    </Sheet>
  )
}
