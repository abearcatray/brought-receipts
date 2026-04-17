'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry } from '@/lib/types'
import FileUpload from '@/components/FileUpload'
import TagInput from '@/components/TagInput'

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

const editSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date_of_work: z.string().min(1, 'Date is required'),
  project: z.string().optional(),
  impact: z.string().optional(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export default function EntryForm({
  entry,
  entryId,
}: {
  entry?: Entry
  entryId?: string
}) {
  const router = useRouter()
  const isEdit = !!entryId

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shared local state
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [links, setLinks] = useState<string[]>(entry?.links?.map(l => l.url) ?? [])
  const [linkDraft, setLinkDraft] = useState('')

  // Staged files (create mode only)
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [stagingError, setStagingError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateValues | EditValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? {
          title: entry?.title ?? '',
          description: entry?.description ?? '',
          date_of_work: entry?.date_of_work ?? new Date().toISOString().slice(0, 10),
          project: entry?.project ?? '',
          impact: entry?.impact ?? '',
        }
      : { title: '' },
  })

  // Links pill handlers
  function handleLinkDraft(value: string) {
    if (value.endsWith(',')) {
      const url = value.slice(0, -1).trim()
      if (url) setLinks(prev => [...prev, url])
      setLinkDraft('')
    } else {
      setLinkDraft(value)
    }
  }

  function handleLinkKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const url = linkDraft.trim()
      if (url) { setLinks(prev => [...prev, url]); setLinkDraft('') }
    } else if (e.key === 'Backspace' && !linkDraft && links.length > 0) {
      setLinks(prev => prev.slice(0, -1))
    }
  }

  // File staging (create mode)
  function handleStagedFiles(fileList: FileList | null) {
    if (!fileList) return
    setStagingError(null)
    const next: File[] = []
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setStagingError(`${file.name} isn't a supported format — try a PDF, image, or doc.`); continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setStagingError(`${file.name} is too large — files must be under 5MB.`); continue
      }
      next.push(file)
    }
    setStagedFiles(prev => [...prev, ...next])
  }

  async function uploadStagedFiles(newEntryId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    for (const file of stagedFiles) {
      const path = `${user.id}/${newEntryId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('wins')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (!uploadError) {
        await supabase.from('entry_files').insert({
          entry_id: newEntryId,
          storage_path: path,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
      }
    }
  }

  const linksPayload = () =>
    links
      .concat(linkDraft.trim() ? [linkDraft.trim()] : [])
      .map(url => ({ url, label: '' }))

  async function onSubmit(values: CreateValues | EditValues) {
    setSaving(true)
    setError(null)

    if (isEdit) {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, tags, links: linksPayload() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "couldn't save — try again, or refresh the page if the issue persists.")
        setSaving(false)
        return
      }
      router.push(`/dashboard/entries/${entryId}`)
      router.refresh()
    } else {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, tags, links: linksPayload() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "couldn't save — try again, or refresh the page if the issue persists.")
        setSaving(false)
        return
      }
      const data = await res.json()
      if (stagedFiles.length && data.id) {
        setUploading(true)
        await uploadStagedFiles(data.id)
        setUploading(false)
      }
      router.push(`/dashboard/entries/${data.id}`)
      router.refresh()
    }
  }

  const inputCls = "w-full rounded-md border border-border bg-muted px-3 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
  const labelCls = "block text-sm uppercase tracking-wide text-muted-foreground mb-2"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* WIN */}
      <div>
        <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Receipt *</label>
        <input
          {...register('title')}
          placeholder='e.g. "Shipped the auth redesign two weeks early"'
          className={inputCls}
          style={{ fontFamily: 'var(--font-body)', fontSize: '1.125rem', fontWeight: 500 }}
        />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Edit-only fields */}
      {isEdit && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Date</label>
              <input
                type="date"
                {...register('date_of_work' as keyof EditValues)}
                className={inputCls}
                style={{ fontFamily: 'var(--font-mono)', colorScheme: 'light' }}
              />
            </div>
            <div>
              <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Project</label>
              <input
                {...register('project' as keyof EditValues)}
                placeholder="e.g. Platform redesign"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>What I did</label>
            <textarea
              {...register('description' as keyof EditValues)}
              placeholder="Walk through what you did and the context that made it hard or meaningful."
              rows={4}
              className={inputCls + ' resize-none'}
            />
          </div>

          <div>
            <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Why it mattered</label>
            <textarea
              {...register('impact' as keyof EditValues)}
              placeholder="What changed because of this? Think: time saved, revenue, reliability, team unblocked."
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>
        </>
      )}

      {/* File attachments — staging on create, live upload on edit */}
      <div>
        <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>
          Files &amp; evidence
        </label>

        {isEdit ? (
          <FileUpload entryId={entryId} existingFiles={entry?.files ?? []} />
        ) : (
          <>
            <div
              className="rounded-md border border-border bg-muted transition-colors cursor-pointer hover:border-primary/40"
              style={{ minHeight: 160 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)' }}
              onDragLeave={e => { e.currentTarget.style.borderColor = '' }}
              onDrop={e => {
                e.preventDefault()
                e.currentTarget.style.borderColor = ''
                handleStagedFiles(e.dataTransfer.files)
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground/70">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  drag to upload, or click to browse — images, PDFs, docs
                  <br />
                  <span className="text-xs text-muted-foreground/70">max 5MB per file</span>
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                className="sr-only"
                onChange={e => handleStagedFiles(e.target.files)}
              />
            </div>

            {stagingError && <p className="mt-1 text-xs text-destructive">{stagingError}</p>}

            {stagedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {stagedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 border border-border"
                    style={{ background: 'var(--card)' }}
                  >
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => setStagedFiles(prev => prev.filter((_, j) => j !== i))}
                      className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Tags</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      {/* Links */}
      <div>
        <label className={labelCls} style={{ fontFamily: 'var(--font-mono)' }}>Links</label>
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-2 min-h-[42px] cursor-text focus-within:ring-1 focus-within:ring-primary/50 transition-all"
          onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
        >
          {links.map((link, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm max-w-[260px]"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
            >
              <span className="truncate">{link}</span>
              <button
                type="button"
                onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))}
                className="hover:opacity-70 leading-none ml-0.5 shrink-0"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={linkDraft}
            onChange={e => handleLinkDraft(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            onBlur={() => { const url = linkDraft.trim(); if (url) { setLinks(prev => [...prev, url]); setLinkDraft('') } }}
            placeholder={links.length === 0 ? 'paste a link and press Enter' : ''}
            className="flex-1 min-w-[140px] bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-md px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
          style={{ background: 'var(--gold)', color: '#0E0E0D' }}
        >
          {uploading ? 'Uploading…' : saving ? 'Saving…' : isEdit ? 'Save' : 'Capture'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
