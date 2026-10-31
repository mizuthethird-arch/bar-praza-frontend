import type { ReactNode } from 'react'
import { sectionTitle } from '../../ui/classes'

// Shared by every board column and card, so the columns cannot drift apart.
// Every card is at least the same height; a card with more content grows taller.
// The shell has no colours: each card adds its tone (neutral, late, ready or delivered).
export const cardShell = 'flex min-h-[24rem] h-auto w-full min-w-0 flex-col rounded-xl border p-5'
export const neutralTone = 'border-neutral-800 bg-neutral-900'

// Column titles share one height, so a title that wraps does not push the cards out of line.
export function ColumnTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className={`mb-4 flex min-h-14 items-end gap-3 ${sectionTitle}`}>
      {title}
      {count ? (
        <span className="mb-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-widest text-black">{count}</span>
      ) : null}
    </h2>
  )
}

export function Column({ title, count, className, children }: { title: string; count?: number; className?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={`min-w-0 ${className ?? ''}`}>
      <ColumnTitle title={title} count={count} />
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function EmptyColumn({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400">{text}</p>
}
