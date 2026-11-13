/* ============================================================
   THE PRINTABLE DETAIL SHEET
   ------------------------------------------------------------
   One component for one student and for twenty-four, because
   they are the same sheet — the bulk case is the single case
   repeated, and building it twice is how the two drift until
   one of them is printing a field the other dropped.

   IT SHOWS WHAT WILL PRINT BEFORE IT PRINTS IT. A teacher
   sending twenty-four of these to a shared staffroom printer
   wants to know what lands on the paper, and these carry
   children's sign-in details, so "what exactly is on this" is a
   fair question to answer before it is face-up on a desk rather
   than after.

   NO PASSWORDS. Not on one sheet and not on twenty-four. A
   printout is the least controlled surface this product
   touches — it gets left on desks, carried home in bags, and
   photographed. The username and the sign-in address are enough
   to get a child started; the password is issued separately,
   once, on screen, by someone who chose to issue it.
   ============================================================ */

import { Printer } from 'lucide-react'
import { gradeLabel } from '../data/mock'
import { Button, Sheet } from '../components/ui'

export default function StudentPrintSheet({ open, students, cls, onClose }) {
  const many = students.length > 1

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={many ? `Print details for ${students.length} students` : 'Print details'}
      width={many ? 'lg' : 'sm'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-ink-500">
            No passwords are printed
            {many && ` · ${students.length} slips, one per student`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      }
    >
      {/* Two to a row once there is more than one, because that
          is how they come off the page — a teacher cuts these
          into slips, and a preview that does not look like the
          sheet is a preview of the wrong thing. */}
      <div className={many ? 'grid gap-3 sm:grid-cols-2' : ''}>
        {students.map((s) => (
          <div key={s.id} className="rounded-control border border-ink-200 p-4">
            <p className="text-base font-semibold text-ink-900">{s.name}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              {[
                ['Student ID', s.studentId],
                ['Grade', gradeLabel(s.gradeLevel)],
                ['Class', cls.name],
                ['Sign in at', 'edusmart.com/student'],
                ['Username', s.studentId],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="tnum text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
