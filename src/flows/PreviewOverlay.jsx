/* ============================================================
   PREVIEW
   ------------------------------------------------------------
   Full screen, as in the live product — a teacher previewing a
   module wants to see it the way a student will, not squinting
   at it in a corner.

   The one thing added: you can assign or add to your playlist
   from inside the preview. Today you preview, close, find the
   card again, and then act. Deciding and acting are the same
   moment; they shouldn't be two places.
   ============================================================ */

import { useEffect, useState } from 'react'
import { X, Play, FileText, PenLine, ClipboardCheck, Check, Plus } from 'lucide-react'
import { resourceTypes, getStandard } from '../data/mock'
import { useApp } from '../store'
import { Button, Badge, cx } from '../components/ui'

const mediaIcons = {
  video: Play,
  doc: FileText,
  interactive: PenLine,
  assessment: ClipboardCheck,
}

export default function PreviewOverlay({ resource, onClose }) {
  const { isInPlaylist, toggleInPlaylist } = useApp()
  const [lang, setLang] = useState('EN')

  useEffect(() => {
    if (!resource) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [resource, onClose])

  if (!resource) return null

  const meta = resourceTypes[resource.type]
  const MediaIcon = mediaIcons[meta.media]
  const std = getStandard(resource.standardId)
  const added = isInPlaylist(resource.id)

  return (
    /* z-60, one layer above Sheet's z-50. A preview can be
       opened FROM a dialog — the resource list on an assignment
       is the case that forced this — and the thing you just
       asked to look at has to be the thing on top. Without it
       the preview painted underneath the list it was opened
       from, which reads as a click that did nothing. */
    <div className="fixed inset-0 z-60 flex flex-col bg-ink-950/90 backdrop-blur-sm">
      {/* ---- Bar ---- */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white">
            {resource.shortTitle}
          </h2>
          <p className="truncate text-[12px] text-white/60">
            {meta.label} · {std?.id} {std?.title}
          </p>
        </div>

        <span className="flex shrink-0 overflow-hidden rounded-full border border-white/25">
          {['EN', 'ES'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cx(
                'px-2.5 py-1 text-[12px] font-semibold transition-colors',
                lang === l ? 'bg-white text-ink-900' : 'text-white/70 hover:text-white'
              )}
            >
              {l}
            </button>
          ))}
        </span>

        {resource.forStudents && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={added ? Check : Plus}
              onClick={() => toggleInPlaylist(resource.id)}
            >
              {added ? 'In playlist' : 'Playlist'}
            </Button>
            <Button size="sm" variant="primary">
              Assign
            </Button>
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close preview"
          title="Close preview"
          className="shrink-0 rounded-control p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* ---- The resource itself ----
          A placeholder in the prototype: the real build drops
          the actual module, worksheet or quiz in here. Marked
          as a placeholder on purpose — a fake screenshot of a
          lesson would be the one thing in this prototype that
          isn't honest. */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-6">
        <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center rounded-card border border-white/15 bg-white/[0.04] p-8 text-center">
          <MediaIcon className="h-10 w-10 text-white/40" />
          <p className="mt-4 text-base font-semibold text-white">{resource.shortTitle}</p>
          <p className="mt-1 max-w-md text-[14px] leading-relaxed text-white/60">
            {resource.blurb}
          </p>
          <Badge tone="neutral" className="mt-5 !bg-white/10 !text-white/70 !ring-white/20">
            {lang === 'EN' ? 'English' : 'Español'} ·{' '}
            {resource.forStudents ? `${resource.minutes} min` : 'Reference'}
          </Badge>
          <p className="mt-6 text-[12px] uppercase tracking-wide text-white/30">
            The real module plays here
          </p>
        </div>
      </div>
    </div>
  )
}
