/* ============================================================
   ASSIGNMENTS  —  OPTION B ONLY
   ------------------------------------------------------------
   This screen only exists when the A/B switch is set to B.

   THE CASE FOR IT
   Some teachers think assignment-first: "I set that quiz last
   Tuesday — how did everyone do?" In Option A, answering that
   means picking a class first, which is the wrong entry point
   if the assignment went to four classes at once.

   THE CASE AGAINST IT
   It's a fifth top-level destination, and it overlaps heavily
   with Classes. Every piece of information here also appears
   inside a class. More doors into the same room means more
   places to look and more chances to look in the wrong one.

   HOW TO JUDGE IT
   Don't compare the screenshots — use them. Pick a real
   question you'd ask on a Tuesday morning, then answer it in
   Option A and again in Option B. Count the clicks, but more
   importantly notice where you hesitated. Hesitation is the
   thing IA is supposed to remove.

   My read: Option A is better for daily use, Option B is better
   the week after a big test. If your teachers skew toward
   single-subject specialists with five sections of the same
   course, A wins. If they reuse one assignment across very
   different groups, B earns its place.
   ============================================================ */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import {
  assignments,
  assignmentStats,
  getStandard,
  getClass,
  getResource,
} from '../data/mock'
import {
  Card,
  Badge,
  Button,
  buttonClass,
  ProgressBar,
  Segmented,
  Score,
  EmptyState,
  cx,
} from '../components/ui'

export default function Assignments() {
  const [filter, setFilter] = useState('active')

  const counts = {
    active: assignments.filter((a) => a.status === 'active').length,
    scheduled: assignments.filter((a) => a.status === 'scheduled').length,
    closed: assignments.filter((a) => a.status === 'closed').length,
  }

  const shown = assignments
    .filter((a) => a.status === filter)
    .sort((a, b) => a.due.localeCompare(b.due))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Assignments</h1>
          <p className="mt-1 text-sm text-ink-500">
            Everything you've set, across every class.
          </p>
        </div>
        <Link to="/teach" className={cx(buttonClass({ variant: 'primary' }), 'gap-2')}>
          <Plus className="h-4 w-4" />
          New assignment
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'active', label: 'Live', count: counts.active },
            { value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
            { value: 'closed', label: 'Closed', count: counts.closed },
          ]}
        />
        <Button variant="ghost" size="sm" icon={Filter}>
          Filter
        </Button>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={`Nothing ${filter}`}
          description="Find material in Teach and send it to a class."
        />
      ) : (
        <div className="space-y-3">
          {shown.map((a) => {
            const stats = assignmentStats(a.id)
            const std = getStandard(a.standardId)
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-ink-900">{a.title}</h2>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      {std?.id} {std?.title} · {a.resourceIds.length} resources
                    </p>

                    {/* Which classes, and how each is doing.
                        The live Workspace hides this behind an
                        "Assigned to 5 Groups • 35 Students"
                        expander, so the state of the assignment
                        is one click away from every row. Here
                        it's just visible. */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.classIds.map((cid) => {
                        const c = getClass(cid)
                        return c ? (
                          <Link
                            key={cid}
                            to={`/classes/${cid}`}
                            className="rounded-control border border-ink-200 px-2.5 py-1 text-[12px] text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                          >
                            {c.name}
                            <span className="ml-1.5 text-ink-400">
                              {c.studentIds.length}
                            </span>
                          </Link>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-6">
                    <div className="text-right">
                      <Score value={stats.avg || null} size="lg" />
                      <p className="text-[12px] text-ink-400">average</p>
                    </div>
                    {stats.needAttention > 0 && (
                      <div className="text-right">
                        <span className="tnum text-lg font-semibold text-alert-700">
                          {stats.needAttention}
                        </span>
                        {/* One word for one idea. This said
                            "struggling"; the rest of the product
                            says "need attention", and the number
                            above it comes from the same rule. */}
                        <p className="text-[12px] text-ink-400">need attention</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-3.5">
                  <ProgressBar
                    value={stats.completed}
                    total={stats.total}
                    tone={stats.completed === stats.total ? 'good' : 'brand'}
                  />
                  <span className="tnum shrink-0 text-[12px] text-ink-500">
                    {stats.completed}/{stats.total} finished
                  </span>
                  <Badge tone="neutral">
                    due{' '}
                    {new Date(a.due).toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
