import { getEntries } from '@/lib/db/entries'
import ExportClient from '@/components/ExportClient'

export const metadata = { title: 'Export — Brought Receipts' }

export default async function ExportPage() {
  const entries = await getEntries()

  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0">
      <div className="mb-8">
        <h1
          className="text-4xl text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Export
        </h1>
        <p className="mt-1 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Select wins and download a review-ready summary.
        </p>
      </div>

      <ExportClient entries={entries} />
    </div>
  )
}
