'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EntryCard from '@/components/EntryCard'
import type { Entry } from '@/lib/types'

export default function EntryListClient({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries)
  const router = useRouter()

  async function handleDelete(id: string) {
    // Optimistic removal
    setEntries(prev => prev.filter(e => e.id !== id))

    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Revert on failure
      setEntries(initialEntries)
      alert('Failed to delete entry.')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
      ))}
    </div>
  )
}
