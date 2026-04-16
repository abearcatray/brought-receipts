'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { Entry } from '@/lib/types'
import { useState } from 'react'

export default function EntryCard({
  entry,
  onDelete,
}: {
  entry: Entry
  onDelete?: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('Delete this win?')) return
    setDeleting(true)
    onDelete?.(entry.id)
  }

  const dateStr = (() => {
    try { return format(new Date(entry.date_of_work + 'T12:00:00'), 'MMM d, yyyy') }
    catch { return entry.date_of_work }
  })()

  return (
    <Link
      href={`/dashboard/entries/${entry.id}`}
      className="block group"
    >
      <article
        className="relative rounded-lg border border-border p-5 transition-all duration-200 hover:border-primary/40"
        style={{
          background: 'var(--card)',
          opacity: deleting ? 0.5 : 1,
        }}
      >
        {/* Gold left accent on hover */}
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ background: 'var(--gold)' }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className="text-lg leading-snug text-foreground group-hover:text-primary transition-colors duration-150 truncate"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {entry.title}
            </h3>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span
                className="text-xs text-muted-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {dateStr}
              </span>

              {entry.project && (
                <span
                  className="text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    background: 'var(--gold-dim)',
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {entry.project}
                </span>
              )}

              {entry.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-sm text-muted-foreground"
                  style={{ background: 'var(--muted)', fontFamily: 'var(--font-body)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Impact snippet */}
            {entry.impact && (
              <p
                className="mt-2.5 text-sm text-muted-foreground line-clamp-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {entry.impact}
              </p>
            )}
          </div>

          {/* Action buttons — visible on hover */}
          <div
            className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            onClick={e => e.preventDefault()}
          >
            <Link
              href={`/dashboard/entries/${entry.id}/edit`}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit"
            >
              <EditIcon size={14} />
            </Link>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>

        {/* Evidence links indicator */}
        {(entry.links?.length || entry.files?.length) ? (
          <div className="mt-3 flex items-center gap-2">
            {entry.links?.length ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <LinkIcon size={11} />
                {entry.links.length} link{entry.links.length !== 1 ? 's' : ''}
              </span>
            ) : null}
            {entry.files?.length ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <FileIcon size={11} />
                {entry.files.length} file{entry.files.length !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        ) : null}
      </article>
    </Link>
  )
}

function EditIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

function LinkIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  )
}

function FileIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}
