import type { Entry, ExportFormat } from '@/lib/types'
import { format } from 'date-fns'

function fmtDate(d: string) {
  try { return format(new Date(d + 'T12:00:00'), 'MMM d, yyyy') } catch { return d }
}

function linksText(entry: Entry) {
  if (!entry.links?.length) return ''
  return entry.links.map(l => l.label ? `${l.label}: ${l.url}` : l.url).join(' | ')
}

function bulletEntry(entry: Entry): string {
  let line = `• ${entry.title}`
  if (entry.project) line += ` [${entry.project}]`
  if (entry.impact) line += ` — ${entry.impact}`
  const links = linksText(entry)
  if (links) line += `\n  Evidence: ${links}`
  return line
}

function structuredEntry(entry: Entry): string {
  const lines = [
    `── ${entry.title.toUpperCase()} ──`,
    `Date: ${fmtDate(entry.date_of_work)}`,
  ]
  if (entry.project) lines.push(`Project: ${entry.project}`)
  if (entry.tags?.length) lines.push(`Tags: ${entry.tags.join(', ')}`)
  if (entry.description) lines.push(`\nWhat I did:\n${entry.description}`)
  if (entry.impact) lines.push(`\nWhy it mattered:\n${entry.impact}`)
  const links = linksText(entry)
  if (links) lines.push(`\nEvidence:\n${links}`)
  return lines.join('\n')
}

function timelineEntry(entry: Entry): string {
  const lines = [`${fmtDate(entry.date_of_work)}  ${entry.title}`]
  if (entry.project) lines.push(`  Project: ${entry.project}`)
  if (entry.description) lines.push(`  ${entry.description}`)
  if (entry.impact) lines.push(`  Impact: ${entry.impact}`)
  const links = linksText(entry)
  if (links) lines.push(`  ${links}`)
  return lines.join('\n')
}

export function generateExport(entries: Entry[], format: ExportFormat): string {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date_of_work).getTime() - new Date(a.date_of_work).getTime()
  )

  const header = `WORK WINS LOG\nExported ${fmtDate(new Date().toISOString().slice(0, 10))}\n${'─'.repeat(60)}\n`

  if (format === 'bullets') {
    return header + sorted.map(bulletEntry).join('\n\n')
  }

  if (format === 'structured') {
    return header + sorted.map(structuredEntry).join('\n\n' + '─'.repeat(40) + '\n\n')
  }

  // timeline
  const byYear = sorted.reduce<Record<string, Entry[]>>((acc, e) => {
    const year = e.date_of_work.slice(0, 4)
    ;(acc[year] ??= []).push(e)
    return acc
  }, {})

  const sections = Object.entries(byYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, entries]) => `${year}\n${'═'.repeat(60)}\n\n${entries.map(timelineEntry).join('\n\n')}`)

  return header + sections.join('\n\n')
}
