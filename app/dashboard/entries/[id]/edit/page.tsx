import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEntry } from '@/lib/db/entries'
import EntryForm from '@/components/EntryForm'

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const entry = await getEntry(id)
  if (!entry) notFound()

  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0 max-w-2xl">
      <Link
        href={`/dashboard/entries/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        ← back to receipt
      </Link>

      <div className="mb-8">
        <h1
          className="text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '2px', lineHeight: 1 }}
        >
          EDIT RECEIPT
        </h1>
      </div>

      <EntryForm entry={entry} entryId={id} />
    </div>
  )
}
