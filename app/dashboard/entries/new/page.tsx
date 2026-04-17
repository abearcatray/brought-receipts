import EntryForm from '@/components/EntryForm'

export const metadata = { title: 'Capture — Brought Receipts' }

export default function NewEntryPage() {
  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '2px', lineHeight: 1 }}
        >
          CAPTURE
        </h1>
        <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Log it while it&apos;s fresh.
        </p>
      </div>

      <EntryForm />
    </div>
  )
}
