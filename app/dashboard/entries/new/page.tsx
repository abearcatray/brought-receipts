import EntryForm from '@/components/EntryForm'

export const metadata = { title: 'Log a Win — Brought Receipts' }

export default function NewEntryPage() {
  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-4xl text-foreground"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Log a Win
        </h1>
        <p className="mt-1 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Capture what you accomplished and why it mattered.
        </p>
      </div>

      <EntryForm />
    </div>
  )
}
