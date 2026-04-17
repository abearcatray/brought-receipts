import { getEntries } from '@/lib/db/entries'
import ExportClient from '@/components/ExportClient'

export const metadata = { title: 'Review Packet — Brought Receipts' }

export default async function ExportPage() {
  const entries = await getEntries()

  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0">
      <div className="mb-8">
        <h1
          className="text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '2px', lineHeight: 1 }}
        >
          REVIEW PACKET
        </h1>
        <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Select receipts and download your review packet.
        </p>
      </div>

      <ExportClient entries={entries} />
    </div>
  )
}
