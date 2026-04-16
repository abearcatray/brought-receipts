'use client'

import { useState } from 'react'
import { format as dateFns } from 'date-fns'
import type { Entry, ExportFormat } from '@/lib/types'
import { generateExport } from '@/lib/export'

const FORMATS: { value: ExportFormat; label: string; description: string }[] = [
  {
    value: 'bullets',
    label: 'Bullets',
    description: '• Win — Impact → Evidence',
  },
  {
    value: 'structured',
    label: 'Structured',
    description: 'What I did / Why it mattered / Evidence per entry',
  },
  {
    value: 'timeline',
    label: 'Timeline',
    description: 'Chronological entries grouped by year',
  },
]

export default function ExportClient({ entries }: { entries: Entry[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(entries.map(e => e.id)))
  const [format, setFormat] = useState<ExportFormat>('bullets')
  const [preview, setPreview] = useState(false)

  function toggleAll() {
    setSelected(prev =>
      prev.size === entries.length ? new Set() : new Set(entries.map(e => e.id))
    )
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function download() {
    const selectedEntries = entries.filter(e => selected.has(e.id))
    const text = generateExport(selectedEntries, format)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wins-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyToClipboard() {
    const selectedEntries = entries.filter(e => selected.has(e.id))
    const text = generateExport(selectedEntries, format)
    navigator.clipboard.writeText(text)
  }

  const selectedEntries = entries.filter(e => selected.has(e.id))
  const previewText = preview ? generateExport(selectedEntries, format) : ''

  const inputClass = "rounded-md border border-border bg-muted px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Left: entry selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Select entries
          </h2>
          <button
            onClick={toggleAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selected.size === entries.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No wins logged yet.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const isSelected = selected.has(entry.id)
              const dateStr = (() => {
                try { return dateFns(new Date(entry.date_of_work + 'T12:00:00'), 'MMM d, yyyy') }
                catch { return entry.date_of_work }
              })()

              return (
                <label
                  key={entry.id}
                  className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected ? 'var(--gold-dim)' : 'var(--card)',
                    borderColor: isSelected ? 'var(--gold)' : 'var(--border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(entry.id)}
                    className="mt-0.5 accent-[--gold] shrink-0"
                  />
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium leading-snug truncate"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        color: isSelected ? 'var(--gold)' : 'var(--foreground)',
                      }}
                    >
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs text-muted-foreground"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {dateStr}
                      </span>
                      {entry.project && (
                        <span className="text-xs text-muted-foreground">· {entry.project}</span>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: format + actions */}
      <div className="space-y-6">
        {/* Format picker */}
        <div>
          <h2
            className="text-lg mb-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Format
          </h2>
          <div className="space-y-2">
            {FORMATS.map(f => (
              <label
                key={f.value}
                className="flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-150"
                style={{
                  background: format === f.value ? 'var(--gold-dim)' : 'var(--card)',
                  borderColor: format === f.value ? 'var(--gold)' : 'var(--border)',
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.value}
                  checked={format === f.value}
                  onChange={() => setFormat(f.value)}
                  className="mt-0.5 accent-[--gold] shrink-0"
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: format === f.value ? 'var(--gold)' : 'var(--foreground)' }}
                  >
                    {f.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <p
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {selected.size} of {entries.length} entries selected
          </p>

          <button
            onClick={download}
            disabled={selected.size === 0}
            className="w-full rounded-md px-4 py-3 text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: 'var(--gold)', color: 'oklch(0.12 0.005 60)' }}
          >
            Download .txt
          </button>

          <button
            onClick={copyToClipboard}
            disabled={selected.size === 0}
            className="w-full rounded-md px-4 py-3 text-sm border border-border hover:border-primary/50 hover:text-primary transition-all disabled:opacity-40"
          >
            Copy to clipboard
          </button>

          <button
            onClick={() => setPreview(p => !p)}
            disabled={selected.size === 0}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-40"
          >
            {preview ? 'Hide preview' : 'Preview export'}
          </button>
        </div>

        {/* Preview */}
        {preview && previewText && (
          <div>
            <p
              className="text-xs uppercase tracking-wide text-muted-foreground mb-2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Preview
            </p>
            <pre
              className="rounded-md border border-border p-4 text-xs text-foreground/80 overflow-auto max-h-80 whitespace-pre-wrap leading-relaxed"
              style={{ background: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
            >
              {previewText}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
