import { Suspense } from 'react'
import Link from 'next/link'
import { getEntries } from '@/lib/db/entries'
import { getAllTags, getAllProjects } from '@/lib/db/tags'
import EntryCard from '@/components/EntryCard'
import FilterBar from '@/components/FilterBar'
import EntryListClient from '@/components/EntryListClient'
import type { EntryFilters } from '@/lib/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const filters: EntryFilters = {
    search: params.search,
    project: params.project,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    tags: params.tags?.split(',').filter(Boolean),
  }

  const [entries, allTags, projects] = await Promise.all([
    getEntries(filters),
    getAllTags(),
    getAllProjects(),
  ])

  return (
    <div className="px-6 py-8 md:py-10 mt-14 md:mt-0">
      {/* Page header */}
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1
            className="text-foreground"
            style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '2px', lineHeight: 1 }}
          >
            YOUR RECEIPTS
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            {entries.length} {entries.length === 1 ? 'receipt' : 'receipts'}
          </p>
        </div>

        <Link
          href="/dashboard/entries/new"
          className="hidden md:flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: 'var(--gold)',
            color: '#0E0E0D',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span className="text-base leading-none">+</span>
          Capture
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <FilterBar projects={projects} allTags={allTags} />
        </Suspense>
      </div>

      {/* Entry list */}
      {entries.length === 0 ? (
        <EmptyState hasFilters={!!params.search || !!params.project || !!params.tags} />
      ) : (
        <EntryListClient initialEntries={entries} />
      )}
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-border">
      <div
        className="text-5xl mb-4 opacity-20"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        ✦
      </div>
      <p
        className="text-base text-muted-foreground"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {hasFilters ? 'nothing matches those filters.' : 'Nothing here yet. Go do something worth logging.'}
      </p>
      {!hasFilters && (
        <Link
          href="/dashboard/entries/new"
          className="mt-5 text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
        >
          Capture your first receipt →
        </Link>
      )}
    </div>
  )
}
