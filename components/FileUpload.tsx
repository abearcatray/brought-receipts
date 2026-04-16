'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EntryFile } from '@/lib/types'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export default function FileUpload({
  entryId,
  existingFiles = [],
}: {
  entryId: string
  existingFiles?: EntryFile[]
}) {
  const [files, setFiles] = useState<EntryFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(selected: FileList | null) {
    if (!selected?.length) return
    const supabase = createClient()
    setError(null)

    for (const file of Array.from(selected)) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`${file.name}: unsupported type. Use images or PDF.`)
        continue
      }
      if (file.size > MAX_SIZE) {
        setError(`${file.name}: file exceeds 10MB limit.`)
        continue
      }

      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated.'); setUploading(false); return }

      const path = `${user.id}/${entryId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      const { error: uploadError } = await supabase.storage
        .from('wins')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        continue
      }

      // Save file record
      const { data: record } = await supabase
        .from('entry_files')
        .insert({
          entry_id: entryId,
          storage_path: path,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single()

      if (record) setFiles(prev => [...prev, record as EntryFile])
      setUploading(false)
    }
  }

  async function deleteFile(file: EntryFile) {
    const supabase = createClient()
    await supabase.storage.from('wins').remove([file.storage_path])
    await supabase.from('entry_files').delete().eq('id', file.id)
    setFiles(prev => prev.filter(f => f.id !== file.id))
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Drop zone */}
      <div
        className="relative rounded-md border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer"
        style={{ background: 'var(--muted)' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = '' }}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.style.borderColor = ''
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <UploadIcon />
          <p className="mt-2 text-sm text-muted-foreground">
            {uploading ? 'Uploading…' : 'Drop files here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">Images & PDF · max 10MB each</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="sr-only"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 border border-border"
              style={{ background: 'var(--card)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileTypeIcon mime={file.mime_type} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{file.original_filename}</p>
                  {file.file_size && (
                    <p className="text-xs text-muted-foreground"
                       style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatSize(file.file_size)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteFile(file)}
                className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                title="Remove"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground/40">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}

function FileTypeIcon({ mime }: { mime: string | null }) {
  const isImage = mime?.startsWith('image/')
  return (
    <div
      className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium shrink-0"
      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
    >
      {isImage ? 'IMG' : 'PDF'}
    </div>
  )
}
