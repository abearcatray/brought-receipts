import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getEntry } from '@/lib/db/entries'
import { createClient } from '@/lib/supabase/server'

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const entry = await getEntry(id)
  if (!entry) notFound()

  const supabase = await createClient()

  const dateStr = (() => {
    try { return format(new Date(entry.date_of_work + 'T12:00:00'), 'MMMM d, yyyy') }
    catch { return entry.date_of_work }
  })()

  // Get signed URLs for files
  const fileUrls: Record<string, string> = {}
  for (const file of entry.files ?? []) {
    const { data } = await supabase.storage
      .from('wins')
      .createSignedUrl(file.storage_path, 3600)
    if (data?.signedUrl) fileUrls[file.id] = data.signedUrl
  }

  const labelClass = "text-xs uppercase tracking-wide text-muted-foreground mb-1"

  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0 max-w-2xl" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        ← Back to wins
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1
            className="text-3xl sm:text-4xl leading-tight text-foreground"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            {entry.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span
              className="text-sm text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {dateStr}
            </span>
            {entry.project && (
              <span
                className="text-xs px-2.5 py-1 rounded-sm"
                style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}
              >
                {entry.project}
              </span>
            )}
            {entry.tags?.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-sm text-muted-foreground"
                style={{ background: 'var(--muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/dashboard/entries/${id}/edit`}
          className="shrink-0 px-4 py-2 text-sm rounded-md border border-border hover:border-primary/50 hover:text-primary transition-all"
        >
          Edit
        </Link>
      </div>

      {/* Body sections */}
      <div className="space-y-8">
        {entry.description && (
          <section>
            <p className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>What I did</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.description}</p>
          </section>
        )}

        {entry.impact && (
          <section>
            <p className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Why it mattered</p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2"
              style={{ color: 'var(--foreground)', borderColor: 'var(--gold)' }}
            >
              {entry.impact}
            </p>
          </section>
        )}

        {entry.links?.length ? (
          <section>
            <p className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Evidence links</p>
            <ul className="space-y-2">
              {entry.links.map(link => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
                    style={{ color: 'var(--gold)' }}
                  >
                    <span className="text-muted-foreground group-hover:text-primary">↗</span>
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {entry.files?.length ? (
          <section>
            <p className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Attached files</p>
            <div className="space-y-2">
              {entry.files.map(file => (
                <a
                  key={file.id}
                  href={fileUrls[file.id] ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border hover:border-primary/30 transition-colors"
                  style={{ background: 'var(--card)' }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium shrink-0"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                  >
                    {file.mime_type?.startsWith('image/') ? 'IMG' : 'PDF'}
                  </div>
                  <span className="text-sm text-foreground truncate">{file.original_filename}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">↗</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Footer meta */}
      <div
        className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Logged {format(new Date(entry.created_at), 'MMM d, yyyy')}
        {entry.updated_at !== entry.created_at && ` · Updated ${format(new Date(entry.updated_at), 'MMM d, yyyy')}`}
      </div>
    </div>
  )
}
