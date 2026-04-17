'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function FilterBar({
  projects,
  allTags,
}: {
  projects: string[]
  allTags: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const project = searchParams.get('project') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  function toggleTag(tag: string) {
    const next = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag]
    update('tags', next.join(','))
  }

  function clearAll() {
    router.push(pathname, { scroll: false })
  }

  const hasFilters = search || project || dateFrom || dateTo || activeTags.length > 0

  return (
    <div
      className="space-y-3"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Search + project row */}
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="search by title, tag, or project…"
          value={search}
          onChange={e => update('search', e.target.value)}
          className="flex-1 min-w-48 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        />

        {projects.length > 0 && (
          <select
            value={project}
            onChange={e => update('project', e.target.value)}
            className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          >
            <option value="">All projects</option>
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={dateFrom}
          onChange={e => update('dateFrom', e.target.value)}
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          style={{ fontFamily: 'var(--font-mono)', colorScheme: 'light' }}
          title="From date"
        />

        <input
          type="date"
          value={dateTo}
          onChange={e => update('dateTo', e.target.value)}
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          style={{ fontFamily: 'var(--font-mono)', colorScheme: 'light' }}
          title="To date"
        />

        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            clear filters
          </button>
        )}
      </div>

      {/* Tag pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="text-xs px-2.5 py-1 rounded-full border transition-all duration-150"
                style={{
                  border: active ? '1px solid var(--gold)' : '1px solid var(--border)',
                  background: active ? 'var(--gold-dim)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--muted-foreground)',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
